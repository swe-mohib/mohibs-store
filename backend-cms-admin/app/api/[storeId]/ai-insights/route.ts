import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { userId } = await auth();
  const { storeId } = await params;

  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

  const store = await prismadb.store.findFirst({
    where: { id: storeId, userId },
  });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  if (!process.env.GEMINI_API_KEY) {
    return new NextResponse("GEMINI_API_KEY is not configured", { status: 503 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [orders, activeProducts, categories] = await Promise.all([
    prismadb.order.findMany({
      where: { storeId, isPaid: true, createdAt: { gte: since } },
      include: { orderItems: { include: { product: { include: { category: true } } } } },
    }),
    prismadb.product.count({ where: { storeId, isArchived: false } }),
    prismadb.category.findMany({ where: { storeId }, select: { name: true } }),
  ]);

  const categorySales = new Map(categories.map((category) => [category.name, { name: category.name, units: 0, revenue: 0 }]));
  let revenue = 0;
  for (const order of orders) {
    for (const item of order.orderItems) {
      const price = item.product.price.toNumber();
      revenue += price;
      const category = categorySales.get(item.product.category.name) ?? {
        name: item.product.category.name,
        units: 0,
        revenue: 0,
      };
      category.units += 1;
      category.revenue += price;
      categorySales.set(category.name, category);
    }
  }

  const snapshot = {
    period: "last 30 days",
    paidOrders: orders.length,
    revenue,
    activeProducts,
    categories: [...categorySales.values()].sort((a, b) => b.revenue - a.revenue),
  };

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const instruction = 'You are an ecommerce analyst. Use only the supplied metrics; never invent data, stock levels, trends, or percentages. Return valid JSON only with this exact shape: {"summary":"one concise sentence","goodInsights":["up to 3 evidence-based positive insights"],"badInsights":["up to 3 evidence-based risks or missing data"],"recommendations":["up to 3 practical actions"],"categoryAnalysis":[{"category":"exact category name from input","signal":"good|bad|neutral","summary":"one evidence-based sentence"}]}. Include every category from input in categoryAnalysis. If there are no sales, clearly state this as a risk and give one practical recommendation.';
  const input = JSON.stringify(snapshot);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents: [{ parts: [{ text: input }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!response.ok) {
    return new NextResponse("Unable to generate AI insights", { status: 502 });
  }

  const result = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const insights = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n");
  if (!insights) {
    return new NextResponse("AI returned no insights", { status: 502 });
  }

  try {
    const analysis = JSON.parse(insights);
    return NextResponse.json({ analysis, snapshot });
  } catch {
    return new NextResponse("AI returned invalid analysis", { status: 502 });
  }
}

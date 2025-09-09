import prismadb from "@/lib/prismadb";
import { Product } from "@prisma/client";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function calculateAmountInPaise(cartProducts: Product[]) {
  if (!Array.isArray(cartProducts)) return 0;
  let totalPaise = 0;
  for (const item of cartProducts) {
    const price = item.price.toNumber();
    const itemPaise = Math.round(price * 100);
    totalPaise += itemPaise;
  }
  return totalPaise;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      storeId: string;
    }>;
  }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { cartProductIds } = body;

    if (!Array.isArray(cartProductIds) || cartProductIds.length === 0) {
      return new Response(JSON.stringify({ error: "cartProducts required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const cartProducts = await prismadb.product.findMany({
      where: {
        id: {
          in: cartProductIds,
        },
      },
    });

    const amount = calculateAmountInPaise(cartProducts); // integer paise
    if (amount <= 0) {
      return new Response(JSON.stringify({ error: "invalid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        // keep a small cart snapshot (but rely on your DB for truth)
        cart: JSON.stringify(
          cartProducts.map((i) => ({ id: i.id, name: i.name }))
        ),
      },
    };

    const order = await razorpay.orders.create(options);

    // create a order in db
    await prismadb.order.create({
      data: {
        storeId,
        isPaid: false,
        razorpay_order_id: order.id,
        orderItems: {
          create: cartProducts.map((product) => ({
            product: {
              connect: {
                id: product.id,
              },
            },
          })),
        },
      },
    });

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
}

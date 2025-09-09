import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
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
    const { userId } = await auth();
    const body = await req.json();
    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!name || !value) {
      return new NextResponse("Missing name or value", { status: 401 });
    }
    if (!storeId) {
      return new NextResponse("Missing storeId", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });
    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId,
      },
    });

    return new NextResponse(JSON.stringify(color), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("[COLORS_POST]", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
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

    if (!storeId) {
      return new NextResponse("Missing storeId", {
        status: 400,
      });
    }

    const colors = await prismadb.color.findMany({
      where: {
        storeId,
      },
    });

    return new NextResponse(JSON.stringify(colors), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("[COLORS_GET]", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

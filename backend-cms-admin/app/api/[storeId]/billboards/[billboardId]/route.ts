import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    const { billboardId } = await params;

    if (!billboardId) {
      return new NextResponse("Missing billboardId", {
        status: 400,
      });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: billboardId,
      },
    });

    return new NextResponse(JSON.stringify(billboard), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { storeId, billboardId } = await params;
    const { userId } = await auth();
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated"), { status: 401 };
    }
    if (!label || !imageUrl) {
      return new NextResponse("Missing label or image-url"), { status: 401 };
    }
    if (!storeId || !billboardId) {
      return new NextResponse("Missing storeId or billboardId", {
        status: 400,
      });
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
    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return new NextResponse(JSON.stringify(billboard), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { storeId, billboardId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated"), { status: 401 };
    }
    if (!storeId || !billboardId) {
      return new NextResponse("Missing storeId or billboardId", {
        status: 400,
      });
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
    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: billboardId,
      },
    });

    return new NextResponse(JSON.stringify(billboard), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("[BILLBOARDS_DELETE]", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import prismadb from "@/lib/prismadb";
import crypto from "crypto";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const verified = expected === razorpay_signature;

    if (!verified) {
      console.warn("webhook invalid signature");
      return new Response(
        JSON.stringify({ verified, message: "invalid signature" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        }
      );
    }

    const order = await prismadb.order.updateMany({
      where: {
        razorpay_order_id,
      },
      data: {
        razorpay_payment_id,
        isPaid: true,
      },
    });

    return new Response(JSON.stringify({ verified, order }), {
      status: verified ? 200 : 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "server error";
    return new Response(
      JSON.stringify({ error: errorMessage || "server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
}

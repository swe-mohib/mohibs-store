"use client";
import { useState } from "react";
import Button from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useCart from "@/hooks/use-cart";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutButtonProps {
  cartProductIds: string[];
  className?: string;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Razorpay SDK failed to load."));
    document.body.appendChild(s);
  });
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  cartProductIds,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const URL = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();
  const cart = useCart();

  async function handleCheckout() {
    setLoading(true);
    try {
      // 1) create order on backend
      const createRes = await fetch(`${URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartProductIds }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err?.error || "Order creation failed");
      }
      const { order } = await createRes.json();

      // 2) load Razorpay sdk
      await loadRazorpayScript();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Mohibs Store",
        description: `Order ${order.id}`,
        order_id: order.id,
        handler: async function (response: VerifyPaymentPayload) {
          // 3) verify server-side
          const verifyRes = await fetch(`${URL}/checkout/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyJson = await verifyRes.json();
          if (verifyRes.ok && verifyJson.verified) {
            toast.success("Payment successful!");
            cart.removeAll();
            router.push("/");
          } else {
            toast.error("Payment verification failed on server.");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        console.error("payment.failed", resp);
        toast.error(
          "Payment failed: " + (resp.error?.description || "Unknown error")
        );
      });
      rzp.open();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "server error";
      console.error(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading || !cartProductIds?.length}
      className={className}
    >
      {loading ? "Processing..." : `Checkout`}
    </Button>
  );
};
export default CheckoutButton;

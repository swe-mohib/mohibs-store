"use client";
import useCart from "@/hooks/use-cart";
import CartItems from "./components/cart-items";
import Summary from "./components/summary";
import Container from "@/components/ui/container";

const Cart = () => {
  const items = useCart((state) => state.items);
  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
            <div className="lg:col-span-7">
              {items.length === 0 && (
                <p className="text-neutral-500">Your cart is empty.</p>
              )}
              <ul>
                {items.map((item) => (
                  <CartItems key={item.id} data={item} />
                ))}
              </ul>
            </div>
            <Summary />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Cart;

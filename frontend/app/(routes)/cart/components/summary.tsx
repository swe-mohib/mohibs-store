import Currency from "@/components/ui/currency";
import CheckoutButton from "@/components/checkout-button";
import useCart from "@/hooks/use-cart";

const Summary = () => {
  const items = useCart((state) => state.items);
  const productIds = items.map((item) => item.id);

  const totalPrice = items.reduce((total, item) => {
    return total + Number(item.price);
  }, 0);

  return (
    <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-base font-medium text-gray-900">Order total</div>
          <Currency value={totalPrice} />
        </div>
      </div>
      <CheckoutButton cartProductIds={productIds} className="w-full mt-6" />
    </div>
  );
};

export default Summary;

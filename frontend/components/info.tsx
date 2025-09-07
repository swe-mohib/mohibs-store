"use client";

import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";
import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { MouseEventHandler } from "react";

interface InfoProps {
  data: Product;
}

export const Info: React.FC<InfoProps> = ({ data }) => {
  const addItem = useCart((state) => state.addItem);

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    addItem(data);
  };
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{data?.name}</h1>

      <div className="mt-3 flex items-end justify-between">
        <div className="text-2xl text-gray-900">
          <Currency value={data?.price} />
        </div>
      </div>

      <hr className="my-4" />
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Size:</h3>
          <div>{data?.size?.name}</div>
        </div>

        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Color:</h3>
          <div className="flex gap-2">
            <div
              className="w-6 h-6 rounded-full border border-gray-600"
              style={{
                backgroundColor: data?.color?.value,
              }}
            />
            {data?.color?.name}
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-x-3">
        <Button className="flex items-center gap-x-2" onClick={onAddToCart}>
          Add to cart
          <ShoppingCart />
        </Button>
      </div>
    </div>
  );
};

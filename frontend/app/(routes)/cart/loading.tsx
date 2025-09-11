// app/(store)/cart/loading-skeleton.tsx
const CartSkeleton = () => {
  return (
    <div className="bg-white">
      <div className="px-4 py-16 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8" />

        <div className="lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 w-full bg-gray-200 rounded-lg" />
            ))}
          </div>

          {/* Summary Skeleton */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="h-40 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;

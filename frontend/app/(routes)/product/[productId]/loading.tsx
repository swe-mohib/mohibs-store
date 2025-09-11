// app/(store)/[productId]/loading.tsx
import Container from "@/components/ui/container";

export default function Loading() {
  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:grid sm:grid-cols-2 sm:items-start sm:gap-x-8 lg:grid-cols-3">
            {/* Gallery Skeleton */}
            <div className="animate-pulse rounded-lg bg-gray-200 h-96 w-full" />

            <div className="mt-10 sm:mt-0 lg:col-span-2 space-y-4">
              {/* Title Skeleton */}
              <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
              {/* Price Skeleton */}
              <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
              {/* Description Skeleton */}
              <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
              {/* Button Skeleton */}
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <hr className="my-10" />

          {/* Suggested Products Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

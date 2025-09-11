// app/(store)/[categoryId]/loading.tsx
import Container from "@/components/ui/container";

export default function Loading() {
  return (
    <div className="bg-white">
      <Container>
        {/* Billboard Skeleton */}
        <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
          <div className="rounded-xl relative aspect-[3.5/1] overflow-hidden bg-gray-200 animate-pulse" />
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8">
            {/* Filters Skeleton (desktop) */}
            <div className="hidden lg:block space-y-6">
              <div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-16 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-16 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Products Skeleton */}
            <div className="mt-6 lg:col-span-4 lg:mt-0 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

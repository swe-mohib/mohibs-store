// app/(store)/loading.tsx
import Container from "@/components/ui/container";

export default function Loading() {
  return (
    <Container>
      <div className="space-y-3 pb-10">
        {/* Billboard Skeleton */}
        <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
          <div className="rounded-xl relative aspect-[3.5/1] overflow-hidden bg-gray-200 animate-pulse" />
        </div>

        {/* Featured Products Skeleton */}
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

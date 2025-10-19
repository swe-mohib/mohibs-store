import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";

const Loading = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Page heading */}
        <Heading title="Products" description="Loading products..." />
        <Separator />

        {/* Toolbar (search/filter/add button) */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-40 rounded-md" /> {/* search/filter */}
          <Skeleton className="h-10 w-28 rounded-md" /> {/* add button */}
        </div>

        {/* Products table skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-8 items-center gap-4 border-b py-3 last:border-0"
                >
                  <Skeleton className="h-4 w-36" /> {/* Name */}
                  <Skeleton className="h-4 w-20" /> {/* Price */}
                  <Skeleton className="h-4 w-24" /> {/* Category */}
                  <Skeleton className="h-4 w-24" /> {/* Size */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" /> {/* Color value */}
                    <Skeleton className="h-6 w-6 rounded-full" />{" "}
                    {/* Color preview */}
                  </div>
                  <Skeleton className="h-4 w-16" /> {/* Featured */}
                  <Skeleton className="h-4 w-16" /> {/* Archived */}
                  <Skeleton className="h-4 w-32" /> {/* Created at */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Loading;

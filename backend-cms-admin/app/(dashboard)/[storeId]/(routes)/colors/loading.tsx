import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";

const Loading = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Page header */}
        <Heading title="Colors" description="Loading colors..." />
        <Separator />

        {/* Toolbar (search/filter/add button) */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-36 rounded-md" /> {/* search/filter */}
          <Skeleton className="h-10 w-28 rounded-md" /> {/* add button */}
        </div>

        {/* Colors table skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 items-center gap-4 border-b py-3 last:border-0"
                >
                  <Skeleton className="h-4 w-40" /> {/* Color name */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" /> {/* Hex code */}
                    <Skeleton className="h-6 w-6 rounded-full" />{" "}
                    {/* Color preview circle */}
                  </div>
                  <Skeleton className="h-4 w-32" /> {/* Created at */}
                  <Skeleton className="h-4 w-32" /> {/* Updated at */}
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

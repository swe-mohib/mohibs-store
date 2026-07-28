import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";

const Loading = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 lg:pt-6">
        {/* Page heading */}
        <Heading title="Orders" description="Loading orders..." />
        <Separator />

        {/* Toolbar (search/filter/add/export button area) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-36 rounded-md" /> {/* search/filter */}
          <Skeleton className="h-10 w-28 rounded-md" /> {/* export button */}
        </div>

        {/* Orders table skeleton */}
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
                  className="grid gap-3 border-b py-3 last:border-0 sm:grid-cols-2 sm:items-center sm:gap-4 lg:grid-cols-6"
                >
                  <Skeleton className="h-4 w-28" /> {/* Order ID */}
                  <Skeleton className="h-4 w-32" /> {/* Razorpay Order ID */}
                  <Skeleton className="h-4 w-32" /> {/* Razorpay Payment ID */}
                  <Skeleton className="h-4 w-40" /> {/* Products */}
                  <Skeleton className="h-4 w-24" /> {/* Total Price */}
                  <Skeleton className="h-4 w-24" /> {/* Created At */}
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

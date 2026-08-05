import { AiInsights } from "@/components/ai-insights";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function AiInsightsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 lg:pt-6">
        <Heading title="AI Insights" description="Recommendations from your store data" />
        <Separator />
        <AiInsights />
      </div>
    </div>
  );
}

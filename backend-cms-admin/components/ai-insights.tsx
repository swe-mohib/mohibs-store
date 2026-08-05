"use client";

import {
  BarChart3,
  IndianRupee,
  Lightbulb,
  Package,
  ReceiptText,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Snapshot = { paidOrders: number; revenue: number; activeProducts: number };
type Analysis = {
  summary: string;
  goodInsights: string[];
  badInsights: string[];
  recommendations: string[];
  categoryAnalysis: {
    category: string;
    signal: "good" | "bad" | "neutral";
    summary: string;
  }[];
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function AiInsights() {
  const params = useParams<{ storeId: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/${params.storeId}/ai-insights`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(await response.text());
      const data = (await response.json()) as {
        analysis: Analysis;
        snapshot: Snapshot;
      };
      setAnalysis(data.analysis);
      setSnapshot(data.snapshot);
      setGeneratedAt(new Date());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to generate insights",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-background dark:from-violet-950/30 dark:to-background py-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <span className="rounded-md bg-violet-600 p-1.5 text-white">
                  <Sparkles className="size-4" />
                </span>{" "}
                AI Insights
              </CardTitle>
              <CardDescription>
                Category performance and recommended actions from your last 30
                days of paid orders.
              </CardDescription>
            </div>
            <Button onClick={generateInsights} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              {loading
                ? "Analyzing..."
                : analysis
                  ? "Refresh analysis"
                  : "Generate analysis"}
            </Button>
          </div>
        </CardHeader>
        {!analysis ? (
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            Generate an analysis to see what is working, what needs attention,
            and the next best actions.
          </CardContent>
        ) : (
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">{analysis.summary}</p>
              {generatedAt && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  Generated{" "}
                  {generatedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            {snapshot && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  icon={<IndianRupee />}
                  label="Revenue"
                  value={currency.format(snapshot.revenue)}
                />
                <Metric
                  icon={<ReceiptText />}
                  label="Paid orders"
                  value={snapshot.paidOrders.toString()}
                />
                <Metric
                  icon={<Package />}
                  label="Active products"
                  value={snapshot.activeProducts.toString()}
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {analysis && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <InsightPanel
              icon={<TrendingUp />}
              title="What is working"
              items={analysis.goodInsights}
              tone="good"
            />
            <InsightPanel
              icon={<TrendingDown />}
              title="Needs attention"
              items={analysis.badInsights}
              tone="bad"
            />
            <InsightPanel
              icon={<Lightbulb />}
              title="Recommended actions"
              items={analysis.recommendations}
              tone="action"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-4" /> Category analysis
              </CardTitle>
              <CardDescription>
                AI interpretation of each category&apos;s last-30-day
                performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {analysis.categoryAnalysis.map((item) => (
                <CategoryCard key={item.category} {...item} />
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function InsightPanel({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone: "good" | "bad" | "action";
}) {
  const colors = {
    good: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
    bad: "border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20",
    action:
      "border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20",
  };
  return (
    <Card className={colors[tone]}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-6">
          {items.map((item, index) => (
            <li
              key={`${index}-${item}`}
              className="border-t pt-3 first:border-0 first:pt-0"
            >
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CategoryCard({
  category,
  signal,
  summary,
}: Analysis["categoryAnalysis"][number]) {
  const label =
    signal === "good"
      ? "Performing well"
      : signal === "bad"
        ? "Needs attention"
        : "Watch";
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{category}</h3>
        <Badge
          variant="outline"
          className={cn(
            signal === "good" && "border-emerald-300 text-emerald-700",
            signal === "bad" && "border-rose-300 text-rose-700",
          )}
        >
          {label}
        </Badge>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
    </div>
  );
}

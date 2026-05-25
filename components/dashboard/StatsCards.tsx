import { Card } from "@/components/ui/Card";
import type { Review } from "@/types/review";

interface StatsCardsProps {
  reviews: Review[];
}

export function StatsCards({ reviews }: StatsCardsProps) {
  const stats = [
    { label: "Total Reviews", value: reviews.length },
    { label: "Pending", value: reviews.filter((review) => review.status === "Pending").length },
    { label: "Approved", value: reviews.filter((review) => review.status === "Resolved").length }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-slate-950">{stat.value}</p>
        </Card>
      ))}
    </section>
  );
}

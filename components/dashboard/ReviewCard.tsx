"use client";

import type { Review, SuggestionTone } from "@/types/review";
import { AiSuggestionPanel } from "@/components/dashboard/AiSuggestionPanel";
import { RatingStars } from "@/components/dashboard/RatingStars";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ReviewCardProps {
  review: Review;
  isGenerating: boolean;
  selectedTone?: SuggestionTone;
  onGenerate: (reviewId: string) => void;
  onSelectSuggestion: (reviewId: string, tone: SuggestionTone) => void;
  onApprove: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  isGenerating,
  selectedTone,
  onGenerate,
  onSelectSuggestion,
  onApprove
}: ReviewCardProps) {
  const isResolved = review.status === "Resolved";

  return (
    <Card as="article" className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {review.placeName || review.placeAddress ? (
            <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              {review.placeName ? (
                <p className="break-words text-sm font-semibold leading-5 text-slate-950">{review.placeName}</p>
              ) : null}
              {review.placeAddress ? (
                <p className="mt-0.5 break-words text-xs leading-5 text-slate-500">{review.placeAddress}</p>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-slate-950">{review.authorName}</h2>
            <StatusBadge status={review.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <RatingStars rating={review.rating} />
            <time className="text-sm text-slate-500" dateTime={review.reviewDate}>
              {new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
                year: "numeric"
              }).format(new Date(review.reviewDate))}
            </time>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onGenerate(review.id)}
          disabled={isGenerating || isResolved}
          className="w-full md:w-auto"
        >
          {isGenerating ? "Generating..." : "Generate AI"}
        </Button>
      </div>

      <p className="mt-4 break-words text-sm leading-6 text-slate-700">{review.content}</p>

      {isGenerating ? (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
          <LoadingSpinner />
          <span>Generating AI suggestions...</span>
        </div>
      ) : null}

      {!isGenerating && review.aiSuggestions && !isResolved ? (
        <AiSuggestionPanel
          suggestions={review.aiSuggestions}
          selectedTone={selectedTone}
          isApproved={isResolved}
          onSelect={(tone) => onSelectSuggestion(review.id, tone)}
          onApprove={() => onApprove(review.id)}
        />
      ) : null}

      {review.selectedReply ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">Approved Reply</p>
          <p className="mt-2 break-words text-sm leading-6 text-emerald-950">{review.selectedReply}</p>
        </div>
      ) : null}
    </Card>
  );
}

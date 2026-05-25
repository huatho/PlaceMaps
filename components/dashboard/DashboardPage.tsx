"use client";

import { useMemo, useState } from "react";
import { PlaceIdForm } from "@/components/dashboard/PlaceIdForm";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { API_ERROR_MESSAGES, APP_CONFIG } from "@/constants";
import type {
  ApproveReviewRequest,
  ApproveReviewResponse,
  FetchReviewsResponse,
  GenerateAiRequest,
  GenerateAiResponse
} from "@/types/api";
import type { Review, SuggestionTone } from "@/types/review";

export function DashboardPage() {
  const [placeId, setPlaceId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [generatingReviewId, setGeneratingReviewId] = useState<string | null>(null);
  const [selectedTones, setSelectedTones] = useState<Record<string, SuggestionTone>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const hasReviews = reviews.length > 0;

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "Pending" ? -1 : 1;
        }

        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
      }),
    [reviews]
  );

  const handleFetchReviews = async () => {
    setFetchError("");
    setSuccessMessage("");

    if (!placeId.trim()) {
      setReviews([]);
      setFetchError(API_ERROR_MESSAGES.placeIdRequired);
      return;
    }

    setIsFetching(true);

    try {
      const response = await fetch("/api/reviews/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: placeId.trim() })
      });
      const payload = (await response.json()) as FetchReviewsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Unable to fetch reviews." : payload.error);
      }

      setReviews(payload.data.reviews);
      setSelectedTones({});
    } catch (error) {
      setReviews([]);
      setFetchError(error instanceof Error ? error.message : "Unable to fetch reviews.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerateAi = async (reviewId: string) => {
    const review = reviews.find((item) => item.id === reviewId);

    if (!review || review.status === "Resolved") {
      return;
    }

    setSuccessMessage("");
    setGeneratingReviewId(reviewId);

    try {
      const requestBody: GenerateAiRequest = { review };
      const response = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const payload = (await response.json()) as GenerateAiResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Unable to generate AI suggestions." : payload.error);
      }

      setReviews((currentReviews) =>
        currentReviews.map((item) =>
          item.id === reviewId ? { ...item, aiSuggestions: payload.data.suggestions } : item
        )
      );
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Unable to generate AI suggestions.");
    } finally {
      setGeneratingReviewId(null);
    }
  };

  const handleSelectSuggestion = (reviewId: string, tone: SuggestionTone) => {
    setSelectedTones((current) => ({ ...current, [reviewId]: tone }));
  };

  const handleApprove = async (reviewId: string) => {
    const selectedTone = selectedTones[reviewId];
    const review = reviews.find((item) => item.id === reviewId);

    if (!selectedTone || !review?.aiSuggestions) {
      return;
    }

    const selectedReply = review.aiSuggestions[selectedTone];
    const requestBody: ApproveReviewRequest = { selectedReply, selectedTone };

    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const payload = (await response.json()) as ApproveReviewResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Unable to approve reply." : payload.error);
      }

      setReviews((currentReviews) =>
        currentReviews.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                status: payload.data.status,
                selectedReply: payload.data.selectedReply
              }
            : item
        )
      );
      setSuccessMessage("Reply approved and review moved to Resolved.");
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Unable to approve reply.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                {APP_CONFIG.name}
              </h1>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold uppercase tracking-normal text-slate-600">
                {APP_CONFIG.badge}
              </span>
            </div>
            <p className="mt-2 text-base text-slate-600">{APP_CONFIG.subtitle}</p>
          </div>
        </header>

        <PlaceIdForm
          placeId={placeId}
          isLoading={isFetching}
          error={fetchError}
          onPlaceIdChange={setPlaceId}
          onSubmit={handleFetchReviews}
        />

        <StatsCards reviews={reviews} />

        {successMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Reviews</h2>
            {hasReviews ? <p className="text-sm text-slate-500">{reviews.length} loaded from Google Places</p> : null}
          </div>

          {!hasReviews ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-base font-semibold text-slate-900">No reviews loaded yet</p>
              <p className="mt-2 text-sm text-slate-500">Enter a Google Place ID to fetch Google reviews.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isGenerating={generatingReviewId === review.id}
                  selectedTone={selectedTones[review.id]}
                  onGenerate={handleGenerateAi}
                  onSelectSuggestion={handleSelectSuggestion}
                  onApprove={handleApprove}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

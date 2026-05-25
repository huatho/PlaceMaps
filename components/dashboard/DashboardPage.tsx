"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlaceIdForm } from "@/components/dashboard/PlaceIdForm";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Button } from "@/components/ui/Button";
import { API_ERROR_MESSAGES, APP_CONFIG } from "@/constants";
import type {
  ApproveReviewRequest,
  ApproveReviewResponse,
  DatabaseReviewsResponse,
  FetchReviewsResponse,
  GenerateAiRequest,
  GenerateAiResponse
} from "@/types/api";
import type { Review, SuggestionTone } from "@/types/review";

const DATABASE_REVIEWS_PER_PAGE = 10;

export function DashboardPage() {
  const [placeId, setPlaceId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [databaseReviews, setDatabaseReviews] = useState<Review[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingDatabaseReviews, setIsLoadingDatabaseReviews] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [databaseError, setDatabaseError] = useState("");
  const [generatingReviewId, setGeneratingReviewId] = useState<string | null>(null);
  const [selectedTones, setSelectedTones] = useState<Record<string, SuggestionTone>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [databaseReviewsPage, setDatabaseReviewsPage] = useState(1);

  const hasReviews = reviews.length > 0;
  const hasDatabaseReviews = databaseReviews.length > 0;

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

  const sortedDatabaseReviews = useMemo(
    () =>
      [...databaseReviews].sort((a, b) => {
        const placeA = (a.placeName || a.placeAddress || a.placeId || "").toLocaleLowerCase();
        const placeB = (b.placeName || b.placeAddress || b.placeId || "").toLocaleLowerCase();
        const placeCompare = placeA.localeCompare(placeB);

        if (placeCompare !== 0) {
          return placeCompare;
        }

        if (a.status !== b.status) {
          return a.status === "Pending" ? -1 : 1;
        }

        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
      }),
    [databaseReviews]
  );

  const databaseReviewsTotalPages = Math.max(1, Math.ceil(sortedDatabaseReviews.length / DATABASE_REVIEWS_PER_PAGE));
  const paginatedDatabaseReviews = useMemo(
    () =>
      sortedDatabaseReviews.slice(
        (databaseReviewsPage - 1) * DATABASE_REVIEWS_PER_PAGE,
        databaseReviewsPage * DATABASE_REVIEWS_PER_PAGE
      ),
    [databaseReviewsPage, sortedDatabaseReviews]
  );
  const firstDatabaseReviewNumber = hasDatabaseReviews
    ? (databaseReviewsPage - 1) * DATABASE_REVIEWS_PER_PAGE + 1
    : 0;
  const lastDatabaseReviewNumber = Math.min(databaseReviewsPage * DATABASE_REVIEWS_PER_PAGE, sortedDatabaseReviews.length);

  useEffect(() => {
    setDatabaseReviewsPage((currentPage) => Math.min(currentPage, databaseReviewsTotalPages));
  }, [databaseReviewsTotalPages]);

  const loadDatabaseReviews = useCallback(async () => {
    setDatabaseError("");
    setIsLoadingDatabaseReviews(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const payload = (await response.json()) as DatabaseReviewsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Unable to load database reviews." : payload.error);
      }

      setDatabaseReviews(payload.data.reviews);
      setDatabaseReviewsPage(1);
    } catch (error) {
      setDatabaseError(error instanceof Error ? error.message : "Unable to load database reviews.");
    } finally {
      setIsLoadingDatabaseReviews(false);
    }
  }, []);

  useEffect(() => {
    void loadDatabaseReviews();
  }, [loadDatabaseReviews]);

  const updateReviewInLists = (reviewId: string, updateReview: (review: Review) => Review) => {
    setReviews((currentReviews) =>
      currentReviews.map((review) => (review.id === reviewId ? updateReview(review) : review))
    );
    setDatabaseReviews((currentReviews) =>
      currentReviews.map((review) => (review.id === reviewId ? updateReview(review) : review))
    );
  };

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
      setSuccessMessage(payload.data.message);
      await loadDatabaseReviews();
    } catch (error) {
      setReviews([]);
      setFetchError(error instanceof Error ? error.message : "Unable to fetch reviews.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerateAi = async (reviewId: string) => {
    const review = reviews.find((item) => item.id === reviewId) ?? databaseReviews.find((item) => item.id === reviewId);

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

      updateReviewInLists(reviewId, (item) => ({ ...item, aiSuggestions: payload.data.suggestions }));
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
    const review = reviews.find((item) => item.id === reviewId) ?? databaseReviews.find((item) => item.id === reviewId);

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

      updateReviewInLists(reviewId, (item) => ({
        ...item,
        status: payload.data.status,
        selectedReply: payload.data.selectedReply
      }));
      setSuccessMessage("Reply approved and review moved to Resolved.");
      await loadDatabaseReviews();
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

        <StatsCards reviews={databaseReviews} />

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

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Database Reviews</h2>
            {hasDatabaseReviews ? (
              <p className="text-sm text-slate-500">{databaseReviews.length} reviews in database</p>
            ) : null}
          </div>

          {databaseError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {databaseError}
            </div>
          ) : null}

          {isLoadingDatabaseReviews ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600">
              Loading database reviews...
            </div>
          ) : !hasDatabaseReviews ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-base font-semibold text-slate-900">No database reviews yet</p>
              <p className="mt-2 text-sm text-slate-500">Fetch a Google Place ID to save reviews into Supabase.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedDatabaseReviews.map((review) => (
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
              {databaseReviewsTotalPages > 1 ? (
                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {firstDatabaseReviewNumber}-{lastDatabaseReviewNumber} of {sortedDatabaseReviews.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setDatabaseReviewsPage((currentPage) => Math.max(1, currentPage - 1))}
                      disabled={databaseReviewsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="min-w-20 text-center text-sm font-semibold text-slate-700">
                      {databaseReviewsPage} / {databaseReviewsTotalPages}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setDatabaseReviewsPage((currentPage) =>
                          Math.min(databaseReviewsTotalPages, currentPage + 1)
                        )
                      }
                      disabled={databaseReviewsPage === databaseReviewsTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

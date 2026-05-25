import { createServerSupabaseClient } from "@/lib/supabase";
import type { GooglePlaceDetails } from "@/lib/google-places";
import type { Review, ReviewStatus } from "@/types/review";

interface PlaceRow {
  place_id: string;
  created_at?: string;
  formatted_address: string | null;
  display_name: string | null;
}

interface ReviewRow {
  id: number;
  place_id: string;
  content: string | null;
  author_name: string | null;
  rating: number | null;
  review_date: string | null;
  status: ReviewStatus | string | null;
}

interface ReplyRow {
  id?: number;
  created_at?: string;
  content: string | null;
  review_id: number;
}

function mapReviewRowToReview(review: ReviewRow, selectedReply?: string): Review {
  return {
    id: String(review.id),
    authorName: review.author_name ?? "Google user",
    rating: review.rating ?? 0,
    content: review.content ?? "",
    reviewDate: review.review_date ?? new Date().toISOString(),
    status: review.status === "Resolved" ? "Resolved" : "Pending",
    selectedReply
  };
}

async function getRepliesByReviewId(reviewIds: number[]) {
  if (reviewIds.length === 0) {
    return new Map<number, string>();
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("replies")
    .select("id, created_at, content, review_id")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const repliesByReviewId = new Map<number, string>();

  for (const reply of (data ?? []) as ReplyRow[]) {
    if (!repliesByReviewId.has(reply.review_id) && reply.content) {
      repliesByReviewId.set(reply.review_id, reply.content);
    }
  }

  return repliesByReviewId;
}

export async function getPlaceReviewsFromDatabase(placeId: string): Promise<Review[] | null> {
  const supabase = createServerSupabaseClient();
  const { data: place, error: placeError } = await supabase
    .from("places")
    .select("place_id, created_at, formatted_address, display_name")
    .eq("place_id", placeId)
    .maybeSingle();

  if (placeError) {
    throw new Error(placeError.message);
  }

  if (!place) {
    return null;
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id, place_id, content, author_name, rating, review_date, status")
    .eq("place_id", (place as PlaceRow).place_id)
    .order("review_date", { ascending: false });

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  const reviewRows = (reviews ?? []) as ReviewRow[];
  const repliesByReviewId = await getRepliesByReviewId(reviewRows.map((review) => review.id));

  return reviewRows.map((review) => mapReviewRowToReview(review, repliesByReviewId.get(review.id)));
}

export async function saveFetchedPlaceReviews(place: GooglePlaceDetails): Promise<Review[]> {
  const supabase = createServerSupabaseClient();
  const { error: placeError } = await supabase.from("places").upsert(
    {
      place_id: place.placeId,
      display_name: place.displayName,
      formatted_address: place.formattedAddress
    },
    { onConflict: "place_id" }
  );

  if (placeError) {
    throw new Error(placeError.message);
  }

  if (place.reviews.length === 0) {
    return [];
  }

  const { data: insertedReviews, error: reviewsError } = await supabase
    .from("reviews")
    .insert(
      place.reviews.map((review) => ({
        place_id: place.placeId,
        content: review.content,
        author_name: review.authorName,
        rating: review.rating,
        review_date: review.reviewDate,
        status: "Pending" satisfies ReviewStatus
      }))
    )
    .select("id, place_id, content, author_name, rating, review_date, status")
    .order("review_date", { ascending: false });

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  return ((insertedReviews ?? []) as ReviewRow[]).map((review) => mapReviewRowToReview(review));
}

export async function approveReviewReply(reviewId: string, selectedReply: string): Promise<void> {
  const parsedReviewId = Number(reviewId);

  if (!Number.isInteger(parsedReviewId)) {
    throw new Error("Invalid review id.");
  }

  const supabase = createServerSupabaseClient();
  const { error: replyError } = await supabase.from("replies").insert({
    review_id: parsedReviewId,
    content: selectedReply
  });

  if (replyError) {
    throw new Error(replyError.message);
  }

  const { error: reviewError } = await supabase
    .from("reviews")
    .update({ status: "Resolved" satisfies ReviewStatus })
    .eq("id", parsedReviewId);

  if (reviewError) {
    throw new Error(reviewError.message);
  }
}

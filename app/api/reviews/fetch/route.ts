import { NextResponse } from "next/server";
import { API_ERROR_MESSAGES } from "@/constants";
import { fetchGooglePlaceDetails } from "@/lib/google-places";
import { getPlaceReviewsFromDatabase, saveFetchedPlaceReviews } from "@/lib/review-store";
import type { FetchReviewsRequest, FetchReviewsResponse } from "@/types/api";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<FetchReviewsRequest>;
  const placeId = body.placeId?.trim() ?? "";

  if (!placeId) {
    const response: FetchReviewsResponse = {
      success: false,
      error: API_ERROR_MESSAGES.placeIdRequired
    };

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const databaseReviews = await getPlaceReviewsFromDatabase(placeId);
    const source = databaseReviews ? "database" : "google";
    const reviews = databaseReviews ?? (await saveFetchedPlaceReviews(await fetchGooglePlaceDetails(placeId)));
    const message =
      reviews.length > 0
        ? `${reviews.length} review${reviews.length === 1 ? "" : "s"} loaded from ${
            source === "database" ? "database" : "Google Places"
          }.`
        : source === "database"
          ? "This place is already in the database, but it has no reviews."
          : "This place was saved, but Google Places did not return any reviews.";
    const response: FetchReviewsResponse = {
      success: true,
      data: { reviews, message, source }
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: FetchReviewsResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unable to fetch Google reviews."
    };

    return NextResponse.json(response, { status: 502 });
  }
}

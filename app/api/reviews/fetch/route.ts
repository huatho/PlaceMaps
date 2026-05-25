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
    const reviews = databaseReviews ?? (await saveFetchedPlaceReviews(await fetchGooglePlaceDetails(placeId)));
    const response: FetchReviewsResponse = {
      success: true,
      data: { reviews }
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

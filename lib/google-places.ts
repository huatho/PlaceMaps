import type { Review } from "@/types/review";

const PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places";
const PLACE_DETAILS_FIELD_MASK = "id,displayName,formattedAddress,location,reviews";

interface GoogleLocalizedText {
  text?: string;
  languageCode?: string;
}

interface GoogleAuthorAttribution {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

interface GooglePlaceReview {
  name?: string;
  relativePublishTimeDescription?: string;
  text?: GoogleLocalizedText;
  originalText?: GoogleLocalizedText;
  rating?: number;
  authorAttribution?: GoogleAuthorAttribution;
  publishTime?: string;
  googleMapsUri?: string;
}

interface GooglePlaceDetailsResponse {
  id?: string;
  displayName?: GoogleLocalizedText;
  formattedAddress?: string;
  reviews?: GooglePlaceReview[];
}

export interface GooglePlaceDetails {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  reviews: Review[];
}

function getGooglePlacesApiKey() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY in environment variables.");
  }

  return apiKey;
}

function buildPlaceDetailsUrl(placeId: string) {
  return `${PLACE_DETAILS_URL}/${encodeURIComponent(placeId)}`;
}

function getReviewContent(review: GooglePlaceReview) {
  return review.text?.text ?? review.originalText?.text ?? "";
}

function getReviewDate(review: GooglePlaceReview) {
  return review.publishTime ?? new Date().toISOString();
}

function mapGoogleReviewToReview(
  review: GooglePlaceReview,
  index: number,
  place: { placeId: string; displayName: string; formattedAddress: string }
): Review {
  return {
    id: review.name ?? `google-review-${index + 1}`,
    placeId: place.placeId,
    placeName: place.displayName,
    placeAddress: place.formattedAddress,
    authorName: review.authorAttribution?.displayName ?? "Google user",
    rating: review.rating ?? 0,
    content: getReviewContent(review),
    reviewDate: getReviewDate(review),
    status: "Pending"
  };
}

export async function fetchGooglePlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
  const response = await fetch(buildPlaceDetailsUrl(placeId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getGooglePlacesApiKey(),
      "X-Goog-FieldMask": PLACE_DETAILS_FIELD_MASK
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Google Places request failed with status ${response.status}.`);
  }

  const place = (await response.json()) as GooglePlaceDetailsResponse;
  const placeDetails = {
    placeId: place.id ?? placeId,
    displayName: place.displayName?.text ?? "",
    formattedAddress: place.formattedAddress ?? ""
  };
  const reviews = (place.reviews ?? [])
    .filter((review) => getReviewContent(review).trim().length > 0)
    .map((review, index) => mapGoogleReviewToReview(review, index, placeDetails))
    .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
    .slice(0, 5);

  return {
    placeId: placeDetails.placeId,
    displayName: placeDetails.displayName,
    formattedAddress: placeDetails.formattedAddress,
    reviews
  };
}

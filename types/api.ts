import type { AiSuggestions, Review, ReviewStatus, SuggestionTone } from "@/types/review";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface FetchReviewsRequest {
  placeId: string;
}

export type FetchReviewsResponse = ApiResponse<{
  reviews: Review[];
  message: string;
  source: "database" | "google";
}>;

export type DatabaseReviewsResponse = ApiResponse<{
  reviews: Review[];
}>;

export interface GenerateAiRequest {
  review: Review;
}

export type GenerateAiResponse = ApiResponse<{
  reviewId: string;
  suggestions: AiSuggestions;
}>;

export interface ApproveReviewRequest {
  selectedReply: string;
  selectedTone: SuggestionTone;
}

export type ApproveReviewResponse = ApiResponse<{
  reviewId: string;
  status: ReviewStatus;
  selectedReply: string;
  selectedTone: SuggestionTone;
}>;

export type HealthResponse = ApiResponse<{
  app: string;
  status: "ok";
  timestamp: string;
}>;

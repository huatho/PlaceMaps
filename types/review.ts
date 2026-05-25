export type ReviewStatus = "Pending" | "Resolved";

export type SuggestionTone = "standard" | "friendly" | "recovery";

export interface AiSuggestions {
  standard: string;
  friendly: string;
  recovery: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  reviewDate: string;
  status: ReviewStatus;
  aiSuggestions?: AiSuggestions;
  selectedReply?: string;
}

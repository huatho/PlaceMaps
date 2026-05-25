export const APP_CONFIG = {
  name: "AI-Powered ORM",
  subtitle: "Review Management Dashboard",
  badge: "MVP 0 / Proof of Concept"
} as const;

export const API_ERROR_MESSAGES = {
  placeIdRequired: "Please enter a Google Place ID before fetching reviews.",
  reviewNotFound: "Review not found.",
  selectedReplyRequired: "Selected reply is required before approval."
} as const;

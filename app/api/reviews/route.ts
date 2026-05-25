import { NextResponse } from "next/server";
import { getAllReviewsFromDatabase } from "@/lib/review-store";
import type { DatabaseReviewsResponse } from "@/types/api";

export async function GET() {
  try {
    const reviews = await getAllReviewsFromDatabase();
    const response: DatabaseReviewsResponse = {
      success: true,
      data: { reviews }
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: DatabaseReviewsResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unable to load database reviews."
    };

    return NextResponse.json(response, { status: 502 });
  }
}

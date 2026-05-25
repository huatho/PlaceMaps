import { NextResponse } from "next/server";
import { API_ERROR_MESSAGES } from "@/constants";
import { generateAiReplySuggestions } from "@/lib/openai";
import type { GenerateAiRequest, GenerateAiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await _request.json().catch(() => ({}))) as Partial<GenerateAiRequest>;
  const review = body.review;

  if (!review) {
    const response: GenerateAiResponse = {
      success: false,
      error: API_ERROR_MESSAGES.reviewNotFound
    };

    return NextResponse.json(response, { status: 404 });
  }

  try {
    const suggestions = await generateAiReplySuggestions(review);
    const response: GenerateAiResponse = {
      success: true,
      data: {
        reviewId: id,
        suggestions
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: GenerateAiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unable to generate AI suggestions."
    };

    return NextResponse.json(response, { status: 502 });
  }
}

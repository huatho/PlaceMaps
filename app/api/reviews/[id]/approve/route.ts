import { NextResponse } from "next/server";
import { API_ERROR_MESSAGES } from "@/constants";
import { approveReviewReply } from "@/lib/review-store";
import type { ApproveReviewRequest, ApproveReviewResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Partial<ApproveReviewRequest>;

  if (!body.selectedReply || !body.selectedTone) {
    const response: ApproveReviewResponse = {
      success: false,
      error: API_ERROR_MESSAGES.selectedReplyRequired
    };

    return NextResponse.json(response, { status: 400 });
  }

  try {
    await approveReviewReply(id, body.selectedReply);
    const response: ApproveReviewResponse = {
      success: true,
      data: {
        reviewId: id,
        status: "Resolved",
        selectedReply: body.selectedReply,
        selectedTone: body.selectedTone
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApproveReviewResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unable to approve reply."
    };

    return NextResponse.json(response, { status: 502 });
  }
}

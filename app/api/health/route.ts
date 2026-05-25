import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/constants";
import type { HealthResponse } from "@/types/api";

export function GET() {
  const response: HealthResponse = {
    success: true,
    data: {
      app: APP_CONFIG.name,
      status: "ok",
      timestamp: new Date().toISOString()
    }
  };

  return NextResponse.json(response);
}

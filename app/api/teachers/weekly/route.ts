import { NextResponse } from "next/server";
import { getWeeklyStats } from "@/lib/analytics";

export async function GET() {
  const data = getWeeklyStats();
  return NextResponse.json(data);
}

import { NextResponse } from "next/server";
import { getTeacherTotals } from "@/lib/analytics";

export async function GET() {
  const data = getTeacherTotals();
  return NextResponse.json(data);
}

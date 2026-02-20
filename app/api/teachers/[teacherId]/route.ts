import { NextResponse } from "next/server";
import { getTeacherAnalytics } from "@/lib/teacher.service";

export async function GET(
  request: Request,
  context: { params: Promise<{ teacherId: string }> }
) {
  const resolvedParams = await context.params;
  const teacherId = resolvedParams.teacherId;

  const teacherIdPattern = /^T\d{3}$/;

  if (!teacherIdPattern.test(teacherId)) {
    return NextResponse.json(
      { error: "Invalid teacher ID format" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const gradeParam = searchParams.get("grade");

  let grade: number | undefined;

  if (gradeParam) {
    const parsed = Number(gradeParam);

    if (isNaN(parsed)) {
      return NextResponse.json(
        { error: "Grade must be a number" },
        { status: 400 }
      );
    }

    grade = parsed;
  }

  const result = getTeacherAnalytics(teacherId, { grade });

  if (!result) {
    return NextResponse.json(
      { error: "Teacher not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}

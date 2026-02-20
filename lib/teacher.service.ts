import { getTeacherById } from "@/lib/analytics";

type Filters = {
  grade?: number;
};

export function getTeacherAnalytics(
  teacherId: string,
  filters: Filters = {}
) {
  const data = getTeacherById(teacherId);

  if (!data) return null;

  let activities = data.activities;

  // Grade filtering
  if (filters.grade !== undefined) {
    activities = activities.filter(
      (activity) => activity.grade === filters.grade
    );
  }

  // Recalculate summary
  let lessons = 0;
  let quizzes = 0;
  let questionPapers = 0;

  for (const activity of activities) {
    if (activity.activity_type === "Lesson Plan") lessons++;
    if (activity.activity_type === "Quiz") quizzes++;
    if (activity.activity_type === "Question Paper")
      questionPapers++;
  }

  return {
    teacher_id: teacherId,
    teacher_name: data.teacher_name,
    lessons,
    quizzes,
    questionPapers,
    activities,
  };
}

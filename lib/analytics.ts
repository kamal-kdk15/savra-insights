import { rawActivities } from "./data";
import { removeDuplicates } from "./dedup";
import { TeacherTotals, WeeklyStats } from "./types";
import { format, startOfWeek } from "date-fns";

type ActivityCounts = {
  lessons: number;
  quizzes: number;
  questionPapers: number;
};

function countActivities(activities: typeof rawActivities): ActivityCounts {
  let lessons = 0;
  let quizzes = 0;
  let questionPapers = 0;

  for (const activity of activities) {
    switch (activity.activity_type) {
      case "Lesson Plan":
        lessons++;
        break;
      case "Quiz":
        quizzes++;
        break;
      case "Question Paper":
        questionPapers++;
        break;
    }
  }

  return { lessons, quizzes, questionPapers };
}

function getCleanData() {
  return removeDuplicates(rawActivities);
}

export function getTeacherTotals(): TeacherTotals[] {
  const cleanData = getCleanData();
  const totalsMap: Record<string, TeacherTotals> = {};

  for (const activity of cleanData) {
    if (!totalsMap[activity.teacher_id]) {
      totalsMap[activity.teacher_id] = {
        teacher_id: activity.teacher_id,
        teacher_name: activity.teacher_name,
        lessons: 0,
        quizzes: 0,
        questionPapers: 0,
      };
    }

    const counts = countActivities([activity]);

    totalsMap[activity.teacher_id].lessons += counts.lessons;
    totalsMap[activity.teacher_id].quizzes += counts.quizzes;
    totalsMap[activity.teacher_id].questionPapers += counts.questionPapers;
  }

  return Object.values(totalsMap);
}

// lib/analytics.ts mein getWeeklyStats() ko is function se replace karo
// Types mein bhi WeeklyStats ka "week" field "date" ho jaayega — neeche dekho

export function getWeeklyStats(): WeeklyStats[] {
  const cleanData = getCleanData();

  // Group by day (YYYY-MM-DD) — data Feb 11–18 ke beech hai
  // Weekly grouping se sirf 2 points bante hain jo chart pe render nahi hota
  const dailyMap: Record<string, WeeklyStats> = {};

  for (const activity of cleanData) {
    // Extract just the date part "2026-02-12" from "2026-02-12T19:07:41"
    const dateKey = activity.created_at.split("T")[0];

    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        week:           dateKey, // "week" field ka naam same rakhha — types change nahi karni
        lessons:        0,
        quizzes:        0,
        questionPapers: 0,
      };
    }

    switch (activity.activity_type) {
      case "Lesson Plan":    dailyMap[dateKey].lessons++;        break;
      case "Quiz":           dailyMap[dateKey].quizzes++;        break;
      case "Question Paper": dailyMap[dateKey].questionPapers++; break;
    }
  }

  // Sort oldest to newest — chart left se right padhega
  return Object.values(dailyMap).sort((a, b) => a.week.localeCompare(b.week));
}


export function getTeacherById(teacherId: string) {
  const cleanData = getCleanData();

  const teacherActivities = cleanData.filter(
    (activity) => activity.teacher_id === teacherId
  );

  if (teacherActivities.length === 0) return null;

  const counts = countActivities(teacherActivities);

  return {
    teacher_id: teacherId,
    teacher_name: teacherActivities[0].teacher_name,
    ...counts,
    activities: teacherActivities,
  };
}

export type ActivityType =
  | "Lesson Plan"
  | "Quiz"
  | "Question Paper";

export interface TeacherActivity {
  teacher_id: string;
  teacher_name: string;
  grade: number;
  subject: string;
  activity_type: ActivityType;
  created_at: string; // ISO string
}

export interface TeacherTotals {
  teacher_id: string;
  teacher_name: string;
  lessons: number;
  quizzes: number;
  questionPapers: number;
}

export interface WeeklyStats {
  week: string;
  lessons: number;
  quizzes: number;
  questionPapers: number;
}

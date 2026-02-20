"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTeacherById } from "@/lib/analytics";
import { Sidebar }    from "@/components/Sidebar ";
import { StatsCard }  from "@/components/StatsCard";
import { WeeklyStats } from "@/lib/types";

const BADGE: Record<string, string> = {
  "Lesson Plan":    "bg-violet-100 text-violet-700",
  "Quiz":           "bg-blue-100 text-blue-700",
  "Question Paper": "bg-emerald-100 text-emerald-700",
};

interface Props {
  params: Promise<{ teacherId: string }>;
}

export default function TeacherDetailPage({ params }: Props) {
  // Next.js 16 — params is a Promise, unwrap with React.use()
  const { teacherId } = use(params);
  const teacher = getTeacherById(teacherId);

  if (!teacher) {
    return (
      <div className="flex min-h-screen bg-[#f7f6ff]">
        <Sidebar />
        <main className="ml-[220px] flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300">Teacher not found</p>
            <Link href="/dashboard" className="text-violet-500 text-sm mt-3 inline-block hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const total = teacher.lessons + teacher.quizzes + teacher.questionPapers;

  // ── Daily chart data ───────────────────────────────────────────────────────
  const dailyMap: Record<string, WeeklyStats> = {};
  for (const a of teacher.activities) {
    const key = a.created_at.split("T")[0];
    if (!dailyMap[key]) dailyMap[key] = { week: key, lessons: 0, quizzes: 0, questionPapers: 0 };
    if (a.activity_type === "Lesson Plan")         dailyMap[key].lessons++;
    else if (a.activity_type === "Quiz")           dailyMap[key].quizzes++;
    else if (a.activity_type === "Question Paper") dailyMap[key].questionPapers++;
  }
  const chartData = Object.values(dailyMap).sort((a, b) => a.week.localeCompare(b.week));

  // ── Grade breakdown ────────────────────────────────────────────────────────
  const gradeMap: Record<number, { lessons: number; quizzes: number; papers: number }> = {};
  for (const a of teacher.activities) {
    if (!gradeMap[a.grade]) gradeMap[a.grade] = { lessons: 0, quizzes: 0, papers: 0 };
    if (a.activity_type === "Lesson Plan")         gradeMap[a.grade].lessons++;
    else if (a.activity_type === "Quiz")           gradeMap[a.grade].quizzes++;
    else if (a.activity_type === "Question Paper") gradeMap[a.grade].papers++;
  }
  const grades = Object.entries(gradeMap)
    .map(([g, c]) => ({ grade: Number(g), ...c }))
    .sort((a, b) => a.grade - b.grade);

  // ── Recent 8 activities ────────────────────────────────────────────────────
  const recent = [...teacher.activities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const subjects = [...new Set(teacher.activities.map((a) => a.subject))].join(", ");
  const initials = teacher.teacher_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f7f6ff]">
      <Sidebar />
      <main className="ml-[220px] flex-1 p-8">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </Link>

        {/* Teacher header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{teacher.teacher_name}</h1>
            <p className="text-sm text-gray-400 mt-1">
              Subject: <span className="text-gray-600 font-medium">{subjects}</span>
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {grades.map((g) => (
                <span key={g.grade} className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium">
                  Grade {g.grade}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-2xl px-6 py-3 text-center flex-shrink-0">
            <p className="text-3xl font-bold text-violet-600">{total}</p>
            <p className="text-xs text-violet-400 font-medium mt-0.5">Total Activities</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard label="Lesson Plans"    value={teacher.lessons}        color="violet"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          />
          <StatsCard label="Quizzes"         value={teacher.quizzes}        color="blue"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
          />
          <StatsCard label="Question Papers" value={teacher.questionPapers} color="green"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
        </div>

        {/* Chart — inline since recharts might not be installed yet */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-1">
            {teacher.teacher_name.split(" ")[0]}&apos;s Daily Activity
          </h3>
          <p className="text-sm text-gray-400 mb-5">Activity breakdown by day</p>
          <div className="space-y-2">
            {chartData.map((d) => {
              const dayTotal = d.lessons + d.quizzes + d.questionPapers;
              const maxVal   = Math.max(...chartData.map((x) => x.lessons + x.quizzes + x.questionPapers)) || 1;
              const label    = new Date(d.week + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div key={d.week} className="flex items-center gap-3">
                  <span className="w-12 text-xs text-gray-400 flex-shrink-0 text-right">{label}</span>
                  <div className="flex-1 flex gap-0.5 h-6 rounded-md overflow-hidden bg-gray-100">
                    {d.lessons > 0 && (
                      <div className="bg-violet-400 flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ width: `${(d.lessons / maxVal) * 100}%` }} title={`${d.lessons} Lessons`}>
                        {d.lessons}
                      </div>
                    )}
                    {d.quizzes > 0 && (
                      <div className="bg-blue-400 flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ width: `${(d.quizzes / maxVal) * 100}%` }} title={`${d.quizzes} Quizzes`}>
                        {d.quizzes}
                      </div>
                    )}
                    {d.questionPapers > 0 && (
                      <div className="bg-emerald-400 flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ width: `${(d.questionPapers / maxVal) * 100}%` }} title={`${d.questionPapers} Papers`}>
                        {d.questionPapers}
                      </div>
                    )}
                  </div>
                  <span className="w-4 text-xs text-gray-400 flex-shrink-0">{dayTotal}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
            {[["Lessons","bg-violet-400"],["Quizzes","bg-blue-400"],["Papers","bg-emerald-400"]].map(([l,b]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-3 h-3 rounded-sm ${b}`} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Grade breakdown + Recent activity */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Grade-wise Breakdown</h3>
            <div className="space-y-3">
              {grades.map((g) => {
                const tot = (g.lessons + g.quizzes + g.papers) || 1;
                const pct = (n: number) => `${Math.round((n / tot) * 100)}%`;
                return (
                  <div key={g.grade} className="flex items-center gap-3">
                    <span className="w-14 text-sm text-gray-500 font-medium flex-shrink-0 text-right">Grade {g.grade}</span>
                    <div className="flex-1 flex gap-0.5 h-8 rounded-lg overflow-hidden bg-gray-100">
                      {g.lessons > 0 && <div className="bg-violet-300 flex items-center justify-center text-violet-800 text-xs font-bold" style={{ width: pct(g.lessons) }}>{g.lessons}</div>}
                      {g.quizzes > 0 && <div className="bg-blue-300 flex items-center justify-center text-blue-800 text-xs font-bold"   style={{ width: pct(g.quizzes) }}>{g.quizzes}</div>}
                      {g.papers  > 0 && <div className="bg-emerald-300 flex items-center justify-center text-emerald-800 text-xs font-bold" style={{ width: pct(g.papers) }}>{g.papers}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-5 pt-4 border-t border-gray-100">
              {[["Lessons","bg-violet-300"],["Quizzes","bg-blue-300"],["Papers","bg-emerald-300"]].map(([l,b]) => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-3 h-3 rounded-sm ${b}`} />{l}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Recent Activity</h3>
            <div className="space-y-1.5">
              {recent.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 mt-0.5 ${BADGE[a.activity_type] ?? "bg-gray-100 text-gray-600"}`}>
                    {a.activity_type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 font-medium truncate">{a.subject} · Grade {a.grade}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

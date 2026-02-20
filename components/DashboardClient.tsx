"use client";

// ── FILE: components/DashboardClient.tsx ──────────────────────────────────────
// Client component — needs useState for the teacher filter dropdown.
// Data comes in as props from the server component (no extra fetching).

import { useState } from "react";
import { TeacherTotals, WeeklyStats } from "@/lib/types";
import { Sidebar }        from "@/components/Sidebar ";
import { StatsCard }      from "@/components/StatsCard";
import { WeeklyChart }    from "@/components/WeeklyChart";
import { TeacherTable }   from "@/components/TeacherTable";
import { InsightsPanel }  from "@/components/InsightsPanel";

interface Props {
  teachers:   TeacherTotals[];
  weeklyData: WeeklyStats[];
}

export function DashboardClient({ teachers, weeklyData }: Props) {
  // "all" means no filter — show every teacher
  const [selectedId, setSelectedId] = useState<string>("all");

  // Filter the teacher table based on dropdown selection
  const filteredTeachers =
    selectedId === "all"
      ? teachers
      : teachers.filter((t) => t.teacher_id === selectedId);

  // Stats always show school-wide totals regardless of filter
  const totalLessons = teachers.reduce((s, t) => s + t.lessons, 0);
  const totalQuizzes = teachers.reduce((s, t) => s + t.quizzes, 0);
  const totalPapers  = teachers.reduce((s, t) => s + t.questionPapers, 0);
  const totalAll     = totalLessons + totalQuizzes + totalPapers;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#f7f6ff]">
      <Sidebar />

      <main className="ml-[220px] flex-1 p-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400 mb-1">{today}</p>
            <h1 className="text-2xl font-bold text-gray-900">School Insights</h1>
            <p className="text-gray-400 text-sm mt-1">
              See what&apos;s happening across your school
            </p>
          </div>

          {/* ── Teacher filter dropdown ────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 font-medium whitespace-nowrap">
              Filter by teacher:
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer shadow-sm"
            >
              <option value="all">All Teachers</option>
              {teachers.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>
                  {t.teacher_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Stats cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatsCard
            label="Total Activities"
            value={totalAll}
            color="violet"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatsCard
            label="Lesson Plans"
            value={totalLessons}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatsCard
            label="Quizzes"
            value={totalQuizzes}
            color="green"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatsCard
            label="Question Papers"
            value={totalPapers}
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        {/* ── Weekly chart + AI Insights — 2/3 + 1/3 split ──────────────── */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="col-span-2">
            <WeeklyChart data={weeklyData} />
          </div>
          <div>
            <InsightsPanel
              scope="school"
              teachers={teachers}
              weeklyData={weeklyData}
            />
          </div>
        </div>

        {/* ── Teacher table — filtered by dropdown ──────────────────────── */}
        <TeacherTable teachers={filteredTeachers} />

      </main>
    </div>
  );
}

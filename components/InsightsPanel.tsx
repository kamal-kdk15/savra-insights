"use client";

import { useState } from "react";
import type { TeacherOverview, WeeklyDataPoint } from "@/lib/types";

interface Props {
  scope:           "school" | "teacher";
  teachers?:       TeacherOverview[];
  weeklyData?:     WeeklyDataPoint[];
  teacherName?:    string;
  teacherContext?: string;
}

// Builds a concise text summary so Gemini gets real data without a huge token bill
function buildSchoolContext(t: TeacherOverview[], w: WeeklyDataPoint[]): string {
  const teacherLines = t.map(
    (x) =>
      `${x.name} (${x.subject}): ${x.lessonPlans} lesson plans, ` +
      `${x.quizzes} quizzes, ${x.questionPapers} question papers — ` +
      `Grades ${x.grades.join(", ")}`
  ).join("\n");

  const weekLines = w.map(
    (d) => `${d.date}: ${d.lessons} lessons, ${d.quizzes} quizzes, ${d.papers} papers`
  ).join(" | ");

  return `Teachers:\n${teacherLines}\n\nWeekly trend: ${weekLines}`;
}

export function InsightsPanel({ scope, teachers, weeklyData, teacherName, teacherContext }: Props) {
  const [insights,  setInsights]  = useState<string[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);

    const context =
      scope === "school"
        ? buildSchoolContext(teachers ?? [], weeklyData ?? [])
        : (teacherContext ?? "");

    try {
      const res = await fetch("/api/insights", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ context, scope, teacherName }),
      });
      const data = await res.json();
      setInsights(data.insights);
      setGenerated(true);
    } catch {
      setError("Failed to reach Gemini. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  const emojis = ["📊", "🏆", "⚠️", "💡"];

  return (
    <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>✨</span> AI Pulse Summary
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {scope === "school"
              ? "Real-time insights from your school data"
              : `Performance notes for ${teacherName}`}
          </p>
        </div>
        {generated && !loading && (
          <button onClick={generate} className="text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors">
            Refresh
          </button>
        )}
      </div>

      {/* Idle — prompt to generate */}
      {!generated && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 max-w-[180px]">
            Generate AI insights based on this week&apos;s data
          </p>
          <button
            onClick={generate}
            className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-xl transition-colors"
          >
            Generate Insights
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex-1 space-y-3 animate-pulse">
          {[1, 2, 3, scope === "school" ? 4 : 0].filter(Boolean).map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mt-2">{error}</div>
      )}

      {/* Insights list */}
      {generated && !loading && insights.length > 0 && (
        <div className="flex-1 space-y-2.5">
          {insights.map((insight, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-violet-50/60 hover:bg-violet-50 transition-colors">
              <span className="flex-shrink-0 mt-0.5">{emojis[i] ?? "💡"}</span>
              <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-1">Powered by Google Gemini Flash</p>
        </div>
      )}
    </div>
  );
}

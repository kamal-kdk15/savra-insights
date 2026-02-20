"use client";

import { useState } from "react";
import { TeacherTotals, WeeklyStats } from "@/lib/types";

interface Props {
  scope: "school" | "teacher";
  teachers?: TeacherTotals[];
  weeklyData?: WeeklyStats[];
  teacherName?: string;
  teacherContext?: string;
}

function buildSchoolContext(t: TeacherTotals[], w: WeeklyStats[]): string {
  const teacherLines = t
    .map(
      (x) =>
        `${x.teacher_name}: ${x.lessons} lessons, ${x.quizzes} quizzes, ${x.questionPapers} papers`
    )
    .join("\n");

  const weekLines = w
    .map(
      (d) =>
        `${d.week}: ${d.lessons} lessons, ${d.quizzes} quizzes, ${d.questionPapers} papers`
    )
    .join(" | ");

  return `Teachers:\n${teacherLines}\n\nDaily trend: ${weekLines}`;
}

export function InsightsPanel({
  scope,
  teachers,
  weeklyData,
  teacherName,
  teacherContext,
}: Props) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (loading) return;

    setLoading(true);
    setError(null);

    const context =
      scope === "school"
        ? buildSchoolContext(teachers ?? [], weeklyData ?? [])
        : teacherContext ?? "";

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, scope, teacherName }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI request failed");
      }

      setInsights(Array.isArray(data.insights) ? data.insights : []);
      setGenerated(true);
    } catch (err: any) {
      setInsights([]);
      setGenerated(true);
      setError(err?.message || "AI unavailable. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  const emojis = ["📊", "🏆", "⚠️", "💡"];
return (
  <div className="bg-white rounded-2xl p-6 flex flex-col min-h-[420px] max-h-[520px] shadow-sm border border-gray-100">

    {/* Header */}
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="font-semibold text-gray-900 text-lg">
          ✨ AI Pulse Summary
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {scope === "school"
            ? "School-wide insights"
            : `Notes for ${teacherName}`}
        </p>
      </div>

      {generated && !loading && (
        <button
          onClick={generate}
          className="text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
        >
          Refresh
        </button>
      )}
    </div>

    {/* Generate State */}
    {!generated && !loading && (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-xl">
          ✨
        </div>
        <p className="text-sm text-gray-500">
          Generate AI insights from your data
        </p>
        <button
          onClick={generate}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          Generate Insights
        </button>
      </div>
    )}

    {/* Loading State */}
    {loading && (
      <div className="flex-1 min-h-0 space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    )}

    {/* Error */}
    {error && (
      <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
        {error}
      </div>
    )}

    {/* Insights */}
    {generated &&
      !loading &&
      Array.isArray(insights) &&
      insights.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">

          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-violet-50/60 hover:bg-violet-50 transition-colors border border-transparent hover:border-violet-100 w-full min-w-0"
            >
              <span className="flex-shrink-0 text-lg mt-0.5">
                {emojis[i] ?? "💡"}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed break-words">
                  {insight}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Powered by Google Gemini Flash
            </p>
          </div>
        </div>
      )}
  </div>
)}

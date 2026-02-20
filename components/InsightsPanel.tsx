"use client";

import { useState } from "react";
import { TeacherTotals, WeeklyStats } from "@/lib/types";

interface Props {
  scope:           "school" | "teacher";
  teachers?:       TeacherTotals[];
  weeklyData?:     WeeklyStats[];
  teacherName?:    string;
  teacherContext?: string;
}

function buildSchoolContext(t: TeacherTotals[], w: WeeklyStats[]): string {
  const teacherLines = t.map(
    (x) => `${x.teacher_name}: ${x.lessons} lessons, ${x.quizzes} quizzes, ${x.questionPapers} papers`
  ).join("\n");
  const weekLines = w.map(
    (d) => `${d.week}: ${d.lessons} lessons, ${d.quizzes} quizzes, ${d.questionPapers} papers`
  ).join(" | ");
  return `Teachers:\n${teacherLines}\n\nDaily trend: ${weekLines}`;
}

// sessionStorage helpers — key lives only in this browser tab
function getSavedKey(): string {
  try { return sessionStorage.getItem("gemini_api_key") ?? ""; }
  catch { return ""; }
}
function saveKey(k: string) {
  try { sessionStorage.setItem("gemini_api_key", k); }
  catch {}
}
function clearKey() {
  try { sessionStorage.removeItem("gemini_api_key"); }
  catch {}
}

export function InsightsPanel({ scope, teachers, weeklyData, teacherName, teacherContext }: Props) {
  const [insights,     setInsights]     = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [generated,    setGenerated]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput,     setKeyInput]     = useState("");

  async function runGenerate(apiKey: string) {
    setLoading(true);
    setError(null);
    setShowKeyInput(false);

    const context = scope === "school"
      ? buildSchoolContext(teachers ?? [], weeklyData ?? [])
      : (teacherContext ?? "");

    try {
      const res  = await fetch("/api/insights", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ context, scope, teacherName, apiKey }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        // Wrong key — clear it so user can re-enter
        clearKey();
        throw new Error(data.error || "AI request failed");
      }

      setInsights(Array.isArray(data.insights) ? data.insights : []);
      setGenerated(true);
    } catch (err: any) {
      setError(err?.message || "AI unavailable. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    if (loading) return;
    const saved = getSavedKey();
    if (!saved) { setShowKeyInput(true); return; }
    runGenerate(saved);
  }

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    saveKey(keyInput.trim());
    runGenerate(keyInput.trim());
    setKeyInput("");
  }

  const emojis = ["📊", "🏆", "⚠️", "💡"];

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col min-h-[420px] max-h-[520px] shadow-sm border border-gray-100">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">✨ AI Pulse Summary</h3>
          <p className="text-xs text-gray-400 mt-1">
            {scope === "school" ? "School-wide insights" : `Notes for ${teacherName}`}
          </p>
        </div>
        {generated && !loading && (
          <button onClick={handleGenerate}
            className="text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors">
            Refresh
          </button>
        )}
      </div>

      {/* API Key input */}
      {showKeyInput && (
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-800 mb-1">Enter your Gemini API Key</p>
            <p className="text-xs text-gray-400 mb-3">
              Free key at{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                className="text-violet-500 underline">aistudio.google.com</a>
              . Saved in your browser session only — never sent to our servers.
            </p>
            <form onSubmit={handleKeySubmit} className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIza..."
                autoFocus
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button type="submit"
                className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
                Go
              </button>
            </form>
          </div>
          <button onClick={() => setShowKeyInput(false)}
            className="text-xs text-gray-400 hover:text-gray-600 text-center">
            Cancel
          </button>
        </div>
      )}

      {/* Idle */}
      {!generated && !loading && !showKeyInput && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-xl">✨</div>
          <p className="text-sm text-gray-500 max-w-[160px]">Generate AI insights from your data</p>
          <button onClick={handleGenerate}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm">
            Generate Insights
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex-1 space-y-3 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
          <button onClick={() => { setError(null); setShowKeyInput(true); }}
            className="block text-xs text-violet-500 mt-1.5 hover:underline">
            Re-enter API key →
          </button>
        </div>
      )}

      {/* Insights */}
      {generated && !loading && insights.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {insights.map((insight, i) => (
            <div key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-violet-50/60 hover:bg-violet-50 transition-colors border border-transparent hover:border-violet-100">
              <span className="flex-shrink-0 text-lg mt-0.5">{emojis[i] ?? "💡"}</span>
              <p className="text-sm text-gray-700 leading-relaxed break-words">{insight}</p>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-1">Powered by Google Gemini Flash</p>
        </div>
      )}
    </div>
  );
}

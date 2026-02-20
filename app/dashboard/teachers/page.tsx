// ── FILE: app/dashboard/teachers/page.tsx ────────────────────────────────────
// All teachers listing page — cards view with quick stats per teacher.
// Click any card to go to that teacher's detail page.

import Link from "next/link";
import { getTeacherTotals } from "@/lib/analytics";
import { Sidebar } from "@/components/Sidebar ";

export default function TeachersPage() {
  const teachers = getTeacherTotals();

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Pick a consistent color per teacher based on their index
  const COLORS = [
    { bg: "bg-violet-100", text: "text-violet-600", ring: "ring-violet-200", bar: "bg-violet-400" },
    { bg: "bg-blue-100",   text: "text-blue-600",   ring: "ring-blue-200",   bar: "bg-blue-400"   },
    { bg: "bg-emerald-100",text: "text-emerald-600",ring: "ring-emerald-200",bar: "bg-emerald-400" },
    { bg: "bg-amber-100",  text: "text-amber-600",  ring: "ring-amber-200",  bar: "bg-amber-400"  },
    { bg: "bg-rose-100",   text: "text-rose-600",   ring: "ring-rose-200",   bar: "bg-rose-400"   },
  ];

  return (
    <div className="flex min-h-screen bg-[#f7f6ff]">
      <Sidebar />

      <main className="ml-[220px] flex-1 p-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-400 text-sm mt-1">
            {teachers.length} active teachers · click a card to view full analysis
          </p>
        </div>

        {/* ── Teacher cards grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((t, i) => {
            const c     = COLORS[i % COLORS.length];
            const total = t.lessons + t.quizzes + t.questionPapers;

            // Progress bar widths — how much of the total each type represents
            const lPct = total ? Math.round((t.lessons        / total) * 100) : 0;
            const qPct = total ? Math.round((t.quizzes        / total) * 100) : 0;
            const pPct = total ? Math.round((t.questionPapers / total) * 100) : 0;

            return (
              <Link
                key={t.teacher_id}
                href={`/dashboard/${t.teacher_id}`}
                className="bg-white rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group block"
              >
                {/* Teacher avatar + name */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center font-bold text-base flex-shrink-0 ring-2 ${c.ring}`}>
                    {initials(t.teacher_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors truncate">
                      {t.teacher_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{t.teacher_id}</p>
                  </div>
                  {/* Arrow — appears on hover */}
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: "Lessons", value: t.lessons,        color: "text-violet-600" },
                    { label: "Quizzes", value: t.quizzes,        color: "text-blue-600"   },
                    { label: "Papers",  value: t.questionPapers, color: "text-emerald-600"},
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-gray-50 rounded-xl py-2.5">
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Activity composition bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-gray-400">Activity mix</p>
                    <p className="text-xs font-semibold text-gray-600">{total} total</p>
                  </div>
                  <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-gray-100">
                    {lPct > 0 && <div className="bg-violet-400 rounded-full" style={{ width: `${lPct}%` }} />}
                    {qPct > 0 && <div className="bg-blue-400"               style={{ width: `${qPct}%` }} />}
                    {pPct > 0 && <div className="bg-emerald-400 rounded-full" style={{ width: `${pPct}%` }} />}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {[["Lessons","bg-violet-400"],["Quizzes","bg-blue-400"],["Papers","bg-emerald-400"]].map(([l,b]) => (
                      <div key={l} className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span className={`w-2 h-2 rounded-full ${b}`} />{l}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </main>
    </div>
  );
}

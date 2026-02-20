import Link from "next/link";
import { TeacherTotals } from "@/lib/types";

export function TeacherTable({ teachers }: { teachers: TeacherTotals[] }) {
  // Guard against undefined — TeacherTotals uses teacher_name, not name
  const initials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";


  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Teacher Overview</h3>
        <p className="text-sm text-gray-400 mt-0.5">All-time activity breakdown per teacher</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Teacher", "Lesson Plans", "Quizzes", "Question Papers", "Total", ""].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teachers.map((t) => {
              const total = t.lessons + t.quizzes + t.questionPapers;
              return (
                <tr key={t.teacher_id} className="hover:bg-gray-50/60 transition-colors group">

                  {/* Name + avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-xs flex-shrink-0">
                        {initials(t.teacher_name)}
                      </div>
                      <span className="font-medium text-gray-900">{t.teacher_name}</span>
                    </div>
                  </td>

                  {/* Activity counts */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700">{t.lessons}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700">{t.quizzes}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700">{t.questionPapers}</span>
                    </div>
                  </td>

                  {/* Total — purple highlight */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-violet-600">{total}</span>
                  </td>

                  {/* View link — fades in on hover */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/${t.teacher_id}`}
                      className="text-xs font-medium text-violet-500 hover:text-violet-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      View details →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

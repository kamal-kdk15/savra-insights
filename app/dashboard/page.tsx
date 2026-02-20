import { getTeacherTotals, getWeeklyStats } from "@/lib/analytics";
import { DashboardClient } from "@/components/DashboardClient";

export default function DashboardPage() {
  const teachers   = getTeacherTotals();
  const weeklyData = getWeeklyStats();
console.log("WEEKLY DATA:", JSON.stringify(weeklyData, null, 2)); // ← yeh add karo
  
  return <DashboardClient teachers={teachers} weeklyData={weeklyData} />;
}

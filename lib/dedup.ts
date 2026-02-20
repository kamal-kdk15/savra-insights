import { TeacherActivity } from "./types";

// Removes duplicate activity uploads based on teacher + type + timestamp
export function removeDuplicates(data: TeacherActivity[]) {
  const seen = new Set<string>();

  return data.filter((item) => {
    const key = `${item.teacher_id}-${item.activity_type}-${item.created_at}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

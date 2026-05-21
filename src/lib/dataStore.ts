import { DailyFile } from '@/types';

export function mergeFiles(existing: DailyFile[], incoming: DailyFile[]): DailyFile[] {
  const map = new Map<string, DailyFile>();
  for (const f of existing) map.set(f.date, f);
  for (const f of incoming) map.set(f.date, f); // incoming replaces existing by date
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

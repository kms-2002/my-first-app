import type { Category } from "./types";

// 실제 공지의 D-day를 계산해야 하므로 고정값이 아닌 실제 오늘 날짜를 사용한다.
export const TODAY = new Date().toISOString().slice(0, 10);

export function daysUntil(dateStr: string, today: string = TODAY): number {
  const a = new Date(today + "T00:00:00");
  const b = new Date(dateStr + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function dDayLabel(dateStr: string, today: string = TODAY): string {
  const diff = daysUntil(dateStr, today);
  if (diff === 0) return "D-DAY";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export function formatDateKorean(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date(dateStr + "T00:00:00").getDay()];
  return `${Number(m)}.${Number(d)}(${weekday})`;
}

export function formatFullDateKorean(dateStr: string, time?: string | null): string {
  const [y, m, d] = dateStr.split("-");
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date(dateStr + "T00:00:00").getDay()];
  const base = `${y}.${Number(m)}.${Number(d)}(${weekday})`;
  return time ? `${base} ${time}` : base;
}

export function formatMonthDayKorean(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date(dateStr + "T00:00:00").getDay()];
  return `${Number(m)}월 ${Number(d)}일(${weekday})`;
}

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> = {
  장학: { bg: "#f5f3ff", text: "#7c3aed" },
  취업: { bg: "#fff7ed", text: "#c2410c" },
  비교과: { bg: "#eff6ff", text: "#1d4ed8" },
  공모전: { bg: "#f0fdf4", text: "#15803d" },
  대외활동: { bg: "#f0fdfa", text: "#0f766e" },
};

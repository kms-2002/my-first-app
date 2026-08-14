import { extractScheduleFromText } from "./scheduleExtractor";
import type { ExtractedInfo, Notice } from "./types";

const CACHE_KEY = "notice-calendar:analysis-cache-v2";

// API 키 없이 무료로 쓸 수 있도록 기본은 규칙 기반(정규식) 추출기를 사용한다.
// ANTHROPIC_API_KEY를 발급받아 더 정확한 분석이 필요해지면 이 값을 "ai"로 바꾸면
// 실제 app/api/analyze(Claude API)를 호출한다.
const ANALYSIS_MODE: "rule" | "ai" = "rule";

function readCache(): Record<string, ExtractedInfo> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, ExtractedInfo>) {
  window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function getCachedAnalysis(noticeId: string): ExtractedInfo | null {
  return readCache()[noticeId] ?? null;
}

// 같은 공지를 반복 분석하지 않도록 sessionStorage에 캐시해 API 호출 비용을 줄인다.
export async function analyzeNotice(notice: Pick<Notice, "id" | "title" | "rawText">): Promise<ExtractedInfo> {
  const cached = getCachedAnalysis(notice.id);
  if (cached) return cached;

  if (ANALYSIS_MODE === "rule") {
    const extracted = extractScheduleFromText(notice.title, notice.rawText);
    writeCache({ ...readCache(), [notice.id]: extracted });
    return extracted;
  }

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: notice.title, rawText: notice.rawText }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "AI 분석에 실패했습니다.");
  }

  const extracted = (await res.json()) as ExtractedInfo;
  writeCache({ ...readCache(), [notice.id]: extracted });
  return extracted;
}

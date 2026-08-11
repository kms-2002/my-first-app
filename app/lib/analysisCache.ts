import { mockAnalysisByNoticeId } from "../data/mockAnalysis";
import type { ExtractedInfo, Notice } from "./types";

const CACHE_KEY = "notice-calendar:analysis-cache-v2";

// ANTHROPIC_API_KEY를 발급받기 전까지는 목업 분석 데이터를 사용한다.
// 키가 준비되면 이 값을 false로 바꾸면 실제 app/api/analyze(Claude API)를 호출한다.
const USE_MOCK_AI = true;

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

  if (USE_MOCK_AI) {
    const mock = mockAnalysisByNoticeId[notice.id];
    if (!mock) throw new Error("이 공지의 목업 분석 데이터가 없습니다.");
    // 실제 API 호출과 비슷한 로딩 체감을 위해 짧은 지연을 흉내낸다.
    await new Promise((resolve) => setTimeout(resolve, 350));
    writeCache({ ...readCache(), [notice.id]: mock });
    return mock;
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

import { NextResponse } from "next/server";
import { mockNotices } from "../../data/mockNotices";
import { scrapeRecentNotices } from "../../lib/server/gnuNoticeSource";
import { readCache, writeCache, isStale, mergeNotices } from "../../lib/server/noticeCache";

// 게시판 3곳을 새로 스크래핑하면 Vercel 기본 함수 제한(10초)을 넘길 수 있어 늘려둔다.
export const maxDuration = 60;

// GNU_SCRAPE_DISABLED=1이면 실제 학교 서버를 긁지 않고 목업 데이터를 반환한다.
// (로컬 개발 중 매번 스크래핑하지 않기 위한 스위치)
export async function GET() {
  if (process.env.GNU_SCRAPE_DISABLED === "1") {
    return NextResponse.json(mockNotices);
  }

  const cache = await readCache();
  if (cache && !isStale(cache)) {
    return NextResponse.json(cache.notices);
  }

  try {
    const knownIds = new Set((cache?.notices ?? []).map((n) => n.id));
    const fresh = await scrapeRecentNotices(knownIds);
    const merged = mergeNotices(cache?.notices ?? [], fresh);
    await writeCache(merged);
    return NextResponse.json(merged);
  } catch (error) {
    console.error("gnu notice scrape failed:", error);
    // 캐시가 있으면 신선하지 않아도 그대로 서비스한다 (스크래핑 실패가 곧 서비스 중단으로 이어지지 않게).
    if (cache) return NextResponse.json(cache.notices);
    return NextResponse.json({ error: "공지를 불러오지 못했습니다." }, { status: 502 });
  }
}

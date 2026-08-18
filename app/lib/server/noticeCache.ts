import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type { Notice } from "../types";

// DB 없이 시작하는 서버 캐시. Vercel 같은 서버리스 환경은 배포 디렉터리가 읽기 전용이고
// os.tmpdir()(=/tmp)만 쓰기가 가능하므로 그쪽에 저장한다. 다만 서버리스 인스턴스가 재활용될
// 때만 캐시가 살아있고, 완전히 새 인스턴스가 뜨면 초기화된다 — 로컬 상시 서버만큼
// 안정적이진 않지만, 그래도 같은 인스턴스가 처리하는 연속 요청에서는 재스크래핑을 막아준다.
// 트래픽이 늘면 Vercel KV 등 영속 저장소로 교체가 필요하다.
const CACHE_DIR = path.join(os.tmpdir(), "gnu-notice-calendar");
const CACHE_FILE = path.join(CACHE_DIR, "notices-cache.json");

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30분
const MAX_STORED_NOTICES = 250; // 게시판 5곳(학사/장학/교내채용/외부기관/교내기관) 최근 글을 함께 보관

interface NoticeCache {
  fetchedAt: string; // ISO datetime
  notices: Notice[];
}

export async function readCache(): Promise<NoticeCache | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as NoticeCache;
  } catch {
    return null;
  }
}

export async function writeCache(notices: Notice[]): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cache: NoticeCache = { fetchedAt: new Date().toISOString(), notices };
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

export function isStale(cache: NoticeCache, maxAgeMs: number = CACHE_TTL_MS): boolean {
  return Date.now() - new Date(cache.fetchedAt).getTime() > maxAgeMs;
}

// 새로 긁은 공지를 기존 캐시와 합친다. id 기준 중복 제거 후 최신순으로 정렬하고,
// 오래된 공지는 잘라내 캐시가 무한정 커지지 않게 한다.
export function mergeNotices(existing: Notice[], fresh: Notice[]): Notice[] {
  const byId = new Map(existing.map((n) => [n.id, n]));
  for (const notice of fresh) byId.set(notice.id, notice);

  return [...byId.values()]
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, MAX_STORED_NOTICES);
}

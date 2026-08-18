import * as cheerio from "cheerio";
import type { Category, Notice } from "../types";
import { guessCategory } from "../categoryHeuristic";
import { politeFetch, sleep, REQUEST_DELAY_MS } from "./politeFetch";

// 경상국립대 공지사항 게시판들. robots.txt에서 차단되지 않은 게시판만 등록한다 (politeFetch.ts 참고).
const BASE_URL = "https://www.gnu.ac.kr";

interface BoardConfig {
  mi: string;
  bbsId: string;
  // 게시판 자체가 카테고리를 보장하면 지정한다 (예: 장학 게시판의 글은 전부 "장학").
  // 지정하지 않으면 제목 키워드로 최선-추정한다 (학사 공지처럼 내용이 섞인 게시판용).
  fixedCategory?: Category;
}

const BOARDS: BoardConfig[] = [
  { mi: "1127", bbsId: "1029" }, // 학사<공지사항<대학소식 (혼합 내용)
  { mi: "1376", bbsId: "1075", fixedCategory: "장학" }, // 장학<공지사항<대학소식
  { mi: "1129", bbsId: "1030", fixedCategory: "취업" }, // 교내채용<공지사항<대학소식
];

// 게시판 하나당 한 번 새로고침할 때 상세 페이지를 가져올 최대 건수. 이미 캐시에 있는 공지는 세지 않는다.
// Vercel 서버리스 함수 제한 시간(app/api/notices/route.ts의 maxDuration) 안에 완전 콜드 스크래핑이
// 끝나도록 값을 보수적으로 잡았다.
export const MAX_DETAIL_FETCHES_PER_BOARD = 8;

// 상세 페이지를 한 번에 몇 건씩 동시에 가져올지. 완전 순차 요청은 (요청 수 × 지연시간)만큼
// 누적되어 콜드 스크래핑 시 Vercel 함수 제한 시간을 넘기기 쉬우므로, 배치 단위로만 예의상 지연을 둔다.
const DETAIL_FETCH_CONCURRENCY = 3;

function listUrl(board: BoardConfig): string {
  return `${BASE_URL}/main/na/ntt/selectNttList.do?mi=${board.mi}&bbsId=${board.bbsId}`;
}

function detailUrl(board: BoardConfig, nttSn: string): string {
  return `${BASE_URL}/main/na/ntt/selectNttInfo.do?mi=${board.mi}&bbsId=${board.bbsId}&nttSn=${nttSn}`;
}

function toIsoDate(dotDate: string): string {
  // "2026.08.06" -> "2026-08-06"
  return dotDate.trim().replaceAll(".", "-").replace(/-$/, "");
}

interface ListRow {
  nttSn: string;
  title: string;
  department: string;
  publishedDate: string;
}

async function fetchNoticeList(board: BoardConfig): Promise<ListRow[]> {
  const html = await politeFetch(listUrl(board));
  const $ = cheerio.load(html);
  const rows: ListRow[] = [];

  $("table tbody tr").each((_, el) => {
    const titleCell = $(el).find("td.ta_l");
    const link = titleCell.find("a.nttInfoBtn[data-id]");
    const nttSn = link.attr("data-id");
    if (!nttSn) return;

    // "새로운 글" 배지가 스크린리더 전용 텍스트(.sr-only)로 제목 안에 섞여 들어오므로 제거하고 추출한다.
    titleCell.find(".sr-only").remove();

    rows.push({
      nttSn,
      title: link.text().replace(/\s+/g, " ").trim(),
      department: titleCell.nextAll("td.BD_tm_none").first().text().trim(),
      publishedDate: toIsoDate($(el).find("td").last().text()),
    });
  });

  return rows;
}

async function fetchNoticeDetail(board: BoardConfig, nttSn: string): Promise<string> {
  const html = await politeFetch(detailUrl(board, nttSn));
  const $ = cheerio.load(html);
  const text = $("tr.cont td").first().text().replace(/\s+/g, " ").trim();
  // 본문이 이미지/첨부파일로만 제공되는 공지는 추출할 텍스트가 없다 — 빈 문자열이면
  // /api/analyze가 필수값 누락으로 오류를 내므로, 텍스트가 없다는 사실 자체를 본문으로 넘긴다.
  return text || "(본문이 이미지 또는 첨부파일로만 제공되어 텍스트가 없습니다.)";
}

// 게시판 하나를 스캔해서, 아직 캐시(knownIds)에 없는 공지의 본문만 새로 긁는다.
// 상세 페이지는 DETAIL_FETCH_CONCURRENCY건씩 묶어 동시에 요청하고, 배치 사이에만 예의상 지연을 둔다
// (건마다 순차 대기하면 콜드 스크래핑 시 Vercel 함수 제한 시간을 넘기기 쉽다).
async function scrapeBoard(board: BoardConfig, knownIds: Set<string>): Promise<Notice[]> {
  const rows = await fetchNoticeList(board);
  const targets = rows
    .filter((row) => !knownIds.has(`gnu-${row.nttSn}`))
    .slice(0, MAX_DETAIL_FETCHES_PER_BOARD);

  const notices: Notice[] = [];
  for (let i = 0; i < targets.length; i += DETAIL_FETCH_CONCURRENCY) {
    if (i > 0) await sleep(REQUEST_DELAY_MS);
    const batch = targets.slice(i, i + DETAIL_FETCH_CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async (row) => ({
        id: `gnu-${row.nttSn}`,
        title: row.title,
        category: board.fixedCategory ?? guessCategory(row.title),
        department: row.department,
        sourceUrl: detailUrl(board, row.nttSn),
        publishedDate: row.publishedDate,
        rawText: await fetchNoticeDetail(board, row.nttSn),
      })),
    );
    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        notices.push(result.value);
      } else {
        // 재시도까지 실패한 개별 상세페이지 하나 때문에 전체 스크래핑을 실패시키지 않고 건너뛴다.
        console.error("상세페이지 스크래핑 실패, 건너뜀:", result.reason);
      }
    }
  }

  return notices;
}

export async function scrapeRecentNotices(knownIds: Set<string>): Promise<Notice[]> {
  const results = await Promise.allSettled(BOARDS.map((board) => scrapeBoard(board, knownIds)));
  return results.flatMap((result) => {
    if (result.status === "fulfilled") return result.value;
    console.error("게시판 스크래핑 실패, 건너뜀:", result.reason);
    return [];
  });
}

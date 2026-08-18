import * as cheerio from "cheerio";
import type { Category, Notice } from "../types";
import { guessCategory } from "../categoryHeuristic";
import { politeFetch, sleep, REQUEST_DELAY_MS } from "./politeFetch";
import { scrapeNerumPrograms } from "./nerumSource";

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
  { mi: "1132", bbsId: "1033" }, // 외부기관<공지사항<대학소식 (공모전·대외활동 공고가 주로 올라오는 게시판, 혼합 내용)
  { mi: "1126", bbsId: "1028" }, // 교내기관<공지사항<대학소식 (교내 서포터즈·창업 경진대회·비교과 프로그램 등이 올라오는 게시판, 혼합 내용)
];

// 게시판 하나당 한 번 새로고침할 때 상세 페이지를 가져올 최대 건수. 이미 캐시에 있는 공지는 세지 않는다.
// 게시판별로 하루에도 여러 건씩 올라오고 공모전/대외활동처럼 드문 카테고리는 최근 글 목록 앞쪽에
// 안 나올 수 있어, 목록을 여러 페이지 훑어서 후보를 넉넉히 확보한 뒤 이만큼 상세 조회한다.
export const MAX_DETAIL_FETCHES_PER_BOARD = 30;

// 게시판 하나당 훑을 목록 페이지 수. 페이지당 10~11건이라 3페이지면 최근 30여 건까지 후보로 본다.
const LIST_PAGES_PER_BOARD = 3;

// 상세 페이지를 한 번에 몇 건씩 동시에 가져올지. 완전 순차 요청은 (요청 수 × 지연시간)만큼
// 누적되어 콜드 스크래핑 시 Vercel 함수 제한 시간을 넘기기 쉬우므로, 배치 단위로만 예의상 지연을 둔다.
const DETAIL_FETCH_CONCURRENCY = 3;

function listUrl(board: BoardConfig, page: number): string {
  return `${BASE_URL}/main/na/ntt/selectNttList.do?mi=${board.mi}&bbsId=${board.bbsId}&currPage=${page}`;
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

// 게시판마다 컬럼 순서/개수가 다르다 (예: 외부기관 게시판은 부서가 제목보다 앞에 오고 끝에 조회수 칸이
// 하나 더 붙는다). "마지막 td = 날짜", "제목 다음 BD_tm_none = 부서" 같은 위치 가정은 게시판마다 깨지므로,
// 값의 생김새(날짜 형식, 순수 숫자 여부)로 찾는다.
const DATE_CELL_PATTERN = /^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?$/;

async function fetchNoticeListPage(board: BoardConfig, page: number): Promise<ListRow[]> {
  const html = await politeFetch(listUrl(board, page));
  const $ = cheerio.load(html);
  const rows: ListRow[] = [];

  $("table tbody tr").each((_, el) => {
    const row = $(el);
    const titleCell = row.find("td.ta_l");
    const link = titleCell.find("a.nttInfoBtn[data-id]");
    const nttSn = link.attr("data-id");
    if (!nttSn) return;

    // "새로운 글" 배지가 스크린리더 전용 텍스트(.sr-only)로 제목 안에 섞여 들어오므로 제거하고 추출한다.
    titleCell.find(".sr-only").remove();

    const allCellText = row
      .find("td")
      .toArray()
      .map((td) => $(td).text().replace(/\s+/g, " ").trim());
    const dateText = allCellText.find((text) => DATE_CELL_PATTERN.test(text)) ?? "";

    // 부서 칸(BD_tm_none) 중 "공지" 배지나 순번·조회수 같은 순수 숫자는 부서명이 아니므로 제외한다.
    const bdCellText = row
      .find("td.BD_tm_none")
      .toArray()
      .map((td) => $(td).text().replace(/\s+/g, " ").trim());
    const department = bdCellText.find((text) => text && text !== "공지" && !/^\d+$/.test(text)) ?? "";

    rows.push({
      nttSn,
      title: link.text().replace(/\s+/g, " ").trim(),
      department,
      publishedDate: toIsoDate(dateText),
    });
  });

  return rows;
}

// 목록 페이지를 LIST_PAGES_PER_BOARD장까지 순차로 훑는다 (페이지 사이엔 예의상 지연을 둔다).
async function fetchNoticeList(board: BoardConfig): Promise<ListRow[]> {
  const rows: ListRow[] = [];
  for (let page = 1; page <= LIST_PAGES_PER_BOARD; page++) {
    if (page > 1) await sleep(REQUEST_DELAY_MS);
    const pageRows = await fetchNoticeListPage(board, page);
    if (pageRows.length === 0) break; // 게시글이 적어 그 페이지가 마지막인 경우
    rows.push(...pageRows);
  }
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
  // 카테고리를 확정 짓지 못하는(= guessCategory가 null을 반환하는) 글은 상세조회 대상에서 아예 제외한다.
  // "비교과"는 학생역량관리시스템에서 별도로 가져오므로, 여기서 애매한 글을 비교과로 폴백시키지 않는다.
  const targets = rows
    .filter((row) => !knownIds.has(`gnu-${row.nttSn}`))
    .map((row) => ({ row, category: board.fixedCategory ?? guessCategory(row.title) }))
    .filter((t): t is { row: ListRow; category: Category } => t.category !== null)
    .slice(0, MAX_DETAIL_FETCHES_PER_BOARD);

  const notices: Notice[] = [];
  for (let i = 0; i < targets.length; i += DETAIL_FETCH_CONCURRENCY) {
    if (i > 0) await sleep(REQUEST_DELAY_MS);
    const batch = targets.slice(i, i + DETAIL_FETCH_CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async ({ row, category }) => ({
        id: `gnu-${row.nttSn}`,
        title: row.title,
        category,
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
  const results = await Promise.allSettled([
    ...BOARDS.map((board) => scrapeBoard(board, knownIds)),
    scrapeNerumPrograms(knownIds), // 비교과는 학생역량관리시스템에서만 가져온다.
  ]);
  return results.flatMap((result) => {
    if (result.status === "fulfilled") return result.value;
    console.error("게시판/비교과 스크래핑 실패, 건너뜀:", result.reason);
    return [];
  });
}

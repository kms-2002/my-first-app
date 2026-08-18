import * as cheerio from "cheerio";
import type { Notice } from "../types";
import { politeFetch, sleep, REQUEST_DELAY_MS } from "./politeFetch";

// 경상국립대 "학생역량관리시스템"(비교과 통합관리시스템). 여기 등록된 프로그램 목록은
// 로그인 없이도 제목·신청기간·교육기간까지 공개돼 있어(신청 자체만 로그인이 필요), 이 목록만으로
// "현재 신청 가능한 비교과 프로그램"을 정확히 판단할 수 있다. 상세페이지는 로그인 후 JS로만 열려서
// 긁을 수 없지만, 목록에 이미 필요한 정보가 다 있어 상세조회가 필요 없다.
const BASE_URL = "https://nerum.gnu.ac.kr";
const LIST_PATH = "/ptfol/imng/icmpNsbjtPgm/findIcmpNsbjtPgmList.do";

// 목록은 "최신 등록순"이 기본값이라 앞쪽 몇 페이지만 봐도 최근 올라온(=아직 신청기간이 안 지났을
// 가능성이 높은) 프로그램 위주로 확인된다. 상세조회가 없어 페이지당 비용이 가볍다.
const LIST_PAGES = 5;

function listUrl(page: number): string {
  return `${BASE_URL}${LIST_PATH}?paginationInfo.currentPageNo=${page}`;
}

// "2026.08.14(금)" 같은 값 하나를 ISO 날짜로.
function toIsoDate(y: string, m: string, d: string): string {
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

const DATE_TOKEN = /(\d{4})\.(\d{1,2})\.(\d{1,2})\([월화수목금토일]\)/;

async function fetchProgramListPage(page: number): Promise<Notice[]> {
  const html = await politeFetch(listUrl(page));
  const $ = cheerio.load(html);
  const notices: Notice[] = [];

  $("a.tit.detailBtn").each((_, el) => {
    const titleEl = $(el);
    const dataParams = titleEl.attr("data-params");
    const seq = dataParams?.match(/"encSddpbSeq"\s*:\s*"([^"]+)"/)?.[1];
    if (!seq) return;

    const container = titleEl.closest("li");
    const title = titleEl.text().replace(/\s+/g, " ").trim();
    const desc = container.find("p.desc").first().text().replace(/\s+/g, " ").trim();
    const department = container.find(".major_type li").first().text().trim();
    const applyRangeText = container.find("dl.apl_date dd").first().text().replace(/\s+/g, " ").trim();
    const eduRangeText = container.find("dl.edu_date dd").first().text().replace(/\s+/g, " ").trim();

    const applyStart = applyRangeText.match(DATE_TOKEN);
    if (!applyStart) return; // 신청기간을 못 읽으면 마감 판단이 불가능하니 건너뛴다.

    notices.push({
      id: `nerum-${seq}`,
      title,
      category: "비교과",
      department,
      sourceUrl: `${BASE_URL}${LIST_PATH}`,
      publishedDate: toIsoDate(applyStart[1], applyStart[2], applyStart[3]),
      rawText: `${title}. ${desc} 신청기간 ${applyRangeText} 교육기간 ${eduRangeText}`,
    });
  });

  return notices;
}

export async function scrapeNerumPrograms(knownIds: Set<string>): Promise<Notice[]> {
  const notices: Notice[] = [];
  for (let page = 1; page <= LIST_PAGES; page++) {
    if (page > 1) await sleep(REQUEST_DELAY_MS);
    const pageNotices = await fetchProgramListPage(page);
    if (pageNotices.length === 0) break;
    notices.push(...pageNotices.filter((n) => !knownIds.has(n.id)));
  }
  return notices;
}

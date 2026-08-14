import type { ExtractedInfo, ScheduleItem } from "./types";

// API 키 없이 무료로 동작하는 규칙 기반(정규식) 일정 추출기.
// 실제 AI만큼 문맥을 이해하진 못하지만, 학교 공지 특유의 정형화된 날짜 표기
// ("2026. 8. 20.(목)", "'26. 8. 3.(월)", "8. 7.(금) ~ 8. 13.(목)")는 안정적으로 잡아낸다.

interface DateToken {
  index: number;
  end: number;
  year: number;
  month: number;
  day: number;
}

function findContextYear(text: string): number {
  const m = text.match(/20\d{2}/);
  return m ? Number(m[0]) : new Date().getFullYear();
}

function collectDateTokens(text: string, contextYear: number): DateToken[] {
  const tokens: DateToken[] = [];

  // 요일 괄호가 있으면 함께 삼켜서, "~" 범위 판별 시 "(금) ~ " 같은 꼬리가 남지 않게 한다.
  const weekdayTail = "(?:\\s*\\([월화수목금토일]\\))?";
  const full = new RegExp(`(\\d{4})\\.\\s*(\\d{1,2})\\.\\s*(\\d{1,2})\\.?${weekdayTail}`, "g");
  const quoted = new RegExp(`['’](\\d{2})\\.\\s*(\\d{1,2})\\.\\s*(\\d{1,2})\\.?${weekdayTail}`, "g");
  const bare = /(?<!\d)(\d{1,2})\.\s*(\d{1,2})\.\s*\([월화수목금토일]\)/g;
  // "2026년 8월 20일(목)" 형식
  const korean = new RegExp(`(\\d{4})년\\s*(\\d{1,2})월\\s*(\\d{1,2})일${weekdayTail}`, "g");
  const koreanBare = /(?<!\d)(\d{1,2})월\s*(\d{1,2})일\s*\([월화수목금토일]\)/g;

  const push = (m: RegExpExecArray, year: number, month: number, day: number) => {
    const overlaps = tokens.some((t) => m.index >= t.index && m.index < t.end);
    if (!overlaps) tokens.push({ index: m.index, end: m.index + m[0].length, year, month, day });
  };

  let m: RegExpExecArray | null;
  while ((m = full.exec(text))) push(m, Number(m[1]), Number(m[2]), Number(m[3]));
  while ((m = quoted.exec(text))) push(m, 2000 + Number(m[1]), Number(m[2]), Number(m[3]));
  while ((m = korean.exec(text))) push(m, Number(m[1]), Number(m[2]), Number(m[3]));
  while ((m = bare.exec(text))) push(m, contextYear, Number(m[1]), Number(m[2]));
  while ((m = koreanBare.exec(text))) push(m, contextYear, Number(m[1]), Number(m[2]));

  return tokens.sort((a, b) => a.index - b.index);
}

function toIsoDate(t: DateToken): string {
  return `${t.year}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}

function findTimeNear(text: string, fromIndex: number): string | null {
  const window = text.slice(fromIndex, fromIndex + 20);
  const m = window.match(/(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

interface LabelMatch {
  label: string;
  type: "deadline" | "activity";
  specific: boolean;
}

const LABEL_RULES: { pattern: RegExp; label: string; type: "deadline" | "activity" }[] = [
  { pattern: /(합격자|선발|심사)\s*발표/, label: "결과 발표", type: "activity" },
  { pattern: /(제출|접수)\s*마감/, label: "제출 마감", type: "deadline" },
  { pattern: /신청\s*마감/, label: "신청 마감", type: "deadline" },
  { pattern: /제출/, label: "제출", type: "deadline" },
  { pattern: /오리엔테이션/, label: "오리엔테이션", type: "activity" },
  { pattern: /발표/, label: "발표", type: "activity" },
  { pattern: /(개강|개최|행사|설명회|특강|시상식|발대식|성과발표회)/, label: "행사", type: "activity" },
  { pattern: /(신청|접수)\s*(기간|기한)/, label: "신청 마감", type: "deadline" },
  { pattern: /수강신청/, label: "수강신청 마감", type: "deadline" },
  { pattern: /등록/, label: "등록 마감", type: "deadline" },
  { pattern: /시작/, label: "시작", type: "activity" },
];

// 날짜 바로 앞 구간(before) 안에서, 배열 순서가 아니라 날짜와 가장 가까운(오른쪽 끝에 있는) 키워드를
// 우선시한다 — 그래야 앞쪽 문장의 무관한 단어에 라벨이 잘못 붙지 않는다.
function findLabel(before: string): LabelMatch {
  let best: { label: string; type: "deadline" | "activity"; end: number } | null = null;

  for (const rule of LABEL_RULES) {
    const global = new RegExp(rule.pattern.source, "g");
    let m: RegExpExecArray | null;
    let lastEnd = -1;
    while ((m = global.exec(before))) {
      lastEnd = m.index + m[0].length;
      if (m[0].length === 0) global.lastIndex++;
    }
    if (lastEnd >= 0 && (!best || lastEnd > best.end)) {
      best = { label: rule.label, type: rule.type, end: lastEnd };
    }
  }

  if (best) return { label: best.label, type: best.type, specific: true };
  if (/까지/.test(before)) {
    return { label: "마감", type: "deadline", specific: false };
  }
  return { label: "일정", type: "activity", specific: false };
}

const AUDIENCE_KEYWORDS = [
  "신입생",
  "편입생",
  "재학생",
  "휴학생",
  "졸업예정자",
  "전 학년",
  "1학년",
  "2학년",
  "3학년",
  "4학년",
];

function findAudience(text: string): string {
  const found = AUDIENCE_KEYWORDS.filter((k) => text.includes(k));
  return found.length > 0 ? found.join(", ") : "본문 확인 필요";
}

export function extractScheduleFromText(title: string, rawText: string): ExtractedInfo {
  // 본문에 연도가 없는 공지도 있어 제목에 있는 "2026학년도" 같은 연도를 우선 참고한다.
  const contextYear = findContextYear(`${title}\n${rawText}`);
  const tokens = collectDateTokens(rawText, contextYear);

  const items: ScheduleItem[] = [];
  const seen = new Set<string>();
  let anySpecific = false;

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    const next = tokens[i + 1];
    const between = next ? rawText.slice(token.end, next.index) : "";
    const isRange = next && /^\s*(~|부터)\s*$/.test(between);

    const before = rawText.slice(Math.max(0, token.index - 40), token.index);
    const match = findLabel(before);
    if (match.specific) anySpecific = true;

    if (isRange && next) {
      // 기간 표현: 마감류 라벨이면 종료일을, 그 외(활동/행사 기간)면 시작일을 캘린더 일정으로 남긴다.
      const useEnd = match.type === "deadline";
      const chosen = useEnd ? next : token;
      const label = useEnd ? match.label : `${match.label} 시작`;
      const date = toIsoDate(chosen);
      const key = `${date}|${label}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ label, date, time: findTimeNear(rawText, chosen.end), type: match.type });
      }
      i += 2;
      continue;
    }

    const date = toIsoDate(token);
    const key = `${date}|${match.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ label: match.label, date, time: findTimeNear(rawText, token.end), type: match.type });
    }
    i += 1;
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  const limited = items.slice(0, 5);

  return {
    hasSchedule: limited.length > 0,
    programName: title,
    scheduleItems: limited,
    targetAudience: findAudience(rawText),
    confidence: anySpecific ? "high" : "low",
  };
}

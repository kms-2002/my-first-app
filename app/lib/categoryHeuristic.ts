import type { Category } from "./types";

// 실제 공지는 카테고리가 태깅되어 있지 않아, 제목 키워드로 최선-추정한다.
// 비교과는 학교 홈페이지 게시판이 아니라 학생역량관리시스템(nerumSource.ts)에서 따로 가져오므로,
// 여기서는 어디에도 안 걸리면 "폴백 비교과" 대신 null(분류 불가)을 반환해 호출부에서 제외시킨다.
const RULES: { category: Category; pattern: RegExp }[] = [
  { category: "장학", pattern: /장학/ },
  { category: "취업", pattern: /취업|채용|인턴|잡페어/ },
  // 공모전은 "경진대회/해커톤"류 명시 키워드 외에, 학교가 실제로 붙이는 관용 표현들도 폭넓게 잡는다:
  // "~챌린지", "~리그"(창업리그 등 팀 경쟁), 제목에 붙는 "[대회]" 태그, "OO톤"(에듀톤·AX톤 등 해커톤류 이름).
  {
    category: "공모전",
    pattern: /공모전|경진대회|챌린지|리그|\[대회\]|아이디어\s*공모|[가-힣A-Za-z0-9]{1,8}-?톤(?=[\s)」》,.]|$)/,
  },
  // 대외활동은 교내 서포터즈/기자단(학교가 직접 운영하는 학생 홍보·활동단)으로 한정한다.
  // 외부기관 게시판의 지자체 축제·행사 홍보 등은 여기 포함하지 않는다.
  { category: "대외활동", pattern: /(?:교내\s*)?서포터즈|기자단/ },
];

export function guessCategory(title: string): Category | null {
  return RULES.find(({ pattern }) => pattern.test(title))?.category ?? null;
}

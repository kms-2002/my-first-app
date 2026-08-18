import type { Category } from "./types";

// 실제 공지는 카테고리가 태깅되어 있지 않아, 제목 키워드로 최선-추정한다.
// 어디에도 안 걸리면 "비교과"로 폴백 (가장 넓은 기본 카테고리).
const RULES: { category: Category; pattern: RegExp }[] = [
  { category: "장학", pattern: /장학/ },
  { category: "취업", pattern: /취업|채용|인턴|잡페어/ },
  { category: "공모전", pattern: /공모전|경진대회|해커톤|아이디어\s*공모/ },
  // 대외활동은 교내 서포터즈/기자단(학교가 직접 운영하는 학생 홍보·활동단)으로 한정한다.
  // 외부기관 게시판의 지자체 축제·행사 홍보 등은 여기 포함하지 않는다.
  { category: "대외활동", pattern: /(?:교내\s*)?서포터즈|기자단/ },
];

export function guessCategory(title: string): Category {
  const rule = RULES.find(({ pattern }) => pattern.test(title));
  return rule ? rule.category : "비교과";
}

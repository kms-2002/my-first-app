import type { Category } from "./types";

// 실제 공지는 카테고리가 태깅되어 있지 않아, 제목 키워드로 최선-추정한다.
// 어디에도 안 걸리면 "비교과"로 폴백 (가장 넓은 기본 카테고리).
const RULES: { category: Category; pattern: RegExp }[] = [
  { category: "장학", pattern: /장학/ },
  { category: "취업", pattern: /취업|채용|인턴|잡페어/ },
  { category: "공모전", pattern: /공모전|경진대회|아이디어\s*공모/ },
  { category: "대외활동", pattern: /서포터즈|기자단|대외활동|봉사단/ },
];

export function guessCategory(title: string): Category {
  const rule = RULES.find(({ pattern }) => pattern.test(title));
  return rule ? rule.category : "비교과";
}

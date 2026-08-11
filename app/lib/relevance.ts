import type { Notice, UserProfile } from "./types";

// AI 호출 없이 규칙 기반으로 "맞춤 선별" 여부와 추천 이유를 계산한다.
// 관심분야 일치는 결정적 규칙으로 충분히 처리할 수 있어, AI 호출은
// 일정 추출(app/api/analyze)에만 집중시켜 데모 비용/지연을 줄인다.
export function matchReason(notice: Notice, profile: UserProfile): string | null {
  const reasons: string[] = [];
  if (profile.interests.includes(notice.category)) {
    reasons.push(`${notice.category} 관심분야 일치`);
  }
  if (notice.rawText.includes(profile.department) || notice.department === profile.department) {
    reasons.push(`${profile.department} 학과 일치`);
  }
  if (reasons.length === 0) return null;
  return reasons.join(" · ");
}

export function isRelevant(notice: Notice, profile: UserProfile): boolean {
  return matchReason(notice, profile) !== null;
}

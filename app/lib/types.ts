export type Category = "장학" | "취업" | "비교과" | "공모전" | "대외활동";

// 목업 "크롤링 결과" — 실제 서비스에서는 학교 공지사항 게시판을 주기적으로 수집한 데이터
export interface Notice {
  id: string;
  title: string;
  category: Category;
  department: string; // 공지 발신 부서 (예: 학생역량개발과)
  sourceUrl: string;
  publishedDate: string; // ISO date (YYYY-MM-DD)
  rawText: string; // AI 분석에 넣을 공지 본문
}

// 공지 하나에서 추출될 수 있는 개별 일정 (신청 마감 / 합격자 발표 / 활동 시작 등)
export interface ScheduleItem {
  label: string; // "신청 마감", "합격자 발표", "오리엔테이션" 등
  date: string; // ISO date (YYYY-MM-DD)
  time: string | null; // "HH:mm", 없으면 null
  type: "deadline" | "activity";
}

// AI 분석 결과 (Claude API 응답을 구조화한 형태)
export interface ExtractedInfo {
  hasSchedule: boolean;
  programName: string;
  scheduleItems: ScheduleItem[];
  targetAudience: string;
  confidence: "high" | "low";
}

export interface UserProfile {
  department: string;
  grade: string;
  interestTags: string[]; // 관심 분야 (AI, 개발, 디자인 등) — 개인화용 태그
  interests: Category[]; // 관심 공지 유형 — 공지 필터링에 직접 사용
}

// 사용자가 "캘린더에 추가"를 눌러 확정한 일정만 저장
export interface CalendarEvent {
  id: string; // `${noticeId}-${scheduleItem index}`
  noticeId: string;
  title: string;
  label: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string | null;
  type: "deadline" | "activity";
  sourceUrl: string;
  confidence: "high" | "low";
}

export interface NotificationSettings {
  deadlineAlerts: boolean;
}

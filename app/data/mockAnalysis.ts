import type { ExtractedInfo } from "../lib/types";

// ANTHROPIC_API_KEY가 아직 없는 동안, 실제 Claude API 응답을 흉내낸 목업 분석 결과.
// app/lib/analysisCache.ts의 USE_MOCK_AI를 false로 바꾸면 실제 API(app/api/analyze)를 호출한다.
export const mockAnalysisByNoticeId: Record<string, ExtractedInfo> = {
  n1: {
    hasSchedule: true,
    programName: "국가장학금 2차 신청",
    scheduleItems: [{ label: "신청 마감", date: "2026-09-05", time: null, type: "deadline" }],
    targetAudience: "소득 구간 산정에 동의한 재학생 전체",
    confidence: "high",
  },
  n2: {
    hasSchedule: true,
    programName: "경남 대학생 창업 아이디어 공모전",
    scheduleItems: [
      { label: "참가 신청 마감", date: "2026-08-18", time: null, type: "deadline" },
      { label: "1차 서류 심사 결과 발표", date: "2026-08-25", time: "17:00", type: "activity" },
      { label: "본선 발표회", date: "2026-09-10", time: "14:00", type: "activity" },
    ],
    targetAudience: "경상국립대 재학생 (팀당 최대 4인)",
    confidence: "high",
  },
  n3: {
    hasSchedule: true,
    programName: "AI 역량강화 프로그램",
    scheduleItems: [
      { label: "신청 마감", date: "2026-08-17", time: "23:59", type: "deadline" },
      { label: "합격자 발표", date: "2026-08-20", time: "17:00", type: "activity" },
      { label: "오리엔테이션", date: "2026-08-25", time: "16:00", type: "activity" },
    ],
    targetAudience: "전 학년 재학생 (선발 30명)",
    confidence: "high",
  },
  n4: {
    hasSchedule: true,
    programName: "현직 개발자 취업특강",
    scheduleItems: [
      { label: "참가 신청 마감", date: "2026-08-19", time: "18:00", type: "deadline" },
      { label: "특강 진행", date: "2026-08-22", time: "15:00", type: "activity" },
    ],
    targetAudience: "개발 취업 준비 3~4학년 및 졸업예정자",
    confidence: "high",
  },
  n5: {
    hasSchedule: true,
    programName: "교내 학습멘토링 멘티 모집",
    scheduleItems: [{ label: "신청 마감", date: "2026-08-22", time: null, type: "deadline" }],
    targetAudience: "1학년 재학생 우선 선발",
    confidence: "high",
  },
  n6: {
    hasSchedule: true,
    programName: "경남 청년기자단 서포터즈",
    scheduleItems: [
      { label: "지원서 접수 마감", date: "2026-08-14", time: null, type: "deadline" },
      { label: "발대식 · 활동 시작", date: "2026-08-30", time: "10:00", type: "activity" },
    ],
    targetAudience: "도내 대학 재학생 및 휴학생",
    confidence: "low",
  },
  n7: {
    hasSchedule: false,
    programName: "도서관 하계 시설 점검",
    scheduleItems: [],
    targetAudience: "전체 이용자",
    confidence: "high",
  },
  n8: {
    hasSchedule: true,
    programName: "공공기관 채용설명회",
    scheduleItems: [
      { label: "참가 신청 마감", date: "2026-08-19", time: null, type: "deadline" },
      { label: "설명회 진행", date: "2026-08-27", time: "14:00", type: "activity" },
    ],
    targetAudience: "취업준비생 및 졸업예정자 (선착순 200명)",
    confidence: "high",
  },
  n9: {
    hasSchedule: true,
    programName: "성적우수 장학금 신청",
    scheduleItems: [{ label: "신청 마감", date: "2026-08-25", time: null, type: "deadline" }],
    targetAudience: "직전 학기 평점 3.5 이상 재학생",
    confidence: "high",
  },
};

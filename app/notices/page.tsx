"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProfile } from "../lib/storage";
import { isRelevant, matchReason } from "../lib/relevance";
import { analyzeNotice, getCachedAnalysis } from "../lib/analysisCache";
import { useNotices } from "../lib/useNotices";
import { CATEGORY_COLORS, dDayLabel, formatFullDateKorean } from "../lib/date";
import type { Category, ExtractedInfo, Notice, UserProfile } from "../lib/types";

type AnalysisState = { extracted?: ExtractedInfo; loading: boolean; error?: string };
type CategoryFilter = "전체" | Category;

const CATEGORIES: Category[] = ["장학", "취업", "비교과", "공모전", "대외활동"];

function earliestItem(extracted: ExtractedInfo) {
  if (extracted.scheduleItems.length === 0) return null;
  return [...extracted.scheduleItems].sort((a, b) => a.date.localeCompare(b.date))[0];
}

export default function NoticesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [analysis, setAnalysis] = useState<Record<string, AnalysisState>>({});
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("전체");
  const { notices, loading: noticesLoading, error: noticesError } = useNotices();

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push("/");
      return;
    }
    setProfile(p);
  }, [router]);

  const relevantNotices = useMemo(() => {
    if (!profile) return [] as Notice[];
    return notices.filter((n) => isRelevant(n, profile));
  }, [profile, notices]);

  // "전체"는 관심분야 기반 맞춤 목록을, 특정 카테고리는 관심분야와 무관하게 해당 카테고리 전체를 보여준다.
  const displayedNotices = useMemo(() => {
    if (selectedCategory === "전체") return relevantNotices;
    return notices.filter((n) => n.category === selectedCategory);
  }, [selectedCategory, relevantNotices, notices]);

  useEffect(() => {
    displayedNotices.forEach((notice) => {
      const cached = getCachedAnalysis(notice.id);
      if (cached) {
        setAnalysis((prev) => ({ ...prev, [notice.id]: { extracted: cached, loading: false } }));
        return;
      }
      setAnalysis((prev) => ({ ...prev, [notice.id]: { loading: true } }));
      analyzeNotice(notice)
        .then((extracted) => setAnalysis((prev) => ({ ...prev, [notice.id]: { extracted, loading: false } })))
        .catch((err) =>
          setAnalysis((prev) => ({ ...prev, [notice.id]: { loading: false, error: err.message } })),
        );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedNotices]);

  const sortedNotices = useMemo(() => {
    return [...displayedNotices].sort((a, b) => {
      const ea = analysis[a.id]?.extracted ? earliestItem(analysis[a.id].extracted!) : null;
      const eb = analysis[b.id]?.extracted ? earliestItem(analysis[b.id].extracted!) : null;
      if (ea && eb) return ea.date.localeCompare(eb.date);
      if (ea) return -1;
      if (eb) return 1;
      return 0;
    });
  }, [displayedNotices, analysis]);

  if (profile === undefined || noticesLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>불러오는 중...</p>
      </main>
    );
  }
  if (!profile) return null;
  if (noticesError) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#dc2626" }}>{noticesError}</p>
      </main>
    );
  }

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <header
        style={{
          padding: "18px 20px",
          background: "#ffffff",
          borderBottom: "1px solid #f0f1f3",
        }}
      >
        <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>맞춤 공지</h1>
      </header>

      <div style={{ display: "flex", gap: "8px", padding: "14px 20px 4px", overflowX: "auto" }}>
        {(["전체", ...CATEGORIES] as CategoryFilter[]).map((cat) => {
          const active = selectedCategory === cat;
          const colors = cat === "전체" ? null : CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                padding: "8px 16px",
                borderRadius: "999px",
                border: active ? "none" : "1px solid #e5e7eb",
                background: active ? (colors ? colors.bg : "#111827") : "#ffffff",
                color: active ? (colors ? colors.text : "#ffffff") : "#6b7280",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "12px 20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {sortedNotices.length === 0 && (
          <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", marginTop: "40px" }}>
            {selectedCategory === "전체" ? "관심 분야에 맞는 공지가 아직 없어요." : `${selectedCategory} 공지가 아직 없어요.`}
          </p>
        )}

        {sortedNotices.map((notice) => {
          const state = analysis[notice.id];
          const colors = CATEGORY_COLORS[notice.category];
          const reason = matchReason(notice, profile);
          const first = state?.extracted ? earliestItem(state.extracted) : null;

          return (
            <Link
              key={notice.id}
              href={`/notices/${notice.id}`}
              style={{
                display: "block",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "16px 18px",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: colors.text,
                    background: colors.bg,
                    padding: "2px 8px",
                    borderRadius: "999px",
                  }}
                >
                  {notice.category}
                </span>
                {first && (
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#dc2626" }}>
                    {dDayLabel(first.date)}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginTop: "8px", lineHeight: 1.4 }}>
                {notice.title}
              </h2>

              {state?.loading && (
                <p style={{ fontSize: "12.5px", color: "#9ca3af", marginTop: "8px" }}>AI 분석 중...</p>
              )}
              {state?.error && (
                <p style={{ fontSize: "12.5px", color: "#dc2626", marginTop: "8px" }}>{state.error}</p>
              )}
              {first && (
                <p style={{ fontSize: "12.5px", color: "#dc2626", marginTop: "8px", fontWeight: 600 }}>
                  {first.label} {formatFullDateKorean(first.date, first.time)}
                </p>
              )}
              {state?.extracted && !state.extracted.hasSchedule && (
                <p style={{ fontSize: "12.5px", color: "#9ca3af", marginTop: "8px" }}>
                  캘린더에 등록할 일정 정보가 없습니다.
                </p>
              )}

              {reason && (
                <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "10px", fontWeight: 600 }}>
                  ✓ {reason}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}

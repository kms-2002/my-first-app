"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getEvents, getProfile } from "./lib/storage";
import { useNotices } from "./lib/useNotices";
import { CATEGORY_COLORS, TODAY, dDayLabel, daysUntil } from "./lib/date";
import type { CalendarEvent, UserProfile } from "./lib/types";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { notices } = useNotices();

  function noticeCategory(noticeId: string) {
    return notices.find((n) => n.id === noticeId)?.category;
  }

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push("/onboarding");
      return;
    }
    setProfile(p);
    setEvents(getEvents());
  }, [router]);

  const weeklyDeadlines = useMemo(
    () =>
      events
        .filter((e) => e.type === "deadline" && daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  const todaysEvents = useMemo(() => events.filter((e) => e.date === TODAY), [events]);

  if (profile === undefined) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>불러오는 중...</p>
      </main>
    );
  }
  if (!profile) return null;

  return (
    <main style={{ display: "flex", flexDirection: "column", paddingBottom: "24px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          background: "#ffffff",
          borderBottom: "1px solid #f0f1f3",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/mypage" style={{ fontSize: "18px", color: "#374151", textDecoration: "none" }} aria-label="메뉴">
            ☰
          </Link>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>AI 공지 자동 캘린더</span>
        </div>
        <span style={{ fontSize: "18px" }}>🔔</span>
      </header>

      <div style={{ padding: "20px" }}>
        <p style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
          안녕하세요, {profile.department} 학생님 👋
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
          이번 주 마감 {weeklyDeadlines.length}건 있어요
        </p>

        {weeklyDeadlines.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "14px",
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#b91c1c", marginBottom: "8px" }}>
              이번 주 마감 요약
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {weeklyDeadlines.map((e) => (
                <Link
                  key={e.id}
                  href={`/notices/${e.noticeId}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    color: "#374151",
                    textDecoration: "none",
                  }}
                >
                  <span>{e.title}</span>
                  <span style={{ fontWeight: 800, color: "#dc2626" }}>{dDayLabel(e.date)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: "15px", fontWeight: 800, color: "#111827", marginTop: "26px", marginBottom: "10px" }}>
          오늘의 일정
        </p>

        {todaysEvents.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              background: "#ffffff",
              border: "1px dashed #e5e7eb",
              borderRadius: "14px",
              color: "#9ca3af",
              fontSize: "13px",
            }}
          >
            오늘 예정된 일정이 없어요.{" "}
            <Link href="/notices" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}>
              맞춤 공지 보러가기
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {todaysEvents.map((e) => {
              const category = noticeCategory(e.noticeId);
              const colors = category ? CATEGORY_COLORS[category] : { bg: "#f3f4f6", text: "#6b7280" };
              return (
                <Link
                  key={e.id}
                  href={`/notices/${e.noticeId}`}
                  style={{
                    display: "block",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    textDecoration: "none",
                  }}
                >
                  {category && (
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
                      {category}
                    </span>
                  )}
                  <p style={{ fontSize: "14.5px", fontWeight: 700, color: "#111827", marginTop: "8px" }}>
                    {e.title}
                  </p>
                  <p style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "4px" }}>
                    {e.type === "deadline" ? "오늘 마감" : "오늘 시작"}
                    {e.time ? ` · ${e.time}` : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

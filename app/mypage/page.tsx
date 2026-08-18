"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  clearProfile,
  getEvents,
  getNotificationSettings,
  getProfile,
  saveNotificationSettings,
} from "../lib/storage";
import { CATEGORY_COLORS, daysUntil } from "../lib/date";
import type { CalendarEvent, NotificationSettings, UserProfile } from "../lib/types";

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({ deadlineAlerts: true });

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push("/");
      return;
    }
    setProfile(p);
    setEvents(getEvents());
    setNotifications(getNotificationSettings());
  }, [router]);

  const weeklyDeadlineCount = useMemo(
    () => events.filter((e) => e.type === "deadline" && daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7).length,
    [events],
  );

  function toggleDeadlineAlerts() {
    const next = { ...notifications, deadlineAlerts: !notifications.deadlineAlerts };
    setNotifications(next);
    saveNotificationSettings(next);
  }

  function handleLogout() {
    clearProfile();
    router.push("/");
  }

  if (profile === undefined) {
    return (
      <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>불러오는 중...</p>
      </main>
    );
  }
  if (!profile) return null;

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "18px 20px", background: "#ffffff", borderBottom: "1px solid #f0f1f3" }}>
        <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>마이페이지</h1>
      </header>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "28px" }}>
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "18px",
            background: "#111827",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            {profile.department.slice(0, 1)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "15.5px", fontWeight: 800, color: "#ffffff" }}>{profile.department}</p>
            <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.65)", marginTop: "3px" }}>{profile.grade}</p>
          </div>
          <Link
            href="/onboarding/profile?edit=1"
            style={{
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#ffffff",
              background: "rgba(255,255,255,0.14)",
              padding: "7px 12px",
              borderRadius: "999px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            수정
          </Link>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[
            { label: "등록한 일정", value: events.length },
            { label: "이번 주 마감", value: weeklyDeadlineCount },
            { label: "관심 공지 유형", value: profile.interests.length },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "14px 10px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>{stat.value}</p>
              <p style={{ fontSize: "11.5px", color: "#9ca3af", marginTop: "4px" }}>{stat.label}</p>
            </div>
          ))}
        </section>

        <section>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#9ca3af", marginBottom: "10px" }}>알림</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>마감 알림 받기</span>
            <button
              onClick={toggleDeadlineAlerts}
              style={{
                width: "44px",
                height: "26px",
                borderRadius: "999px",
                border: "none",
                background: notifications.deadlineAlerts ? "#2563eb" : "#d1d5db",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              aria-label="마감 알림 받기 토글"
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: notifications.deadlineAlerts ? "22px" : "3px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  background: "#ffffff",
                  transition: "left 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderTop: "none",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>알림 시점</span>
            <span style={{ fontSize: "13px", color: "#2563eb", fontWeight: 700 }}>3일 전, 1일 전</span>
          </div>
        </section>

        <section>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#9ca3af", marginBottom: "10px" }}>관심 정보</p>
          <div
            style={{
              padding: "16px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>관심 분야</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {(profile.interestTags ?? []).length === 0 && (
                    <span style={{ fontSize: "13px", color: "#9ca3af" }}>선택된 관심분야가 없어요</span>
                  )}
                  {(profile.interestTags ?? []).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#2563eb",
                        background: "#eff6ff",
                        padding: "4px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link href="/onboarding/profile?edit=1" style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                수정
              </Link>
            </div>

            <div style={{ height: "1px", background: "#f0f1f3" }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>관심 공지 유형</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {profile.interests.length === 0 && (
                    <span style={{ fontSize: "13px", color: "#9ca3af" }}>선택된 공지 유형이 없어요</span>
                  )}
                  {profile.interests.map((interest) => {
                    const colors = CATEGORY_COLORS[interest];
                    return (
                      <span
                        key={interest}
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: colors.text,
                          background: colors.bg,
                          padding: "4px 10px",
                          borderRadius: "999px",
                        }}
                      >
                        {interest}
                      </span>
                    );
                  })}
                </div>
              </div>
              <Link href="/onboarding/interests?edit=1" style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                수정
              </Link>
            </div>
          </div>
        </section>

        <section>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#9ca3af", marginBottom: "10px" }}>계정</p>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              color: "#dc2626",
              fontSize: "14px",
              fontWeight: 700,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </section>

        <p style={{ fontSize: "11.5px", color: "#d1d5db", textAlign: "center", marginTop: "4px" }}>알리오 v1.0.0</p>
      </div>
    </main>
  );
}

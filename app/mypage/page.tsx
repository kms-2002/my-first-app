"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getNotificationSettings, getProfile, saveNotificationSettings } from "../lib/storage";
import { CATEGORY_COLORS } from "../lib/date";
import type { NotificationSettings, UserProfile } from "../lib/types";

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [notifications, setNotifications] = useState<NotificationSettings>({ deadlineAlerts: true });

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push("/onboarding");
      return;
    }
    setProfile(p);
    setNotifications(getNotificationSettings());
  }, [router]);

  function toggleDeadlineAlerts() {
    const next = { ...notifications, deadlineAlerts: !notifications.deadlineAlerts };
    setNotifications(next);
    saveNotificationSettings(next);
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>학과 · 학년</p>
                <p style={{ fontSize: "14.5px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
                  {profile.department} · {profile.grade}
                </p>
              </div>
              <Link href="/onboarding/profile?edit=1" style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                수정
              </Link>
            </div>

            <div style={{ height: "1px", background: "#f0f1f3" }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>관심 분야</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {profile.interests.length === 0 && (
                    <span style={{ fontSize: "13px", color: "#9ca3af" }}>선택된 관심분야가 없어요</span>
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
              <Link href="/onboarding/profile?edit=1" style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                수정
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

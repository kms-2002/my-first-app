"use client";

import Link from "next/link";

export default function OnboardingSplashPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: "32px",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "22px",
          background: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "38px",
        }}
      >
        📅
      </div>

      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.4, color: "#111827" }}>
          AI가 분석하고,
          <br />
          일정은 자동으로
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "12px", lineHeight: 1.6 }}>
          학교 공지를 자동으로 분석해
          <br />
          중요한 일정만 캘린더에 등록해드려요
        </p>
      </div>

      <Link
        href="/onboarding/profile"
        style={{
          width: "100%",
          maxWidth: "320px",
          textAlign: "center",
          padding: "14px",
          borderRadius: "12px",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        시작하기
      </Link>
    </main>
  );
}

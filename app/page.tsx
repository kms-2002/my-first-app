import Link from "next/link";
import CalendarIllustration from "./components/CalendarIllustration";

export default function SplashPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 28px",
        gap: "36px",
        background: "#ffffff",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}>
        <CalendarIllustration size={132} />

        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "23px", fontWeight: 800, lineHeight: 1.45, color: "#111827", letterSpacing: "-0.3px" }}>
            AI가 분석하고,
            <br />
            일정은 자동으로
          </h1>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "12px", lineHeight: 1.6 }}>
            학교 공지들을 자동으로 분석해
            <br />
            중요한 일정만 캘린더에 등록해드려요
          </p>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link
          href="/onboarding/profile"
          style={{
            width: "100%",
            textAlign: "center",
            padding: "16px",
            borderRadius: "14px",
            background: "#111827",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          회원가입
        </Link>
        <Link
          href="/login"
          style={{
            width: "100%",
            textAlign: "center",
            padding: "16px",
            borderRadius: "14px",
            background: "#f3f4f6",
            color: "#111827",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          로그인
        </Link>
      </div>
    </main>
  );
}

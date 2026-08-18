"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProfile } from "../lib/storage";
import CalendarIllustration from "../components/CalendarIllustration";

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 데모 프로젝트라 별도 인증 서버가 없어, 로컬에 저장된 프로필 유무로 로그인을 흉내낸다.
    if (getProfile()) {
      router.push("/home");
      return;
    }
    setError("등록된 계정을 찾을 수 없어요. 회원가입을 먼저 진행해주세요.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px 40px",
        background: "#ffffff",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: 0, color: "#111827", alignSelf: "flex-start" }}
        aria-label="뒤로가기"
      >
        ←
      </button>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", margin: "36px 0 40px" }}>
        <CalendarIllustration size={72} />
        <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#111827" }}>다시 만나서 반가워요</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="학번"
          style={inputStyle}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호"
          style={inputStyle}
        />

        {error && <p style={{ fontSize: "12.5px", color: "#dc2626" }}>{error}</p>}

        <button
          type="submit"
          style={{
            marginTop: "8px",
            padding: "16px",
            borderRadius: "14px",
            border: "none",
            background: "#111827",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          로그인
        </button>
      </form>

      <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", marginTop: "24px" }}>
        아직 계정이 없으신가요?{" "}
        <Link href="/onboarding/profile" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
          회원가입
        </Link>
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  fontSize: "14px",
  color: "#111827",
};

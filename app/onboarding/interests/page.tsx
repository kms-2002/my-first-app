"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category, UserProfile } from "../../lib/types";
import { getProfile, saveProfile } from "../../lib/storage";

const CATEGORY_OPTIONS: { value: Category; icon: string; label: string }[] = [
  { value: "장학", icon: "🎓", label: "장학" },
  { value: "취업", icon: "💼", label: "취업" },
  { value: "비교과", icon: "📱", label: "비교과 프로그램" },
  { value: "공모전", icon: "🏆", label: "공모전" },
  { value: "대외활동", icon: "🎖️", label: "대외활동" },
];

function InterestsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";

  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [selected, setSelected] = useState<Category[]>(CATEGORY_OPTIONS.map((c) => c.value));

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      // 1단계(학과/학년/관심분야)를 거치지 않고 들어온 경우 그리로 돌려보낸다.
      router.replace("/onboarding/profile");
      return;
    }
    setProfile(p);
    if (isEdit) setSelected(p.interests);
  }, [router, isEdit]);

  function toggle(category: Category) {
    setSelected((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    saveProfile({ ...profile, interests: selected });
    router.push(isEdit ? "/mypage" : "/home");
  }

  if (profile === undefined) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px 20px 40px",
        gap: "8px",
        background: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: 0, color: "#111827" }}
          aria-label="뒤로가기"
        >
          ←
        </button>
        {!isEdit && (
          <div style={{ display: "flex", gap: "6px", flex: 1 }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ flex: 1, height: "4px", borderRadius: "999px", background: "#111827" }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "8px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
          관심 공지 유형을 선택해주세요
        </h1>
        <p style={{ fontSize: "13.5px", color: "#9ca3af", marginTop: "6px" }}>
          선택한 항목에 맞는 공지만 우선 제공할게요.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, marginTop: "22px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {CATEGORY_OPTIONS.map(({ value, icon, label }) => {
            const active = selected.includes(value);
            return (
              <button
                type="button"
                key={value}
                onClick={() => toggle(value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "15px 16px",
                  borderRadius: "14px",
                  border: active ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                  background: active ? "#eff6ff" : "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "17px",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </span>
                <span style={{ flex: 1, fontSize: "14.5px", fontWeight: 700, color: "#111827" }}>{label}</span>
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "7px",
                    border: active ? "none" : "1.5px solid #d1d5db",
                    background: active ? "#2563eb" : "transparent",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          style={{
            marginTop: "auto",
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
          {isEdit ? "저장하기" : "시작하기"}
        </button>
      </form>
    </main>
  );
}

export default function InterestsPage() {
  return (
    <Suspense fallback={null}>
      <InterestsForm />
    </Suspense>
  );
}

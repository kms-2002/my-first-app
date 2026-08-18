"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserProfile } from "../../lib/types";
import { getProfile, saveProfile } from "../../lib/storage";

const DEPARTMENTS = [
  "컴퓨터공학부",
  "경영학과",
  "기계공학부",
  "간호학과",
  "화학과",
  "행정학과",
  "건축학과",
  "식품영양학과",
];
const GRADES = ["1학년", "2학년", "3학년", "4학년", "휴학중"];
const INTEREST_TAGS = ["AI", "개발", "취업", "장학", "공모전", "대외활동", "창업", "디자인", "기타"];

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";

  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [interestTags, setInterestTags] = useState<string[]>([]);
  const [existing, setExisting] = useState<UserProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setExisting(p);
      setDepartment(p.department);
      setGrade(p.grade);
      setInterestTags(p.interestTags ?? []);
    }
  }, []);

  function toggleTag(tag: string) {
    setInterestTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit && existing) {
      saveProfile({ ...existing, department, grade, interestTags });
      router.push("/mypage");
      return;
    }
    // 1단계는 아직 관심 공지 유형이 없으므로 기존 값(있다면)을 이어받고, 2단계에서 완성한다.
    saveProfile({ department, grade, interestTags, interests: existing?.interests ?? [] });
    router.push("/onboarding/interests");
  }

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
        {!isEdit && <StepProgress step={1} />}
      </div>

      <div style={{ marginTop: "8px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
          관심 정보를 설정해주세요
        </h1>
        <p style={{ fontSize: "13.5px", color: "#9ca3af", marginTop: "6px" }}>더 정확한 공지를 추천해드려요.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "18px" }}>
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>학과</label>
          <SelectField value={department} onChange={setDepartment} options={DEPARTMENTS} />
        </div>

        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>학년</label>
          <SelectField value={grade} onChange={setGrade} options={GRADES} />
        </div>

        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>관심 분야 (복수 선택 가능)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginTop: "12px" }}>
            {INTEREST_TAGS.map((tag) => {
              const active = interestTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: active ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                    background: active ? "#eff6ff" : "#ffffff",
                    color: active ? "#2563eb" : "#6b7280",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "16px",
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
          {isEdit ? "저장하기" : "다음"}
        </button>
      </form>
    </main>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div style={{ position: "relative", marginTop: "8px" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        style={{
          position: "absolute",
          right: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#9ca3af",
          fontSize: "12px",
        }}
      >
        ▾
      </span>
    </div>
  );
}

function StepProgress({ step }: { step: 1 | 2 }) {
  return (
    <div style={{ display: "flex", gap: "6px", flex: 1 }}>
      {[1, 2].map((n) => (
        <div
          key={n}
          style={{
            flex: 1,
            height: "4px",
            borderRadius: "999px",
            background: n <= step ? "#111827" : "#e5e7eb",
          }}
        />
      ))}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 36px 13px 14px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  fontSize: "14px",
  color: "#111827",
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileForm />
    </Suspense>
  );
}

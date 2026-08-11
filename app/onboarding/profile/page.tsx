"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category, UserProfile } from "../../lib/types";
import { getProfile, saveProfile } from "../../lib/storage";

const ALL_INTERESTS: Category[] = ["장학", "취업", "비교과", "공모전", "대외활동"];
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

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";

  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [interests, setInterests] = useState<Category[]>([]);

  useEffect(() => {
    const existing = getProfile();
    if (existing) {
      setDepartment(existing.department);
      setGrade(existing.grade);
      setInterests(existing.interests);
    }
  }, []);

  function toggleInterest(interest: Category) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile: UserProfile = { department, grade, interests };
    saveProfile(profile);
    router.push(isEdit ? "/mypage" : "/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px 20px 40px",
        gap: "24px",
        background: "#f9fafb",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: 0 }}
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>관심 정보를 설정해주세요</h1>
      </div>
      <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "-14px" }}>
        더 정확한 공지를 추천해드려요
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>학과</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={selectStyle}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>학년</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} style={selectStyle}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>
            관심 분야 (복수 선택)
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
            {ALL_INTERESTS.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "999px",
                    border: "none",
                    background: active ? "#2563eb" : "#f3f4f6",
                    color: active ? "#ffffff" : "#6b7280",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "12px",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "#2563eb",
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

const selectStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "8px",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  fontSize: "14px",
  color: "#111827",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileForm />
    </Suspense>
  );
}

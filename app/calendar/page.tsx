"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getEvents } from "../lib/storage";
import { TODAY, dDayLabel, daysUntil, formatMonthDayKorean } from "../lib/date";
import type { CalendarEvent } from "../lib/types";

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const [TODAY_YEAR, TODAY_MONTH] = TODAY.split("-").map(Number);

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [year, setYear] = useState(TODAY_YEAR);
  const [month, setMonth] = useState(TODAY_MONTH);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const eventsByDate = useMemo(() => {
    return (events ?? []).reduce<Record<string, CalendarEvent[]>>((acc, e) => {
      (acc[e.date] ??= []).push(e);
      return acc;
    }, {});
  }, [events]);

  const summaryBanner = useMemo(() => {
    const all = events ?? [];
    const todays = all.filter((e) => e.date === TODAY);
    if (todays.length > 0) {
      const extra = todays.length > 1 ? ` 외 ${todays.length - 1}건` : "";
      return { tone: "today" as const, text: `오늘 일정 · ${todays[0].title}${extra}` };
    }
    const upcomingDeadline = all
      .filter((e) => e.type === "deadline" && daysUntil(e.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (upcomingDeadline) {
      return {
        tone: "deadline" as const,
        text: `마감 임박 · ${upcomingDeadline.title} (${dDayLabel(upcomingDeadline.date)})`,
      };
    }
    return null;
  }, [events]);

  function goToMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  }

  if (events === null) {
    return (
      <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>불러오는 중...</p>
      </main>
    );
  }

  if (events.length === 0) {
    return (
      <main style={{ display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "18px 20px", background: "#ffffff", borderBottom: "1px solid #f0f1f3" }}>
          <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>캘린더</h1>
        </header>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "60px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "44px" }}>📪</div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>아직 등록된 일정이 없어요</p>
            <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "6px", lineHeight: 1.6 }}>
              맞춤 공지에서 관심 있는 공지를 확인하고
              <br />
              일정을 등록해보세요
            </p>
          </div>
          <Link
            href="/notices"
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            맞춤 공지 보러가기
          </Link>
        </div>
      </main>
    );
  }

  const total = daysInMonth(year, month);
  const leadingBlanks = firstWeekday(year, month);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  const agenda = Object.entries(eventsByDate)
    .filter(([date]) => date.startsWith(`${year}-${String(month).padStart(2, "0")}`))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
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
        <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>캘린더</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => goToMonth(-1)} style={navBtnStyle} aria-label="이전 달">
            ‹
          </button>
          <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#374151" }}>
            {year}년 {month}월
          </span>
          <button onClick={() => goToMonth(1)} style={navBtnStyle} aria-label="다음 달">
            ›
          </button>
        </div>
      </header>

      {summaryBanner && (
        <div
          style={{
            margin: "14px 20px 0",
            padding: "10px 14px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12.5px",
            fontWeight: 700,
            background: summaryBanner.tone === "today" ? "#eff6ff" : "#fef2f2",
            color: summaryBanner.tone === "today" ? "#1d4ed8" : "#b91c1c",
          }}
        >
          <span>{summaryBanner.tone === "today" ? "📌" : "⏰"}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {summaryBanner.text}
          </span>
        </div>
      )}

      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "11.5px", fontWeight: 700, color: "#9ca3af" }}>
              {d}
            </div>
          ))}

          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />;
            const key = dateKey(year, month, day);
            const dayEvents = eventsByDate[key] ?? [];
            const isToday = key === TODAY;
            return (
              <div
                key={key}
                style={{
                  aspectRatio: "1 / 1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                }}
              >
                <span
                  style={{
                    width: "26px",
                    height: "26px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    fontSize: "12.5px",
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? "#ffffff" : "#374151",
                    background: isToday ? "#2563eb" : "transparent",
                  }}
                >
                  {day}
                </span>
                <div style={{ display: "flex", gap: "2px", height: "5px" }}>
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "999px",
                        background: e.type === "deadline" ? "#ef4444" : "#22c55e",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "4px 20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {agenda.length === 0 && (
          <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", marginTop: "20px" }}>
            이 달에는 등록된 일정이 없어요.
          </p>
        )}
        {agenda.map(([date, dayEvents]) => (
          <div key={date}>
            <p style={{ fontSize: "12.5px", fontWeight: 700, color: "#6b7280", marginBottom: "8px" }}>
              {formatMonthDayKorean(date)}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {dayEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/notices/${e.noticeId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: e.type === "deadline" ? "#ef4444" : "#22c55e",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{e.title}</p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{e.time ?? ""}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: "26px",
  height: "26px",
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  color: "#374151",
  fontSize: "14px",
  cursor: "pointer",
};

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getEvents } from "../lib/storage";
import { useNotices } from "../lib/useNotices";
import { TODAY, CATEGORY_COLORS } from "../lib/date";
import type { CalendarEvent } from "../lib/types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const NEUTRAL_COLOR = { bg: "#f3f4f6", text: "#6b7280" };

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function weekdayOf(dateStr: string) {
  return WEEKDAY_LABELS[new Date(dateStr + "T00:00:00").getDay()];
}

const [TODAY_YEAR, TODAY_MONTH, TODAY_DAY] = TODAY.split("-").map(Number);

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [year, setYear] = useState(TODAY_YEAR);
  const [month, setMonth] = useState(TODAY_MONTH);
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);
  const { notices } = useNotices();

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const eventsByDate = useMemo(() => {
    return (events ?? []).reduce<Record<string, CalendarEvent[]>>((acc, e) => {
      (acc[e.date] ??= []).push(e);
      return acc;
    }, {});
  }, [events]);

  function colorFor(noticeId: string) {
    const category = notices.find((n) => n.id === noticeId)?.category;
    return category ? CATEGORY_COLORS[category] : NEUTRAL_COLOR;
  }

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
    setSelectedDay((prev) => Math.min(prev, daysInMonth(y, m)));
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
              background: "#111827",
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

  const selectedKey = dateKey(year, month, Math.min(selectedDay, total));
  const selectedEvents = (eventsByDate[selectedKey] ?? []).slice().sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

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
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>{month}월</h1>
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

      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#9ca3af", paddingBottom: "6px" }}>
              {d}
            </div>
          ))}

          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />;
            const key = dateKey(year, month, day);
            const dayEvents = eventsByDate[key] ?? [];
            const isToday = key === TODAY;
            const isSelected = day === Math.min(selectedDay, total);

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(day)}
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  minWidth: 0,
                  aspectRatio: "3 / 4",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  padding: "3px 1px",
                  margin: 0,
                  border: "none",
                  borderRadius: "10px",
                  background: isSelected ? "#111827" : "transparent",
                  font: "inherit",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: isToday || isSelected ? 800 : 500,
                    color: isSelected ? "#ffffff" : isToday ? "#2563eb" : "#374151",
                  }}
                >
                  {day}
                </span>
                <div style={{ boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "2px", width: "100%", minWidth: 0 }}>
                  {dayEvents.slice(0, 2).map((e) => {
                    const colors = colorFor(e.noticeId);
                    return (
                      <span
                        key={e.id}
                        style={{
                          boxSizing: "border-box",
                          display: "block",
                          fontSize: "8.5px",
                          fontWeight: 700,
                          lineHeight: 1.2,
                          padding: "1px 2px",
                          borderRadius: "4px",
                          background: isSelected ? "rgba(255,255,255,0.16)" : colors.bg,
                          color: isSelected ? "#ffffff" : colors.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "100%",
                          minWidth: 0,
                          textAlign: "center",
                        }}
                      >
                        {e.label}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "12px 20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>
          {year}년 {month}월 {Math.min(selectedDay, total)}일 ({weekdayOf(selectedKey)})
        </p>

        {selectedEvents.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#9ca3af", padding: "20px 0", textAlign: "center" }}>
            이 날은 등록된 일정이 없어요.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {selectedEvents.map((e) => {
              const colors = colorFor(e.noticeId);
              return (
                <Link
                  key={e.id}
                  href={`/notices/${e.noticeId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderLeft: `4px solid ${colors.text}`,
                    borderRadius: "10px",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: colors.text,
                        background: colors.bg,
                        padding: "1px 7px",
                        borderRadius: "999px",
                        marginBottom: "4px",
                      }}
                    >
                      {e.label}
                    </span>
                    <p
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {e.title}
                    </p>
                  </div>
                  {e.time && (
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>{e.time}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <Link
          href="/notices"
          style={{
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "13px",
            borderRadius: "12px",
            border: "1px dashed #d1d5db",
            color: "#374151",
            fontSize: "13.5px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          + 새로운 이벤트
        </Link>
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

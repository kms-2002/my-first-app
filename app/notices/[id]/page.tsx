"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { addEvents, getEventsByNotice } from "../../lib/storage";
import { analyzeNotice, getCachedAnalysis } from "../../lib/analysisCache";
import { useNotices } from "../../lib/useNotices";
import { CATEGORY_COLORS, formatFullDateKorean } from "../../lib/date";
import type { CalendarEvent, ExtractedInfo } from "../../lib/types";

export default function NoticeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notices, loading: noticesLoading, error: noticesError } = useNotices();
  const notice = notices.find((n) => n.id === params.id);

  const [extracted, setExtracted] = useState<ExtractedInfo | null>(notice ? getCachedAnalysis(notice.id) : null);
  const [loading, setLoading] = useState(!extracted);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [addedNow, setAddedNow] = useState(false);

  const alreadyAddedIds = useMemo(
    () => new Set(notice ? getEventsByNotice(notice.id).map((e) => e.id) : []),
    [notice, addedNow],
  );

  useEffect(() => {
    if (!notice || extracted) return;
    setLoading(true);
    analyzeNotice(notice)
      .then((res) => {
        setExtracted(res);
        setChecked(new Set(res.scheduleItems.map((_, i) => i)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice]);

  useEffect(() => {
    if (extracted) setChecked(new Set(extracted.scheduleItems.map((_, i) => i)));
  }, [extracted]);

  if (noticesLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>불러오는 중...</p>
      </main>
    );
  }

  if (noticesError) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <p style={{ color: "#dc2626" }}>{noticesError}</p>
        <Link href="/notices" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
          공지 목록으로
        </Link>
      </main>
    );
  }

  if (!notice) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <p style={{ color: "#6b7280" }}>공지를 찾을 수 없습니다.</p>
        <Link href="/notices" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
          공지 목록으로
        </Link>
      </main>
    );
  }

  const colors = CATEGORY_COLORS[notice.category];

  function eventIdFor(index: number) {
    return `${notice!.id}-${index}`;
  }

  function toggle(index: number) {
    if (alreadyAddedIds.has(eventIdFor(index))) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleAddSelected() {
    if (!extracted) return;
    const toAdd: CalendarEvent[] = extracted.scheduleItems
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => checked.has(index) && !alreadyAddedIds.has(eventIdFor(index)))
      .map(({ item, index }) => ({
        id: eventIdFor(index),
        noticeId: notice!.id,
        title: `${extracted.programName || notice!.title} · ${item.label}`,
        label: item.label,
        date: item.date,
        time: item.time,
        type: item.type,
        sourceUrl: notice!.sourceUrl,
        confidence: extracted.confidence,
      }));

    if (toAdd.length === 0) return;
    addEvents(toAdd);
    setAddedNow(true);
  }

  const selectedNewCount = extracted
    ? extracted.scheduleItems.filter((_, i) => checked.has(i) && !alreadyAddedIds.has(eventIdFor(i))).length
    : 0;

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 20px", background: "#ffffff", borderBottom: "1px solid #f0f1f3" }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: 0 }}
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>공지 상세</h1>
      </header>

      <div style={{ padding: "20px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: colors.text,
            background: colors.bg,
            padding: "2px 8px",
            borderRadius: "999px",
          }}
        >
          {notice.category}
        </span>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginTop: "10px", lineHeight: 1.4 }}>
          {notice.title}
        </h2>
        <p style={{ fontSize: "12.5px", color: "#9ca3af", marginTop: "6px" }}>
          {notice.department} · {notice.publishedDate}
        </p>

        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>
            AI가 추출한 일정 — 등록할 항목 선택
          </p>

          {loading && <p style={{ fontSize: "13px", color: "#9ca3af" }}>AI 분석 중...</p>}
          {error && (
            <p style={{ fontSize: "13px", color: "#dc2626" }}>
              {error} 원문을 직접 확인해주세요.
            </p>
          )}

          {extracted && extracted.scheduleItems.length === 0 && (
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>이 공지에서는 캘린더에 등록할 일정을 찾지 못했습니다.</p>
          )}

          {extracted && extracted.confidence === "low" && extracted.scheduleItems.length > 0 && (
            <div
              style={{
                marginBottom: "10px",
                padding: "8px 12px",
                background: "#ffedd5",
                border: "1px dashed #f97316",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#c2410c",
              }}
            >
              ⚠️ 확인 필요 — 날짜 추출 확신도가 낮습니다. 원문을 함께 확인해주세요.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {extracted?.scheduleItems.map((item, index) => {
              const added = alreadyAddedIds.has(eventIdFor(index));
              const isChecked = checked.has(index);
              return (
                <label
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    cursor: added ? "default" : "pointer",
                    opacity: added ? 0.6 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked || added}
                    disabled={added}
                    onChange={() => toggle(index)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <div>
                    <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                      {item.label} {added && "· 추가됨"}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                      {formatFullDateKorean(item.date, item.time)}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {addedNow && selectedNewCount === 0 && (
          <p style={{ fontSize: "12.5px", color: "#16a34a", marginTop: "14px", fontWeight: 700 }}>
            ✓ 선택한 일정이 캘린더에 추가됐어요.{" "}
            <Link href="/calendar" style={{ textDecoration: "underline" }}>
              캘린더에서 보기
            </Link>
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <a
            href={notice.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            원문 보기
          </a>
          <button
            onClick={handleAddSelected}
            disabled={selectedNewCount === 0}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: "10px",
              border: "none",
              background: selectedNewCount === 0 ? "#d1d5db" : "#111827",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: selectedNewCount === 0 ? "default" : "pointer",
            }}
          >
            선택 항목 캘린더에 추가
          </button>
        </div>
      </div>
    </main>
  );
}

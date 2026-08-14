"use client";

import { useEffect, useState } from "react";
import type { Notice } from "./types";

interface UseNoticesResult {
  notices: Notice[];
  loading: boolean;
  error: string | null;
}

// /api/notices에서 실제(또는 목업) 공지를 한 번 가져온다.
export function useNotices(): UseNoticesResult {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/notices")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "공지를 불러오지 못했습니다.");
        return body as Notice[];
      })
      .then((data) => {
        if (!cancelled) setNotices(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "공지를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { notices, loading, error };
}

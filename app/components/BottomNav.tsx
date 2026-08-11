"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/notices", label: "공지", icon: "📋" },
  { href: "/calendar", label: "캘린더", icon: "🗓️" },
  { href: "/mypage", label: "마이페이지", icon: "👤" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        background: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "10px 0 12px",
              textDecoration: "none",
              color: active ? "#2563eb" : "#9ca3af",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500 }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

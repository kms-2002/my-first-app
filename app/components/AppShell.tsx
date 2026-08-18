"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /kickboard는 별도 실습 과제 페이지라 모바일 앱 프레임을 적용하지 않는다.
  if (pathname.startsWith("/kickboard")) {
    return <>{children}</>;
  }

  const hideNav = pathname === "/" || pathname.startsWith("/onboarding") || pathname === "/login";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          minHeight: "100vh",
          background: "#f9fafb",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 24px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ flex: 1 }}>{children}</div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}

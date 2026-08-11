const hazardTypes = [
  { icon: "🚶", label: "횡단보도 앞", color: "#2a78d6", cx: 95, cy: 75 },
  { icon: "🚌", label: "버스정류장", color: "#eb6834", cx: 290, cy: 60 },
  { icon: "🧱", label: "점자블록(인도)", color: "#1baf7a", cx: 150, cy: 160 },
  { icon: "🚸", label: "어린이보호구역", color: "#eda100", cx: 320, cy: 175 },
  { icon: "🏮", label: "전통시장", color: "#e87ba4", cx: 65, cy: 195 },
];

export default function HazardMap() {
  return (
    <div
      style={{
        background: "#fcfcfb",
        border: "1px solid rgba(11,11,11,0.10)",
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <svg viewBox="0 0 380 250" style={{ width: "100%", height: "auto" }}>
        <rect
          x="6"
          y="6"
          width="368"
          height="238"
          rx="18"
          fill="#f9f9f7"
          stroke="#c3c2b7"
          strokeDasharray="6 5"
          strokeWidth="1.5"
        />
        <text x="190" y="30" textAnchor="middle" fontSize="12" fill="#898781">
          진주시 도심 권역 (개념도 · 실제 위치 아님)
        </text>

        {hazardTypes.map((h) => (
          <g key={h.label}>
            <circle cx={h.cx} cy={h.cy} r="20" fill={h.color} opacity="0.9" />
            <circle cx={h.cx} cy={h.cy} r="20" fill="none" stroke="#fcfcfb" strokeWidth="2" />
            <text
              x={h.cx}
              y={h.cy + 6}
              textAnchor="middle"
              fontSize="16"
            >
              {h.icon}
            </text>
            <text
              x={h.cx}
              y={h.cy + 38}
              textAnchor="middle"
              fontSize="12.5"
              fontWeight={700}
              fill="#0b0b0b"
            >
              {h.label}
            </text>
          </g>
        ))}
      </svg>

      <p
        style={{
          fontSize: "12.5px",
          color: "#c2410c",
          marginTop: "12px",
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        ⚠️ 실제 사고 좌표 데이터를 확보하지 못해, 기사에서 반복 언급된
        &ldquo;위험 유형&rdquo;을 예시로 배치한 개념도입니다. 실제 사고·방치
        발생 지점이 아닙니다.
      </p>
    </div>
  );
}

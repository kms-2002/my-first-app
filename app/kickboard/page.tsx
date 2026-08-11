import type { Metadata } from "next";
import {
  AgeDistributionChart,
  GyeongnamTrendChart,
  NationalTrendChart,
} from "./Charts";
import HazardMap from "./HazardMap";

export const metadata: Metadata = {
  title: "경남(진주) 전동킥보드 리서치",
  description: "경남·진주시 전동킥보드(개인형이동장치) 사회문제 리서치 - 통계와 출처 정리",
};

const stats = [
  { value: "232건 / 5명", label: "경남 최근 3년 PM 사고 · 사망 (2022~2024)" },
  { value: "3,440건", label: "경남 최근 3년 PM 관련 민원 (대부분 불법주차)" },
  { value: "1,650대+", label: "진주시 공유 전동킥보드 운영 대수 (6개 업체, 2025.09)" },
  { value: "약 44%", label: "전국 PM 사고운전자 중 19세 이하 청소년 비율" },
];

const sections: {
  title: string;
  paragraphs: string[];
  list?: string[];
}[] = [
  {
    title: "1. 전국 배경 통계",
    paragraphs: [
      "개인형이동장치(PM) 사고는 2018년 225건에서 2023년 2,389건으로 10배 이상 늘었고, 이 기간 사망자는 24명 발생했다.",
    ],
    list: [
      "최근 3년(2022~2024) 사고: 2,386건 → 2,389건 → 2,232건, 누적 사상자 7,865명",
      "무면허 운전 사고 비중이 전체의 절반가량이며 매년 증가 (2024년 1,167건)",
      "사고 운전자의 약 44%가 19세 이하 청소년 (15세 이하 1,441명, 16~19세 1,648명)",
    ],
  },
  {
    title: "2. 경남(도 전체) 통계",
    paragraphs: [
      "최근 3년(2022~2024)간 경남의 PM 사고는 총 232건, 사망 5명이었다 (2022년 80건 · 2023년 76건 · 2024년 76건).",
    ],
    list: [
      "같은 기간 PM 관련 민원 신고 3,440건 — 대부분 불법 주차 문제",
      "김해시만 보면 사고가 2021년 10건 → 2023년 22건으로 2배 이상 증가 (2024년 상반기 11건)",
    ],
  },
  {
    title: "4. 진주시 현황",
    paragraphs: [
      "2025년 9월 기준 진주지역 공유 전동킥보드는 6개 업체, 1,650대 이상이 운영 중이다. 2023년 10월(4개 업체·약 1,475대)과 비교하면 2년 새 업체 수와 대수 모두 늘었다.",
      "2020년 8~10월경 시는 무단 방치 전동킥보드에 대당 2만원 과태료를 부과하고 강제 수거를 시행했으며, 대여업체에 지정 거치대 정리를 요청했다.",
    ],
    list: [
      "주요 문제: 점자블록·횡단보도 앞·버스정류장 무단 방치",
      "안전모 미착용 2인 탑승, 청소년 무면허 운행 다수 목격",
    ],
  },
  {
    title: "5. 제도적 대응",
    paragraphs: [
      "2023년 10월 오경훈 진주시의원이 「개인형 이동장치 이용 안전 증진 조례 개정안」을 발의했다. 대여사업자 준수사항을 명시하고, 무단 방치 기기의 강제 견인 및 견인비용을 소유자·사업자에게 징수하는 조항을 신설하는 내용이다. (최종 통과 여부는 이번 조사로 확정하지 못함)",
      "2025년 9월 강묘영 진주시의원이 문제를 재차 제기하며 4대 대책을 제시했다 — 조례가 있어도 현장 이행이 미흡하다는 방증으로 보인다.",
    ],
    list: [
      "① 지정 주차구역 단계적 확충 및 구역 외 반납 차단",
      "② 어린이보호구역·전통시장 등 속도 제한/주행 제한",
      "③ 무관용 단속 (안전모 미착용·무면허·2인탑승·인도주행)",
      "④ 안전교육·캠페인 정례화",
    ],
  },
  {
    title: "6. 비교 참고 — 창원시 사례",
    paragraphs: [
      "창원시는 경남 최초로 2020년 10월 「개인형 이동수단 이용 안전 증진 조례」를 제정했다. 지정주차구역을 5개소(2020.10)에서 53개소(2021.03)로 확대했고, 800여명 규모 시민감시단과 '3시간 이내 이동' 신속대응팀을 운영했다.",
      "진주시 대책을 설계할 때 참고할 만한 선행 사례로 볼 수 있다.",
    ],
  },
];

const caveats = [
  "진주시 단위의 연도별 사고 건수 자체는 개별 기사로 확인되지 않았고, 경남 도 단위 통계(232건/5명)만 확인됨. 진주시 세부 수치는 경남경찰청 교통사고 통계나 진주시청 문의 필요.",
  "2023년 조례 개정안의 최종 통과·시행 여부는 이번 검색으로 확정하지 못함 — 진주시의회(jinjucl.com) 회의록이나 자치법규정보시스템(elis.go.kr)에서 교차 확인 권장.",
];

const sources = [
  {
    title: "경남 전동킥보드 사고 3년간 232건…5명 숨져 - 경남신문 (2025.09.04)",
    url: "https://v.daum.net/v/WWZqDQloCx",
  },
  {
    title: "김해지역 전동킥보드 사고, 3년 전보다 2배 이상 증가 - 경남도민일보 (2024.08.07)",
    url: "https://www.idomin.com/news/articleView.html?idxno=917945",
  },
  {
    title: "강묘영 진주시의원, \"애물단지 공유킥보드 질서 잡을 대책 시급\" - 브릿지경제 (2025.09.09)",
    url: "https://www.viva100.com/article/20250909501434",
  },
  {
    title: "진주 무단방치 공유형 킥보드 금지·견인 조례 추진 - 경남도민일보 (2023.10.10)",
    url: "https://www.idomin.com/news/articleView.html?idxno=836281",
  },
  {
    title: "강묘영 진주시의원, 불법 운행 전동킥보드 대책 필요 - 경남도민일보 (2025)",
    url: "https://www.idomin.com/news/articleView.html?idxno=945846",
  },
  {
    title: "진주시, 10월부터 무단방치 전동킥보드 강력 단속 - 경남도민일보/뉴시스 (2020.08.30)",
    url: "https://www.idomin.com/news/articleView.html?idxno=738076",
  },
  {
    title: "창원시, 사람 중심 전동킥보드 안전 대책 강력 추진 - 보안뉴스 (2021.04.14)",
    url: "https://m.boannews.com/html/detail.html?idx=96488",
  },
  {
    title: "전동킥보드 5년새 사고 10배 ↑...청소년 44배까지 - 농민신문 (2025.10.30)",
    url: "https://www.nongmin.com/article/20251030500527",
  },
  {
    title: "전동킥보드 사고, 지난해 2389건에 사망 24명 - 농민신문 (2024.08.05)",
    url: "https://www.nongmin.com/article/20240805500552",
  },
  {
    title: "한국도로교통공단_개인형이동장치(PM) 교통사고 통계 - 공공데이터포털",
    url: "https://www.data.go.kr/data/15087988/fileData.do",
  },
];

export default function KickboardResearch() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px",
        gap: "32px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "56px" }}>🛴</div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, marginTop: "8px" }}>
          경남(진주) 전동킥보드 사회문제 리서치
        </h1>
        <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "6px" }}>
          통계와 사실을 출처와 함께 정리한 자료입니다
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          maxWidth: "760px",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#eff6ff",
              border: "2px solid #93c5fd",
              borderRadius: "14px",
              padding: "18px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#1d4ed8" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "12.5px", color: "#374151", marginTop: "6px", lineHeight: 1.5 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "720px",
        }}
      >
        {sections.map((section, idx) => (
          <div key={section.title} style={{ display: "contents" }}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #fed7aa",
                borderRadius: "14px",
                padding: "20px 22px",
              }}
            >
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#9a3412" }}>
                {section.title}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  style={{ fontSize: "14px", color: "#374151", marginTop: "10px", lineHeight: 1.7 }}
                >
                  {p}
                </p>
              ))}
              {section.list && (
                <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                  {section.list.map((item, i) => (
                    <li
                      key={i}
                      style={{ fontSize: "13.5px", color: "#4b5563", marginTop: "4px", lineHeight: 1.6 }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {idx === 1 && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #fed7aa",
                  borderRadius: "14px",
                  padding: "20px 22px",
                }}
              >
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#9a3412" }}>
                  3. 통계로 보기 (시각화)
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginTop: "14px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#52514e" }}>
                      전국 PM 사고 건수 (연도별)
                    </p>
                    <NationalTrendChart />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#52514e" }}>
                      경남 PM 사고 건수 (연도별)
                    </p>
                    <GyeongnamTrendChart />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#52514e" }}>
                      사고운전자 연령대 분포 (전국, 최근 3년 누적)
                    </p>
                    <AgeDistributionChart />
                  </div>
                </div>

                <p style={{ fontSize: "13px", fontWeight: 600, color: "#52514e", marginTop: "22px" }}>
                  요약 표 — 최근 3년 통계
                </p>
                <div style={{ overflowX: "auto", marginTop: "8px" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                      minWidth: "480px",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e1e0d9" }}>
                        <th style={{ textAlign: "left", padding: "8px 10px", color: "#52514e" }}>
                          구분
                        </th>
                        <th style={{ textAlign: "right", padding: "8px 10px", color: "#52514e" }}>
                          2022
                        </th>
                        <th style={{ textAlign: "right", padding: "8px 10px", color: "#52514e" }}>
                          2023
                        </th>
                        <th style={{ textAlign: "right", padding: "8px 10px", color: "#52514e" }}>
                          2024
                        </th>
                        <th style={{ textAlign: "left", padding: "8px 10px", color: "#52514e" }}>
                          비고
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                      <tr style={{ borderBottom: "1px solid #e1e0d9" }}>
                        <td style={{ padding: "8px 10px" }}>전국 PM 사고(건)</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>2,386</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>2,389</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>2,232</td>
                        <td style={{ padding: "8px 10px", color: "#6b7280" }}>누적 사상자 7,865명</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e1e0d9" }}>
                        <td style={{ padding: "8px 10px" }}>경남 PM 사고(건)</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>80</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>76</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>76</td>
                        <td style={{ padding: "8px 10px", color: "#6b7280" }}>3년 누적 사망 5명</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e1e0d9" }}>
                        <td style={{ padding: "8px 10px" }}>경남 PM 민원(건)</td>
                        <td colSpan={3} style={{ padding: "8px 10px", textAlign: "right" }}>
                          3,440 (3년 누적)
                        </td>
                        <td style={{ padding: "8px 10px", color: "#6b7280" }}>대부분 불법주차</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e1e0d9" }}>
                        <td style={{ padding: "8px 10px" }}>김해 PM 사고(건)</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>25</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>22</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>11*</td>
                        <td style={{ padding: "8px 10px", color: "#6b7280" }}>*2024는 상반기만</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px 10px" }}>진주시 공유킥보드(대)</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>—</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>1,475*</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>1,650+**</td>
                        <td style={{ padding: "8px 10px", color: "#6b7280" }}>*2023.10 · **2025.09</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {idx === 2 && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #fed7aa",
                  borderRadius: "14px",
                  padding: "20px 22px",
                }}
              >
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#9a3412" }}>
                  진주시 위험 유형 개념도
                </h2>
                <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
                  기사에서 반복 언급된 방치·사고 위험 유형을 위치 예시로 표현한 그림입니다.
                </p>
                <div style={{ marginTop: "14px" }}>
                  <HazardMap />
                </div>
              </div>
            )}
          </div>
        ))}

        <div
          style={{
            background: "#ffedd5",
            border: "2px dashed #f97316",
            borderRadius: "10px",
            padding: "16px 18px",
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#c2410c" }}>
            ⚠️ 리서치 상 유의점
          </p>
          <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
            {caveats.map((c, i) => (
              <li
                key={i}
                style={{ fontSize: "13px", color: "#c2410c", marginTop: "6px", lineHeight: 1.6 }}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "18px 20px",
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>출처</p>
          <ol style={{ marginTop: "8px", paddingLeft: "20px" }}>
            {sources.map((s) => (
              <li key={s.url} style={{ fontSize: "13px", marginTop: "6px", lineHeight: 1.6 }}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1d4ed8", textDecoration: "underline" }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}

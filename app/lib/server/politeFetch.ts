// 학교 홈페이지를 긁을 때 지켜야 할 최소한의 예의(정체 밝히기 + 요청 간격)를 모아둔 모듈.
// 서버 전용 — 클라이언트 컴포넌트에서 import하지 않는다.

const USER_AGENT = "GNU-Notice-Calendar/0.1 (student project; contact: agg1940@naver.com)";

// https://www.gnu.ac.kr/robots.txt 에서 확인한 차단 경로.
// 나중에 다른 게시판으로 스크래핑 대상을 넓힐 때, 실수로 차단된 경로를 요청하지 않도록 막는 안전장치.
const KNOWN_DISALLOWED_QUERIES = [
  "mi=10200&bbsId=3195",
  "mi=1276&bbsId=1042",
  "nttSn=2131062&mi=10200",
];

export const REQUEST_DELAY_MS = 400;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function politeFetch(url: string): Promise<string> {
  if (KNOWN_DISALLOWED_QUERIES.some((query) => url.includes(query))) {
    throw new Error(`robots.txt에서 차단된 경로라 요청할 수 없습니다: ${url}`);
  }

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`요청 실패 (${res.status}): ${url}`);
  }
  return res.text();
}

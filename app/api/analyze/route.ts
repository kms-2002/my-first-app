import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// 비용에 민감한 학생 데모이므로 가장 저렴한 모델로 시작한다.
// 추출 정확도가 부족하면 "claude-sonnet-5"로 교체한다.
const MODEL = "claude-haiku-4-5";

const EXTRACTED_INFO_SCHEMA = {
  type: "object" as const,
  properties: {
    hasSchedule: {
      type: "boolean",
      description: "이 공지에 캘린더에 등록할 만한 날짜 정보(신청 마감, 발표, 활동 등)가 있는지 여부",
    },
    programName: { type: "string", description: "프로그램/공고명" },
    scheduleItems: {
      type: "array",
      description: "본문에서 찾은 개별 일정 목록. 날짜 정보가 없으면 빈 배열.",
      items: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description: "일정 이름 (예: 신청 마감, 합격자 발표, 오리엔테이션, 활동 시작)",
          },
          date: { type: "string", description: "YYYY-MM-DD 형식의 날짜" },
          time: {
            anyOf: [{ type: "string" }, { type: "null" }],
            description: "HH:mm 형식의 시간, 본문에 명시되지 않으면 null",
          },
          type: {
            type: "string",
            enum: ["deadline", "activity"],
            description: "신청/접수 마감류는 deadline, 그 외 발표·활동·행사는 activity",
          },
        },
        required: ["label", "date", "time", "type"],
        additionalProperties: false,
      },
    },
    targetAudience: { type: "string", description: "모집/지원 대상 요약" },
    confidence: {
      type: "string",
      enum: ["high", "low"],
      description: "추출한 날짜 정보의 확신도. 본문에 날짜가 명확하지 않으면 low",
    },
  },
  required: ["hasSchedule", "programName", "scheduleItems", "targetAudience", "confidence"],
  additionalProperties: false,
};

export async function POST(request: NextRequest) {
  const { title, rawText } = await request.json();

  if (!title || !rawText) {
    return NextResponse.json({ error: "title, rawText가 필요합니다." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY가 설정되어 있지 않습니다. .env.local을 확인해주세요." },
      { status: 500 },
    );
  }

  try {
    const client = new Anthropic();
    const today = new Date().toISOString().slice(0, 10);
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: {
        format: {
          type: "json_schema",
          schema: EXTRACTED_INFO_SCHEMA,
        },
      },
      messages: [
        {
          role: "user",
          content:
            "다음은 대학교 공지사항 본문이다. 신청 마감, 발표일, 활동 시작 등 본문에 등장하는 모든 개별 일정을 추출하라. " +
            `오늘 날짜는 ${today}이다. 날짜는 반드시 YYYY-MM-DD 형식으로, 시간은 본문에 있으면 HH:mm로 반환하고 ` +
            "본문에 명시되지 않은 값은 null로 반환하라. 일정이 여러 개면 발생 순서대로 배열에 담아라.\n\n" +
            `제목: ${title}\n본문: ${rawText}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "AI 응답에서 결과를 찾을 수 없습니다." }, { status: 502 });
    }

    const extracted = JSON.parse(textBlock.text);
    return NextResponse.json(extracted);
  } catch (error) {
    console.error("analyze route error:", error);
    return NextResponse.json({ error: "AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 502 });
  }
}

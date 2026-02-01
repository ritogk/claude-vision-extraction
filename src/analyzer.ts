import Anthropic from "@anthropic-ai/sdk";
import { Location, AnalysisResult } from "./types";
import { createRoadWidthAnalysisPrompt } from "./prompts";

const MODEL = "claude-sonnet-4-5-20250929";

// Claude Sonnetで道幅を分析
export async function analyzeRoadWidth(
  client: Anthropic,
  imageBase64: string,
  location: Location
): Promise<AnalysisResult> {
  const startTime = performance.now();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: createRoadWidthAnalysisPrompt(location),
          },
        ],
      },
    ],
  });

  const endTime = performance.now();
  const processingTimeMs = Math.round(endTime - startTime);

  // レスポンスからテキストを抽出
  const textContent = response.content.find((block) => block.type === "text");
  const analysisText = textContent && textContent.type === "text" ? textContent.text : "";

  // 結果をパース（簡易的な抽出）
  const roadWidthMatch = analysisText.match(/推定道幅[:：]\s*(.+?)(?:\n|$)/);
  const confidenceMatch = analysisText.match(/確信度[:：]\s*(.+?)(?:\n|$)/);

  return {
    location,
    roadWidth: roadWidthMatch ? roadWidthMatch[1].trim() : "不明",
    confidence: confidenceMatch ? confidenceMatch[1].trim() : "不明",
    description: analysisText,
    processingTimeMs,
  };
}

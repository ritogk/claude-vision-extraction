import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

import { AnalysisResult, AnalysisOutput, TokenUsage } from "./types";
import { loadConfig } from "./config";
import { loadLocations, formatLocation } from "./loader";
import { fetchStreetViewImage } from "./streetview";
import { analyzeRoadWidth } from "./analyzer";

const OUTPUT_DIR = path.join(__dirname, "..", "output");

// 出力ディレクトリを作成
function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// トークン使用量の合計を計算
function calculateTotalTokenUsage(results: AnalysisResult[]): TokenUsage {
  const total = results.reduce(
    (acc, r) => ({
      inputTokens: acc.inputTokens + r.tokenUsage.inputTokens,
      outputTokens: acc.outputTokens + r.tokenUsage.outputTokens,
      costUsd: acc.costUsd + r.tokenUsage.costUsd,
      costJpy: acc.costJpy + r.tokenUsage.costJpy,
    }),
    { inputTokens: 0, outputTokens: 0, costUsd: 0, costJpy: 0 }
  );

  return {
    inputTokens: total.inputTokens,
    outputTokens: total.outputTokens,
    costUsd: Math.round(total.costUsd * 1_000_000) / 1_000_000,
    costJpy: Math.round(total.costJpy * 100) / 100,
  };
}

// 結果をJSONファイルに保存
function saveResultsToJson(results: AnalysisResult[]): string {
  ensureOutputDir();

  const output: AnalysisOutput = {
    generatedAt: new Date().toISOString(),
    totalLocations: results.length,
    totalTokenUsage: calculateTotalTokenUsage(results),
    results,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `analysis_${timestamp}.json`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), "utf-8");

  return filePath;
}

// メイン処理
async function main() {
  console.log("=== Street View 道幅分析ツール ===\n");

  // 設定を読み込み
  const config = loadConfig();

  // Anthropicクライアント初期化
  const anthropic = new Anthropic();

  // 位置情報を読み込み
  const locations = loadLocations();
  console.log(`${locations.length} 件の位置情報を読み込みました\n`);

  // 各位置について分析
  const results: AnalysisResult[] = [];

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const locationStr = formatLocation(location);

    console.log(`\n--- [${i + 1}/${locations.length}] ${locationStr} を分析中... ---`);

    try {
      const nestLocation = i + 1 < locations.length ? locations[i + 1] : undefined;
      // Street View画像を取得
      console.log("Street View画像を取得中...");
      const imageBase64 = await fetchStreetViewImage(
        location.lat,
        location.lng,
        config.googleMapsApiKey,
        nestLocation ? nestLocation.lat : undefined,
        nestLocation ? nestLocation.lng : undefined
      );
      console.log("画像取得完了、Claude Sonnetで分析中...");

      // 道幅を分析
      const result = await analyzeRoadWidth(anthropic, imageBase64, location);
      results.push(result);

      // 結果を出力
      console.log("\n【分析結果】");
      console.log(`処理時間: ${result.processingTimeMs}ms`);
      console.log(`トークン: 入力${result.tokenUsage.inputTokens} / 出力${result.tokenUsage.outputTokens}`);
      console.log(`金額: ¥${result.tokenUsage.costJpy} ($${result.tokenUsage.costUsd})`);
      console.log(`車線数: ${result.analysis.lanes}`);
      console.log(`車線幅: ${result.analysis.lane_width}m`);
      console.log(`センターライン: ${result.analysis.center_line ? "あり" : "なし"}`);
      console.log(`路肩(進行方向): ${result.analysis.shoulder_forward ?? "なし"}m`);
      console.log(`路肩(逆側): ${result.analysis.shoulder_opposite ?? "なし"}m`);
      console.log(`ガードレール(進行方向): ${result.analysis.guardrail_forward ? "あり" : "なし"}`);
      console.log(`ガードレール(逆側): ${result.analysis.guardrail_opposite ? "あり" : "なし"}`);
    } catch (error) {
      console.error(`エラー: ${locationStr} の分析に失敗しました`);
      console.error(error instanceof Error ? error.message : error);
    }
  }

  // サマリーを出力
  console.log("\n\n========== 分析結果サマリー ==========\n");
  console.log("| 座標 | 車線数 | 車線幅 | センターライン | 処理時間 |");
  console.log("|------|--------|--------|----------------|----------|");

  for (const result of results) {
    const loc = formatLocation(result.location);
    const lanes = result.analysis.lanes;
    const laneWidth = `${result.analysis.lane_width}m`;
    const centerLine = result.analysis.center_line ? "○" : "×";
    console.log(`| ${loc} | ${lanes} | ${laneWidth} | ${centerLine} | ${result.processingTimeMs}ms |`);
  }

  // 合計金額を表示
  if (results.length > 0) {
    const total = calculateTotalTokenUsage(results);
    console.log("\n【合計トークン使用量】");
    console.log(`入力トークン: ${total.inputTokens.toLocaleString()}`);
    console.log(`出力トークン: ${total.outputTokens.toLocaleString()}`);
    console.log(`合計金額: ¥${total.costJpy.toLocaleString()} ($${total.costUsd})`);

    // JSONファイルに保存
    const outputPath = saveResultsToJson(results);
    console.log(`\n結果をJSONファイルに保存しました: ${outputPath}`);
  }

  console.log("\n分析完了");
}

// 実行
main().catch(console.error);

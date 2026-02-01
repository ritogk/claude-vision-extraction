import Anthropic from "@anthropic-ai/sdk";

import { AnalysisResult } from "./types";
import { loadConfig } from "./config";
import { loadLocations, formatLocation } from "./loader";
import { fetchStreetViewImage } from "./streetview";
import { analyzeRoadWidth } from "./analyzer";

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
      // Street View画像を取得
      console.log("Street View画像を取得中...");
      const imageBase64 = await fetchStreetViewImage(
        location.lat,
        location.lng,
        config.googleMapsApiKey
      );
      console.log("画像取得完了、Claude Sonnetで分析中...");

      // 道幅を分析
      const result = await analyzeRoadWidth(anthropic, imageBase64, location);
      results.push(result);

      // 結果を出力
      console.log("\n【分析結果】");
      console.log(`処理時間: ${result.processingTimeMs}ms`);
      console.log(`推定道幅: ${result.roadWidth}`);
      console.log(`確信度: ${result.confidence}`);
      console.log("\n【詳細】");
      console.log(result.description);
    } catch (error) {
      console.error(`エラー: ${locationStr} の分析に失敗しました`);
      console.error(error instanceof Error ? error.message : error);
    }
  }

  // サマリーを出力
  console.log("\n\n========== 分析結果サマリー ==========\n");
  console.log("| 座標 | 推定道幅 | 確信度 | 処理時間 |");
  console.log("|------|----------|--------|----------|");

  for (const result of results) {
    console.log(`| ${formatLocation(result.location)} | ${result.roadWidth} | ${result.confidence} | ${result.processingTimeMs}ms |`);
  }

  console.log("\n分析完了");
}

// 実行
main().catch(console.error);

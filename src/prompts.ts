import { Location } from "./types";

// 道幅分析用プロンプトを生成
export function createRoadWidthAnalysisPrompt(location: Location): string {
  return `Google Street View画像から日本の道路特徴を推定してください。

以下の項目をJSON形式で回答：
- lanes: 車線数（整数）
- lane_width: 1車線の幅（メートル）
- center_line: センターライン有無（true/false）
- shoulder_left: 画像の左側の路肩幅（メートル、なければnull）
- shoulder_right: 画像の右側の路肩幅（メートル、なければnull）
- guardrail_left: 画像の左側のガードレール有無（true/false）
- guardrail_right: 画像の右側のガードレール有無（true/false）

ガードレールの防護柵(0.35m)、センターライン実線1本(0.2m)、センターライン実線2本(0.15m)、センターライン破線1本(0.15m)、車両(1.7m幅)等を基準にスケールを推定。
数値は小数1桁。日本の交通ルールは道路交通法に基づき車両は「左側通行」。推定のみ、説明不要。`;
}

// const promptJp = `Google Street View画像から日本の道路特徴を推定してください。

// 以下の項目をJSON形式で回答：
// - lanes: 車線数（整数）
// - lane_width: 1車線の幅（メートル）
// - center_line: センターライン有無（true/false）
// - shoulder_left: 左側の路肩幅（メートル、なければnull）
// - shoulder_right: 右側の路肩幅（メートル、なければnull）
// - guardrail_left: 左側のガードレール有無（true/false）
// - guardrail_right: 右側のガードレール有無（true/false）

// ガードレールの防護柵(0.35m)、センターライン実線1本(0.2m)、センターライン実線2本(0.15m)、センターライン破線1本(0.15m)、車両(1.7m幅)等を基準にスケールを推定。
// 数値は小数1桁。推定のみ、説明不要。`;

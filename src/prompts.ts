import { Location } from "./types";

// 道幅分析用プロンプトを生成
export function createRoadWidthAnalysisPrompt(location: Location): string {
  return `Google Street View画像から日本の道路特徴を推定してください。

以下の項目をJSON形式で回答：
- lanes: 車線数（整数）
- lane_width: 1車線の幅（メートル）
- center_line: センターライン有無（true/false）
- shoulder_forward: 進行方向の路肩幅（メートル、なければnull）
- shoulder_opposite: 逆側の路肩幅（メートル、なければnull）
- guardrail_forward: 進行方向のガードレール有無（true/false）
- guardrail_opposite: 逆側のガードレール有無（true/false）

ガードレールの防護柵(0.35m)、センターライン実線1本(0.2m)、センターライン実線2本(0.15m)、センターライン破線1本(0.15m)、車両(1.7m幅)等を基準にスケールを推定。
数値は小数1桁。推定のみ、説明不要。`;
}

const promptJp = `Google Street View画像から日本の道路特徴を推定してください。

以下の項目をJSON形式で回答：
- lanes: 車線数（整数）
- lane_width: 1車線の幅（メートル）
- center_line: センターライン有無（true/false）
- shoulder_forward: 進行方向の路肩幅（メートル、なければnull）
- shoulder_opposite: 逆側の路肩幅（メートル、なければnull）
- guardrail_forward: 進行方向のガードレール有無（true/false）
- guardrail_opposite: 逆側のガードレール有無（true/false）

ガードレールの防護柵(0.35m)、センターライン実線1本(0.2m)、センターライン実線2本(0.15m)、センターライン破線1本(0.15m)、車両(1.7m幅)等を基準にスケールを推定。
数値は小数1桁。推定のみ、説明不要。`;

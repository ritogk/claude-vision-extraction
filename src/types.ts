// 入力データの型定義（[lat, lng]の配列）
export type LocationInput = [number, number];

// 内部で使用する位置情報の型定義
export interface Location {
  lat: number;
  lng: number;
}

// 分析結果の型定義
export interface AnalysisResult {
  location: Location;
  roadWidth: string;
  confidence: string;
  description: string;
  processingTimeMs: number;
}

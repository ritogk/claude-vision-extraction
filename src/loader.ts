import * as fs from "fs";
import * as path from "path";
import { Location, LocationInput } from "./types";

// 位置情報JSONファイルを読み込み
export function loadLocations(filePath?: string): Location[] {
  const locationsPath = filePath || path.join(__dirname, "..", "data", "locations.json");

  if (!fs.existsSync(locationsPath)) {
    console.error(`エラー: 位置情報ファイルが見つかりません: ${locationsPath}`);
    process.exit(1);
  }

  const locationsData = fs.readFileSync(locationsPath, "utf-8");
  const rawLocations: LocationInput[] = JSON.parse(locationsData);

  // [lat, lng] 形式を { lat, lng } 形式に変換（一時的に末尾3件のみ）
  return rawLocations.slice(-3).map(([lat, lng]) => ({ lat, lng }));
}

// 位置情報を文字列にフォーマット
export function formatLocation(location: Location): string {
  return `(${location.lat}, ${location.lng})`;
}

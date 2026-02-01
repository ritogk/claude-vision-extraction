import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const STREET_VIEW_BASE_URL = "https://maps.googleapis.com/maps/api/streetview";
const STREET_VIEW_METADATA_URL = "https://maps.googleapis.com/maps/api/streetview/metadata";
const TMP_DIR = path.join(__dirname, "..", "tmp");

interface StreetViewMetadata {
  status: string;
  pano_id?: string;
  location?: {
    lat: number;
    lng: number;
  };
  date?: string;
  copyright?: string;
}

// tmpディレクトリを作成
function ensureTmpDir(): void {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
}

// 2点間の方位角（heading）を計算する
// 現在地点から次の地点への進行方向を0-360度で返す
function calculateHeading(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);
  const deltaLng = toRadians(toLng - fromLng);

  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let heading = toDegrees(Math.atan2(x, y));
  // 0-360度の範囲に正規化
  heading = (heading + 360) % 360;

  return heading;
}

// 画像ファイル名を生成
function generateImageFileName(lat: number, lng: number): string {
  return `streetview_${lat}_${lng}.jpg`;
}

// Street View メタデータを取得して利用可能か確認
export async function checkStreetViewAvailability(
  lat: number,
  lng: number,
  apiKey: string
): Promise<StreetViewMetadata> {
  const response = await axios.get<StreetViewMetadata>(STREET_VIEW_METADATA_URL, {
    params: {
      location: `${lat},${lng}`,
      key: apiKey,
    },
  });

  if (response.data.status !== "OK") {
    throw new Error(`Street View not available: ${response.data.status}`);
  }

  return response.data;
}

// Street View画像を取得してBase64エンコード（tmpに保存）
// nextLat, nextLng を指定すると、その方向を向いた画像を取得する
export async function fetchStreetViewImage(
  lat: number,
  lng: number,
  apiKey: string,
  nextLat?: number,
  nextLng?: number
): Promise<string> {
  // メタデータを確認してStreet Viewが利用可能か検証
  await checkStreetViewAvailability(lat, lng, apiKey);

  // 次の地点が指定されている場合、進行方向を計算
  const params: Record<string, string> = {
    size: "640x480",
    location: `${lat},${lng}`,
    key: apiKey,
    fov: "90",
    pitch: "0",
  };

  if (nextLat !== undefined && nextLng !== undefined) {
    const heading = calculateHeading(lat, lng, nextLat, nextLng);
    params.heading = heading.toString();
  }

  // Street View Static APIで画像を取得
  const response = await axios.get(STREET_VIEW_BASE_URL, {
    params,
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data);

  // tmpディレクトリに保存
  ensureTmpDir();
  const fileName = generateImageFileName(lat, lng);
  const filePath = path.join(TMP_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  return buffer.toString("base64");
}

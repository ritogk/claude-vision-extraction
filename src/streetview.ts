import axios from "axios";

const STREET_VIEW_BASE_URL = "https://maps.googleapis.com/maps/api/streetview";
const STREET_VIEW_METADATA_URL = "https://maps.googleapis.com/maps/api/streetview/metadata";

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

// Street View画像を取得してBase64エンコード
export async function fetchStreetViewImage(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> {
  // メタデータを確認してStreet Viewが利用可能か検証
  await checkStreetViewAvailability(lat, lng, apiKey);

  // Street View Static APIで画像を取得
  const response = await axios.get(STREET_VIEW_BASE_URL, {
    params: {
      size: "640x480",
      location: `${lat},${lng}`,
      key: apiKey,
      fov: "90",
      pitch: "0",
    },
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data);
  return buffer.toString("base64");
}

// 네이버 클라우드 플랫폼 API 설정
// 실제 배포 시에는 환경 변수 사용 권장: process.env.NAVER_CLIENT_ID, process.env.NAVER_CLIENT_SECRET
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "oerw4p2yw2";
const NAVER_CLIENT_SECRET =
  process.env.NAVER_CLIENT_SECRET || "JN3MCDii1HJwkXfD8BZRoQYXIX9UQb7HMnQoNEzN";

export default async function handler(req, res) {
  // GET 요청만 허용
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "주소 쿼리가 필요합니다." });
  }

  try {
    console.log(`🔍 Geocoding 요청: ${query}`);
    console.log(`🔑 API Key ID: ${NAVER_CLIENT_ID}`);
    console.log(`🔑 API Key 존재 여부: ${!!NAVER_CLIENT_SECRET}`);

    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(
      query
    )}`;
    console.log(`📡 요청 URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        "x-ncp-apigw-api-key-id": NAVER_CLIENT_ID,
        "x-ncp-apigw-api-key": NAVER_CLIENT_SECRET,
        Accept: "application/json",
      },
    });

    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Geocoding API 오류 세부내용:`, errorText);

      // 401 오류인 경우 API 키 확인 안내
      if (response.status === 401) {
        return res.status(200).json({
          success: false,
          data: null,
          message:
            "API 키 인증에 문제가 있어요. 네이버 클라우드 플랫폼에서 API 키를 확인해주세요",
          error: "INVALID_API_KEY",
        });
      }

      return res.status(response.status).json({
        error: `Geocoding API 오류: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    if (data.addresses && data.addresses.length > 0) {
      const address = data.addresses[0];
      return res.status(200).json({
        success: true,
        data: {
          lat: parseFloat(address.y),
          lng: parseFloat(address.x),
          roadAddress: address.roadAddress,
          jibunAddress: address.jibunAddress,
        },
      });
    }

    return res.status(200).json({
      success: false,
      data: null,
      message: "주소를 찾을 수 없어요",
    });
  } catch (error) {
    console.error("Geocoding 서버 오류:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

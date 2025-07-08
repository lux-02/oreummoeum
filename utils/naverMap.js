// 네이버 클라우드 플랫폼 클라이언트 ID (지도 스크립트용)
// 브라우저에서는 환경변수를 직접 사용할 수 없으므로 빌드 시점에 주입됩니다
const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "oerw4p2yw2";

// Geocoding API로 주소를 좌표로 변환 (서버 사이드 프록시 사용)
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `/api/geocode?query=${encodeURIComponent(address)}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API 오류: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return result.data; // data 객체만 반환
    }

    return null;
  } catch (error) {
    console.error("Geocoding 오류:", error);
    return null;
  }
};

// 네이버 지도 스크립트 로드
export const loadNaverMapScript = () => {
  return new Promise((resolve, reject) => {
    // 이미 로드되었는지 확인
    if (window.naver && window.naver.maps) {
      console.log("✅ 네이버 지도 스크립트 이미 로드됨");
      resolve();
      return;
    }

    // 중복 로딩 방지: 이미 스크립트 태그가 있는지 확인
    const existingScript = document.querySelector(`script[src*="maps.js"]`);
    if (existingScript) {
      console.log("🔄 네이버 지도 스크립트 로딩 중... 대기");

      // 기존 스크립트가 로딩을 완료할 때까지 대기
      const checkLoaded = setInterval(() => {
        if (window.naver && window.naver.maps) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);

      // 10초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error("네이버 지도 스크립트 로딩 타임아웃"));
      }, 10000);

      return;
    }

    console.log("📥 네이버 지도 스크립트 로딩 시작");

    // 인증 실패 감지 함수 설정
    if (!window.navermap_authFailure) {
      window.navermap_authFailure = function () {
        console.error("🚫 네이버 지도 API 인증 실패!");
        console.error(
          "📋 해결방법: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html"
        );
      };
    }

    const script = document.createElement("script");
    // 신규 API 파라미터 사용: ncpClientId → ncpKeyId
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
    script.type = "text/javascript";
    script.async = true;

    script.onload = () => {
      console.log("✅ 네이버 지도 스크립트 로드 완료");
      // 스크립트 로드 완료 후 API 사용 가능할 때까지 잠시 대기
      setTimeout(() => {
        if (window.naver && window.naver.maps) {
          resolve();
        } else {
          reject(new Error("네이버 지도 API 초기화 실패"));
        }
      }, 100);
    };

    script.onerror = (error) => {
      console.error("❌ 네이버 지도 스크립트 로드 실패:", error);
      reject(new Error("네이버 지도 스크립트 로드 실패"));
    };

    // 10초 타임아웃 설정
    setTimeout(() => {
      if (!window.naver || !window.naver.maps) {
        reject(new Error("네이버 지도 스크립트 로딩 타임아웃 (10초)"));
      }
    }, 10000);

    document.head.appendChild(script);
  });
};

// 좌표가 유효한지 확인
export const isValidCoordinate = (lat, lng) => {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;

  // 제주도 좌표 범위 확인 (대략적)
  if (lat < 33.0 || lat > 33.7) return false;
  if (lng < 126.0 || lng > 127.0) return false;

  return true;
};

// 오름 데이터에서 최적의 좌표 추출 (동기)
export const getOptimalCoordinates = (oreum) => {
  // 1순위: MapX, MapY (API에서 제공하는 좌표)
  if (oreum.mapX && oreum.mapY && isValidCoordinate(oreum.mapY, oreum.mapX)) {
    return {
      lat: parseFloat(oreum.mapY),
      lng: parseFloat(oreum.mapX),
      source: "API",
    };
  }

  // 2순위: coordinates (기존 좌표)
  if (
    oreum.coordinates &&
    isValidCoordinate(oreum.coordinates.lat, oreum.coordinates.lng)
  ) {
    return {
      lat: oreum.coordinates.lat,
      lng: oreum.coordinates.lng,
      source: "coordinates",
    };
  }

  return null;
};

// 🆕 Geocoding을 포함한 비동기 좌표 추출
export const getOptimalCoordinatesAsync = async (oreum) => {
  console.log("🔍 좌표 추출 시작:", oreum.name);

  // 1단계: 기존 좌표 확인
  const existingCoords = getOptimalCoordinates(oreum);
  if (existingCoords) {
    console.log(`✅ 기존 좌표 사용: ${existingCoords.source}`);
    return existingCoords;
  }

  // 2단계: 주소가 있으면 Geocoding 시도
  if (oreum.location) {
    console.log(`🗺️ Geocoding 시도: ${oreum.location}`);

    try {
      const geocoded = await geocodeAddress(oreum.location);
      if (geocoded && geocoded.lat && geocoded.lng) {
        console.log(`✅ Geocoding 성공: ${geocoded.lat}, ${geocoded.lng}`);
        console.log(
          `📍 사용할 좌표: ${geocoded.lat}, ${geocoded.lng} (출처: geocoding)`
        );
        return {
          lat: geocoded.lat,
          lng: geocoded.lng,
          source: "geocoding",
          address: geocoded.roadAddress || geocoded.jibunAddress,
        };
      } else {
        console.warn(`⚠️ Geocoding 결과 없음: ${oreum.name}`);
      }
    } catch (error) {
      console.error(`❌ Geocoding 오류 (${oreum.name}):`, error.message);

      // API 키 오류인 경우 안내 메시지
      if (
        error.message.includes("401") ||
        error.message.includes("INVALID_API_KEY")
      ) {
        console.info(
          "💡 네이버 클라우드 플랫폼에서 Geocoding API 키를 확인해주세요."
        );
      }
    }
  }

  // 3단계: 모든 방법 실패 시 null 반환 (fallback 좌표는 컴포넌트에서 처리)
  console.warn(`⚠️ ${oreum.name}: 좌표를 찾을 수 없습니다.`);
  return null;
};

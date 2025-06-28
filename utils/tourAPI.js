import axios from "axios";

// Next.js API route 사용 (CORS 문제 해결)
const API_BASE_URL = "/api/tour";

// API 에러 처리
const handleAPIError = (error, apiName) => {
  console.warn(`${apiName} API 호출 실패 (정상 동작):`, error.message);

  if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
    throw new Error(`CORS 또는 네트워크 연결 문제`);
  } else if (error.response?.status === 403) {
    throw new Error(`API 접근 권한이 없습니다`);
  } else if (error.response?.status >= 500) {
    throw new Error(`서버 일시 오류입니다`);
  } else {
    throw new Error(`API 서비스를 사용할 수 없습니다`);
  }
};

// 1. 키워드 검색 조회
export const searchKeyword = async (keyword, numOfRows = 10, pageNo = 1) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        endpoint: "searchKeyword",
        keyword,
        numOfRows,
        pageNo,
      },
      timeout: 10000,
    });

    if (response.data?.response?.header?.resultCode === "0000") {
      return response.data.response.body.items?.item || [];
    } else {
      const resultMsg =
        response.data?.response?.header?.resultMsg || "알 수 없는 오류";
      throw new Error(`API 응답 오류: ${resultMsg}`);
    }
  } catch (error) {
    handleAPIError(error, "키워드 검색");
  }
};

// 2. 공통정보 조회
export const getDetailCommon = async (contentId, contentTypeId = "12") => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        endpoint: "detailCommon",
        contentId,
        contentTypeId,
      },
      timeout: 10000,
    });

    if (response.data?.response?.header?.resultCode === "0000") {
      const items = response.data.response.body.items?.item;
      return items ? items[0] : null;
    } else {
      const resultMsg =
        response.data?.response?.header?.resultMsg || "알 수 없는 오류";
      throw new Error(`API 응답 오류: ${resultMsg}`);
    }
  } catch (error) {
    handleAPIError(error, "공통정보 조회");
  }
};

// 3. 소개정보 조회
export const getDetailIntro = async (contentId, contentTypeId = "12") => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        endpoint: "detailIntro",
        contentId,
        contentTypeId,
      },
      timeout: 10000,
    });

    if (response.data?.response?.header?.resultCode === "0000") {
      const items = response.data.response.body.items?.item;
      return items ? items[0] : null;
    } else {
      const resultMsg =
        response.data?.response?.header?.resultMsg || "알 수 없는 오류";
      throw new Error(`API 응답 오류: ${resultMsg}`);
    }
  } catch (error) {
    handleAPIError(error, "소개정보 조회");
  }
};

// 4. 반복정보 조회
export const getDetailInfo = async (contentId, contentTypeId = "12") => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        endpoint: "detailInfo",
        contentId,
        contentTypeId,
      },
      timeout: 10000,
    });

    if (response.data?.response?.header?.resultCode === "0000") {
      return response.data.response.body.items?.item || [];
    } else {
      const resultMsg =
        response.data?.response?.header?.resultMsg || "알 수 없는 오류";
      throw new Error(`API 응답 오류: ${resultMsg}`);
    }
  } catch (error) {
    handleAPIError(error, "반복정보 조회");
  }
};

// 5. 이미지정보 조회
export const getDetailImage = async (contentId) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        endpoint: "detailImage",
        contentId,
      },
      timeout: 10000,
    });

    if (response.data?.response?.header?.resultCode === "0000") {
      return response.data.response.body.items?.item || [];
    } else {
      const resultMsg =
        response.data?.response?.header?.resultMsg || "알 수 없는 오류";
      throw new Error(`API 응답 오류: ${resultMsg}`);
    }
  } catch (error) {
    handleAPIError(error, "이미지정보 조회");
  }
};

// 6. 반려동물 동반 여행 정보
export const getDetailPetTour = async (contentId) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        endpoint: "detailPetTour",
        contentId,
      },
      timeout: 10000,
    });

    if (response.data?.response?.header?.resultCode === "0000") {
      const items = response.data.response.body.items?.item;
      return items ? items[0] : null;
    } else {
      const resultMsg =
        response.data?.response?.header?.resultMsg || "알 수 없는 오류";
      throw new Error(`API 응답 오류: ${resultMsg}`);
    }
  } catch (error) {
    handleAPIError(error, "반려동물 정보 조회");
  }
};

// 7. 오름 전체 정보 조회 (여러 API 결합)
export const getOreumFullInfo = async (contentId) => {
  try {
    console.info(`오름 정보 조회 시도: ${contentId}`);

    const [common, intro, info, images, petTour] = await Promise.allSettled([
      getDetailCommon(contentId),
      getDetailIntro(contentId),
      getDetailInfo(contentId),
      getDetailImage(contentId),
      getDetailPetTour(contentId),
    ]);

    return {
      common: common.status === "fulfilled" ? common.value : null,
      intro: intro.status === "fulfilled" ? intro.value : null,
      info: info.status === "fulfilled" ? info.value : [],
      images: images.status === "fulfilled" ? images.value : [],
      petTour: petTour.status === "fulfilled" ? petTour.value : null,
    };
  } catch (error) {
    handleAPIError(error, "오름 전체 정보 조회");
  }
};

// 8. 오름명으로 contentId 찾기
export const findContentIdByName = async (oreumName) => {
  try {
    console.info(`오름명으로 검색: ${oreumName}`);
    const results = await searchKeyword(oreumName, 5);

    // 정확한 이름 매치 우선
    const exactMatch = results.find(
      (item) => item.title === oreumName || item.title.includes(oreumName)
    );

    const contentId = exactMatch ? exactMatch.contentid : null;
    console.info(`찾은 contentId: ${contentId || "없음"}`);

    return contentId;
  } catch (error) {
    console.warn(`오름명 "${oreumName}"로 contentId 찾기 실패:`, error.message);
    return null;
  }
};

// 9. 반복정보에서 특정 정보 추출
export const extractInfoByName = (infoList, infoName) => {
  if (!Array.isArray(infoList)) return "";
  const info = infoList.find((item) => item.infoname === infoName);
  return info ? info.infotext : "";
};

// 10. 이용 정보 정리
export const formatUsageInfo = (intro, info) => {
  if (!intro && !info) {
    return {
      openTime: "상시 개방",
      restDay: "연중무휴",
      parking: "정보 없음",
      entrance: "무료",
      guide: "정보 없음",
      trail: "정보 없음",
      course: "정보 없음",
    };
  }

  return {
    openTime: intro?.usetime || "상시 개방",
    restDay: intro?.restdate || "연중무휴",
    parking: intro?.parking || "정보 없음",
    entrance: extractInfoByName(info, "입 장 료") || "무료",
    guide: extractInfoByName(info, "한국어 안내서비스") || "정보 없음",
    trail: extractInfoByName(info, "등산로") || "정보 없음",
    course: extractInfoByName(info, "관광코스안내") || "정보 없음",
  };
};

// 11. 반려동물 정보 정리
export const formatPetInfo = (petTour) => {
  if (!petTour) {
    return {
      allowed: false,
      type: "정보 없음",
      notes: "반려동물 동반 정보가 없습니다.",
    };
  }

  return {
    allowed: petTour.acmpyTypeCd !== "동반불가",
    type: petTour.acmpyTypeCd || "정보 없음",
    possibleBreeds: petTour.acmpyPsblCpam || "정보 없음",
    requirements: petTour.acmpyNeedMtr || "정보 없음",
    notes: petTour.etcAcmpyInfo || "추가 정보 없음",
  };
};

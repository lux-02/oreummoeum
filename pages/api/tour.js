import axios from "axios";

// API 기본 설정
const API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const SERVICE_KEY =
  "%2F2OIqgppGrVx4hZGiPZ4NvXYHDrZLxRAiGY33ji8GNLhOTfBBPiOPY%2BZGjZGVhSbXwjNkL3nvZyDU8rGUivRyw%3D%3D";

// 공통 API 파라미터
const commonParams = {
  serviceKey: SERVICE_KEY,
  MobileOS: "ETC",
  MobileApp: "AppTest",
  _type: "json",
};

export default async function handler(req, res) {
  const { method, query } = req;

  if (method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    endpoint,
    contentId,
    contentTypeId = "12",
    keyword,
    numOfRows = 10,
    pageNo = 1,
  } = query;

  try {
    let apiUrl = "";
    let params = { ...commonParams };

    switch (endpoint) {
      case "detailCommon":
        apiUrl = `${API_BASE_URL}/detailCommon2`;
        params = { ...params, contentId, contentTypeId };
        break;
      case "detailIntro":
        apiUrl = `${API_BASE_URL}/detailIntro2`;
        params = { ...params, contentId, contentTypeId };
        break;
      case "detailInfo":
        apiUrl = `${API_BASE_URL}/detailInfo2`;
        params = { ...params, contentId, contentTypeId };
        break;
      case "detailImage":
        apiUrl = `${API_BASE_URL}/detailImage2`;
        params = { ...params, contentId };
        break;
      case "detailPetTour":
        apiUrl = `${API_BASE_URL}/detailPetTour2`;
        params = { ...params, contentId };
        break;
      case "searchKeyword":
        apiUrl = `${API_BASE_URL}/searchKeyword2`;
        params = { ...params, keyword, numOfRows, pageNo, arrange: "C" };
        break;
      default:
        return res.status(400).json({ error: "Invalid endpoint" });
    }

    console.log(`🌐 API 호출: ${endpoint}, 파라미터:`, params);

    const response = await axios.get(apiUrl, {
      params,
      timeout: 10000, // 10초 타임아웃
    });

    if (response.data?.response?.header?.resultCode === "0000") {
      res.status(200).json(response.data);
    } else {
      const resultMsg =
        response.data?.response?.header?.resultMsg || "알 수 없는 오류";
      console.warn(`API 오류: ${resultMsg}`);
      res.status(400).json({ error: `API 응답 오류: ${resultMsg}` });
    }
  } catch (error) {
    console.error(`API 호출 실패 (${endpoint}):`, error.message);

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      res.status(503).json({ error: "외부 API 서비스에 연결할 수 없습니다" });
    } else if (error.response?.status) {
      res
        .status(error.response.status)
        .json({ error: error.response.statusText });
    } else {
      res.status(500).json({ error: "서버 내부 오류가 발생했습니다" });
    }
  }
}

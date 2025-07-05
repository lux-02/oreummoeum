import Papa from "papaparse";

// 지역별 이미지 매핑
const regionImages = {
  제주시: {
    동지역: "/img/지역별/제주시/제주시_동지역.jpg",
    애월읍: "/img/지역별/제주시/제주시_애월읍.jpg",
    조천읍: "/img/지역별/제주시/제주시_조천읍.jpg",
    구좌읍: "/img/지역별/제주시/제주시_구좌읍.jpg",
    한림읍: "/img/지역별/제주시/제주시_한림읍.jpg",
    한경면: "/img/지역별/제주시/제주시_한경면.jpg",
    우도면: "/img/지역별/제주시/제주시_우도면.jpg",
  },
  서귀포시: {
    동지역: "/img/지역별/서귀포시/서귀포시_동지역.jpg",
    남원읍: "/img/지역별/서귀포시/서귀포시_남원읍.jpg",
    표선면: "/img/지역별/서귀포시/서귀포시_표선면.jpg",
    성산읍: "/img/지역별/서귀포시/서귀포시_성산읍.jpg",
    안덕면: "/img/지역별/서귀포시/서귀포시_안덕면.jpg",
    대정읍: "/img/지역별/서귀포시/서귀포시_대정읍.jpg",
  },
};

// 오름 형태별 이미지 매핑
const typeImages = {
  원추형: "/img/오름 종류/원추형.jpg",
  말굽형: "/img/오름 종류/말굽형.jpg",
  원형: "/img/오름 종류/원형.jpg",
  복합형: "/img/오름 종류/복합형.jpg",
};

// 샘플 오름 데이터 (테스트용)
const SAMPLE_OREUM_DATA = [
  {
    id: 1,
    name: "새별오름",
    region: "제주시",
    location: "제주특별자치도 제주시 애월읍 봉성리",
    height: 519,
    area: 327.3,
    coordinates: { lat: 33.3873, lng: 126.2881 },
    description:
      "애월읍에 위치한 아름다운 원추형 오름으로, 정상에서 제주 서부 해안과 한라산의 절경을 감상할 수 있습니다.",
    updateDate: "2024-03-31",
    district: "애월읍",
    type: "원추형",
    image: typeImages["원추형"],
  },
  {
    id: 2,
    name: "용눈이오름",
    region: "제주시",
    location: "제주특별자치도 제주시 구좌읍 종달리",
    height: 247,
    area: 141.5,
    coordinates: { lat: 33.4563, lng: 126.9234 },
    description:
      "말굽형 분화구를 가진 아름다운 오름으로, 성산일출봉과 함께 일출 명소로 유명합니다.",
    updateDate: "2024-03-31",
    district: "구좌읍",
    type: "말굽형",
    image: typeImages["말굽형"],
  },
  {
    id: 3,
    name: "따라비오름",
    region: "제주시",
    location: "제주특별자치도 제주시 조천읍 교래리",
    height: 819,
    area: 235.8,
    coordinates: { lat: 33.3762, lng: 126.6845 },
    description:
      "한라산국립공원 내에 위치한 높은 오름으로, 숲길 트레킹의 진수를 맛볼 수 있습니다.",
    updateDate: "2024-03-31",
    district: "조천읍",
    type: "원형",
    image: typeImages["원형"],
  },
  {
    id: 4,
    name: "성산일출봉",
    region: "서귀포시",
    location: "제주특별자치도 서귀포시 성산읍 성산리",
    height: 182,
    area: 398.7,
    coordinates: { lat: 33.4581, lng: 126.9427 },
    description:
      "제주도의 대표적인 관광명소이자 유네스코 세계자연유산으로, 일출 경관이 아름다운 화산섬입니다.",
    updateDate: "2024-03-31",
    district: "성산읍",
    type: "복합형",
    image: typeImages["복합형"],
  },
  {
    id: 5,
    name: "한라산",
    region: "서귀포시",
    location: "제주특별자치도 서귀포시 토평동",
    height: 1947,
    area: 1800.5,
    coordinates: { lat: 33.3616, lng: 126.5292 },
    description:
      "제주도의 최고봉이자 대한민국의 최남단 산으로, 백록담 화구호가 있는 신비로운 산입니다.",
    updateDate: "2024-03-31",
    district: "동지역",
    type: "원형",
    image: typeImages["원형"],
  },
  {
    id: 6,
    name: "산굼부리",
    region: "제주시",
    location: "제주특별자치도 제주시 조천읍 교래리",
    height: 395,
    area: 158.2,
    coordinates: { lat: 33.3722, lng: 126.7708 },
    description:
      "천연기념물로 지정된 폭발 분화구로, 다양한 식물 생태계가 보존되어 있습니다.",
    updateDate: "2024-03-31",
    district: "조천읍",
    type: "원형",
    image: typeImages["원형"],
  },
  {
    id: 7,
    name: "금오름",
    region: "서귀포시",
    location: "제주특별자치도 서귀포시 안덕면 사계리",
    height: 427,
    area: 287.4,
    coordinates: { lat: 33.2341, lng: 126.3154 },
    description:
      "안덕면에 위치한 아름다운 오름으로, 형제섬과 가파도가 내려다보이는 경관이 일품입니다.",
    updateDate: "2024-03-31",
    district: "안덕면",
    type: "원추형",
    image: typeImages["원추형"],
  },
  {
    id: 8,
    name: "당산봉",
    region: "서귀포시",
    location: "제주특별자치도 서귀포시 남원읍 태흥리",
    height: 382,
    area: 195.7,
    coordinates: { lat: 33.2876, lng: 126.7234 },
    description:
      "남원읍의 대표적인 오름으로, 한라산과 바다를 동시에 조망할 수 있는 멋진 전망을 자랑합니다.",
    updateDate: "2024-03-31",
    district: "남원읍",
    type: "말굽형",
    image: typeImages["말굽형"],
  },
];

// location 컬럼에서 구/읍/면 정규화
const normalizeDistrict = (location, region) => {
  if (!location) return "기타";

  // location 컬럼의 값을 정규화
  const district = location.trim();

  // 동지역을 지역별로 구분 (동일한 이름이므로 그대로 반환)
  // regionImages에서 지역별로 구분되어 있음

  return district;
};

// 형태 정리 함수
const normalizeType = (type) => {
  if (!type) return "원추형";

  if (type.includes("원추")) return "원추형";
  if (type.includes("말굽")) return "말굽형";
  if (type.includes("원형")) return "원형";
  if (type.includes("복합")) return "복합형";

  return "원추형"; // 기본값
};

// 좌표 생성 (제주도 내 임의 좌표)
const generateCoordinates = (index, region) => {
  // 제주도 대략적 좌표 범위
  const jeju = {
    lat: { min: 33.1, max: 33.6 },
    lng: { min: 126.1, max: 126.9 },
  };

  // 인덱스 기반으로 좌표 분산
  const seed = index * 0.001;
  const lat =
    jeju.lat.min + ((jeju.lat.max - jeju.lat.min) * ((index * 7) % 100)) / 100;
  const lng =
    jeju.lng.min + ((jeju.lng.max - jeju.lng.min) * ((index * 11) % 100)) / 100;

  return {
    lat: Math.round(lat * 1000) / 1000,
    lng: Math.round(lng * 1000) / 1000,
  };
};

// 오름 설명 생성
const generateDescription = (name, type, height, region) => {
  const normalizedType = normalizeType(type);
  const descriptions = [
    `${name}은(는) 제주 ${region}에 위치한 해발 ${height}m의 ${normalizedType} 오름입니다.`,
    `아름다운 자연경관과 독특한 지형으로 유명한 ${name}은(는) 제주의 대표적인 오름 중 하나입니다.`,
    `${normalizedType}의 특징을 잘 보여주는 ${name}은(는) 등반과 자연 관찰에 적합한 장소입니다.`,
    `제주의 화산 활동으로 형성된 ${name}은(는) 지질학적 가치가 높은 오름입니다.`,
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// CSV 파싱 함수
export const parseOreumData = async () => {
  try {
    const response = await fetch("/Oreum_list.csv");
    const csvText = await response.text();

    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });

    const data = result.data.map((row, index) => ({
      id: index + 1,
      name: row["오름명"] || "",
      city: row["행정시"] || "",
      location: row["소재지"] || "",
      subLocation:
        row["location"] && row["location"] !== "0" ? row["location"] : "",
      altitude: parseFloat(row["표고"]) || 0,
      area: parseFloat(row["면적"]) || 0,
      shape: row["형태"] || "",
      description: row["Overview"] || "",
      // 좌표 정보
      coordinates: {
        lat: parseFloat(row["MapY"]) || 0,
        lng: parseFloat(row["MapX"]) || 0,
      },
      // 관광공사 API 데이터
      tourAPI: {
        contentId: row["ContentID"] || "",
        contentTypeId: row["ContentTypeID"] || "",
        firstImage: row["FirstImage"] || "",
        firstImage2: row["FirstImage2"] || "",
        hasAPIData: !!(row["ContentID"] && row["ContentID"].trim()),
      },
      // 반려동물 정보
      petInfo: {
        acmpyTypeCd: row["Pet_acmpyTypeCd"] || "",
        etcAcmpyInfo: row["Pet_etcAcmpyInfo"] || "",
        acmpyPsblCpam: row["Pet_acmpyPsblCpam"] || "",
        acmpyNeedMtr: row["Pet_acmpyNeedMtr"] || "",
      },
      // 상세 정보
      detailInfo: {
        infocenter: row["Detail_infocenter"] || "",
        opendate: row["Detail_opendate"] || "",
        restdate: row["Detail_restdate"] || "",
        usetime: row["Detail_usetime"] || "",
        parking: row["Detail_parking"] || "",
        chkbabycarriage: row["Detail_chkbabycarriage"] || "",
        chkpet: row["Detail_chkpet"] || "",
        chkcreditcard: row["Detail_chkcreditcard"] || "",
      },
      // 추가 이미지들
      images: [
        row["Image_1"],
        row["Image_2"],
        row["Image_3"],
        row["Image_4"],
        row["Image_5"],
        row["Image_6"],
        row["Image_7"],
        row["Image_8"],
        row["Image_9"],
        row["Image_10"],
      ].filter((img) => img && img.trim()),
      // 카드 표시용 이미지 (FirstImage 우선, 없으면 기본 이미지)
      cardImage:
        row["FirstImage"] ||
        (row["행정시"] === "제주시"
          ? `/img/지역별/제주시/제주시_${row["location"] || "동지역"}.jpg`
          : `/img/지역별/서귀포시/서귀포시_${row["location"] || "동지역"}.jpg`),
      // 오름 형태별 이미지
      shapeImage: (() => {
        const shapeMap = {
          원추형: "/img/오름 종류/원추형.jpg",
          말굽형: "/img/오름 종류/말굽형.jpg",
          복합형: "/img/오름 종류/복합형.jpg",
          원형: "/img/오름 종류/원형.jpg",
        };
        const baseShape = row["형태"] ? row["형태"].split("(")[0] : "";
        return shapeMap[baseShape] || "/img/오름 종류/원추형.jpg";
      })(),
    }));

    return data;
  } catch (error) {
    console.error("CSV 파싱 오류:", error);
    return [];
  }
};

// 필터링 함수들
export const filterByCity = (data, city) => {
  if (!city) return data;
  return data.filter((item) => item.city === city);
};

export const filterByShape = (data, shape) => {
  if (!shape) return data;
  return data.filter((item) => item.shape.includes(shape));
};

export const searchByName = (data, searchTerm) => {
  if (!searchTerm) return data;
  return data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const sortByAltitude = (data, ascending = true) => {
  return [...data].sort((a, b) =>
    ascending ? a.altitude - b.altitude : b.altitude - a.altitude
  );
};

export const sortByArea = (data, ascending = true) => {
  return [...data].sort((a, b) =>
    ascending ? a.area - b.area : b.area - a.area
  );
};

// 통계 함수들
export const getStatistics = (data) => {
  const totalCount = data.length;
  const jeju = data.filter((item) => item.city === "제주시").length;
  const seogwipo = data.filter((item) => item.city === "서귀포시").length;

  const shapeStats = data.reduce((acc, item) => {
    const baseShape = item.shape.split("(")[0];
    acc[baseShape] = (acc[baseShape] || 0) + 1;
    return acc;
  }, {});

  const avgAltitude =
    data.reduce((sum, item) => sum + item.altitude, 0) / totalCount;
  const avgArea = data.reduce((sum, item) => sum + item.area, 0) / totalCount;

  return {
    totalCount,
    cityStats: { 제주시: jeju, 서귀포시: seogwipo },
    shapeStats,
    avgAltitude: Math.round(avgAltitude * 10) / 10,
    avgArea: Math.round(avgArea * 10) / 10,
  };
};

// 지역별 이미지 가져오기
export const getRegionImage = (region, district) => {
  const regionMap = regionImages[region];
  if (!regionMap) return "/img/지역별/제주시/제주시_동지역.jpg";

  return regionMap[district] || Object.values(regionMap)[0];
};

// 지역별 구/읍/면 목록 가져오기
export const getDistrictsByRegion = (region) => {
  const districts = regionImages[region];
  return districts ? Object.keys(districts) : [];
};

// 오름 검색 함수
export const searchOreum = (oreumList, searchTerm) => {
  if (!searchTerm.trim()) return oreumList;

  const term = searchTerm.toLowerCase();
  return oreumList.filter(
    (oreum) =>
      oreum.name.toLowerCase().includes(term) ||
      oreum.description.toLowerCase().includes(term) ||
      oreum.location.toLowerCase().includes(term)
  );
};

// 오름 정렬 함수
export const sortOreum = (oreumList, sortBy) => {
  const sorted = [...oreumList];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    case "height":
      return sorted.sort((a, b) => b.height - a.height);
    case "area":
      return sorted.sort((a, b) => b.area - a.area);
    default:
      return sorted;
  }
};

// 지역별 필터링
export const filterByRegion = (oreumList, region, district = null) => {
  let filtered = oreumList.filter((oreum) => oreum.region === region);

  if (district) {
    filtered = filtered.filter((oreum) => oreum.district === district);
  }

  return filtered;
};

// 오름 형태별 필터링
export const filterByType = (oreumList, type) => {
  return oreumList.filter((oreum) => oreum.type === type);
};

// 높이별 필터링
export const filterByHeight = (oreumList, minHeight, maxHeight) => {
  return oreumList.filter(
    (oreum) => oreum.height >= minHeight && oreum.height <= maxHeight
  );
};

// 통계 정보 계산
export const getOreumStats = (oreumList) => {
  const totalCount = oreumList.length;
  const avgHeight = Math.round(
    oreumList.reduce((sum, oreum) => sum + oreum.height, 0) / totalCount
  );
  const maxHeight = Math.max(...oreumList.map((oreum) => oreum.height));
  const minHeight = Math.min(...oreumList.map((oreum) => oreum.height));

  const typeCount = oreumList.reduce((acc, oreum) => {
    acc[oreum.type] = (acc[oreum.type] || 0) + 1;
    return acc;
  }, {});

  const regionCount = oreumList.reduce((acc, oreum) => {
    acc[oreum.region] = (acc[oreum.region] || 0) + 1;
    return acc;
  }, {});

  return {
    totalCount,
    avgHeight,
    maxHeight,
    minHeight,
    typeCount,
    regionCount,
  };
};

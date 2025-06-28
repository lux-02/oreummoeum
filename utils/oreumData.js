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
export const parseOreumCSV = async () => {
  try {
    // 실제 CSV 파일 읽기
    const response = await fetch("/Oreum_list.csv");
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn("CSV 파싱 경고:", results.errors);
          }

          const oreumList = results.data
            .filter((row) => row.오름명 && row.오름명.trim()) // 빈 행 제거
            .map((row, index) => {
              const name = row.오름명?.trim() || "";
              const region = row.행정시?.trim() || "";
              const location = row.소재지?.trim() || "";
              const locationDistrict = row.location?.trim() || ""; // location 컬럼 사용
              const height = parseInt(row.표고) || 0;
              const area = parseFloat(row.면적) || 0;
              const type = row.형태?.trim() || "원추형";
              const district = normalizeDistrict(locationDistrict, region);
              const normalizedType = normalizeType(type);

              // 한국관광공사 API 관련 필드
              const contentId = row.ContentID?.trim() || null;
              const contentTypeId = row.ContentTypeID?.trim() || null;
              const firstImage = row.FirstImage?.trim() || null;
              const firstImage2 = row.FirstImage2?.trim() || null;

              // 이미지 우선순위: FirstImage > 오름 종류별 기본 이미지
              const image =
                firstImage ||
                typeImages[normalizedType] ||
                typeImages["원추형"];

              return {
                id: index + 1,
                name,
                region,
                location,
                height,
                area,
                coordinates: generateCoordinates(index + 1, region),
                description: generateDescription(name, type, height, region),
                district,
                type: normalizedType,
                image,
                // 한국관광공사 API 관련 정보
                tourAPI: {
                  contentId,
                  contentTypeId,
                  firstImage,
                  firstImage2,
                  hasAPIData: !!(contentId && contentTypeId),
                },
              };
            });

          console.log(
            `✅ ${oreumList.length}개의 오름 데이터를 성공적으로 로드했습니다.`
          );
          resolve(oreumList);
        },
        error: (error) => {
          console.error("CSV 파싱 오류:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("CSV 파일 로드 실패:", error);
    // 실패 시 기본 샘플 데이터 반환
    return getSampleOreumData();
  }
};

// 백업용 샘플 데이터 (CSV 로드 실패 시)
const getSampleOreumData = () => {
  return [
    {
      id: 1,
      name: "새별오름",
      region: "제주시",
      location: "제주특별자치도 제주시 애월읍 봉성리",
      height: 519,
      area: 522216,
      coordinates: { lat: 33.3615, lng: 126.3512 },
      description:
        "새별오름은 제주시 애월읍에 위치한 해발 519m의 복합형 오름으로, 아름다운 일출과 억새밭으로 유명합니다.",
      district: "애월읍",
      type: "복합형",
      image: "/img/오름 종류/복합형.jpg",
      tourAPI: {
        contentId: "572973",
        contentTypeId: "12",
        firstImage:
          "http://tong.visitkorea.or.kr/cms/resource/34/2943834_image2_1.bmp",
        firstImage2:
          "http://tong.visitkorea.or.kr/cms/resource/34/2943834_image3_1.bmp",
        hasAPIData: true,
      },
    },
    {
      id: 2,
      name: "용눈이오름",
      region: "제주시",
      location: "제주특별자치도 제주시 구좌읍 종달리",
      height: 247,
      area: 404264,
      coordinates: { lat: 33.4542, lng: 126.8021 },
      description:
        "용눈이오름은 말의 눈처럼 생긴 두 개의 화구호가 있는 독특한 복합형 오름입니다.",
      district: "구좌읍",
      type: "복합형",
      image:
        "http://tong.visitkorea.or.kr/cms/resource/30/3011830_image2_1.jpg",
      tourAPI: {
        contentId: "572960",
        contentTypeId: "12",
        firstImage:
          "http://tong.visitkorea.or.kr/cms/resource/30/3011830_image2_1.jpg",
        firstImage2:
          "http://tong.visitkorea.or.kr/cms/resource/30/3011830_image3_1.jpg",
        hasAPIData: true,
      },
    },
    {
      id: 3,
      name: "따라비오름",
      region: "서귀포시",
      location: "제주특별자치도 서귀포시 표선면 가시리",
      height: 342,
      area: 448111,
      coordinates: { lat: 33.3123, lng: 126.7234 },
      description:
        "따라비오름은 서귀포시 표선면에 위치한 복합형 오름으로 목장과 어우러진 풍경이 아름답습니다.",
      district: "표선면",
      type: "복합형",
      image: "/img/오름 종류/복합형.jpg",
      tourAPI: {
        contentId: "572968",
        contentTypeId: "12",
        firstImage: null,
        firstImage2: null,
        hasAPIData: true,
      },
    },
    {
      id: 4,
      name: "성산일출봉",
      region: "서귀포시",
      location: "제주특별자치도 서귀포시 성산읍 성산리",
      height: 179,
      area: 453030,
      coordinates: { lat: 33.4583, lng: 126.9425 },
      description:
        "성산일출봉은 UNESCO 세계자연유산으로 지정된 제주의 대표적인 관광명소입니다.",
      district: "성산읍",
      type: "원형",
      image:
        "http://tong.visitkorea.or.kr/cms/resource/36/2839736_image2_1.jpg",
      tourAPI: {
        contentId: "2839742",
        contentTypeId: "39",
        firstImage:
          "http://tong.visitkorea.or.kr/cms/resource/36/2839736_image2_1.jpg",
        firstImage2:
          "http://tong.visitkorea.or.kr/cms/resource/36/2839736_image3_1.jpg",
        hasAPIData: true,
      },
    },
    {
      id: 5,
      name: "한라산",
      region: "제주시",
      location: "제주특별자치도 제주시 해안동",
      height: 1950,
      area: 30000000,
      coordinates: { lat: 33.3617, lng: 126.5292 },
      description:
        "한라산은 제주도의 중앙에 위치한 대한민국 최고봉으로, 다양한 생태계를 품고 있습니다.",
      district: "해안동",
      type: "원추형",
      image: "/img/오름 종류/원추형.jpg",
      tourAPI: {
        contentId: null,
        contentTypeId: null,
        firstImage: null,
        firstImage2: null,
        hasAPIData: false,
      },
    },
    {
      id: 6,
      name: "산굼부리",
      region: "제주시",
      location: "제주특별자치도 제주시 조천읍 교래리",
      height: 437,
      area: 574697,
      coordinates: { lat: 33.3443, lng: 126.7055 },
      description:
        "산굼부리는 천연기념물로 지정된 분화구가 완벽하게 보존된 원형 오름입니다.",
      district: "조천읍",
      type: "원형",
      image:
        "http://tong.visitkorea.or.kr/cms/resource/55/3354255_image2_1.jpg",
      tourAPI: {
        contentId: "126474",
        contentTypeId: "12",
        firstImage:
          "http://tong.visitkorea.or.kr/cms/resource/55/3354255_image2_1.jpg",
        firstImage2:
          "http://tong.visitkorea.or.kr/cms/resource/55/3354255_image3_1.jpg",
        hasAPIData: true,
      },
    },
    {
      id: 7,
      name: "금오름",
      region: "제주시",
      location: "제주특별자치도 제주시 한림읍 금악리",
      height: 427,
      area: 613966,
      coordinates: { lat: 33.3021, lng: 126.4312 },
      description:
        "금오름은 화구호가 있는 원형 오름으로 금악리의 상징적인 존재입니다.",
      district: "한림읍",
      type: "원형",
      image:
        "http://tong.visitkorea.or.kr/cms/resource/35/3352435_image2_1.jpg",
      tourAPI: {
        contentId: "129699",
        contentTypeId: "12",
        firstImage:
          "http://tong.visitkorea.or.kr/cms/resource/35/3352435_image2_1.jpg",
        firstImage2:
          "http://tong.visitkorea.or.kr/cms/resource/35/3352435_image3_1.jpg",
        hasAPIData: true,
      },
    },
    {
      id: 8,
      name: "당산봉",
      region: "제주시",
      location: "제주특별자치도 제주시 한경면 용수리",
      height: 148,
      area: 534135,
      coordinates: { lat: 33.3156, lng: 126.1845 },
      description:
        "당산봉은 제주 서부 지역의 대표적인 복합형 오름으로 용수리의 랜드마크입니다.",
      district: "한경면",
      type: "복합형",
      image:
        "http://tong.visitkorea.or.kr/cms/resource/84/3477884_image2_1.jpg",
      tourAPI: {
        contentId: "2704703",
        contentTypeId: "12",
        firstImage:
          "http://tong.visitkorea.or.kr/cms/resource/84/3477884_image2_1.jpg",
        firstImage2:
          "http://tong.visitkorea.or.kr/cms/resource/84/3477884_image3_1.jpg",
        hasAPIData: true,
      },
    },
  ];
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

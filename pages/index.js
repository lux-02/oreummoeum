import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegionSelector from "../components/RegionSelector";
import OreumGrid from "../components/OreumGrid";
import OreumDetail from "../components/OreumDetail";
import {
  parseOreumData,
  filterByCity,
  getStatistics,
} from "../utils/oreumData";
import styles from "../styles/Home.module.css";

export default function Home() {
  const SITE_URL = "https://oreum.제주맹글이.site";
  const PAGE_TITLE = "오름모음 - 제주 오름 지도, 지역별 오름 검색";
  const PAGE_DESC =
    "제주도의 아름다운 오름들을 담은 디지털 도감입니다. 지역별로 오름을 검색하고, 고도와 형태 정보를 한눈에 확인하세요.";
  const OG_IMAGE = `${SITE_URL}${encodeURI("/img/오름 종류/원추형.jpg")}`;
  const [currentView, setCurrentView] = useState("main"); // 'main', 'oreumList'
  const [selectedTab, setSelectedTab] = useState("all"); // 'all', '제주시', '서귀포시'
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedOreum, setSelectedOreum] = useState(null);
  const [oreumData, setOreumData] = useState([]);
  const [filteredOreumData, setFilteredOreumData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // 형태명에서 괄호와 그 안의 내용 제거
  const getCleanShapeName = (shape) => {
    if (!shape) return "";
    // 괄호와 그 안의 내용을 제거 (예: "말굽형(서향)" → "말굽형")
    return shape.replace(/\(.*?\)/g, "").trim();
  };

  // 지역별 이미지 맵핑
  const getRegionImage = (city, district) => {
    const cityFolder = city === "제주시" ? "제주시" : "서귀포시";
    const districtFile = district || "동지역";
    return `/img/지역별/${cityFolder}/${cityFolder}_${districtFile}.jpg`;
  };

  // 구/읍/면별 오름 개수 계산
  const getDistrictsByCity = (city) => {
    if (!oreumData.length) return [];
    const districts = [
      ...new Set(
        oreumData
          .filter((oreum) => oreum.city === city)
          .map((oreum) => oreum.subLocation)
          .filter((district) => district)
      ),
    ];
    return districts.sort();
  };

  // 지역 및 구역으로 필터링
  const filterByRegion = (data, city, district) => {
    let filtered = data;
    if (city) {
      filtered = filterByCity(filtered, city);
    }
    if (district) {
      filtered = filtered.filter((oreum) => oreum.subLocation === district);
    }
    return filtered;
  };

  // 오름 데이터 로드
  useEffect(() => {
    const loadOreumData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 오름 데이터 로딩 시작...");
        const data = await parseOreumData();
        setOreumData(data);
        setStatistics(getStatistics(data));
        console.log(`✅ ${data.length}개 오름 데이터 로드 완료!`);
      } catch (err) {
        console.error("❌ 오름 데이터 로드 실패:", err);
        setError("오름 정보를 불러오지 못했어요");
      } finally {
        setLoading(false);
      }
    };

    loadOreumData();
  }, []);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 컴포넌트 언마운트 시 검색 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // 지역/구역 선택 시 필터링
  useEffect(() => {
    if (selectedRegion && oreumData.length > 0) {
      const filtered = filterByRegion(
        oreumData,
        selectedRegion,
        selectedDistrict
      );
      setFilteredOreumData(filtered);
      console.log(
        `📍 ${selectedRegion} ${selectedDistrict || "모든 지역"}: ${
          filtered.length
        }개 오름`
      );
    }
  }, [selectedRegion, selectedDistrict, oreumData]);

  // 탭 선택 핸들러
  const handleTabSelect = (tab) => {
    setSelectedTab(tab);
    setSelectedRegion(null);
    setSelectedDistrict(null);
    setCurrentView("main");
    setIsDropdownOpen(false); // 드롭다운 닫기
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 드롭다운 외부 클릭 시 닫기
  const handleClickOutside = (e) => {
    if (!e.target.closest(".regionDropdown")) {
      setIsDropdownOpen(false);
    }
  };

  // 오름 검색 로직
  const searchOreums = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchActive(false);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    const results = oreumData.filter((oreum) => {
      return (
        oreum.name.toLowerCase().includes(lowerQuery) ||
        oreum.location.toLowerCase().includes(lowerQuery) ||
        oreum.city.toLowerCase().includes(lowerQuery) ||
        (oreum.subLocation &&
          oreum.subLocation.toLowerCase().includes(lowerQuery))
      );
    });

    setSearchResults(results);
    setIsSearchActive(true);
    console.log(`🔍 "${query}" 검색 결과: ${results.length}개`);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // 디바운싱을 위한 타이머 설정
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchOreums(query);
    }, 300);

    setSearchTimeout(timeout);
  };

  // 검색 클리어
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchActive(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };

  // 구/읍/면 선택 핸들러
  const handleDistrictSelect = (region, district) => {
    setSelectedRegion(region);
    setSelectedDistrict(district);
    setCurrentView("oreumList");
  };

  // 오름 선택 핸들러
  const handleOreumSelect = (oreum) => {
    setSelectedOreum(oreum);
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    if (currentView === "oreumList") {
      setCurrentView("main");
      setSelectedRegion(null);
      setSelectedDistrict(null);
    }
  };

  // 홈으로 가기 핸들러
  const handleGoHome = () => {
    setCurrentView("main");
    setSelectedTab("all");
    setSelectedRegion(null);
    setSelectedDistrict(null);
  };

  // 표시할 구역들 계산
  const getDistrictsToShow = () => {
    if (selectedTab === "all") {
      // 모든 구역 표시
      const allDistricts = [];
      ["제주시", "서귀포시"].forEach((city) => {
        getDistrictsByCity(city).forEach((district) => {
          allDistricts.push({ region: city, district });
        });
      });
      return allDistricts;
    } else {
      // 선택된 지역의 구역만 표시
      return getDistrictsByCity(selectedTab).map((district) => ({
        region: selectedTab,
        district,
      }));
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🌋</div>
          <h2>오름들을 불러오고 있어요</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span>⚠️</span>
          <h2>앗, 문제가 생겼어요</h2>
          <p>오름 정보를 불러오지 못했어요</p>
          <button onClick={() => window.location.reload()}>
            다시 시도할게요
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESC} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="제주 오름 전경" />
        <meta property="og:url" content={SITE_URL} />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "오름모음",
              url: SITE_URL,
              description: PAGE_DESC,
              inLanguage: "ko-KR",
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </Head>

      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 onClick={handleGoHome} style={{ cursor: "pointer" }}>
            오름모음
          </h1>
          <p className={styles.subtitle}>
            제주의 {oreumData.length}개 오름을 담은 디지털 도감
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          {currentView === "main" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* 구역 목록 */}
              <div className={styles.districtView}>
                {/* 지역 헤더 with 드롭다운 & 검색 */}
                <div className={styles.regionHeader}>
                  <div className={styles.headerControls}>
                    {/* 지역 드롭다운 */}
                    <div className={`${styles.regionDropdown} regionDropdown`}>
                      <button
                        className={styles.dropdownButton}
                        onClick={toggleDropdown}
                        disabled={isSearchActive}
                      >
                        <span className={styles.dropdownText}>
                          {selectedTab === "all" ? "모든 지역" : selectedTab}
                        </span>
                        <svg
                          className={`${styles.dropdownIcon} ${
                            isDropdownOpen ? styles.open : ""
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M7 10l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {isDropdownOpen && !isSearchActive && (
                        <div className={styles.dropdownMenu}>
                          {[
                            { key: "all", label: "모든 지역" },
                            { key: "제주시", label: "제주시" },
                            { key: "서귀포시", label: "서귀포시" },
                          ].map((option) => (
                            <button
                              key={option.key}
                              className={`${styles.dropdownOption} ${
                                selectedTab === option.key ? styles.active : ""
                              }`}
                              onClick={() => handleTabSelect(option.key)}
                            >
                              <span>{option.label}</span>
                              {selectedTab === option.key && (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 오름 검색창 */}
                    <div className={styles.searchContainer}>
                      <div className={styles.searchInputWrapper}>
                        <svg
                          className={styles.searchIcon}
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="m21 21-4.35-4.35"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="오름 이름이나 지역을 입력해주세요"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className={styles.searchInput}
                        />
                        {searchQuery && (
                          <button
                            className={styles.clearButton}
                            onClick={clearSearch}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <line
                                x1="18"
                                y1="6"
                                x2="6"
                                y2="18"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <line
                                x1="6"
                                y1="6"
                                x2="18"
                                y2="18"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 검색 결과 or 지역 카드 */}
                {isSearchActive ? (
                  /* 검색 결과 */
                  <div className={styles.searchResults}>
                    {searchResults.length === 0 ? (
                      <div className={styles.noResults}>
                        <h3>찾는 오름이 없어요</h3>
                        <p>
                          &quot;{searchQuery}&quot;와 비슷한 이름의 오름을 찾지
                          못했어요
                        </p>
                        <button
                          className={styles.clearSearchButton}
                          onClick={clearSearch}
                        >
                          전체 보기
                        </button>
                      </div>
                    ) : (
                      <div className={styles.oreumGrid}>
                        {searchResults.map((oreum) => (
                          <motion.div
                            key={oreum.id}
                            className={styles.oreumCard}
                            onClick={() => handleOreumSelect(oreum)}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className={styles.oreumImage}>
                              <Image
                                src={
                                  oreum.shapeImage ||
                                  "/img/오름 종류/원추형.jpg"
                                }
                                alt={oreum.name}
                                width={300}
                                height={200}
                                onError={(e) => {
                                  e.target.src = "/img/오름 종류/원추형.jpg";
                                }}
                              />
                            </div>
                            <div className={styles.oreumInfo}>
                              <h3>{oreum.name}</h3>
                              <p className={styles.oreumLocation}>
                                {oreum.city} · {oreum.subLocation}
                              </p>
                              <div className={styles.oreumMeta}>
                                <span>⛰️ {oreum.altitude}m</span>
                                <span>🏞️ {getCleanShapeName(oreum.shape)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 지역 카드 */
                  <div className={styles.districtGrid}>
                    {getDistrictsToShow().map(({ region, district }) => {
                      const districtOreumCount = filterByRegion(
                        oreumData,
                        region,
                        district
                      ).length;
                      return (
                        <motion.div
                          key={`${region}-${district}`}
                          className={styles.districtCard}
                          onClick={() => handleDistrictSelect(region, district)}
                          whileHover={{ scale: 1.02, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={styles.districtImage}>
                            <Image
                              src={getRegionImage(region, district)}
                              alt={`${region} ${district}`}
                              width={300}
                              height={200}
                            />
                          </div>
                          <div className={styles.districtInfo}>
                            <h3>
                              {selectedTab === "all" ? (
                                <>
                                  {region} {district}
                                </>
                              ) : (
                                district
                              )}
                            </h3>
                            <p>{districtOreumCount}개 오름</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === "oreumList" && (
            <motion.div
              key="oreumList"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <OreumGrid
                oreumList={filteredOreumData}
                onOreumSelect={handleOreumSelect}
                onGoHome={handleGoHome}
                region={selectedRegion}
                district={selectedDistrict}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 오름 상세 모달 */}
      {selectedOreum && (
        <OreumDetail
          oreum={selectedOreum}
          onClose={() => setSelectedOreum(null)}
        />
      )}

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>오름모음</h4>
            <p>제주의 아름다운 오름을 디지털로 만나다</p>
          </div>
          <button
            style={{
              background: "var(--earth-brown)",
              border: "none",
              padding: "10px",
              borderRadius: "10px",
              cursor: "pointer",
              color: "white",
            }}
            onClick={() => {
              window.open("https://xn--bj0b10u3zketa68a.site/", "_blank");
            }}
          >
            제주맹글이 여행유형 테스트 하러가기!
          </button>
          <div className={styles.footerSection}>
            <p>총 {oreumData.length}개 오름</p>
            {statistics && (
              <>
                <p>제주시: {statistics.cityStats["제주시"] || 0}개</p>
                <p>서귀포시: {statistics.cityStats["서귀포시"] || 0}개</p>
              </>
            )}
          </div>
          <div className={styles.footerSection}>
            <p>데이터 출처</p>
            <p>제주특별자치도, 한국관광공사</p>
            <p>최종 업데이트: 2025년 7월</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>
            &copy; 2025 오름모음. 제주의 자연을 보존합니다.
            <a
              style={{
                textAlign: "center",
                justifyContent: "center",
                display: "flex",
              }}
              href="mailto:darkwinterlab@gmail.com"
            >
              문의: darkwinterlab@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

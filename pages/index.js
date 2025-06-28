import Head from "next/head";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegionSelector from "../components/RegionSelector";
import OreumGrid from "../components/OreumGrid";
import OreumDetail from "../components/OreumDetail";
import {
  parseOreumCSV,
  getRegionImage,
  getDistrictsByRegion,
  filterByRegion,
} from "../utils/oreumData";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [currentView, setCurrentView] = useState("main"); // 'main', 'oreumList'
  const [selectedTab, setSelectedTab] = useState("all"); // 'all', '제주시', '서귀포시'
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedOreum, setSelectedOreum] = useState(null);
  const [oreumData, setOreumData] = useState([]);
  const [filteredOreumData, setFilteredOreumData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 오름 데이터 로드
  useEffect(() => {
    const loadOreumData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 오름 데이터 로딩 시작...");
        const data = await parseOreumCSV();
        setOreumData(data);
        console.log(`✅ ${data.length}개 오름 데이터 로드 완료!`);
      } catch (err) {
        console.error("❌ 오름 데이터 로드 실패:", err);
        setError("오름 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadOreumData();
  }, []);

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
        `📍 ${selectedRegion} ${selectedDistrict || "전체"}: ${
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
      ["제주시", "서귀포시"].forEach((region) => {
        getDistrictsByRegion(region).forEach((district) => {
          allDistricts.push({ region, district });
        });
      });
      return allDistricts;
    } else {
      // 선택된 지역의 구역만 표시
      return getDistrictsByRegion(selectedTab).map((district) => ({
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
          <h2>오름모음을 준비하고 있습니다</h2>
          <p>제주의 아름다운 오름들을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span>⚠️</span>
          <h2>로딩 오류</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 onClick={handleGoHome} style={{ cursor: "pointer" }}>
            🌋 오름모음
          </h1>
          <p className={styles.subtitle}>
            제주의 {oreumData.length}개 오름을 담은 디지털 도감
          </p>
        </div>

        {/* 네비게이션 */}
        {currentView === "oreumList" && (
          <div className={styles.navigation}>
            <button onClick={handleGoBack} className={styles.backButton}>
              ← 뒤로가기
            </button>
            <div className={styles.breadcrumb}>
              <span onClick={handleGoHome} style={{ cursor: "pointer" }}>
                홈
              </span>
              {selectedRegion && (
                <>
                  <span> › </span>
                  <span>{selectedRegion}</span>
                </>
              )}
              {selectedDistrict && (
                <>
                  <span> › </span>
                  <span>{selectedDistrict}</span>
                </>
              )}
            </div>
          </div>
        )}
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
              {/* 탭 메뉴 */}
              <div className={styles.tabContainer}>
                <div className={styles.tabMenu}>
                  {[
                    { key: "all", label: "All" },
                    { key: "제주시", label: "제주시" },
                    { key: "서귀포시", label: "서귀포시" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      className={`${styles.tab} ${
                        selectedTab === tab.key ? styles.activeTab : ""
                      }`}
                      onClick={() => handleTabSelect(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 구역 목록 */}
              <div className={styles.districtView}>
                <h2>
                  {selectedTab === "all" ? "모든 지역" : `${selectedTab} 지역`}{" "}
                  구역 선택
                </h2>
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
                          <img
                            src={getRegionImage(region, district)}
                            alt={`${region} ${district}`}
                          />
                        </div>
                        <div className={styles.districtInfo}>
                          <h3>
                            {selectedTab === "all" ? (
                              <>
                                <span className={styles.regionTag}>
                                  {region}
                                </span>
                                {district}
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
                region={selectedRegion}
                district={selectedDistrict}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 오름 상세 모달 */}
      <OreumDetail
        oreum={selectedOreum}
        isOpen={!!selectedOreum}
        onClose={() => setSelectedOreum(null)}
      />

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>오름모음</h4>
            <p>제주의 아름다운 오름을 디지털로 만나다</p>
          </div>
          <div className={styles.footerSection}>
            <h4>통계</h4>
            <p>총 {oreumData.length}개 오름</p>
            <p>
              제주시: {oreumData.filter((o) => o.region === "제주시").length}개
            </p>
            <p>
              서귀포시:{" "}
              {oreumData.filter((o) => o.region === "서귀포시").length}개
            </p>
          </div>
          <div className={styles.footerSection}>
            <h4>정보</h4>
            <p>데이터 출처: 제주특별자치도</p>
            <p>최종 업데이트: 2024년 3월</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 오름모음. 제주의 자연을 보존합니다.</p>
        </div>
      </footer>
    </div>
  );
}

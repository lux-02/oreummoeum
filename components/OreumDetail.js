import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getOreumFullInfo,
  findContentIdByName,
  formatUsageInfo,
  formatPetInfo,
} from "../utils/tourAPI";
import styles from "./OreumDetail.module.css";

const OreumDetail = ({ oreum, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [apiError, setApiError] = useState(false);

  // API 데이터 로드
  useEffect(() => {
    if (isOpen && oreum) {
      loadOreumApiData();
    }
  }, [isOpen, oreum]);

  const loadOreumApiData = async () => {
    setLoading(true);
    setApiError(false);

    try {
      // CSV에서 가져온 contentId 사용 (우선)
      let contentId = oreum.tourAPI?.contentId;

      // contentId가 없으면 오름명으로 검색 (백업)
      if (!contentId) {
        contentId = await findContentIdByName(oreum.name);
      }

      if (contentId) {
        console.log(
          `🌋 ${oreum.name} API 데이터 로드 중... (ID: ${contentId})`
        );
        const fullInfo = await getOreumFullInfo(contentId);
        setApiData(fullInfo);
        console.log(`✅ ${oreum.name} API 데이터 로드 완료`);
      } else {
        console.info(
          `📋 ${oreum.name}: API 데이터가 없어 기본 정보만 표시합니다.`
        );
        setApiError(true);
      }
    } catch (error) {
      console.warn("API 데이터 로드 실패 (정상 동작):", error.message);
      setApiError(true);
      // API 실패해도 기본 데이터로 계속 진행
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "🧭 개요", icon: "🧭" },
    { id: "usage", label: "📋 이용정보", icon: "📋" },
    { id: "pet", label: "🐾 반려견", icon: "🐾" },
    { id: "photos", label: "🖼️ 사진", icon: "🖼️" },
    { id: "location", label: "📍 지도", icon: "📍" },
  ];

  if (!isOpen || !oreum) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 className={styles.oreumName}>{oreum.name}</h2>
              <p className={styles.oreumLocation}>📍 {oreum.location}</p>
              <div className={styles.oreumMeta}>
                <span className={styles.metaTag}>🏔️ {oreum.height}m</span>
                <span className={styles.metaTag}>
                  📐 {oreum.area.toLocaleString()}㎡
                </span>
                <span className={styles.metaTag}>🌋 {oreum.type}</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={`${styles.favoriteBtn} ${
                  favorited ? styles.favorited : ""
                }`}
                onClick={() => setFavorited(!favorited)}
              >
                {favorited ? "❤️" : "🤍"}
              </button>
              <button className={styles.closeBtn} onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className={styles.tabNav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className={styles.tabContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  function renderTabContent() {
    if (loading) {
      return (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🌋</div>
          <p>추가 정보를 불러오는 중...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab oreum={oreum} apiData={apiData} apiError={apiError} />
        );
      case "usage":
        return <UsageTab oreum={oreum} apiData={apiData} apiError={apiError} />;
      case "pet":
        return <PetTab oreum={oreum} apiData={apiData} apiError={apiError} />;
      case "photos":
        return (
          <PhotosTab oreum={oreum} apiData={apiData} apiError={apiError} />
        );
      case "location":
        return (
          <LocationTab oreum={oreum} apiData={apiData} apiError={apiError} />
        );
      default:
        return null;
    }
  }
};

// 개요 탭
const OverviewTab = ({ oreum, apiData, apiError }) => {
  // 디버깅을 위한 로그
  console.log("OverviewTab - apiData:", apiData);
  console.log("OverviewTab - apiError:", apiError);
  console.log("OverviewTab - overview:", apiData?.common?.overview);

  const hasDetailedOverview = apiData?.common?.overview && !apiError;
  const overviewText = hasDetailedOverview
    ? apiData.common.overview
    : oreum.description;

  return (
    <div className={styles.overview}>
      <div className={styles.mainImage}>
        <img src={oreum.image} alt={oreum.name} />
        {hasDetailedOverview && (
          <div className={styles.apiDataBadge}>
            <span>🌐</span>
            <span>상세정보</span>
          </div>
        )}
      </div>
      <div className={styles.description}>
        <div className={styles.descriptionHeader}>
          <h3>오름 소개</h3>
          {hasDetailedOverview && (
            <span className={styles.sourceIndicator}>한국관광공사 제공</span>
          )}
        </div>

        <div className={styles.overviewContent}>
          {overviewText.split("\n").map((paragraph, index) => (
            <p key={index} className={paragraph.trim() ? "" : styles.emptyLine}>
              {paragraph.trim() || "\u00A0"}
            </p>
          ))}
        </div>

        {/* 기본 오름 정보 */}
        <div className={styles.basicInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>🏔️ 높이</span>
            <span className={styles.infoValue}>{oreum.height}m</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>📐 면적</span>
            <span className={styles.infoValue}>
              {oreum.area.toLocaleString()}㎡
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>🌋 형태</span>
            <span className={styles.infoValue}>{oreum.type}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>📍 위치</span>
            <span className={styles.infoValue}>{oreum.district}</span>
          </div>
        </div>

        {apiError && (
          <div className={styles.apiNotice}>
            <span>ℹ️</span>
            <p>
              현재 기본 정보만 표시됩니다. 상세 정보는 추후 업데이트 예정입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 이용정보 탭
const UsageTab = ({ oreum, apiData, apiError }) => {
  const usageInfo = apiData
    ? formatUsageInfo(apiData.intro, apiData.info)
    : null;

  return (
    <div className={styles.usage}>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>⏰</span>
          <div>
            <h4>개방시간</h4>
            <p>{usageInfo?.openTime || "상시 개방"}</p>
          </div>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>🚫</span>
          <div>
            <h4>휴무일</h4>
            <p>{usageInfo?.restDay || "연중무휴"}</p>
          </div>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>🎫</span>
          <div>
            <h4>입장료</h4>
            <p>{usageInfo?.entrance || "무료"}</p>
          </div>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>🚗</span>
          <div>
            <h4>주차</h4>
            <p>{usageInfo?.parking || "가능"}</p>
          </div>
        </div>
      </div>

      {apiError && (
        <div className={styles.apiNotice}>
          <span>ℹ️</span>
          <p>
            기본 이용정보만 표시됩니다. 실제 방문 전 관련 기관에 문의해주세요.
          </p>
        </div>
      )}
    </div>
  );
};

// 반려견 탭
const PetTab = ({ oreum, apiData, apiError }) => {
  const petInfo = apiData ? formatPetInfo(apiData.petTour) : null;

  return (
    <div className={styles.pet}>
      <div className={styles.petStatus}>
        <span
          className={`${styles.petBadge} ${
            !apiError && petInfo?.allowed ? styles.allowed : styles.unknown
          }`}
        >
          {apiError
            ? "🐶 정보 확인 필요"
            : petInfo?.allowed
            ? "🐶 동반 가능"
            : "🚫 동반 불가"}
        </span>
      </div>

      {!apiError && petInfo?.allowed && (
        <div className={styles.petDetails}>
          <div className={styles.petInfo}>
            <h4>동반 가능 견종</h4>
            <p>{petInfo.possibleBreeds}</p>
          </div>
          <div className={styles.petInfo}>
            <h4>필수 준비사항</h4>
            <p>{petInfo.requirements}</p>
          </div>
          <div className={styles.petInfo}>
            <h4>추가 안내사항</h4>
            <p>{petInfo.notes}</p>
          </div>
        </div>
      )}

      {apiError && (
        <div className={styles.apiNotice}>
          <span>ℹ️</span>
          <p>
            반려동물 동반 정보는 방문 전 해당 지역 관광안내소나 관리사무소에
            직접 문의해주세요.
          </p>
        </div>
      )}
    </div>
  );
};

// 사진 탭
const PhotosTab = ({ oreum, apiData, apiError }) => {
  const apiImages = apiData?.images || [];

  // CSV의 FirstImage들과 API 이미지들을 합치기
  const allImages = [];

  // 1. CSV의 FirstImage 추가
  if (oreum.tourAPI?.firstImage) {
    allImages.push({
      url: oreum.tourAPI.firstImage,
      name: `${oreum.name} 대표사진`,
      source: "csv",
    });
  }

  // 2. CSV의 FirstImage2 추가 (FirstImage와 다른 경우만)
  if (
    oreum.tourAPI?.firstImage2 &&
    oreum.tourAPI.firstImage2 !== oreum.tourAPI.firstImage
  ) {
    allImages.push({
      url: oreum.tourAPI.firstImage2,
      name: `${oreum.name} 추가사진`,
      source: "csv",
    });
  }

  // 3. API 이미지들 추가 (중복 제거)
  apiImages.forEach((image, index) => {
    const isDuplicate = allImages.some((img) => img.url === image.originimgurl);
    if (!isDuplicate) {
      allImages.push({
        url: image.originimgurl,
        name: image.imgname || `${oreum.name} ${index + 1}`,
        source: "api",
      });
    }
  });

  return (
    <div className={styles.photos}>
      {allImages.length > 0 ? (
        <>
          <div className={styles.imageStats}>
            <p>📸 총 {allImages.length}장의 사진</p>
          </div>
          <div className={styles.imageGrid}>
            {allImages.map((image, index) => (
              <div key={index} className={styles.imageItem}>
                <img
                  src={image.url}
                  alt={image.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageSource}>
                    {image.source === "csv" ? "📋" : "🌐"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.noPhotos}>
          <span>📷</span>
          <h3>사진 준비 중</h3>
          <p>아름다운 오름 사진들을 준비하고 있습니다</p>
          {apiError && (
            <div className={styles.apiNotice}>
              <span>ℹ️</span>
              <p>추가 사진은 향후 업데이트 예정입니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 지도 탭
const LocationTab = ({ oreum, apiData, apiError }) => (
  <div className={styles.location}>
    <div className={styles.coordinates}>
      <h4>위치 정보</h4>
      <p>위도: {oreum.coordinates.lat}</p>
      <p>경도: {oreum.coordinates.lng}</p>
      <p className={styles.address}>{oreum.location}</p>
    </div>
    <div className={styles.mapPlaceholder}>
      <span>🗺️</span>
      <h3>지도 서비스 준비 중</h3>
      <p>인터랙티브 지도는 추후 구현 예정입니다</p>
      <p>현재는 좌표 정보를 제공합니다</p>
    </div>
  </div>
);

export default OreumDetail;

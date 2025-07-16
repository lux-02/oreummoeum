import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { searchOreum, sortOreum } from "../utils/oreumData";
import styles from "./OreumGrid.module.css";

const OreumGrid = ({
  oreumList,
  onOreumSelect,
  onGoHome,
  region,
  district,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // 검색 및 정렬 처리
  const filteredAndSortedOreums = useMemo(() => {
    let filtered = searchOreum(oreumList, searchTerm);
    return sortOreum(filtered, sortBy);
  }, [oreumList, searchTerm, sortBy]);

  // Masonry 브레이크포인트
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 2,
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2
            className={styles.title}
            onClick={onGoHome}
            style={{ cursor: "pointer" }}
          >
            {region} {district && `› ${district}`}
          </h2>
          <p className={styles.count}>{filteredAndSortedOreums.length}</p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="오름 이름을 입력해주세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={styles.clearButton}
            >
              ✕
            </button>
          )}
        </div>

        {/* <div className={styles.sortBox}>
          <label htmlFor="sort">정렬:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="name">이름순</option>
            <option value="altitude">높이순</option>
            <option value="area">면적순</option>
          </select>
        </div> */}
      </div>

      {/* 결과가 없을 때 */}
      {filteredAndSortedOreums.length === 0 && (
        <div className={styles.noResults}>
          <h3>찾는 오름이 없어요</h3>
          <p>다른 이름으로 검색해보세요</p>
        </div>
      )}

      {/* 오름 그리드 */}
      {filteredAndSortedOreums.length > 0 && (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={styles.masonryGrid}
          columnClassName={styles.masonryColumn}
        >
          {filteredAndSortedOreums.map((oreum, index) => (
            <OreumCard
              key={oreum.id}
              oreum={oreum}
              onClick={onOreumSelect}
              index={index}
            />
          ))}
        </Masonry>
      )}
    </div>
  );
};

// 개별 오름 카드 컴포넌트
const OreumCard = ({ oreum, onClick, index }) => {
  // 카드 높이 변형 (Masonry 효과)
  const heights = [360];
  const cardHeight = heights[index % heights.length];

  // 이미지 URL 결정 (API 이미지 우선, 없으면 오름 종류 이미지)
  const getImageUrl = () => {
    // ContentID가 있고 FirstImage가 있으면 API 이미지 사용
    if (oreum.tourAPI?.firstImage) {
      return oreum.tourAPI.firstImage;
    }
    // 없으면 오름 종류별 기본 이미지 사용
    return oreum.shapeImage;
  };

  // 형태명에서 괄호와 그 안의 내용 제거
  const getCleanShapeName = (shape) => {
    if (!shape) return "";
    // 괄호와 그 안의 내용을 제거 (예: "말굽형(서향)" → "말굽형")
    return shape.replace(/\(.*?\)/g, "").trim();
  };

  return (
    <motion.div
      className={styles.oreumCard}
      onClick={() => onClick(oreum)}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: (index % 8) * 0.1, // 스태거링 효과
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.95 }}
      style={{ minHeight: cardHeight }}
    >
      {/* 카드 이미지 */}
      <div className={styles.cardImage}>
        <Image
          src={getImageUrl()}
          alt={oreum.name}
          width={300}
          height={200}
          loading="lazy"
        />
        <div className={styles.imageOverlayLeft}>
          <span className={styles.typeTag}>
            {getCleanShapeName(oreum.shape)}
          </span>
        </div>
        <div className={styles.imageOverlay}>
          <span className={styles.typeTag}>{oreum.id}</span>
        </div>
        <div className={styles.imageOverlayBottomLeft}>
          <span className={styles.metaText}>{oreum.altitude}m</span>
          <span className={styles.metaText}>
            {(oreum.area / 10000).toFixed(1)}ha
          </span>
        </div>
      </div>

      {/* 카드 콘텐츠 */}
      <div className={styles.cardContent}>
        <h3 className={styles.oreumName}>{oreum.name}</h3>
        <p className={styles.oreumLocation}>{oreum.location}</p>

        <div className={styles.cardFooter}>
          <button className={styles.detailButton}>자세히 보기 →</button>
        </div>
      </div>
    </motion.div>
  );
};

export default OreumGrid;

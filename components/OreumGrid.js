import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { searchOreum, sortOreum } from "../utils/oreumData";
import styles from "./OreumGrid.module.css";

const OreumGrid = ({ oreumList, onOreumSelect, region, district }) => {
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
    480: 1,
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            {region} {district && `› ${district}`}
          </h2>
          <p className={styles.count}>
            총 {filteredAndSortedOreums.length}개의 오름
          </p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="오름명으로 검색..."
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

        <div className={styles.sortBox}>
          <label htmlFor="sort">정렬:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="name">이름순</option>
            <option value="height">높이순</option>
            <option value="area">면적순</option>
          </select>
        </div>
      </div>

      {/* 결과가 없을 때 */}
      {filteredAndSortedOreums.length === 0 && (
        <div className={styles.noResults}>
          <span>🔍</span>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색어를 시도해보세요</p>
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
  const heights = [280, 320, 360, 300, 340];
  const cardHeight = heights[index % heights.length];

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
        <img src={oreum.image} alt={oreum.name} loading="lazy" />
        <div className={styles.imageOverlay}>
          <span className={styles.typeTag}>{oreum.type}</span>
        </div>
      </div>

      {/* 카드 콘텐츠 */}
      <div className={styles.cardContent}>
        <h3 className={styles.oreumName}>{oreum.name}</h3>
        <p className={styles.oreumLocation}>{oreum.district}</p>

        <div className={styles.oreumMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>🏔️</span>
            <span className={styles.metaText}>{oreum.height}m</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>📐</span>
            <span className={styles.metaText}>
              {(oreum.area / 10000).toFixed(1)}ha
            </span>
          </div>
        </div>

        <p className={styles.oreumDescription}>{oreum.description}</p>

        <div className={styles.cardFooter}>
          <button className={styles.detailButton}>자세히 보기 →</button>
        </div>
      </div>
    </motion.div>
  );
};

export default OreumGrid;

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import NaverMap from "./NaverMap";
import styles from "./OreumDetail.module.css";

const OreumDetail = ({ oreum, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [imageError, setImageError] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (oreum) {
      setLoading(false);
    }
  }, [oreum]);

  // 사진 탭이 숨겨졌을 때 activeTab 처리
  useEffect(() => {
    if (activeTab === "photos" && !hasPhotos()) {
      setActiveTab("overview");
    }
    // 사진 탭이 활성화될 때 인덱스 리셋
    if (activeTab === "photos") {
      setCurrentPhotoIndex(0);
    }
  }, [activeTab, oreum]);

  // 오름이 변경될 때 사진 인덱스 리셋
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setCurrentSlideIndex(0);
  }, [oreum]);

  const handleImageError = (imageUrl) => {
    setImageError((prev) => ({ ...prev, [imageUrl]: true }));
  };

  const isImageValid = (imageUrl) => {
    return imageUrl && !imageError[imageUrl];
  };

  const formatText = (text) => {
    if (!text) return "";
    return text.replace(/\n/g, "<br />");
  };

  const getAllImages = () => {
    const images = [];

    // FirstImage와 FirstImage2 추가
    if (oreum.tourAPI?.firstImage) {
      images.push({
        url: oreum.tourAPI.firstImage,
        source: "CSV",
        label: "대표 이미지 1",
      });
    }

    // 추가 이미지들 (Image_1 ~ Image_10)
    oreum.images?.forEach((imageUrl, index) => {
      if (imageUrl) {
        images.push({
          url: imageUrl,
          source: "CSV",
          label: `추가 이미지 ${index + 1}`,
        });
      }
    });

    // 오름 종류별 기본 이미지 추가 (API 이미지가 없을 때)
    if (images.length === 0 && oreum.shapeImage) {
      images.push({
        url: oreum.shapeImage,
        source: "기본",
        label: `${oreum.shape} 기본 이미지`,
      });
    }

    return images;
  };

  // 개요 탭용 슬라이드 이미지 가져오기
  const getOverviewSlideImages = () => {
    const images = [];

    if (oreum.tourAPI?.firstImage) {
      images.push({
        url: oreum.tourAPI.firstImage,
        source: "API",
      });
    }

    // API 이미지가 없으면 기본 이미지 사용
    if (images.length === 0 && oreum.shapeImage) {
      images.push({
        url: oreum.shapeImage,
        source: "기본",
      });
    }

    return images;
  };

  // 슬라이드 네비게이션 함수
  const goToNextSlide = () => {
    const slideImages = getOverviewSlideImages();
    setCurrentSlideIndex((prevIndex) =>
      prevIndex === slideImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    const slideImages = getOverviewSlideImages();
    setCurrentSlideIndex((prevIndex) =>
      prevIndex === 0 ? slideImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  // 사진 탭 표시 여부 확인
  const hasPhotos = () => {
    const allImages = getAllImages();
    // 기본 오름 종류 이미지만 있는 경우는 사진 탭 숨김
    const hasRealImages = allImages.some(
      (image) => image.source === "CSV" || image.source === "API"
    );
    return hasRealImages;
  };

  // 사진 탭 네비게이션 함수들
  const goToNextPhoto = () => {
    const allImages = getAllImages();
    if (allImages.length === 0) return;

    setCurrentPhotoIndex((prevIndex) => {
      const nextIndex = prevIndex === allImages.length - 1 ? 0 : prevIndex + 1;
      console.log("Next photo:", prevIndex, "->", nextIndex); // 디버그용
      return nextIndex;
    });
  };

  const goToPrevPhoto = () => {
    const allImages = getAllImages();
    if (allImages.length === 0) return;

    setCurrentPhotoIndex((prevIndex) => {
      const nextIndex = prevIndex === 0 ? allImages.length - 1 : prevIndex - 1;
      console.log("Prev photo:", prevIndex, "->", nextIndex); // 디버그용
      return nextIndex;
    });
  };

  const goToPhoto = (index) => {
    setCurrentPhotoIndex(index);
  };

  // 드래그 이벤트 핸들러
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    setDragEnd({ x: clientX, y: clientY });
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = dragEnd.x - dragStart.x;
    const deltaY = Math.abs(dragEnd.y - dragStart.y);

    // 수평 드래그가 수직 드래그보다 크고, 최소 50px 이상 움직였을 때
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToPrevPhoto(); // 오른쪽으로 드래그 = 이전 이미지
      } else {
        goToNextPhoto(); // 왼쪽으로 드래그 = 다음 이미지
      }
    }

    setDragStart({ x: 0, y: 0 });
    setDragEnd({ x: 0, y: 0 });
  };

  const OverviewTab = () => {
    const slideImages = getOverviewSlideImages();

    return (
      <div className={styles.overviewContent}>
        {/* 이미지 슬라이드 */}
        {slideImages.length > 0 && (
          <div className={styles.imageSlideContainer}>
            <div className={styles.imageSlide}>
              <div className={styles.slideImageWrapper}>
                {isImageValid(slideImages[currentSlideIndex].url) ? (
                  <Image
                    src={slideImages[currentSlideIndex].url}
                    alt={`${oreum.name} ${slideImages[currentSlideIndex].label}`}
                    width={600}
                    height={400}
                    className={styles.slideImage}
                    onError={() =>
                      handleImageError(slideImages[currentSlideIndex].url)
                    }
                  />
                ) : (
                  <div className={styles.slideImageFallback}>
                    <span>이미지를 불러올 수 없습니다</span>
                  </div>
                )}

                {/* 슬라이드 네비게이션 버튼 */}
                {slideImages.length > 1 && (
                  <>
                    <button
                      className={`${styles.slideButton} ${styles.prevButton}`}
                      onClick={goToPrevSlide}
                    >
                      ‹
                    </button>
                    <button
                      className={`${styles.slideButton} ${styles.nextButton}`}
                      onClick={goToNextSlide}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* 슬라이드 인디케이터 */}
              {slideImages.length > 1 && (
                <div className={styles.slideIndicators}>
                  {slideImages.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.slideIndicator} ${
                        index === currentSlideIndex ? styles.active : ""
                      }`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {oreum.tourAPI?.hasAPIData && oreum.description && (
          <div className={styles.apiDescription}>
            <div className={styles.descriptionHeader}>
              <span className={styles.sourceIndicator}>한국관광공사 제공</span>
            </div>
            <div
              className={styles.descriptionText}
              dangerouslySetInnerHTML={{
                __html: formatText(oreum.description),
              }}
            />
          </div>
        )}

        <div className={styles.basicInfo}>
          <h3>기본 정보</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>높이</span>
              <span className={styles.infoValue}>{oreum.altitude}m</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>면적</span>
              <span className={styles.infoValue}>
                {oreum.area.toLocaleString()}㎡
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>형태</span>
              <span className={styles.infoValue}>{oreum.shape}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>위치</span>
              <span className={styles.infoValue}>{oreum.location}</span>
            </div>
          </div>
        </div>

        {/* 이용 정보 */}
        {(oreum.detailInfo?.infocenter ||
          oreum.detailInfo?.usetime ||
          oreum.detailInfo?.parking) && (
          <div className={styles.basicInfo}>
            <h3>이용 정보</h3>
            <div className={styles.infoGrid}>
              {oreum.detailInfo.infocenter && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>문의처</span>
                  <span className={styles.infoValue}>
                    {oreum.detailInfo.infocenter}
                  </span>
                </div>
              )}
              {oreum.detailInfo.usetime && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>이용시간</span>
                  <span
                    className={styles.infoValue}
                    dangerouslySetInnerHTML={{
                      __html: formatText(oreum.detailInfo.usetime),
                    }}
                  />
                </div>
              )}
              {oreum.detailInfo.restdate && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>휴무일</span>
                  <span className={styles.infoValue}>
                    {oreum.detailInfo.restdate}
                  </span>
                </div>
              )}
              {oreum.detailInfo.parking && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>주차</span>
                  <span className={styles.infoValue}>
                    {oreum.detailInfo.parking}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 반려동물 정보 */}
        {oreum.petInfo?.acmpyTypeCd && (
          <div className={styles.basicInfo}>
            <h3>반려동물 동반 정보</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>동반 가능 여부</span>
                <span className={styles.infoValue}>
                  {oreum.petInfo.acmpyTypeCd}
                </span>
              </div>
              {oreum.petInfo.acmpyPsblCpam && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>동반 가능 반려동물</span>
                  <span className={styles.infoValue}>
                    {oreum.petInfo.acmpyPsblCpam}
                  </span>
                </div>
              )}
              {oreum.petInfo.acmpyNeedMtr && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>필요 사항</span>
                  <span className={styles.infoValue}>
                    {oreum.petInfo.acmpyNeedMtr}
                  </span>
                </div>
              )}
              {oreum.petInfo.etcAcmpyInfo && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>추가 정보</span>
                  <span
                    className={styles.infoValue}
                    dangerouslySetInnerHTML={{
                      __html: formatText(oreum.petInfo.etcAcmpyInfo),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PhotosTab = () => {
    const allImages = getAllImages();

    if (allImages.length === 0) {
      return (
        <div className={styles.photosContent}>
          <div className={styles.noImages}>
            <p>현재 등록된 이미지가 없습니다.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.photosContent}>
        {/* 메인 이미지 뷰어 */}
        <div className={styles.mainImageViewer}>
          <div
            className={styles.mainImageContainer}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {isImageValid(allImages[currentPhotoIndex].url) ? (
              <Image
                src={allImages[currentPhotoIndex].url}
                alt={`${oreum.name} ${allImages[currentPhotoIndex].label}`}
                width={800}
                height={500}
                className={styles.mainImage}
                onError={() =>
                  handleImageError(allImages[currentPhotoIndex].url)
                }
              />
            ) : (
              <div className={styles.mainImageFallback}>
                <span>이미지를 불러올 수 없습니다</span>
              </div>
            )}

            {/* 이미지 카운터 오버레이 */}
            {allImages.length > 1 && (
              <div className={styles.imageCounterOverlay}>
                {currentPhotoIndex + 1} / {allImages.length}
              </div>
            )}

            {/* 네비게이션 버튼 */}
            {allImages.length > 1 && (
              <>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevPhoto();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  ‹
                </button>
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextPhoto();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>

        {/* 썸네일 슬라이드 */}
        {allImages.length > 1 && (
          <div className={styles.thumbnailSlider}>
            <div className={styles.thumbnailContainer}>
              <div className={styles.thumbnailTrack}>
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnailItem} ${
                      index === currentPhotoIndex ? styles.active : ""
                    }`}
                    onClick={() => goToPhoto(index)}
                  >
                    {isImageValid(image.url) ? (
                      <Image
                        src={image.url}
                        alt={`${oreum.name} 썸네일 ${index + 1}`}
                        width={80}
                        height={60}
                        className={styles.thumbnailImage}
                        onError={() => handleImageError(image.url)}
                      />
                    ) : (
                      <div className={styles.thumbnailFallback}>
                        <span>×</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const LocationTab = () => (
    <div className={styles.locationContent}>
      <div className={styles.locationInfo}>
        <h3>위치 정보</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>주소</span>
            <span className={styles.infoValue}>{oreum.location}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>행정구역</span>
            <span className={styles.infoValue}>
              {oreum.city}{" "}
              {oreum.subLocation && oreum.subLocation !== "0"
                ? oreum.subLocation
                : ""}
            </span>
          </div>
          {oreum.coordinates?.lat &&
          oreum.coordinates?.lng &&
          oreum.coordinates.lat !== 0 &&
          oreum.coordinates.lng !== 0 ? (
            <>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>위도</span>
                <span className={styles.infoValue}>
                  {oreum.coordinates.lat.toFixed(6)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>경도</span>
                <span className={styles.infoValue}>
                  {oreum.coordinates.lng.toFixed(6)}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* 지도 영역 */}
      <div className={styles.mapSection}>
        <h3>지도</h3>
        <div className={styles.mapContainer}>
          <NaverMap
            oreum={oreum}
            width="100%"
            height="400px"
            className={styles.locationMap}
          />
        </div>
      </div>
    </div>
  );

  if (!oreum) return null;

  return (
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
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{oreum.name}</h2>
            <p className={styles.subtitle}>
              {oreum.city} · {oreum.subLocation}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "overview" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              개요
            </button>
            {hasPhotos() && (
              <button
                className={`${styles.tabButton} ${
                  activeTab === "photos" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("photos")}
              >
                사진
              </button>
            )}
            <button
              className={`${styles.tabButton} ${
                activeTab === "location" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("location")}
            >
              위치
            </button>
          </div>

          <div className={styles.tabContent}>
            {loading ? (
              <div className={styles.loading}>데이터를 불러오는 중...</div>
            ) : (
              <>
                <div
                  className={`${styles.tabPanel} ${
                    activeTab === "overview" ? styles.active : styles.hidden
                  }`}
                >
                  <OverviewTab />
                </div>
                {hasPhotos() && (
                  <div
                    className={`${styles.tabPanel} ${
                      activeTab === "photos" ? styles.active : styles.hidden
                    }`}
                  >
                    <PhotosTab />
                  </div>
                )}
                <div
                  className={`${styles.tabPanel} ${
                    activeTab === "location" ? styles.active : styles.hidden
                  }`}
                >
                  <LocationTab />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OreumDetail;

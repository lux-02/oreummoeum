import React, { useState } from "react";
import Head from "next/head";
import SimpleNaverMap from "../components/SimpleNaverMap";
import styles from "../styles/TestMap.module.css";

// 테스트용 제주도 오름 예제 데이터
const testOreumData = [
  {
    id: 1,
    name: "성산일출봉",
    mapX: 126.9423,
    mapY: 33.4584,
    location: "제주특별자치도 서귀포시 성산읍 성산리",
    city: "서귀포시",
    subLocation: "성산읍",
    altitude: 182,
    shape: "원추형",
    type: "화산체",
  },
  {
    id: 2,
    name: "한라산",
    mapX: 126.5311,
    mapY: 33.3617,
    location: "제주특별자치도 제주시 해안동",
    city: "제주시",
    subLocation: "해안동",
    altitude: 1947,
    shape: "원형",
    type: "화산체",
  },
  {
    id: 3,
    name: "송악산",
    mapX: 126.3172,
    mapY: 33.2212,
    location: "제주특별자치도 서귀포시 대정읍 상모리",
    city: "서귀포시",
    subLocation: "대정읍",
    altitude: 104,
    shape: "말굽형",
    type: "화산체",
  },
  // 🔍 Geocoding 테스트용 좌표 없는 데이터
  {
    id: 4,
    name: "따라비오름",
    mapX: null, // 좌표 없음
    mapY: null, // 좌표 없음
    location: "제주특별자치도 제주시 애월읍 광령리",
    city: "제주시",
    subLocation: "애월읍",
    altitude: 382,
    shape: "원추형",
    type: "화산체",
  },
  {
    id: 5,
    name: "노꼬메오름",
    mapX: 0, // 좌표 없음 (0값)
    mapY: 0, // 좌표 없음 (0값)
    location: "제주특별자치도 서귀포시 남원읍 신례리",
    city: "서귀포시",
    subLocation: "남원읍",
    altitude: 515,
    shape: "복합형",
    type: "화산체",
  },
  {
    id: 6,
    name: "거린사슴오름",
    // mapX, mapY 자체가 없음
    location: "제주특별자치도 제주시 조천읍 교래리",
    city: "제주시",
    subLocation: "조천읍",
    altitude: 396,
    shape: "원형",
    type: "화산체",
  },
];

export default function TestMapPage() {
  const [selectedOreum, setSelectedOreum] = useState(testOreumData[0]);
  const [isMapVisible, setIsMapVisible] = useState(true);

  // 형태명에서 괄호와 그 안의 내용 제거
  const getCleanShapeName = (shape) => {
    if (!shape) return "";
    // 괄호와 그 안의 내용을 제거 (예: "말굽형(서향)" → "말굽형")
    return shape.replace(/\(.*?\)/g, "").trim();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>네이버 지도 API 테스트</title>
        <meta name="description" content="네이버 지도 API 테스트 페이지" />
      </Head>

      <header className={styles.header}>
        <h1>🗺️ 네이버 지도 API 테스트</h1>
        <p>제주도 오름 위치 표시 + Geocoding 테스트</p>
        <div
          style={{
            marginTop: "10px",
            fontSize: "14px",
            background: "rgba(255,255,255,0.2)",
            padding: "8px 16px",
            borderRadius: "20px",
            display: "inline-block",
          }}
        >
          🆕 좌표 없는 오름 → 주소 → Geocoding → 정확한 위치 표시
        </div>
      </header>

      <main className={styles.main}>
        {/* 컨트롤 패널 */}
        <div className={styles.controls}>
          <h3>🎮 테스트 컨트롤</h3>

          <div className={styles.controlGroup}>
            <label>오름 선택:</label>
            <select
              value={selectedOreum.id}
              onChange={(e) => {
                const oreum = testOreumData.find(
                  (o) => o.id === parseInt(e.target.value)
                );
                setSelectedOreum(oreum);
              }}
              className={styles.select}
            >
              {testOreumData.map((oreum) => (
                <option key={oreum.id} value={oreum.id}>
                  {oreum.name} ({oreum.city})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.controlGroup}>
            <button
              onClick={() => setIsMapVisible(!isMapVisible)}
              className={styles.button}
            >
              지도 {isMapVisible ? "숨기기" : "보이기"}
            </button>
          </div>

          <div className={styles.info}>
            <h4>📍 선택된 오름 정보</h4>
            <p>
              <strong>이름:</strong> {selectedOreum.name}
            </p>
            <p>
              <strong>위치:</strong> {selectedOreum.location}
            </p>
            <p>
              <strong>높이:</strong> {selectedOreum.altitude}m
            </p>
            <p>
              <strong>좌표:</strong>{" "}
              {selectedOreum.mapY && selectedOreum.mapX
                ? `${selectedOreum.mapY.toFixed(
                    6
                  )}, ${selectedOreum.mapX.toFixed(6)}`
                : "❌ 없음 (Geocoding 필요)"}
            </p>
            <p>
              <strong>형태:</strong> {getCleanShapeName(selectedOreum.shape)}
            </p>
          </div>
        </div>

        {/* 지도 영역 */}
        <div className={styles.mapSection}>
          <h3>🗺️ 네이버 지도</h3>
          {isMapVisible ? (
            <div className={styles.mapWrapper}>
              <SimpleNaverMap
                oreum={selectedOreum}
                width="100%"
                height="500px"
              />
            </div>
          ) : (
            <div className={styles.mapPlaceholder}>
              <p>지도가 숨겨진 상태입니다</p>
              <button
                onClick={() => setIsMapVisible(true)}
                className={styles.button}
              >
                지도 보이기
              </button>
            </div>
          )}
        </div>

        {/* 로그 영역 */}
        <div className={styles.logSection}>
          <h3>📜 브라우저 콘솔 로그 확인</h3>
          <p>
            F12를 눌러 개발자 도구를 열고 Console 탭에서 다음 로그들을
            확인하세요:
          </p>
          <ul>
            <li>✅ 네이버 지도 스크립트 로드 완료</li>
            <li>✅ 지도 컨테이너 준비 완료</li>
            <li>🔍 좌표 확인 및 Geocoding</li>
            <li>🗺️ Geocoding 시도: [주소]</li>
            <li>✅ Geocoding 성공: [좌표] (또는 ⚠️ 실패)</li>
            <li>🗺️ 지도 생성 시작</li>
            <li>📍 마커 생성</li>
            <li>💬 정보창 생성 (좌표 출처 표시)</li>
            <li>🎉 지도 초기화 완전히 완료</li>
          </ul>

          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#f0f8ff",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >
            <strong>🧪 Geocoding 테스트:</strong>
            <br />
            • 따라비오름: 제주시 애월읍 광령리
            <br />
            • 노꼬메오름: 서귀포시 남원읍 신례리
            <br />• 거린사슴오름: 제주시 조천읍 교래리
          </div>
        </div>
      </main>
    </div>
  );
}

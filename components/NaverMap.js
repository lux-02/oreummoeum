import React, { useRef, useEffect, useState } from "react";
import {
  loadNaverMapScript,
  getOptimalCoordinates,
  getOptimalCoordinatesAsync,
} from "../utils/naverMap";
import styles from "./NaverMap.module.css";

const NaverMap = ({
  oreum,
  width = "100%",
  height = "400px",
  className = "",
}) => {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("초기화 중...");
  const [error, setError] = useState(null);

  console.log("🚀 NaverMap 렌더링 시작:", oreum?.name);

  useEffect(() => {
    if (!oreum) {
      console.log("❌ oreum 데이터 없음");
      setStatus("오름 데이터 없음");
      return;
    }

    // 인증 실패 감지 함수 설정
    const originalAuthFailure = window.navermap_authFailure;
    window.navermap_authFailure = function () {
      console.error("🚫 네이버 지도 API 인증 실패!");
      setError("API 인증 실패: 신규 클라이언트 ID 발급 필요");
      setStatus("❌ API 인증 실패");

      // 인증 실패 시 fallback UI 표시
      if (mapRef.current) {
        showFallbackMap();
      }

      // 원래 함수가 있었다면 복원
      if (originalAuthFailure) {
        originalAuthFailure();
      }
    };

    const showFallbackMap = async () => {
      if (!mapRef.current) return;

      console.log("🎨 Fallback 지도 생성 (Geocoding 포함)");
      let coordinates = await getOptimalCoordinatesAsync(oreum);

      if (!coordinates) {
        coordinates = {
          lat: 33.3617,
          lng: 126.5292,
          source: "fallback",
        };
      }

      console.log(
        `📍 Fallback 좌표: ${coordinates.lat}, ${coordinates.lng} (${coordinates.source})`
      );

      mapRef.current.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          border-radius: 12px;
        ">
          <div style="font-size: 56px; margin-bottom: 24px;">🗺️</div>
          <h3 style="margin: 0 0 12px 0; font-size: 20px;">${oreum.name}</h3>
          <p style="margin: 0; opacity: 0.9; font-size: 16px;">${
            oreum.city
          } · ${oreum.subLocation}</p>
          <p style="margin: 12px 0 0 0; font-size: 14px; opacity: 0.8;">
            📍 ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}
          </p>
          <div style="
            margin-top: 24px;
            padding: 12px 18px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            font-size: 13px;
          ">
            🔑 신규 네이버 클라우드 API 키 필요
          </div>
          <a href="https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html" 
             target="_blank" 
             style="
               margin-top: 12px;
               color: #fff;
               text-decoration: underline;
               font-size: 12px;
               opacity: 0.8;
             ">
            📋 발급 가이드 보기
          </a>
        </div>
      `;
    };

    const initMap = async () => {
      try {
        console.log("🔄 지도 초기화 시작:", oreum.name);
        setStatus("지도 초기화 중...");
        setError(null);

        // 1단계: DOM 컨테이너 확인
        console.log("1️⃣ DOM 컨테이너 확인");
        if (!mapRef.current) {
          throw new Error("지도 컨테이너 ref가 없습니다");
        }

        const rect = mapRef.current.getBoundingClientRect();
        console.log(`📏 컨테이너 크기: ${rect.width}x${rect.height}`);

        if (rect.width === 0 || rect.height === 0) {
          throw new Error(
            `지도 컨테이너 크기가 0입니다: ${rect.width}x${rect.height}`
          );
        }

        // 2단계: 네이버 지도 스크립트 로드
        console.log("2️⃣ 네이버 지도 스크립트 로드");
        setStatus("지도 스크립트 로딩 중...");
        await loadNaverMapScript();
        console.log("✅ 네이버 지도 스크립트 로드 완료");

        // 3단계: 좌표 확인 (Geocoding 지원)
        console.log("3️⃣ 좌표 확인 (Geocoding 포함)");
        setStatus("좌표 확인 중...");

        let coordinates = await getOptimalCoordinatesAsync(oreum);

        if (!coordinates) {
          console.log("⚠️ 모든 좌표 추출 실패, 기본 제주도 좌표 사용");
          coordinates = {
            lat: 33.3617,
            lng: 126.5292,
            source: "fallback",
          };
        }

        console.log(
          `📍 최종 사용 좌표: ${coordinates.lat}, ${coordinates.lng} (출처: ${coordinates.source})`
        );

        // 4단계: 지도 생성
        console.log("4️⃣ 지도 생성");
        setStatus("지도 생성 중...");

        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(
            coordinates.lat,
            coordinates.lng
          ),
          zoom: 15,
          minZoom: 8,
          maxZoom: 21,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.naver.maps.MapTypeControlStyle.BUTTON,
            position: window.naver.maps.Position.TOP_RIGHT,
          },
          zoomControl: true,
          zoomControlOptions: {
            style: window.naver.maps.ZoomControlStyle.SMALL,
            position: window.naver.maps.Position.TOP_LEFT,
          },
          scaleControl: true,
          logoControl: true,
        });

        console.log("✅ 지도 생성 완료");

        // 5단계: 마커 생성 (프리미엄 디자인)
        console.log("5️⃣ 마커 생성");
        setStatus("마커 생성 중...");

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            coordinates.lat,
            coordinates.lng
          ),
          map: map,
          title: oreum.name,
          icon: {
            content: `
              <div style="
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                border: 3px solid white;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.2s ease;
              " 
              onmouseover="this.style.transform='scale(1.1)'" 
              onmouseout="this.style.transform='scale(1)'">
                🏔️
              </div>
            `,
            size: new window.naver.maps.Size(36, 36),
            anchor: new window.naver.maps.Point(18, 18),
          },
        });

        console.log("✅ 마커 생성 완료");

        // 6단계: 정보창 생성 (프리미엄 디자인)
        console.log("6️⃣ 정보창 생성");
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="
              padding: 20px; 
              min-width: 220px;
              border-radius: 12px;
              background: white;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
              border: none;
            ">
              <div style="
                display: flex;
                align-items: center;
                margin-bottom: 12px;
              ">
                <div style="
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 8px;
                  padding: 8px;
                  margin-right: 12px;
                  color: white;
                  font-size: 20px;
                ">🏔️</div>
                <div>
                  <h4 style="margin: 0; font-size: 18px; color: #2c3e50;">${
                    oreum.name
                  }</h4>
                  <p style="margin: 2px 0 0 0; font-size: 13px; color: #7f8c8d;">${
                    oreum.city
                  } · ${oreum.subLocation}</p>
                </div>
              </div>
              
              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 16px;
              ">
                <div style="
                  background: #f8f9fa;
                  padding: 10px;
                  border-radius: 8px;
                  text-align: center;
                ">
                  <div style="font-size: 20px; color: #667eea;">⛰️</div>
                  <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">높이</div>
                  <div style="font-size: 16px; font-weight: bold; color: #2c3e50;">${
                    oreum.altitude
                  }m</div>
                </div>
                
                <div style="
                  background: #f8f9fa;
                  padding: 10px;
                  border-radius: 8px;
                  text-align: center;
                ">
                  <div style="font-size: 20px; color: #667eea;">🏞️</div>
                  <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">형태</div>
                  <div style="font-size: 14px; font-weight: bold; color: #2c3e50;">${
                    oreum.shape
                  }</div>
                </div>
              </div>
              
              <div style="
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e9ecef;
                text-align: center;
              ">
                <div style="font-size: 11px; color: #adb5bd; margin-bottom: 4px;">
                  📍 ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(
            6
          )}
                </div>
                <div style="font-size: 10px; color: ${
                  coordinates.source === "geocoding"
                    ? "#28a745"
                    : coordinates.source === "API"
                    ? "#007bff"
                    : coordinates.source === "fallback"
                    ? "#ffc107"
                    : "#6c757d"
                };">
                  
                </div>
              </div>
            </div>
          `,
          borderWidth: 0,
          disableAnchor: false,
          backgroundColor: "transparent",
          maxWidth: 280,
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, "click", () => {
          console.log("👆 마커 클릭:", oreum.name);
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(map, marker);
          }
        });

        console.log("✅ 정보창 및 이벤트 등록 완료");

        // 좌표 출처별 완료 메시지
        const statusMessages = {
          API: "✅ 지도 로드 완료 (관광공사 좌표)",
          coordinates: "✅ 지도 로드 완료 (기존 좌표)",
          geocoding: "✅ 지도 로드 완료 (주소 변환)",
          fallback: "⚠️ 기본 위치 (정확한 좌표 없음)",
        };

        const statusMessage =
          statusMessages[coordinates.source] || "✅ 지도 초기화 완료!";
        setStatus(statusMessage);

        console.log(
          "🎉 NaverMap 초기화 완전 완료:",
          oreum.name,
          `(${coordinates.source})`
        );
      } catch (err) {
        console.error("❌ NaverMap 오류:", err);
        setError(err.message);
        setStatus("❌ 지도 초기화 실패");

        // 오류 시에도 fallback UI 표시
        if (mapRef.current) {
          showFallbackMap();
        }
      }
    };

    // 약간의 지연 후 초기화 (DOM 안정화)
    const timer = setTimeout(initMap, 200);

    return () => {
      clearTimeout(timer);
      // 인증 실패 함수 복원
      if (originalAuthFailure) {
        window.navermap_authFailure = originalAuthFailure;
      } else {
        delete window.navermap_authFailure;
      }
    };
  }, [oreum]);

  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ width, height }}
    >
      <div className={styles.statusBar}></div>

      <div
        ref={mapRef}
        className={styles.map}
        style={{
          width: "100%",
          height: "calc(100%)",
          border: "1px solid #e1e5e9",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default NaverMap;

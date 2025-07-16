import React, { useRef, useEffect, useState } from "react";
import {
  loadNaverMapScript,
  getOptimalCoordinatesAsync,
} from "../utils/naverMap";
import styles from "./SimpleNaverMap.module.css";

const SimpleNaverMap = ({ oreum, width = "100%", height = "400px" }) => {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("초기화 중...");
  const [error, setError] = useState(null);

  // 형태명에서 괄호와 그 안의 내용 제거
  const getCleanShapeName = (shape) => {
    if (!shape) return "";
    // 괄호와 그 안의 내용을 제거 (예: "말굽형(서향)" → "말굽형")
    return shape.replace(/\(.*?\)/g, "").trim();
  };

  console.log("🚀 SimpleNaverMap 렌더링 시작:", oreum?.name);

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
      setError("API 인증에 문제가 있어요. 신규 클라이언트 ID 발급이 필요해요");
      setStatus("API 인증에 문제가 있어요");

      // 인증 실패 시 fallback UI 표시
      if (mapRef.current) {
        // 기본 좌표로 fallback 표시
        showFallbackMap({
          lat: 33.3617,
          lng: 126.5292,
          source: "fallback",
        });
      }

      // 원래 함수가 있었다면 복원
      if (originalAuthFailure) {
        originalAuthFailure();
      }
    };

    const showFallbackMap = (coordinates = null) => {
      if (!mapRef.current) return;

      const fallbackCoords = coordinates || {
        lat: 33.3617,
        lng: 126.5292,
        source: "fallback",
      };

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
          border-radius: 8px;
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">🗺️</div>
          <h3 style="margin: 0 0 10px 0;">${oreum.name}</h3>
          <p style="margin: 0; opacity: 0.9;">${oreum.city} · ${
        oreum.subLocation
      }</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
            📍 ${fallbackCoords.lat.toFixed(4)}, ${fallbackCoords.lng.toFixed(
        4
      )}
          </p>
          <div style="
            margin-top: 20px;
            padding: 10px 15px;
            background: rgba(255,255,255,0.2);
            border-radius: 6px;
            font-size: 12px;
          ">
            🔑 신규 네이버 클라우드 API 키 필요
          </div>
          <a href="https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html" 
             target="_blank" 
             style="
               margin-top: 10px;
               color: #fff;
               text-decoration: underline;
               font-size: 11px;
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
        setStatus("지도를 불러오고 있어요...");
        await loadNaverMapScript();
        console.log("✅ 네이버 지도 스크립트 로드 완료");

        // 3단계: 좌표 확인 (Geocoding 포함)
        console.log("3️⃣ 좌표 확인 및 Geocoding");
        setStatus("좌표 확인 중...");

        let coordinates = await getOptimalCoordinatesAsync(oreum);

        if (!coordinates) {
          console.log("⚠️ 모든 좌표 확인 실패, 기본 제주도 좌표 사용");
          coordinates = {
            lat: 33.3617,
            lng: 126.5292,
            source: "fallback",
          };
        }

        console.log(
          `📍 사용할 좌표: ${coordinates.lat}, ${coordinates.lng} (출처: ${coordinates.source})`
        );

        // 4단계: 지도 생성
        console.log("4️⃣ 지도 생성");
        setStatus("지도 생성 중...");

        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(
            coordinates.lat,
            coordinates.lng
          ),
          zoom: 14,
          mapTypeControl: true,
          zoomControl: true,
        });

        console.log("✅ 지도 생성 완료");

        // 5단계: 마커 생성
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
                background: #ff6b6b;
                border: 2px solid white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              ">🏔️</div>
            `,
            size: new window.naver.maps.Size(20, 20),
            anchor: new window.naver.maps.Point(10, 10),
          },
        });

        console.log("✅ 마커 생성 완료");

        // 6단계: 정보창 생성
        console.log("6️⃣ 정보창 생성");

        // 좌표 출처별 라벨
        const getSourceLabel = (source) => {
          switch (source) {
            case "API":
              return "🎯 관광공사 API";
            case "coordinates":
              return "📍 기본 좌표";
            case "geocoding":
              return "🗺️ 주소 변환";
            case "fallback":
              return "⚠️ 기본 위치";
            default:
              return "❓ 알 수 없음";
          }
        };

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 180px; max-width: 280px;">
              <h4 style="margin: 0 0 8px 0; color: #2c3e50;">${oreum.name}</h4>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">
                <strong>높이:</strong> ${oreum.altitude}m
              </p>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">
                <strong>형태:</strong> ${getCleanShapeName(oreum.shape)}
              </p>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">
                <strong>위치:</strong> ${oreum.city}
              </p>
              ${
                coordinates.address
                  ? `
                <p style="margin: 4px 0 2px 0; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 4px;">
                  <strong>주소:</strong> ${coordinates.address}
                </p>
              `
                  : ""
              }
              <div style="
                margin-top: 8px; 
                padding-top: 6px; 
                border-top: 1px solid #eee; 
                font-size: 10px; 
                color: #aaa;
                text-align: center;
              ">
                ${getSourceLabel(coordinates.source)}
              </div>
            </div>
          `,
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

        setStatus("✅ 지도 초기화 완료!");
        console.log("🎉 SimpleNaverMap 초기화 완전 완료:", oreum.name);
      } catch (err) {
        console.error("❌ SimpleNaverMap 오류:", err);
        setError(err.message);
        setStatus("지도를 불러올 수 없어요");

        // 오류 시에도 fallback UI 표시
        if (mapRef.current) {
          showFallbackMap({
            lat: 33.3617,
            lng: 126.5292,
            source: "error",
          });
        }
      }
    };

    // 약간의 지연 후 초기화 (DOM 안정화)
    const timer = setTimeout(initMap, 100);

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
    <div className={styles.container} style={{ width, height }}>
      <div className={styles.statusBar}>
        <span className={error ? styles.error : styles.status}>
          {error || status}
        </span>
      </div>

      <div
        ref={mapRef}
        className={styles.map}
        style={{
          width: "100%",
          height: "calc(100% - 40px)",
          border: "2px solid #ddd",
          borderRadius: "8px",
        }}
      />

      {oreum && (
        <div className={styles.debugInfo}>
          <small>
            {oreum.name} | 좌표: {oreum.mapY?.toFixed(4)},{" "}
            {oreum.mapX?.toFixed(4)}
          </small>
        </div>
      )}
    </div>
  );
};

export default SimpleNaverMap;

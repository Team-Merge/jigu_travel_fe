import React, { useEffect, useState, useRef, useCallback } from "react";
import { getUserLocation, saveUserLocation } from "../../utils/api";

declare global {
  interface Window {
    naver: any;
  }
}

interface TravelWithAIMapProps {
  places: Place[];
  onLocationChange: (location: { lat: number; lng: number }) => void;
  setHighlightedPlaceId: (placeId: number | null) => void;
  mapCenter: { lat: number; lng: number } | null;
  highlightedPlaceId: number | null;
}

const TravelWithAIMap: React.FC<TravelWithAIMapProps> = ({
  places,
  onLocationChange,
  setHighlightedPlaceId,
  mapCenter,
  highlightedPlaceId,
}) => {
  const naverMapApiKey = import.meta.env.VITE_NAVER_MAP_API_KEY_ID;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const placeMarkersRef = useRef<Map<number, any>>(new Map());
  const watchId = useRef<number | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // "처음 위치" 여부를 추적하기 위한 ref
  const isInitialLocationSet = useRef(false);

  // 네이버 지도 API 로드
  useEffect(() => {
    if (!naverMapApiKey) {
      console.error("네이버 API 키가 환경 변수에 설정되지 않았습니다.");
      return;
    }

    if (window.naver && window.naver.maps) {
      console.log("네이버 지도 API 이미 로드됨");
      setMapLoaded(true);
      return;
    }

    const scriptId = "naver-map-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapApiKey}`;
      script.async = true;
      script.onload = () => {
        console.log("네이버 지도 API 로드 완료");
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [naverMapApiKey]);

  // 지도 생성
  useEffect(() => {
    if (!mapLoaded || mapRef.current || !mapContainerRef.current) return;
    console.log("지도 초기화 진행");

    // 필요하다면 최소한의 기본 좌표를 설정합니다.
    // 아래에서는 center가 잠실역으로 되어 있습니다.
    mapRef.current = new window.naver.maps.Map(mapContainerRef.current, {
      zoom: 17,
      center: new window.naver.maps.LatLng(37.514296, 127.102013),
    });
  }, [mapLoaded]);

  // 현재 위치 마커 추가 및 업데이트
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 watchId가 있으면 제거
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    watchId.current = getUserLocation(
      ({ lat, lng }) => {
        if (!lat || !lng) {
          console.warn("위치 정보를 가져올 수 없음.");
          return;
        }

        const lastLocation = lastLocationRef.current;
        const distance = lastLocation
          ? Math.hypot(lastLocation.lat - lat, lastLocation.lng - lng)
          : Infinity;

        // 필요에 맞게 50m(0.0005) 이상 이동시에만 갱신하도록 설정
        if (distance > 0.0005) {
          onLocationChange({ lat, lng });
          saveUserLocation(lat, lng).catch((error) =>
            console.error("위치 저장 오류:", error)
          );
          lastLocationRef.current = { lat, lng };
        }

        const newCenter = new window.naver.maps.LatLng(lat, lng);

        // 처음 위치를 받아온 경우에만 지도 중심으로 panTo
        if (!isInitialLocationSet.current) {
          mapRef.current.panTo(newCenter);
          isInitialLocationSet.current = true;
        }

        // 마커 생성/업데이트
        if (!currentMarkerRef.current) {
          currentMarkerRef.current = new window.naver.maps.Marker({
            position: newCenter,
            map: mapRef.current,
            icon: {
              content: `
                <div class="current-location-marker">
                  <div class="pulse"></div>
                </div>`,
              anchor: new window.naver.maps.Point(7, 7),
            },
          });
        } else {
          currentMarkerRef.current.setPosition(newCenter);
        }
      },
      (error) => {
        console.error("위치 오류 발생:", error);
        setLocationError(true);
        setTimeout(() => setLocationError(false), 10000); // 10초 후 재시도
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [mapLoaded, onLocationChange]);

  // 사용자가 명소를 선택했을 때만 지도 중앙 이동
  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.panTo(new window.naver.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
  }, [mapCenter]);

  // 명소 마커 생성 및 업데이트
  useEffect(() => {
      if (!mapLoaded) return;

      const markerIcons = {
        default: "/icons/map-pin.png",
        highlighted: "/icons/map-pin-active.png",
      };

      // 새로 업데이트된 마커 정보를 담을 임시 맵
      const updatedMarkers = new Map<number, any>();

      places.forEach((place) => {
        // 이미 마커가 있으면 그대로 사용, 없으면 새로 생성
        let marker = placeMarkersRef.current.get(place.placeId);

        if (!marker) {
          marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(place.latitude, place.longitude),
            map: mapRef.current,
            title: place.name,
          });

          // 마커 클릭 시 명소 강조 & 지도 이동
          window.naver.maps.Event.addListener(marker, "click", () => {
            setHighlightedPlaceId(place.placeId);
            mapRef.current.panTo(marker.getPosition());
          });
        }

        // 하이라이트 적용 여부에 따른 아이콘 설정
        const isHighlighted = place.placeId === highlightedPlaceId;
        marker.setIcon({
          url: isHighlighted ? markerIcons.highlighted : markerIcons.default,
          scaledSize: new window.naver.maps.Size(32, 32),
          anchor: new window.naver.maps.Point(16, 32),
        });

        updatedMarkers.set(place.placeId, marker);
      });

      // 없어진(placeId가 더 이상 없는) 마커 제거
      placeMarkersRef.current.forEach((marker, placeId) => {
        if (!updatedMarkers.has(placeId)) {
          marker.setMap(null);
        }
      });

      // placeMarkersRef 갱신
      placeMarkersRef.current = updatedMarkers;
    }, [places, mapLoaded, highlightedPlaceId, setHighlightedPlaceId]);

  // 지도 클릭 시 강조 해제
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const clickListener = window.naver.maps.Event.addListener(map, "click", () => {
      setHighlightedPlaceId(null);
    });
    return () => {
      window.naver.maps.Event.removeListener(clickListener);
    };
  }, [mapLoaded, setHighlightedPlaceId]);

// 현위치버튼
  const handleRecenter = useCallback(() => {
      if (!mapRef.current || !currentMarkerRef.current || !lastLocationRef.current) {
        console.warn("지도 혹은 현재 위치 정보가 없습니다. 현위치 버튼 동작 안함.");
        return;
      }

      const { lat, lng } = lastLocationRef.current;
      const newCenter = new window.naver.maps.LatLng(lat, lng);
      console.log(lat, lng);

      currentMarkerRef.current.setPosition(newCenter);
      mapRef.current.panTo(newCenter);

    }, []);

  return (
    <div id="map" ref={mapContainerRef} style={{ width: "100%", height: "100%" }}>
      <button id="recenter-button" onClick={handleRecenter}>
                                  <img src="/icons/gps.png" alt="현위치" />
                                </button>
      {locationError && <div className="location-error">위치 정보를 가져올 수 없습니다.</div>}
    </div>
  );
};

export default TravelWithAIMap;

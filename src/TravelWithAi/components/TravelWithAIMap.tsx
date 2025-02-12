import React, { useEffect, useState, useRef, useCallback } from "react";
import { getUserLocation, saveUserLocation, calculateDistance } from "../../utils/api";

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

    const initialCenter = lastLocationRef.current
        ? new window.naver.maps.LatLng(lastLocationRef.current.lat, lastLocationRef.current.lng)
        : new window.naver.maps.LatLng(37.514296, 127.102013);

    mapRef.current = new window.naver.maps.Map(mapContainerRef.current, {
      center: initialCenter, // 초기 위치: 잠실역
      zoom: 17,
    });
  }, [mapLoaded]);

  // 현위치 마커 추가 및 업데이트
  useEffect(() => {
    if (!mapRef.current) return;

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
          ? calculateDistance(lastLocation.lat, lastLocation.lng, lat, lng)
          : Infinity;

        if (distance > 20) { // 20m 이상 이동한 경우에만 위치 저장
          onLocationChange({ lat, lng });

          saveUserLocation(lat, lng)
            .catch((error) => console.error("위치 저장 오류:", error));

          lastLocationRef.current = { lat, lng };
          setLocationError(false);
        }

        const newCenter = new window.naver.maps.LatLng(lat, lng);
        if (mapRef.current) mapRef.current.panTo(newCenter);

        // 기존 마커가 없으면 생성, 있으면 위치 업데이트
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
  }, [mapLoaded, onLocationChange, locationError]);

  // 명소 마커 생성 및 업데이트
  useEffect(() => {
    if (!mapLoaded) return;

    const markerIcons = {
      default: "/icons/map-pin.png",
      highlighted: "/icons/map-pin-active.png",
    };

    places.forEach((place) => {
        // 새로운 마커 추가
        if (!placeMarkersRef.current.has(place.placeId)) {
            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(place.latitude, place.longitude),
                map: mapRef.current,
                title: place.name,
                icon: {
                    url: markerIcons.default,
                    scaledSize: new window.naver.maps.Size(32, 32),
                    anchor: new window.naver.maps.Point(16, 32),
                  },
                });
        // 마커 클릭 시, 해당 명소 강조 및 지도 중앙 이동
        window.naver.maps.Event.addListener(marker, "click", () => {
          setHighlightedPlaceId(place.placeId);
          mapRef.current.panTo(marker.getPosition());
        });
        placeMarkersRef.current.set(place.placeId, marker);
      }
    });

    // 기존 마커 중 사라진 명소의 마커 제거
    placeMarkersRef.current.forEach((marker, placeId) => {
      if (!places.some((place) => place.placeId === placeId)) {
        marker.setMap(null);
        placeMarkersRef.current.delete(placeId);
      }
    });
  }, [places, mapLoaded, setHighlightedPlaceId]);

  // 클릭시 강조
  useEffect(() => {
      if (!mapLoaded) return;

      const markerIcons = {
        default: "/icons/map-pin.png",
        highlighted: "/icons/map-pin-active.png",
      };

      placeMarkersRef.current.forEach((marker, placeId) => {
        marker.setIcon({
          url: highlightedPlaceId === placeId ? markerIcons.highlighted : markerIcons.default,
          scaledSize: new window.naver.maps.Size(32, 32),
          anchor: new window.naver.maps.Point(16, 32),
        });
      });
    }, [highlightedPlaceId]);

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

  // 지도 중앙 이동
  useEffect(() => {
    if (!mapCenter || !mapRef.current) return;
      mapRef.current.panTo(new window.naver.maps.LatLng(mapCenter.lat, mapCenter.lng));
  }, [mapCenter]);

  // 위치 오류 발생
  useEffect(() => {
      if (!mapLoaded || locationError) return; // 위치 오류 발생 시 일정 시간 동안 추가 요청 방지

      watchId.current = getUserLocation(
          ({ lat, lng }) => {
              const lastLocation = lastLocationRef.current;
              const distance = lastLocation
                  ? calculateDistance(lastLocation.lat, lastLocation.lng, lat, lng)
                  : Infinity;

              if (distance > 20) { // 20m 이상 이동한 경우에만 업데이트
                  onLocationChange({ lat, lng });
                  saveUserLocation(lat, lng);
                  lastLocationRef.current = { lat, lng };
                  setLocationError(false);
              }
          },
          (error) => {
              console.error("위치 오류 발생:", error);
              if (!locationError) {
                  setLocationError(true);
                  setTimeout(() => setLocationError(false), 10000); // 10초 후 재시도
              }
          }
      );

      return () => {
          if (watchId.current !== null) {
              navigator.geolocation.clearWatch(watchId.current);
          }
      };
  }, [locationError]);

  // 현위치 버튼
  const handleRecenter = useCallback(() => {
    if (!mapRef.current || !currentMarkerRef.current || !lastLocationRef.current) {
      console.warn("지도 또는 마커 정보 없음. 현위치 버튼 동작 안함.");
      return;
    }

    const { lat, lng } = lastLocationRef.current;
    const newCenter = new window.naver.maps.LatLng(lat, lng);
    mapRef.current.panTo(newCenter);

    if (currentMarkerRef.current) {
      currentMarkerRef.current.setPosition(newCenter);
    }
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

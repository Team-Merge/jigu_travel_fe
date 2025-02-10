import React, { useEffect, useState, useRef, useCallback } from "react";
import { getUserLocation, saveUserLocation } from "../utils/api";

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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const placeMarkersRef = useRef<Map<number, any>>(new Map());
  const lastLatRef = useRef<number | null>(null);
  const lastLngRef = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);

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

  // 지도 생성 (ref 사용)
  useEffect(() => {
    if (!mapLoaded || mapRef.current || !mapContainerRef.current) return;
    console.log("지도 초기화 진행");
    mapRef.current = new window.naver.maps.Map(mapContainerRef.current, {
      center: new window.naver.maps.LatLng(37.514296, 127.102013), // 초기 위치: 잠실역
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
        if (lat !== lastLatRef.current || lng !== lastLngRef.current) {
          onLocationChange({ lat, lng });
          const newCenter = new window.naver.maps.LatLng(lat, lng);
          if (!lastLatRef.current || Math.abs(lat - lastLatRef.current) > 0.0005 || Math.abs(lng - lastLngRef.current) > 0.0005) {
            mapRef.current.setCenter(newCenter);
          }
          if (currentMarkerRef.current) {
            currentMarkerRef.current.setPosition(newCenter);
          } else {
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
          }
          saveUserLocation(lat, lng);
        }
        lastLatRef.current = lat;
        lastLngRef.current = lng;
      },
      (error) => {
        alert("위치 정보를 가져올 수 없습니다.");
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [mapLoaded, onLocationChange]);

  // 명소 마커 생성 및 업데이트
  useEffect(() => {
    if (!mapLoaded) return;
    const newMarkers = new Map<number, any>();
    const markerIcons = {
      default: "/icons/map-pin.png",
      highlighted: "/icons/map-pin-active.png",
    };

    places.forEach((place) => {
      if (placeMarkersRef.current.has(place.placeId)) {
        const existingMarker = placeMarkersRef.current.get(place.placeId);
        existingMarker.setIcon({
          url: highlightedPlaceId === place.placeId ? markerIcons.highlighted : markerIcons.default,
          scaledSize: new window.naver.maps.Size(32, 32),
          size: new window.naver.maps.Size(32, 32),
          anchor: new window.naver.maps.Point(16, 32),
        });
        newMarkers.set(place.placeId, existingMarker);
      } else {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(place.latitude, place.longitude),
          map: mapRef.current,
          title: place.name,
          icon: {
            url: highlightedPlaceId === place.placeId ? markerIcons.highlighted : markerIcons.default,
            scaledSize: new window.naver.maps.Size(highlightedPlaceId === place.placeId ? 40 : 32, highlightedPlaceId === place.placeId ? 40 : 32),
            size: new window.naver.maps.Size(32, 32),
            anchor: new window.naver.maps.Point(16, 32),
          },
        });
        // 마커 클릭 시, 해당 명소 강조 및 지도 중앙 이동
        window.naver.maps.Event.addListener(marker, "click", () => {
          setHighlightedPlaceId(place.placeId);
          mapRef.current.panTo(marker.getPosition());
        });
        newMarkers.set(place.placeId, marker);
      }
    });

    // 기존 마커 중 사라진 명소의 마커 제거
    placeMarkersRef.current.forEach((marker, placeId) => {
      if (!newMarkers.has(placeId)) {
        marker.setMap(null);
      }
    });
    placeMarkersRef.current = newMarkers;
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

  // 지도 중앙 이동
  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.panTo(new window.naver.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
  }, [mapCenter]);

  // 현위치 버튼
  const handleRecenter = useCallback(() => {
    if (!mapRef.current || !currentMarkerRef.current || lastLatRef.current === null || lastLngRef.current === null) {
      console.warn("지도 또는 마커 정보 없음. 현위치 버튼 동작 안함.");
      return;
    }
    const newCenter = new window.naver.maps.LatLng(lastLatRef.current, lastLngRef.current);
    mapRef.current.setCenter(newCenter);
    currentMarkerRef.current.setPosition(newCenter);
  }, []);

  return (
    <div id="map" ref={mapContainerRef} style={{ width: "100%", height: "100%" }}>
      <button id="recenter-button" onClick={handleRecenter}>
        <img src="/icons/gps.png" alt="현위치" />
      </button>
    </div>
  );
};

export default TravelWithAIMap;

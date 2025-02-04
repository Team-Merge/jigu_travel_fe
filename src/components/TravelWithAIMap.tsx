import React, { useEffect, useState, useRef } from "react";
import { loadApiKey, saveUserLocation } from "../utils/api";
import { Place } from "../types/Place";

declare global {
  interface Window {
    naver: any;
  }
}

interface TravelWithAIMapProps {
  places: Place[];
  onLocationChange: (location: { lat: number; lng: number }) => void;
}

const TravelWithAIMap: React.FC<TravelWithAIMapProps> = ({ places, onLocationChange }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [placeMarkers, setPlaceMarkers] = useState<any[]>([]);
  
  const lastLatRef = useRef<number | null>(null);
  const lastLngRef = useRef<number | null>(null);

  // API Key 로드
  useEffect(() => {
    const fetchApiKey = async () => {
      const key = await loadApiKey();
      if (key) {
        setApiKey(key);
      } else {
        console.error("API Key 불러오기 실패!");
      }
    };
    fetchApiKey();
  }, []);

  // 네이버 지도 스크립트 로드 및 지도 초기화
  useEffect(() => {
    if (!apiKey) return;

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${apiKey}`;
    script.async = true;

    script.onload = () => {
      console.log("네이버 지도 API 로드 완료");
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        console.error("#map 요소가 존재하지 않습니다!");
        return;
      }

      // 현위치 가져오기
      navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 위치 변화가 있을 때만 업데이트
          if (lat !== lastLatRef.current || lng !== lastLngRef.current) {
            onLocationChange({ lat, lng });
            console.log("현위치:", lat, lng);

            // 지도 생성 또는 갱신
            const newMap = new window.naver.maps.Map(mapElement, {
              center: new window.naver.maps.LatLng(lat, lng),
              zoom: 17,
            });
            setMap(newMap);

            // 현재 위치 마커 추가
            addCurrentMarker(newMap, lat, lng);

            // 위치 저장 API 호출
            saveUserLocation(lat, lng);
          }
          lastLatRef.current = lat;
          lastLngRef.current = lng;
        },
        () => alert("위치 정보를 가져올 수 없습니다."),
        { enableHighAccuracy: true }
      );
    };

    document.head.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 정리
    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey, onLocationChange]);

  // 현재 위치 마커 추가 함수
  const addCurrentMarker = (mapInstance: any, lat: number, lng: number) => {
    if (currentMarker) currentMarker.setMap(null);
    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: mapInstance,
      icon: {
        content:
          '<div style="width: 12px; height: 12px; background-color: red; border-radius: 50%;"></div>',
        anchor: new window.naver.maps.Point(7, 7),
      },
    });
    setCurrentMarker(marker);
  };

  // 주변 명소 마커 업데이트
  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    placeMarkers.forEach((marker) => marker.setMap(null));

    if (places.length === 0) {
      setPlaceMarkers([]);
      return;
    }

    const newMarkers = places.map((place) => {
      return new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(place.latitude, place.longitude),
        map: map,
        title: place.name,
        icon: {
          url: "/icons/location-pin.png",
          size: new window.naver.maps.Size(32, 32),
          scaledSize: new window.naver.maps.Size(32, 32),
          anchor: new window.naver.maps.Point(16, 32),
        },
      });
    });

    setPlaceMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [places, map]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;

};

export default TravelWithAIMap;

import React, { useEffect, useState, useRef } from "react";
import { getUserLocation, saveUserLocation } from "../utils/api";

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
  const naverMapApiKey = import.meta.env.VITE_NAVER_MAP_API_KEY_ID;
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const placeMarkersRef = useRef<Map<number, any>>(new Map());
  const lastLatRef = useRef<number | null>(null);
  const lastLngRef = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);

  // 네이버 지도 로드 및 지도 초기화 (API 키 로드 후 한 번 실행)
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
          if (!mapLoaded || mapRef.current) return;

          console.log("지도 초기화 진행");
          const mapElement = document.getElementById("map");
          if (!mapElement) {
            console.error("#map 요소를 찾을 수 없습니다!");
            return;
          }

          mapRef.current = new window.naver.maps.Map(mapElement, {
            center: new window.naver.maps.LatLng(37.514296, 127.102013),
            zoom: 17,
          });
        }, [mapLoaded]);

  // 현위치 마커 추가, 업데이트
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
                  content: '<div style="width: 12px; height: 12px; background-color: red; border-radius: 50%;"></div>',
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

  // 실시간 위치 추적 및 지도 업데이트
  useEffect(() => {
      if (!mapLoaded) return;

      const newMarkers = new Map<number, any>();

      places.forEach((place) => {
        if (placeMarkersRef.current.has(place.placeId)) {
          newMarkers.set(place.placeId, placeMarkersRef.current.get(place.placeId));
        } else {
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(place.latitude, place.longitude),
            map: mapRef.current,
            title: place.name,
            icon: {
              url: "/icons/location_pin.png",
              size: new window.naver.maps.Size(32, 32),
              scaledSize: new window.naver.maps.Size(32, 32),
              anchor: new window.naver.maps.Point(16, 32),
            },
          });

          window.naver.maps.Event.addListener(marker, "click", () => {
            mapRef.current.panTo(marker.getPosition());
          });

          newMarkers.set(place.placeId, marker);
        }
      });

      placeMarkersRef.current.forEach((marker, placeId) => {
        if (!newMarkers.has(placeId)) {
          marker.setMap(null);
        }
      });

      placeMarkersRef.current = newMarkers;
    }, [places, mapLoaded]);

  // 현위치 버튼
  const handleRecenter = () => {
    if (!mapRef.current || !currentMarkerRef.current || lastLatRef.current === null || lastLngRef.current === null) {
      console.warn("지도 또는 마커 정보 없음. 현위치 버튼 동작 안함.");
      return;
    }
    const newCenter = new window.naver.maps.LatLng(lastLatRef.current, lastLngRef.current);
    mapRef.current.setCenter(newCenter);

    currentMarkerRef.current.setPosition(newCenter);
    currentMarkerRef.current.setMap(mapRef.current);
  };

  return (
      <div id="map" style={{ width: "100%", height: "100%", position: "relative" }}>
        <button id="recenter-button" onClick={() => {
            if (mapRef.current && lastLatRef.current !== null && lastLngRef.current !== null) {
                mapRef.current.setCenter(
                    new window.naver.maps.LatLng(
                        lastLatRef.current, lastLngRef.current));}}}>현위치
        </button>
      </div>
    );
  };

export default TravelWithAIMap;

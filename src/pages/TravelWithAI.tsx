import React, { useEffect, useState } from "react";

import { loadApiKey } from "../utils/api";
import { saveUserLocation } from "../utils/api";
// import { fetchNearbyPlaces } from "../utils/api";

import { Place } from "../types/Place";

import "../styles/TravelWithAI.css";

declare global {
  interface Window {
    naver: any;
  }
}

const TravelWithAI: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<string>("custom");


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
                    setUserLocation({ lat, lng });
                    console.log("현위치:", lat, lng);
                    { enableHighAccuracy: true}

                    /** 네이버 지도 객체 생성 */
                    const newMap = new window.naver.maps.Map(mapElement, {
                      center: new window.naver.maps.LatLng(lat, lng), // 현재 위치를 지도 중심으로 설정
                      zoom: 15,
                    });

        setMap(newMap);
        addCurrentMarker(newMap, lat, lng);
        saveUserLocation(lat, lng);
        },
        () => alert("위치 정보를 가져올 수 없습니다."),
        { enableHighAccuracy: true }
      );
    };

    document.head.appendChild(script);
  }, [apiKey]);


  const addCurrentMarker = (map: any, lat: number, lng: number) => {
      if (currentMarker) currentMarker.setMap(null);

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: map,
        icon: {
          content: '<div style="width: 14px; height: 14px; background-color: red; border-radius: 50%;"></div>',
          anchor: new window.naver.maps.Point(7, 7),
        },
      });

      setCurrentMarker(marker);
    };

  return (
      <div className="map-container">
        <div className="sidebar">
        <div className="sidebar-header">
            <button className="category active">맞춤 명소</button>
            <button className="category">모든 명소</button>
            <button className="category">즐겨찾기</button>
          </div>
          </div>
            <div className="map-wrapper">
          <div id="map"></div>
        </div>
      </div>
    );
};

export default TravelWithAI;

import React, { useEffect, useState } from "react";
import TravelWithAISidebar from "../components/TravelWithAISidebar";
import TravelWithAIMap from "../components/TravelWithAIMap";
import useWebSocket from "../hooks/useWebSocket";
import { fetchNearbyPlaces, getUserInterest } from "../utils/api";

import "../styles/TravelWithAI.css";

const TravelWithAI: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<string>("interest");
  const [placesCount, setPlacesCount] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
      const jwtToken = localStorage.getItem("jwt");
      if (!jwtToken || jwtToken === "undefined") {
        alert("로그인 후 사용해주세요.");
        navigate("/auth/login");
        return;
      }
      scrollToBottom();
    }, []);

  // 관심사 로드, 로컬 스토리지 저장
  useEffect(() => {
      const fetchInitialData = async () => {
            if (!userLocation) return;

            let storedInterests = JSON.parse(localStorage.getItem("interests") || "[]");

            if (storedInterests.length === 0) {
              storedInterests = await getUserInterest();
              localStorage.setItem("interests", JSON.stringify(storedInterests));
            }

            setInterests(storedInterests);

            try {
              const fetchedPlaces = await fetchNearbyPlaces(userLocation.lat, userLocation.lng, storedInterests);
              setPlaces(fetchedPlaces);
              setPlacesCount(fetchedPlaces.length);
            } catch (error) {
              console.error("초기 맞춤 명소 불러오기 실패:", error);
            }
          };

          fetchInitialData();
        }, [userLocation]);

  const { places: webSocketPlaces } = useWebSocket(userLocation, interests);

  // 모든 명소 버튼
  const handleFetchPlaces = async () => {
    if (!userLocation) return;
    try {
      const fetchedPlaces = await fetchNearbyPlaces(userLocation.lat, userLocation.lng);
      setPlaces(fetchedPlaces);
      setPlacesCount(fetchedPlaces.length);
      setActiveTab("all");
    } catch (error) {
      console.error("명소 불러오기 실패:", error);
    }
  };

  return (
    <div className="map-container">
      <TravelWithAISidebar
        places={activeTab === "all" ? places : webSocketPlaces}
                activeTab={activeTab}
                onFetchPlaces={handleFetchPlaces}
      />
      <div className="map-wrapper">
        <TravelWithAIMap places={activeTab === "all" ? places : webSocketPlaces} onLocationChange={setUserLocation} />
      </div>
      <div className="places-count">
        지금 내 주변 관광명소는 {activeTab === "all" ? placesCount : webSocketPlaces.length}개
      </div>
    </div>
  );
};

export default TravelWithAI;

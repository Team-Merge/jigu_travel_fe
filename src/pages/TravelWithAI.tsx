import React, { useEffect, useState, useRef } from "react";
import TravelWithAISidebar from "../components/TravelWithAISidebar";
import TravelWithAIMap from "../components/TravelWithAIMap";
import useWebSocket from "../hooks/useWebSocket";
import { fetchNearbyPlaces, getUserInterest, endTravel, saveUserLocation } from "../utils/api";

import "../styles/TravelWithAI.css";

interface TravelWithAIProps {
  onAiGuideRequest: (placeName: string) => void;
}

const TravelWithAI: React.FC<TravelWithAIProps> = ({ onAiGuideRequest }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<string>("interest");
  const [placesCount, setPlacesCount] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [isWebSocketReady, setIsWebSocketReady] = useState<boolean>(false);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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

            // 최초 1회 : REST API로 맞춤 명소
            try {
              const fetchedPlaces = await fetchNearbyPlaces(userLocation.lat, userLocation.lng, storedInterests);
              setPlaces(fetchedPlaces);
              setFilteredPlaces(fetchedPlaces);
              setPlacesCount(fetchedPlaces.length);
              setIsWebSocketReady(true);
            } catch (error) {
              console.error("초기 맞춤 명소 불러오기 실패:", error);
            }
          };

          fetchInitialData();
        }, [userLocation]);

  const { places: webSocketPlaces } = useWebSocket(userLocation, interests, isWebSocketReady);

  useEffect(() => {
      const updatedPlaces = activeTab === "all" ? webSocketPlaces : webSocketPlaces.filter((place) =>
          place.types.some((type) => interests.includes(type))
        );

        setFilteredPlaces(updatedPlaces);
        setPlacesCount(updatedPlaces.length);
    }, [webSocketPlaces, activeTab, interests]);

  // 모든 명소 버튼
  const handleFetchPlaces = async () => {
    if (!userLocation) return;
    try {
      setFilteredPlaces(webSocketPlaces);
      setPlacesCount(webSocketPlaces.length);
      setActiveTab("all");
    } catch (error) {
      console.error("명소 불러오기 실패:", error);
    }
  };

  // 맞춤 명소 버튼
  const handleFetchInterestPlaces = async () => {
      if (!userLocation) return;
      try {
        const filtered = webSocketPlaces.filter((place) =>
          place.types.some((type) => interests.includes(type))
        );
        setFilteredPlaces(filtered);
        setPlacesCount(filtered.length);
        setActiveTab("interest");
      } catch (error) {
        console.error("맞춤 명소 필터링 실패:", error);
      }
    };

  // 명소 리스트 클릭
  const handlePlaceClick = (placeId: number, lat: number, lng: number) => {
      setHighlightedPlaceId(null);
      setTimeout(() => {
          setHighlightedPlaceId(placeId);
          }, 10);
      setMapCenter({lat, lng});
      };

    // 여행 종료 버튼
    const handleEndTravel = async () => {
        try {
            if (!userLocation) {
                alert("현재 위치를 가져올 수 없습니다. 여행 종료를 다시 시도해주세요.");
                return;
            }

            // 종료 전 마지막 위치 저장
            await saveUserLocation(userLocation.lat, userLocation.lng);
            console.log("여행 종료 전 마지막 위치 저장 완료:", userLocation);

            // 여행 종료 API 호출
            await endTravel();

            // 사용자 알림 및 페이지 이동
            window.location.href = "/home";

        } catch (error) {
            console.error("여행 종료 중 오류 발생:", error);
            alert("여행 종료 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };


  return (
    <div className="map-container">
      <TravelWithAISidebar
        places={filteredPlaces}
        activeTab={activeTab}
        onFetchPlaces={handleFetchPlaces}
        onFetchInterestPlaces={handleFetchInterestPlaces}
        handleEndTravel={handleEndTravel}
        highlightedPlaceId={highlightedPlaceId}
        onPlaceClick={handlePlaceClick}
        onAiGuideRequest={onAiGuideRequest} 
      />
      <div className="map-wrapper">
        <TravelWithAIMap
                places={filteredPlaces}
                onLocationChange={setUserLocation}
                setHighlightedPlaceId={setHighlightedPlaceId}
                mapCenter={mapCenter}
              />
      </div>
      <div className="places-count">
        지금 내 주변 관광명소는 {placesCount}개
      </div>
    </div>
  );
};

export default TravelWithAI;

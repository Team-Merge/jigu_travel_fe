import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TravelWithAISidebar from "../components/TravelWithAISidebar";
import TravelWithAIMap from "../components/TravelWithAIMap";
import useWebSocket from "../hooks/useWebSocket";
import { fetchNearbyPlaces, getUserInterest, endTravel, saveUserLocation } from "../utils/api";
import "../styles/TravelWithAI.css";

interface TravelWithAIProps {
  onAiGuideRequest: (placeName: string) => void;
}

const TravelWithAI: React.FC<TravelWithAIProps> = ({ onAiGuideRequest }) => {
  const navigate = useNavigate();
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<"interest" | "all">("interest");
  const [placesCount, setPlacesCount] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [isWebSocketReady, setIsWebSocketReady] = useState<boolean>(false);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isWebSocketActive, setIsWebSocketActive] = useState(true);
  const [isTravelEnding, setIsTravelEnding] = useState(false);

  // JWT 체크 및 로그인 페이지 리다이렉트
  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken || jwtToken === "undefined") {
      alert("로그인 후 사용해주세요.");
      navigate("/auth/login");
    }
  }, [navigate]);

  // 사용자 위치가 결정되면 초기 관심사 및 명소 로드 (REST API)
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
        // 초기 REST API 결과를 설정해두고 WebSocket이 준비되면 대체
        setFilteredPlaces(fetchedPlaces);
        setPlacesCount(fetchedPlaces.length);
        setIsWebSocketReady(true);
      } catch (error) {
        console.error("초기 맞춤 명소 불러오기 실패:", error);
      }
    };

    fetchInitialData();
  }, [userLocation]);

  // WebSocket을 통해 실시간 명소 업데이트
  const { places: webSocketPlaces } = useWebSocket(userLocation, interests, isWebSocketReady, isWebSocketActive);

  // WebSocket 데이터와 activeTab, 관심사에 따라 명소 필터링
  useEffect(() => {
    const updatedPlaces =
      activeTab === "all"
        ? webSocketPlaces
        : webSocketPlaces.filter((place) =>
            place.types.some((type) => interests.includes(type))
          );
    setFilteredPlaces(updatedPlaces);
    setPlacesCount(updatedPlaces.length);
  }, [webSocketPlaces, activeTab, interests]);

  // 명소 클릭 시 지도 중앙 업데이트
  const handlePlaceClick = (placeId: number, lat: number, lng: number) => {
    setHighlightedPlaceId(placeId);
    setMapCenter({ lat, lng });
  };

  // "모든 명소" 버튼
  const handleFetchPlaces = () => {
    if (!userLocation) return;
    setFilteredPlaces(webSocketPlaces);
    setPlacesCount(webSocketPlaces.length);
    setActiveTab("all");
  };

  // "맞춤 명소" 버튼
  const handleFetchInterestPlaces = () => {
    if (!userLocation) return;
    const filtered = webSocketPlaces.filter((place) =>
      place.types.some((type) => interests.includes(type))
    );
    setFilteredPlaces(filtered);
    setPlacesCount(filtered.length);
    setActiveTab("interest");
  };

  // "여행 종료" 버튼
  const handleEndTravel = async () => {
    if (!userLocation) {
      alert("현재 위치를 가져올 수 없습니다. 여행 종료를 다시 시도해주세요.");
      return;
    }
    setIsTravelEnding(true);

    try {
      // 종료 전 마지막 위치 저장
      await saveUserLocation(userLocation.lat, userLocation.lng);
      console.log("여행 종료 전 마지막 위치 저장 완료:", userLocation);

      // 여행 종료 API 호출
      const response = await endTravel();
      if (response && response.code === 200) {
        alert("여행이 종료되었습니다. 메인 화면으로 이동합니다.");
        setIsWebSocketActive(false);
        window.location.replace("/home");
      } else {
        alert("여행 종료에 실패했습니다. 다시 시도해주세요.");
        setIsTravelEnding(false);
      }
    } catch (error) {
      console.error("여행 종료 중 오류 발생:", error);
      alert("여행 종료 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsTravelEnding(false);
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
          highlightedPlaceId={highlightedPlaceId}
        />
      </div>
      <div className="places-count">지금 내 주변 관광명소는 {placesCount}개</div>
    </div>
  );
};

export default TravelWithAI;

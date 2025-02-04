import React, { useState } from "react";
import TravelWithAISidebar from "../components/TravelWithAISidebar";
import TravelWithAIMap from "../components/TravelWithAIMap";
import { fetchNearbyPlaces, getUserInterest } from "../utils/api";

import "../styles/TravelWithAI.css";

const TravelWithAI: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [placesCount, setPlacesCount] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  const handleFetchPlacesByInterests = async () => {
    if (!userLocation) return;
    try {
      const interests = await getUserInterest();
      if (interests.length === 0) {
        console.warn("사용자 관심사 없음.");
        setPlaces([]);
        setPlacesCount(0);
        return;
      }
      const fetchedPlaces = await fetchNearbyPlaces(userLocation.lat, userLocation.lng, interests);
      setPlaces(fetchedPlaces);
      setPlacesCount(fetchedPlaces.length);
      setActiveTab("interest");
    } catch (error) {
      console.error("맞춤 명소 불러오기 실패:", error);
    }
  };

  return (
    <div className="map-container">
      <TravelWithAISidebar
        places={places}
        activeTab={activeTab}
        onFetchPlaces={handleFetchPlaces}
        onFetchPlacesByInterests={handleFetchPlacesByInterests}
      />
      <div className="map-wrapper">
        <TravelWithAIMap places={places} onLocationChange={setUserLocation} />
      </div>
      <div className="places-count">
        지금 내 주변 관광명소는 {placesCount}개
      </div>
    </div>
  );
};

export default TravelWithAI;

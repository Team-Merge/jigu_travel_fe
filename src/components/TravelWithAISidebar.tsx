import React, { useEffect, useRef } from "react";

import "../styles/TravelWithAISidebar.css";
import Custom_icon from "../assets/images/travelwithai_custom.svg";
import All_icon from "../assets/images/travelwithai_all.svg";
import End_icon from "../assets/images/travelwithai_end.png";

interface Place {
  placeId: number;
  types: string[];
  name: string;
  tel?: string;
  latitude: number;
  longitude: number;
  address: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TravelWithAISidebarProps {
  places: Place[];
  activeTab: string;
  onFetchPlaces: () => void;
  onFetchInterestPlaces: () => void;
  handleEndTravel: () => void;
  highlightedPlaceId: number | null;
  onPlaceClick: {lat: number, lng: number};
  onAiGuideRequest: (placeName: string) => void;  // 명소 안내버튼? 동작? ㄱㄴ?
}

const TravelWithAISidebar: React.FC<TravelWithAISidebarProps> = ({
  places,
  activeTab,
  onFetchPlaces,
  onFetchInterestPlaces,
  handleEndTravel,
  highlightedPlaceId,
  onPlaceClick,
  onAiGuideRequest
}) => {
    const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (highlightedPlaceId && itemRefs.current[highlightedPlaceId]) {
              itemRefs.current[highlightedPlaceId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }, [highlightedPlaceId]);

    return (
        <div className="map-sidebar">
          {/* 카테고리 버튼 영역 */}
          <div className="map-sidebar-categories">
          <button className={`map-category ${activeTab === "interest" ? "active" : ""}`} onClick={onFetchInterestPlaces}>
                    <img src={Custom_icon} className="place-category-icon" alt="맞춤 명소"/> 맞춤 명소 </button>
          <button className={`map-category ${activeTab === "all" ? "active" : ""}`} onClick={onFetchPlaces}>
              <img src={All_icon} className="place-category-icon" alt="모든 명소" /> 모든 명소 </button>
          <button className={`map-category ${activeTab === "" ? "active" : ""}`} onClick={handleEndTravel}>
                        <img src={End_icon} className="place-category-icon" alt="" /> 여행 종료 </button>
          </div>

      {/* 명소 리스트 영역 */}
          <div className="map-sidebar-places">
            {places.length > 0 ? (
              places.map((place) => (
                  <div
                        key={place.placeId}
                        ref={(el) => (itemRefs.current[place.placeId] = el)}
                        className={`place-item ${highlightedPlaceId === place.placeId ? "highlighted" : ""}`}
                        onClick = {() => {
                            onPlaceClick(place.placeId, place.latitude, place.longitude);
                            }}
                  >
                       <h3>{place.name}</h3>
                            <p className="place-address">{place.address}</p>
                            <p className="place-tel">{place.tel}</p>
                        {/* AI 명소 안내받기 버튼 */}
                        <button className="ai-guide-button" onClick={() => onAiGuideRequest(place.name)}>
                            AI 명소 안내받기
                        </button>
                  </div>
              ))
            ) : (
          <p className="no-places">주변 명소를 찾을 수 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default TravelWithAISidebar;

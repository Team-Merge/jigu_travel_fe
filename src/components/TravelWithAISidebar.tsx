import React from "react";

import "../styles/TravelWithAISidebar.css";
import Custom_icon from "../assets/images/travelwithai_custom.svg";
import All_icon from "../assets/images/travelwithai_all.svg";

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
}

const TravelWithAISidebar: React.FC<TravelWithAISidebarProps> = ({
  places,
  activeTab,
  onFetchPlaces,
}) => {
  return (
    <div className="map-sidebar">
      {/* 카테고리 버튼 영역 */}
      <div className="map-sidebar-categories">
      <button className={`map-category ${activeTab === "custom" ? "active" : ""}`}>
                <img
                  src={Custom_icon}
                  className="place-category-icon"
                  alt="맞춤 명소"
                />
                맞춤 명소
              </button>
        <button
                  className={`map-category ${activeTab === "all" ? "active" : ""}`}
                  onClick={onFetchPlaces}
                >
          <img
            src={All_icon}
            className="place-category-icon"
            alt="모든 명소"
          />
          모든 명소
        </button>
      </div>

      {/* 명소 리스트 영역 */}
      <div className="map-sidebar-places">
        {places.length > 0 ? (
          places.map((place, index) => (
            <div key={index} className="place-item">
              <h3>
                {place.name} <span className="place-category">{place.types}</span>
              </h3>
              <p className="place-address">{place.address}</p>
              <p className="place-tel">{place.tel}</p>
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

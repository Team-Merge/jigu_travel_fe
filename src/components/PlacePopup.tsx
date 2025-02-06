import React from "react";
import "../styles/PlacePopup.css"; // 스타일 추가

const PLACE_TYPES = [
  "식도락_여행",
  "오락_체험_여행",
  "힐링_여행",
  "역사_문화_여행",
  "쇼핑_여행",
  "캠핑_글램핑_여행",
];

interface PlacePopupProps {
  place: any;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onClose: () => void;
  onSave: () => void;
  setSelectedPlace: (place: any) => void;
}

const PlacePopup: React.FC<PlacePopupProps> = ({
  place,
  isEditing,
  setIsEditing,
  onClose,
  onSave,
  setSelectedPlace,
}) => {
  if (!place) return null; // 선택된 장소가 없으면 아무것도 렌더링하지 않음

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-head">
          <h2>장소 상세 정보</h2>
        </div>
        
        <p>
          <strong>이름:</strong>{" "}
          {isEditing ? (
            <input
              value={place.name}
              onChange={(e) => setSelectedPlace({ ...place, name: e.target.value })}
            />
          ) : (
            place.name
          )}
        </p>

        <p>
          <strong>연락처:</strong>{" "}
          {isEditing ? (
            <input
              value={place.tel || ""}
              onChange={(e) => setSelectedPlace({ ...place, tel: e.target.value })}
            />
          ) : (
            place.tel || "없음"
          )}
        </p>


        <p>
          <strong>종류:</strong>{" "}
          {isEditing ? (
            <select
              value={place.types[0]}
              onChange={(e) => setSelectedPlace({ ...place, types: [e.target.value] })}
            >
              {PLACE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          ) : (
            place.types.join(", ")
          )}
        </p>
        <p>
          <strong>위도:</strong>{" "}
          {isEditing ? (
            <input
              type="number"
              step="0.000001"
              value={place.latitude}
              onChange={(e) => setSelectedPlace({ ...place, latitude: parseFloat(e.target.value) })}
            />
          ) : (
            place.latitude
          )}
        </p>

        <p>
          <strong>경도:</strong>{" "}
          {isEditing ? (
            <input
              type="number"
              step="0.000001"
              value={place.longitude}
              onChange={(e) => setSelectedPlace({ ...place, longitude: parseFloat(e.target.value) })}
            />
          ) : (
            place.longitude
          )}
        </p>

        <p>
          <strong>주소:</strong>{" "}
          {isEditing ? (
            <input
              value={place.address}
              onChange={(e) => setSelectedPlace({ ...place, address: e.target.value })}
            />
          ) : (
            place.address
          )}
        </p>
      </div>
      <div className="popup-buttons">
        {isEditing ? (
          <button onClick={onSave}>저장</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>편집하기</button>
        )}
        <button onClick={onClose}>닫기</button>
      </div>

    </div>
  );
};

export default PlacePopup;

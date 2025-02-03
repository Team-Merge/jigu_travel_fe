import React from "react";
import { Place } from "../types/Place";

interface Props {
  place: Place;
  onSelect: (place: Place) => void;
}

const PlaceInfo: React.FC<Props> = ({ place, onSelect }) => {
  return (
    <div className="place-info" onClick={() => onSelect(place)}>
      <h3>{place.name}</h3>
      <p>{place.category || "정보 없음"} | {place.address}</p>
    </div>
  );
};

export default PlaceInfo;

import React from "react";
import { Place } from "../types/Place";
import PlaceInfo from "./PlaceInfo";

interface Props {
  places: Place[];
}

const PlaceList: React.FC<Props> = ({ places }) => {
  return (
    <div className="places-list">
      {places.length === 0 ? (
        <p>주변 명소를 찾을 수 없습니다.</p>
      ) : (
        places.map((place) => <PlaceInfo key={place.id} place={place} />)
      )}
    </div>
  );
};

export default PlaceList;

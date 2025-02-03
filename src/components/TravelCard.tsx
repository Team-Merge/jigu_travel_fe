import React, { forwardRef } from "react";
import "../styles/TravelCard.css";

interface TravelCardProps {
  name: string;
  address: string;
  tel?: string;  // tel을 선택적(optional) 속성으로 변경
}

// forwardRef를 사용하여 ref 전달 가능하도록 수정
const TravelCard = forwardRef<HTMLDivElement, TravelCardProps>(
  ({ name, address, tel }, ref) => {
    return (
      <div ref={ref} className="travel-card">
        <h3>{name}</h3>
        <p>{address}</p>
        {tel && <p>☎ {tel}</p>}
      </div>
    );
  }
);

export default TravelCard;
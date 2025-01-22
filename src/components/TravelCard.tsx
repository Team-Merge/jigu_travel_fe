// src/components/TravelCard.tsx
import React from "react";
import "../styles/TravelCard.css";

interface TravelCardProps {
  name: string;
}

const TravelCard: React.FC<TravelCardProps> = ({ name }) => {
  return (
    <div className="travel-card">
      <h3>{name}</h3>
      <button className="bookmark-btn">🔖</button>
    </div>
  );
};

export default TravelCard;

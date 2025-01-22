// src/pages/Home.tsx
import React from "react";
import Header from "../components/Header";
import TravelCard from "../components/TravelCard";
import "../styles/Home.css";

const Home: React.FC = () => {

  return (
    <div className="home">
      <Header />
      <h2>맞춤형 여행 안내</h2>
      <div className="recommend-section">
        <button className="recommend-card" onClick={() => window.location.href = "/travel-with-ai"}>
          <p>AI와 함께 여행 시작!</p>
          <h3>여행친구와 함께 여행하기</h3>
        </button>
        <button className="recommend-card" onClick={() => window.location.href = "/ask-ai"}>
          <p>저건 뭘까?</p>
          <h3>사진 찍어서 AI에게 물어보기</h3>
        </button>
      </div>

      <h2>사용자 맞춤형 인근 여행지</h2>
      <div className="filter-buttons">
        <button className="selected">전체</button>
        <button>호텔</button>
        <button>유적지</button>
      </div>

      <div className="travel-list">
        <TravelCard name="서울 타워" />
        <TravelCard name="경복궁" />
      </div>
    </div>
  );
};

export default Home;
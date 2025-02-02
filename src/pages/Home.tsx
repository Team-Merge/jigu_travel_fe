import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../components/Header";
import TravelCard from "../components/TravelCard";
import "../styles/Home.css";
import { getUserInterest, fetchPlaces, Place } from "../utils/api";

const Home: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    getUserInterest().then((interests) => {
      if (interests.length > 0) {
        setCategories(["전체", ...interests]);
      }
    });
  }, []);

  useEffect(() => {
    setPage(0);
    setPlaces([]); // 새로운 카테고리를 선택하면 리스트 초기화
    loadPlaces(0, selectedCategory);
  }, [selectedCategory]);

  const loadPlaces = async (page: number, category: string) => {
    const newPlaces = await fetchPlaces(page, 10, category);
    setPlaces((prev) => [...prev, ...newPlaces]);
    setHasMore(newPlaces.length > 0);
  };

  const lastPlaceRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => {
            const newPage = prev + 1;
            loadPlaces(newPage, selectedCategory);
            return newPage;
          });
        }
      });

      observer.current.observe(node);
    },
    [hasMore, selectedCategory]
  );

  return (
    <div className="home-wrapper">
      <Header />
      <div className="home-container">
        <div className="title-name">
          <h3>맞춤형 여행 안내</h3>
        </div>
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

        <div className="title-name">
          <h3>사용자 맞춤형 인근 여행지</h3>
        </div>
        <div className="filter-buttons">
          {categories.map((category, index) => (
            <button
              key={index}
              className={category === selectedCategory ? "selected" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="travel-list">
          {places.map((place, index) => (
            <TravelCard
              key={place.placeId}
              name={place.name}
              address={place.address}
              tel={place.tel ?? "연락처 정보 없음"}
              ref={index === places.length - 1 ? lastPlaceRef : null} // forwardRef 적용된 TravelCard에 ref 전달
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

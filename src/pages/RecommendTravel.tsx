import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { getUserInfo, getRecommendations, UserInfo, RecommendationResponse } from "../utils/api";
import Header from "../components/Header";
import "../styles/RecommendTravel.css";
import localShopping from "../assets/images/genreOptions/local-shopping.png";
import mall from "../assets/images/genreOptions/mall.png";
import history from "../assets/images/genreOptions/history.png";
import festival from "../assets/images/genreOptions/festival.png";
import food from "../assets/images/genreOptions/food.png";
import buffet from "../assets/images/genreOptions/buffet.png";
import landscape from "../assets/images/genreOptions/landscape.png";
import healing from "../assets/images/genreOptions/healing.png";
import camping from "../assets/images/genreOptions/camping.png";
import glamping from "../assets/images/genreOptions/glamping.png";
import thrill from "../assets/images/genreOptions/thrill.png";
import culture from "../assets/images/genreOptions/culture.png";

const genreOptions = [
  "로컬 쇼핑", "대형 쇼핑몰", "역사와 전통 건축물", "축제와 공연", "로컬 음식",
  "고급 뷔페", "풍경 감상", "힐링 산책", "노지 캠핑", "글램핑", "스릴 체험", "문화"
];

const travelOptions = [
  { value: 0, label: "0번" },
  { value: 1, label: "5회 미만" },
  { value: 2, label: "5회 ~ 10회" },
  { value: 3, label: "10회 이상" }
];

// 장르별 이미지 매핑 (이미지가 없는 경우 undefined)
const genreImages: { [key: string]: string | undefined } = {
  "로컬 쇼핑": localShopping,
  "대형 쇼핑몰": mall,
  "역사와 전통 건축물": history,
  "축제와 공연": festival,
  "로컬 음식": food,
  "고급 뷔페": buffet,
  "풍경 감상": landscape,
  "힐링 산책": healing,
  "노지 캠핑": camping,
  "글램핑": glamping,
  "스릴 체험": thrill,
  "문화": culture,
};

const RecommendTravel: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1); // 현재 단계 (1: 여행 횟수, 2: 장르 선택, 3: 추천 결과)
  const [user, setUser] = useState<UserInfo | null>(null);
  const [travelFrequency, setTravelFrequency] = useState<number | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserInfo().then(setUser).catch(console.error);
  }, []);

  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) => {
        if (prev.includes(genre)) {
            return prev.filter((g) => g !== genre); // 선택 해제
        } else if (prev.length < 3) {
            return [...prev, genre]; // 3개까지 선택 가능
        } else {
            return prev; // 3개 이상 선택 불가
        }
    });
};

  const getAgeGroup = (birthDate: string): number => {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age < 10) return 0;
    if (age < 20) return 1;
    if (age < 30) return 2;
    if (age < 40) return 3;
    if (age < 50) return 4;
    if (age < 60) return 5;
    if (age < 70) return 6;
    return 7;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || travelFrequency === null) return;

    const requestData = {
      age: getAgeGroup(user.birthDate),
      gender: user.gender === "MALE" ? 1 : 0,
      annual_travel_frequency: travelFrequency,
      selected_genres: selectedGenres,
      method: "hybrid",
    };

    try {
      console.log("[DEBUG] 요청 데이터:", requestData);
      const response = await getRecommendations(requestData);
      console.log("[DEBUG] FastAPI 응답:", response);
      setRecommendations(response);
      setError(null);
      setStep(3); // 추천 결과 페이지로 이동
    } catch (err) {
      console.error("추천 요청 중 오류 발생:", err);
      setError("추천 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="recommend-travel-wrapper">
    <div className="recommend-travel-container">
      <Header />

      {/* 여행 횟수 선택 페이지 */}
      {step === 1 && (
        <div>
          <h3>1년 중 몇 번 정도 여행을 떠나시나요?</h3>
          <form onSubmit={() => setStep(2)}>
            {travelOptions.map((option) => (
              <label key={option.value} className="radio-option">
                <input
                  type="radio"
                  name="travelFrequency"
                  value={option.value}
                  checked={travelFrequency === option.value}
                  onChange={() => setTravelFrequency(option.value)}
                />
                {option.label}
              </label>
            ))}
            <button type="submit" disabled={travelFrequency === null}>다음</button>
          </form>
        </div>
      )}

      {/* 장르 선택 페이지 */}
      {step === 2 && (
          <div>
              <h3>관심 있는 여행 스타일을 3개 선택하세요</h3>
              <div className="genre-grid">
                  {genreOptions.map((genre) => {
                      const imageUrl = genreImages[genre];

                      return (
                          <div
                              key={genre}
                              className={`genre-item ${selectedGenres.includes(genre) ? "selected" : ""}`}
                              onClick={() => handleGenreChange(genre)}
                          >
                              <div
                                  className="genre-image"
                                  style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : "none" }}
                              ></div>
                              <p>{genre}</p>
                          </div>
                      );
                  })}
              </div>
              <button className="next-btn" onClick={handleSubmit} disabled={selectedGenres.length !== 3}>
                  추천받기
              </button>
          </div>
      )}

      {/* 추천 결과 페이지 */}
      {step === 3 && recommendations && (
        <div>
          <h3>추천 결과</h3>
          <p><strong>추천 1:</strong> {recommendations.top2_recommendations[0]}</p>
          <p><strong>추천 2:</strong> {recommendations.top2_recommendations[1]}</p>
          <h3>ai가 해당 카테고리를 추천한 이유</h3>
          <div>
            {Object.entries(recommendations.category_scores).map(([category, score]) => (
              <p key={category}>{category}: {score.toFixed(2)}</p>
            ))}
          </div>
          <button className="next-btn" onClick={() => navigate("/home")}>종료</button>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
    </div>
  );
};

export default RecommendTravel;

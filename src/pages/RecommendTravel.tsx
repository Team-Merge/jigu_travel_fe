import React, { useState, useEffect } from "react";
import { getUserInfo, getRecommendations, UserInfo, RecommendationResponse } from "../utils/api";

const genreOptions = [
  "로컬 쇼핑", "대형 쇼핑몰", "역사와 전통 건축물", "축제와 공연", "로컬 음식",
  "고급 뷔페", "풍경 감상", "힐링 산책", "노지 캠핑", "글램핑", "스릴 체험", "문화"
];

const RecommendTravel: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [travelFrequency, setTravelFrequency] = useState<number>(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserInfo().then(setUser).catch(console.error);
  }, []);

  /** 사용자가 선택한 장르 업데이트 */
  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const getAgeGroup = (birthDate: string): number => {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    
    if (age < 10) return 0;  // 10대 미만
    if (age < 20) return 1;  // 10대
    if (age < 30) return 2;  // 20대
    if (age < 40) return 3;  // 30대
    if (age < 50) return 4;  // 40대
    if (age < 60) return 5;  // 50대
    if (age < 70) return 6;  // 60대
    return 7;  // 70대 이상
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const requestData = {
      age: getAgeGroup(user.birthDate),
      gender: user.gender === "MALE" ? 1 : 0,
      annual_travel_frequency: travelFrequency,
      selected_genres: selectedGenres,
      method: "hybrid",
    };

    try {
      console.log("🔹 [DEBUG] 요청 데이터:", requestData);

      const response = await getRecommendations(requestData);

      // FastAPI 응답을 그대로 사용
      console.log("🔹 [DEBUG] FastAPI 응답 (정제됨):", response);
      setRecommendations(response);
      setError(null);
    } catch (err) {
      console.error("🚨 추천 요청 중 오류 발생:", err);
      setError("추천 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <h2>여행 추천 받기</h2>
      <form onSubmit={handleSubmit}>
        <label>여행 빈도:</label>
        <input
          type="number"
          value={travelFrequency}
          onChange={(e) => setTravelFrequency(Number(e.target.value))}
        />

        <h3>관심 있는 여행 스타일을 선택하세요 (최대 3개)</h3>
        {genreOptions.map((genre) => (
          <label key={genre} style={{ display: "block" }}>
            <input
              type="checkbox"
              value={genre}
              checked={selectedGenres.includes(genre)}
              onChange={() => handleGenreChange(genre)}
              disabled={selectedGenres.length >= 3 && !selectedGenres.includes(genre)}
            />
            {genre}
          </label>
        ))}

        <button type="submit">추천받기</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {recommendations && (
        <div>
          <h3>추천 결과</h3>
          <p><strong>추천 1:</strong> {recommendations.top2_recommendations[0]}</p>
          <p><strong>추천 2:</strong> {recommendations.top2_recommendations[1]}</p>
          <h4>카테고리 점수</h4>
          <ul>
            {Object.entries(recommendations.category_scores).map(([category, score]) => (
              <li key={category}>{category}: {score.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecommendTravel;

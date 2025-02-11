import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../../layout/components/Header";
import TravelCard from "../components/TravelCard";
import "../styles/Home.css";
import { getUserInterest, fetchPlaces, countVisitor, Place } from "../../utils/api";
import { FaSyncAlt } from "react-icons/fa";
import MainGuideLogo from "../../assets/images/main_guide_logo.png"
import MainImageLogo from "../../assets/images/main_image_logo.png"


const Home: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // 기본 위치 (서울 강남 송파구)
  const DEFAULT_LATITUDE = 37.508373;
  const DEFAULT_LONGITUDE = 127.103565;

  /** 홈 진입 시 최초 한 번만 사용자 위치 가져오기 */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        console.log("위치 가져오기 성공:", coords.latitude, coords.longitude);
      },
      (error) => {
        console.warn("위치 가져오기 실패, 기본값 사용:", error);
        setLatitude(DEFAULT_LATITUDE);
        setLongitude(DEFAULT_LONGITUDE);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  }, []);

  /** 사용자 관심사 불러오기 */
  useEffect(() => {
    getUserInterest().then((interests) => {
      if (interests.length > 0) {
        setCategories(["전체", ...interests]);
      }
    });
  }, []);

  /** 장소 목록 불러오기 (카테고리 변경 시) */
  useEffect(() => {
    setPage(0);
    setPlaces([]); // 리스트 초기화
    if (latitude !== null && longitude !== null) {
      loadPlaces(0, selectedCategory);
    }
  }, [selectedCategory, latitude, longitude]);

  /** 방문자 카운트 */
  useEffect(() => {
    countVisitor().then((status) => {
      console.log(status === "new" ? "새로운 방문!" : "기존 방문자");
    });
  }, []);

  /** 장소 불러오기 */
  const loadPlaces = async (page: number, category: string) => {
    try {
      if (latitude === null || longitude === null) return;
      const response = await fetchPlaces(page, 10, category, latitude, longitude);
      setPlaces((prev) => [...prev, ...response.content]);
      setHasMore(page < response.totalPages - 1);
    } catch (error) {
      console.error("장소 데이터 불러오기 실패:", error);
    }
  };

  /** "장소 업데이트" 버튼 클릭 시 위치 업데이트 */
  const updateLocation = () => {
    if (isDisabled) return;

    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), 3000); 

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setPage(0);
        setPlaces([]);
        loadPlaces(0, selectedCategory);

        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
        console.log("새로운 위치:", coords.latitude, coords.longitude);
      },
      (error) => console.error("위치 가져오기 실패:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  };

  /** 무한 스크롤 감지 */
  const lastPlaceRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasMore || loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setLoading(true);
          setPage((prev) => {
            const newPage = prev + 1;
            loadPlaces(newPage, selectedCategory).then(() => setLoading(false));
            return newPage;
          });
        }
      });

      observer.current.observe(node);
    },
    [hasMore, selectedCategory, loading]
  );

  return (
    <div className="home-wrapper">
      <Header />
      <div className="home-container">
        {showNotification && <div className="notification">장소가 업데이트 되었습니다</div>}

        
        <div className="title-name">
          <h3>AI가 추천하는 여행</h3>
        </div>
        <div className="recommend-section">
          <button className="recommend-card" onClick={() => window.location.href = "/travel-with-ai"}>
            <div className="main-log-wrapper">
            <img src={MainGuideLogo} width="75" height="70"/>
            </div>
            <p>AI와 함께 여행 시작!</p>
            <h3>여행친구와 <br/>
              함께 여행하기</h3>
          </button>
          <button className="recommend-card" onClick={() => window.location.href = "/ask-ai"}>
            <div className="main-log-wrapper">
              <img src={MainImageLogo} width="60" height="70"/>
            </div>
              <p>저건 뭘까?</p>
              <h3>사진 찍어서
                <br/>
                AI에게 물어보기</h3>
          </button>
        </div>

        <div className="title-container">
          <div className="title-name">
            <h3>AI가 추천하는 여행지</h3>
          </div>

          <div className="update-location-container">
            <button className="refresh-button" onClick={updateLocation} title="내 위치 새로고침" disabled={isDisabled}>
              <FaSyncAlt className="refresh-icon" />
            </button>
          </div>
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
              ref={index === places.length - 1 ? lastPlaceRef : null} // forwardRef 적용
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

import React, { useEffect, useState } from "react";
import {
  fetchPlaces,
  fetchDeletedPlaces,
  uploadPlacesCsv,
  deletePlace,
  permanentlyDeletePlace,
  Place,
  updatePlace,
} from "../utils/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlacePopup from "../components/PlacePopup";
import "../styles/AdminLocationPage.css";
import PlaceCategoryChart from "../components/PlaceCategoryChart";

const AdminLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [deletedPlaces, setDeletedPlaces] = useState<Place[]>([]);
  const [page, setPage] = useState(0);
  const [deletedPage, setDeletedPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDeletedPages, setTotalDeletedPages] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  /** 검색 관련 상태 */
  const [searchQuery, setSearchQuery] = useState(""); // 검색어
  const [searchBy, setSearchBy] = useState<"name" | "types" | "address">("name"); // 검색 기준 (기본값: 이름)
  const [searchTerm, setSearchTerm] = useState("")

  /** CSV 파일 선택 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  /** CSV 파일 업로드 */
  const handleUpload = async () => {
    if (!file) {
      alert("CSV 파일을 선택해주세요.");
      return;
    }
    try {
      const result = await uploadPlacesCsv(file);
      alert(result);
      fetchPlacesList(); // 업로드 후 목록 갱신
    } catch (error) {
      alert("CSV 업로드 실패");
      console.error(error);
    }
  };

  const handleSearch = () => {
    setPage(0); // 검색 시 첫 페이지로 이동
    setSearchTerm(searchQuery); // ✅ 입력된 검색어를 실제 검색어로 설정 후 fetchPlacesList 실행
  };

  /** 장소 목록 불러오기 */
  const fetchPlacesList = async () => {
    try {
      const response = await fetchPlaces(page, size, "전체", undefined, undefined, false, searchQuery, searchBy);
      setPlaces(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("장소 데이터 불러오기 실패:", error);
    }
  };

  /** 삭제된 장소 목록 불러오기 */
  const fetchDeletedPlacesList = async () => {
    try {
      const response = await fetchDeletedPlaces(deletedPage, size);
      setDeletedPlaces(response.content || []);
      setTotalDeletedPages(response.totalPages || 1);
    } catch (error) {
      console.error("삭제된 장소 불러오기 실패:", error);
    }
  };
  useEffect(() => {
    fetchPlacesList();
  }, [page, searchTerm]);

  useEffect(() => {
    fetchDeletedPlacesList();
  }, [deletedPage]);

  /** 장소 삭제 (Soft Delete) */
  const handleDelete = async (placeId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deletePlace(placeId);
      fetchPlacesList();
      fetchDeletedPlacesList();
    } catch (error) {
      console.error("장소 삭제 실패:", error);
    }
  };
  
    /** 장소 복구 (Soft Delete 해제) */
    const handleRestore = async (placeId: number) => {
    if (!window.confirm("이 장소를 복구하시겠습니까?")) return;
    try {
      await deletePlace(placeId); // 기존 삭제 API를 호출하여 복구
      fetchPlacesList(); // 장소 목록 갱신
      fetchDeletedPlacesList(); // 휴지통 목록 갱신
    } catch (error) {
      console.error("장소 복구 실패:", error);
    }
  };

  /** 장소 완전 삭제 (Hard Delete) */
  const handlePermanentDelete = async (placeId: number) => {
    if (!window.confirm("정말 완전 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await permanentlyDeletePlace(placeId);
      fetchDeletedPlacesList();
    } catch (error) {
      console.error("완전 삭제 실패:", error);
    }
  };
  
  const handleRowClick = (place: Place) => {
    setSelectedPlace(place);
    setIsEditing(false); // 보기 모드로 초기화
  };

  const handleSave = async () => {
    if (!selectedPlace) return;

    try {
      await updatePlace(selectedPlace.placeId, selectedPlace);
      alert("장소 정보가 업데이트되었습니다.");
      setIsEditing(false);
      fetchPlacesList();
    } catch (error) {
      console.error("업데이트 실패:", error);
      alert("업데이트에 실패했습니다.");
    }
  };
  return (
    <div className="location-wrapper">
      <Header />
      <div className="location-container">
        <h2>장소 관리</h2>
        <div className="stats-container">
            <div className="category-upload-wrapper">
                <div className="chart-wrapper">
                    <PlaceCategoryChart />
                </div>
                <div className="upload-wrapper">
                    <div className="file-container">
                        <input type="file" accept=".csv" onChange={handleFileChange} />
                    </div>
                    <div className="csv-button-container">
                        <button className="csv-search-btn" onClick={handleUpload}>CSV 업로드</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="stats-container">
          <div className="search-wrapper">
            <div className="search-types">
                <select value={searchBy} onChange={(e) => setSearchBy(e.target.value as "name" | "types" | "address")}>
                <option value="name">이름</option>
                <option value="types">종류</option>
                <option value="address">주소</option>
                </select>
            </div>
            <div className="location-search-container">
                <input
                    type="text"
                    placeholder="검색어 입력..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
        </div>
        
        <button className="search-btn" onClick={handleSearch}>검색</button>
        {/* 장소 목록 */}
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-header">
              <h2>장소 목록</h2>
            </div>

            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>종류</th>
                  <th>주소</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {places.length > 0 ? (
                  places.map((place) => (
                    <tr key={place.placeId} onClick={() => handleRowClick(place)}>
                      <td>{place.name}</td>
                      <td>{place.types.join(", ")}</td>
                      <td>{place.address}</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(place.placeId);
                          }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>검색 결과가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 📌 페이지네이션 */}
            <div className="pagination">
              <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
                이전
              </button>
              <span>{page + 1} / {totalPages}</span>
              <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={page >= totalPages - 1}>
                다음
              </button>
            </div>
          </div>
        </div>
        {/* 팝업 컴포넌트 사용 */}
        <PlacePopup
          place={selectedPlace}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onClose={() => setSelectedPlace(null)}
          onSave={handleSave}
          setSelectedPlace={setSelectedPlace}
        />
        {/* 삭제된 장소 목록 */}
        <div className="stats-container">
            <div className="stat-box">
                <div className="stat-header">
                <h2>휴지통</h2>
                </div>
                <table>
                <thead>
                    <tr>
                    <th>이름</th>
                    <th>종류</th>
                    <th>주소</th>
                    <th>복구</th>
                    <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                {deletedPlaces.length > 0 ? (
                    deletedPlaces.map((place) => (
                    <tr key={place.placeId}>
                        <td>{place.name}</td>
                        <td>{place.types.join(", ")}</td>
                        <td>{place.address}</td>
                        <td>
                        <button onClick={() => handleRestore(place.placeId)}>복구</button>
                        </td>
                        <td>
                        <button onClick={() => handlePermanentDelete(place.placeId)}>삭제</button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px", fontWeight: "bold" }}>
                        휴지통이 비었습니다!
                    </td>
                    </tr>
                )}
                </tbody>
                </table>
                {/* 삭제된 장소 페이지네이션 */}
                <div className="pagination">
                <button onClick={() => setDeletedPage((prev) => Math.max(prev - 1, 0))} disabled={deletedPage === 0}>
                    이전
                </button>
                <span>
                    {deletedPage + 1} / {totalDeletedPages}
                </span>
                <button onClick={() => setDeletedPage((prev) => Math.min(prev + 1, totalDeletedPages - 1))} disabled={deletedPage >= totalDeletedPages - 1}>
                    다음
                </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLocationPage;

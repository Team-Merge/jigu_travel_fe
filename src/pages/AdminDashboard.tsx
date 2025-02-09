import React, { useEffect, useState } from "react";
import {
  getTodayVisitorCount,
  getVisitorCountByDate,
//   getVisitorRecords,
  getAllActiveUsers,
  setAdminStatus,
  fetchPlaces,
  getTodayUserStats,
} from "../utils/api";
import { useNavigate } from "react-router-dom";
import VisitorChart from "../components/VisitorChart";
import "../styles/AdminDashboard.css";
import Header from "../components/Header";

interface VisitorRecord {
  id: number;
  ip: string;
  visitDate: string;
  visitCount: number;
}

interface Place {
    placeId: number;
    name: string;
    types: string[];
    address: string;
  }

interface User {
  userId: string;
  loginId: string;
  nickname: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
    
const navigate = useNavigate();

const [userPage, setUserPage] = useState<number>(0);
const [placePage, setPlacePage] = useState<number>(0);
const [size] = useState<number>(10);
const [totalUserPages, setTotalUserPages] = useState<number>(1);
const [totalPlacePages, setTotalPlacePages] = useState<number>(1);


  const [todayCount, setTodayCount] = useState<number>(0);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateCount, setDateCount] = useState<number | null>(null);
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const getTodayKST = () => {
    const now = new Date();
    now.setHours(now.getHours() + 9); // UTC → KST 변환
    return now.toISOString().split("T")[0]; // yyyy-MM-dd 형식 반환
  };
  
  const getPastDateKST = (days: number) => {
    const date = new Date();
    date.setHours(date.getHours() + 9); // UTC → KST 변환
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };

  const getPastDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };
  
  // 방문자 통계 기간 (기본값: 최근 7일)
const [startDate, setStartDate] = useState<string>(getPastDateKST(7));
const [endDate] = useState<string>(getTodayKST());

useEffect(() => {
    fetchTodayCount();
    fetchUsers();
  }, [userPage]);
  
  useEffect(() => {
    fetchPlacesList();
  }, [placePage]);

  const fetchTodayCount = async () => {
    const count = await getTodayVisitorCount();
    setTodayCount(count);
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllActiveUsers(userPage, size);
      setUsers(response.content || []);
      setTotalUserPages(response.totalPages || 1);
    } catch (error) {
      console.error("사용자 불러오기 실패:", error);
      setUsers([]);
    }
  };

  const fetchPlacesList = async () => {
    try {
      const response = await fetchPlaces(placePage, size, "전체");
      setPlaces(response.content || []);
      setTotalPlacePages(response.totalPages || 1);
    } catch (error) {
      console.error("장소 데이터 불러오기 실패:", error);
      setPlaces([]);
    }
  };
  
  const [todayStats, setTodayStats] = useState<{ newUsers: number; deletedUsers: number } | null>(null);

  useEffect(() => {
      fetchTodayStats();
  }, []);
  
  const fetchTodayStats = async () => {
      try {
          const stats = await getTodayUserStats();
          setTodayStats(stats);
      } catch (error) {
          console.error("오늘 가입/탈퇴자 수 가져오기 실패:", error);
      }
  };

  // 사용자 목록 페이지 이동
  const goToPreviousUserPage = () => {
    if (userPage > 0) setUserPage(userPage - 1);
  };
  const goToNextUserPage = () => {
    if (userPage < totalUserPages - 1) setUserPage(userPage + 1);
  };
  
  // 장소 목록 페이지 이동
  const goToPreviousPlacePage = () => {
    if (placePage > 0) setPlacePage(placePage - 1);
  };
  const goToNextPlacePage = () => {
    if (placePage < totalPlacePages - 1) setPlacePage(placePage + 1);
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    const kstDate = new Date(date);
    kstDate.setHours(kstDate.getHours() + 9);
    const formattedDate = kstDate.toISOString().split("T")[0];
  
    setSelectedDate(formattedDate);
    const count = await getVisitorCountByDate(formattedDate);
    setDateCount(count);
  };

  // 관리자 권한 부여/해제
  const toggleAdmin = async (userId: string, role: string) => {
    const newRole = role === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN";
    await setAdminStatus(userId, newRole);
    fetchUsers();
  };

  return (
    <div className="admin-wrapper">
        <Header />
        <div className="admin-dashboard">

            <h2>개요</h2>
            <div className="stats-container">
                <div className="stat-box">
                    <h2>오늘 방문자</h2>
                    <p>{todayCount}명</p>
                </div>
                <div className="stat-box">
                    <h2>오늘 가입자 / 탈퇴자</h2>
                    {todayStats ? (
                        <p>{todayStats.newUsers}명 / {todayStats.deletedUsers}명</p>
                    ) : (
                        <p>데이터 로딩 중...</p>
                    )}
                </div>
            </div>
            
            <div className="stats-container">
                <div className="stat-box">
                    <div className="stat-header">
                        <h2>방문자 통계</h2>
                        <button className="report-btn" onClick={() => navigate("/admin/visitor")}>전체 보고서 →</button>
                    </div>
                {/* VisitorChart에 startDate, endDate 전달 */}
                <VisitorChart startDate={startDate} endDate={endDate} />
                </div>
            </div>
    
            {/* 사용자 관리 UI */}
            <div className="stats-container">
                <div className="stat-box">
                    <div className="stat-header">
                        <h2>사용자 목록</h2>
                        <button className="report-btn" onClick={() => navigate("/admin/users")}>사용자 관리 →</button>
                    </div>
                    {users.length > 0 ? (
                        <table>
                        <thead>
                            <tr>
                            <th>아이디</th>
                            <th>닉네임</th>
                            <th>관리자 여부</th>
                            {/* <th>관리자 설정</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.loginId}</td>
                                <td>{user.nickname}</td>
                                <td>{user.role === "ROLE_ADMIN" ? "✅" : "❌"}</td>
                                {/* <td>
                                <button onClick={() => toggleAdmin(user.userId, user.role)}>
                                    {user.role === "ROLE_ADMIN" ? "해제" : "부여"}
                                </button>
                                </td> */}
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    ) : (
                        <p>사용자 데이터가 없습니다.</p>
                    )}

                    {/* 페이지네이션 UI */}
                    <div className="pagination">
                        <button onClick={goToPreviousUserPage} disabled={userPage === 0}>
                        이전
                        </button>
                        <span>{userPage + 1} / {totalUserPages}</span>
                        <button onClick={goToNextUserPage} disabled={userPage >= totalUserPages - 1}>
                        다음
                        </button>
                    </div>
                </div>
            </div>
            <div className="stats-container">
                <div className="stat-box">
                    <div className="stat-header">
                        <h2>장소 목록</h2>
                        <button className="report-btn" onClick={() => navigate("/admin/location")}>장소 관리 →</button>
                    </div>
                    {places.length > 0 ? (
                        <table>
                        <thead>
                            <tr>
                            <th>이름</th>
                            <th>종류</th>
                            <th>주소</th>
                            </tr>
                        </thead>
                        <tbody>
                            {places.map((place) => (
                            <tr key={place.placeId}>
                                <td>{place.name}</td>
                                <td>{place.types.join(", ")}</td>
                                <td>{place.address}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    ) : (
                    <p>장소 데이터가 없습니다.</p>
                    )}
                    {/* 페이지네이션 UI */}
                    <div className="pagination">
                      <button onClick={goToPreviousPlacePage} disabled={placePage === 0}>
                          이전
                      </button>
                      <span>{placePage + 1} / {totalPlacePages}</span>
                      <button onClick={goToNextPlacePage} disabled={placePage >= totalPlacePages - 1}>
                          다음
                      </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;

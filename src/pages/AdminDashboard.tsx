import React, { useEffect, useState } from "react";
import {
  getTodayVisitorCount,
  getVisitorCountByDate,
  getVisitorRecords,
  getAllUsers,
  setAdminStatus,
} from "../utils/api";
import VisitorChart from "../components/VisitorChart";
import "../styles/AdminDashboard.css";
import Header from "../components/Header";

interface VisitorRecord {
  id: number;
  ip: string;
  visitDate: string;
  visitCount: number;
}

interface User {
  userId: string;
  loginId: string;
  nickname: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [todayCount, setTodayCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateCount, setDateCount] = useState<number | null>(null);
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // 페이지네이션 관련 상태
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchTodayCount();
    fetchVisitorRecords();
    fetchUsers();
  }, [page]);

  const fetchTodayCount = async () => {
    const count = await getTodayVisitorCount();
    setTodayCount(count);
  };

  const fetchVisitorRecords = async () => {
    const data = await getVisitorRecords();
    setRecords(data);
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers(page, size);
      setUsers(response.content || []); // undefined 방지
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("사용자 불러오기 실패:", error);
      setUsers([]); // 에러 발생 시 빈 배열 유지
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    const count = await getVisitorCountByDate(date);
    setDateCount(count);
  };

  // 관리자 권한 부여/해제
  const toggleAdmin = async (userId: string, role: string) => {
    const newRole = role === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN";
    await setAdminStatus(userId, newRole);
    fetchUsers();
  };

  // 페이지 이동
  const goToPreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <div className="admin-dashboard">
      <Header />

      <h2>방문자 대시보드</h2>
      <div className="stats-container">
        <div className="stat-box">
          <h2>오늘 방문자 수</h2>
          <p>{todayCount}명</p>
        </div>
        <div className="stat-box">
          <h2>특정 날짜 방문자 수</h2>
          <input type="date" value={selectedDate} onChange={handleDateChange} />
          {dateCount !== null && <p>{selectedDate} 방문자 수: {dateCount}명</p>}
        </div>
      </div>
      <VisitorChart />

      {/* 🔥 사용자 관리 UI */}
      <h2>사용자 관리</h2>
      {users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>아이디</th>
              <th>닉네임</th>
              <th>관리자 여부</th>
              <th>관리자 설정</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.loginId}</td>
                <td>{user.nickname}</td>
                <td>{user.role === "ROLE_ADMIN" ? "✅ 관리자" : "❌ 일반 사용자"}</td>
                <td>
                  <button onClick={() => toggleAdmin(user.userId, user.role)}>
                    {user.role === "ROLE_ADMIN" ? "❌ 관리자 해제" : "✅ 관리자 부여"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>사용자 데이터가 없습니다.</p>
      )}

      {/* 🔥 페이지네이션 UI */}
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={page === 0}>
          이전
        </button>
        <span>페이지 {page + 1} / {totalPages}</span>
        <button onClick={goToNextPage} disabled={page === totalPages - 1}>
          다음
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

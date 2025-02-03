import React, { useEffect, useState } from "react";
import { getTodayVisitorCount, getVisitorCountByDate, getVisitorRecords, getAllUsers, setAdminStatus } from "../utils/api";
import VisitorChart from "../components/VisitorChart";
import "../styles/AdminDashboard.css";

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
  role: string;  // ✅ isAdmin 대신 role 사용
}

const AdminDashboard: React.FC = () => {
  const [todayCount, setTodayCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateCount, setDateCount] = useState<number | null>(null);
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchTodayCount();
    fetchVisitorRecords();
    fetchAllUsers();
  }, []);

  const fetchTodayCount = async () => {
    const count = await getTodayVisitorCount();
    setTodayCount(count);
  };

  const fetchVisitorRecords = async () => {
    const data = await getVisitorRecords();
    setRecords(data);
  };

  const fetchAllUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    const count = await getVisitorCountByDate(date);
    setDateCount(count);
  };

  // ✅ role을 기반으로 관리자 권한을 부여/해제
  const toggleAdmin = async (userId: string, role: string) => {
    const newRole = role === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN"; // ✅ role을 직접 변경
    await setAdminStatus(userId, newRole);
    fetchAllUsers(); // 변경 후 사용자 목록 새로고침
  };
  
  return (
    <div className="admin-dashboard">
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
          {users.map(user => (
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
    </div>
  );
};

export default AdminDashboard;

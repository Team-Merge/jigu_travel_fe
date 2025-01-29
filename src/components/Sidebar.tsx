// src/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, logout } from "../utils/api";
import "../styles/Sidebar.css";

interface SidebarProps {
  onClose: () => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isOpen }) => {
  const [user, setUser] = useState<{ nickname: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
      } catch (error) {
        setUser(null); // 에러 발생 시 비로그인 상태 처리
      }
    };

    if (isOpen) { // 사이드바가 열릴 때만 사용자 정보 가져오기
      fetchUser();
    }
  }, [isOpen]); // `isOpen`이 변경될 때마다 실행

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/");
  };

  return (
      <div className={`sidebar ${isOpen ? "open" : ""}`}> {/* 동적 클래스 적용 */}
        <button className="close-btn" onClick={onClose}>✖</button>

        {user ? (
            <div className="user-info">
              <p className="username">{user.nickname}님</p>
              <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
            </div>
        ) : (
            <button className="login-btn" onClick={() => navigate("/auth/login")}>
              로그인 및 회원가입
            </button>
        )}
        <button className="ai-guide-btn" onClick={() => navigate("/ai-guide")}>
          AI 음성 가이드
        </button>
        <p className="menu-item">Q & A</p>
      </div>
  );
};

export default Sidebar;

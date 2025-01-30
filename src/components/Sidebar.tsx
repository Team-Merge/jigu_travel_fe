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
        {/* 사용자 정보 + 닫기 버튼을 한 줄에 배치 */}
        <div className="user-header">
          <div className="user-info">
            {user ? <p className="username">{user.nickname}님</p> : null}
          </div>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        {/* 로그인 여부에 따른 버튼 */}
        {user ? (
          <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
        ) : (
          <button className="login-btn" onClick={() => navigate("/auth/login")}>
            로그인 및 회원가입
          </button>
        )}
        <div className="guide-section">
        <button className="menu-item" onClick={() => navigate("/ai-guide")}>
          AI 음성 가이드
          <img src="/icons/right_arrow.svg" alt="화살표" className="arrow-icon" />
        </button>
        <button className="menu-item" onClick={() => navigate("/recommend-travel")}>
          카테고리 추천
          <img src="/icons/right_arrow.svg" alt="화살표" className="arrow-icon" />
        </button>
        <button className="menu-item" onClick={() => navigate("/board")}>
          Q & A
          <img src="/icons/right_arrow.svg" alt="화살표" className="arrow-icon" />
        </button>
      </div>

      </div>
  );
};

export default Sidebar;

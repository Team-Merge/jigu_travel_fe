// src/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation 추가
import { getUserInfo, logout } from "../utils/api";
import "../styles/Sidebar.css";

interface SidebarProps {
  onClose: () => void;
  isOpen: boolean;
}

interface User {
  nickname: string;
  role: string; // 역할 추가 (ROLE_USER, ROLE_ADMIN 등)
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isOpen }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // 현재 페이지 경로 가져오기

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };

    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/");
  };

  // 기본 메뉴 (일반 사용자용)
  const defaultMenu = [
    { label: "AI 음성 가이드", path: "/ai-guide" },
    { label: "카테고리 추천", path: "/recommend-travel" },
    { label: "Q & A", path: "/board" },
  ];

  // 관리자 페이지 메뉴 (`/admin`에서만 표시)
  const adminMenu = [
    { label: "대시보드", path: "/admin" },
    { label: "방문자 통계", path: "/admin/visitor" },
    { label: "사용자 관리", path: "/admin/visitors" },
    { label: "장소 관리", path: "/admin/location" },
  ];

  // 현재 URL이 "/admin"으로 시작하면 관리자 메뉴 사용
  const isAdminPage = location.pathname.startsWith("/admin");
  const menuItems = isAdminPage ? adminMenu : defaultMenu;

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="user-header">
        <div className="user-info">
          {user ? <p className="username">{user.nickname}님</p> : null}
        </div>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      {user ? (
        <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
      ) : (
        <button className="login-btn" onClick={() => navigate("/auth/login")}>
          로그인 및 회원가입
        </button>
      )}

      {/* 현재 페이지에 따라 다른 메뉴 표시 */}
      <div className="guide-section">
        {menuItems.map((item) => (
          <button key={item.path} className="menu-item" onClick={() => navigate(item.path)}>
            {item.label}
            <img src="/icons/right_arrow.svg" alt="화살표" className="arrow-icon" />
          </button>
        ))}

        {/* 관리자일 때만 "관리 페이지" 버튼 추가 (일반 모드에서만) */}
        {!isAdminPage && user?.role === "ROLE_ADMIN" && (
          <button className="menu-item" onClick={() => navigate("/admin")}>
            관리페이지
            <img src="/icons/right_arrow.svg" alt="화살표" className="arrow-icon" />
          </button>
        )}
      </div>

    </div>
  );
};

export default Sidebar;

// src/components/Header.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import "../styles/global.css";
import Sidebar from "./Sidebar";
import logo from "../assets/images/logo.png";

const Header: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
        <div className="logo" onClick={() => navigate("/home")}>
          <img src={logo} alt="지구여행" className="logo-img" />
        </div>

        <div className="header-icons">
          <button className="search-icon">
              <img src="/icons/search_logo.svg" alt="검색" className="icon-img" />
          </button>
          
          <button className="menu-icon" onClick={() => setSidebarOpen(true)}>
              <img src="/icons/menu_logo.svg" alt="검색" className="icon-img" />
          </button>
        </div>

        <Sidebar onClose={() => setSidebarOpen(false)} isOpen={isSidebarOpen} />

    </header>
  );
};

export default Header;

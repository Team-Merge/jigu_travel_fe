// src/pages/AuthLogin.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthLogin.css";
import Header from "../components/Header";
import logo from "../assets/images/logo.png";

const AuthLogin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-login-container">
        <div className="auth-login">
        <Header />
        <img src={logo} alt="지구여행 로고" className="logo_body" />

        <h2 className="title">지구 <span className="highlight">구석구석</span> 떠나는 여행</h2>

        <button className="login-button" onClick={() => navigate("/auth/login/email")}>
            아이디로 시작하기
        </button>

        <p className="register-text">
            아직 회원이 아니신가요?{" "}
            <span className="register-link" onClick={() => navigate("/auth/register")}>
            아이디로 회원가입 하기
            </span>
        </p>
        </div>
    </div>
  );
};

export default AuthLogin;

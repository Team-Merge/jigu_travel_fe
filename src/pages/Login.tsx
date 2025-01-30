// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, checkUserInterest } from "../utils/api";
import LoginForm from "../components/LoginForm";
import Header from "../components/Header";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await login(loginId, password);
      const hasInterest = await checkUserInterest();
      if (hasInterest) {
        navigate("/home"); // 관심사 있으면 홈으로 이동
      } else {
        navigate("/recommend-travel"); // 관심사 없으면 추천 여행 페이지로 이동
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.");
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-content">
        <LoginForm
          loginId={loginId}
          setLoginId={setLoginId}
          password={password}
          setPassword={setPassword}
          onSubmit={handleSubmit}
          error={error}
        />
      </div>
    </div>
  );
};

export default Login;

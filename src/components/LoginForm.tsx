// src/components/LoginForm.tsx
import React from "react";
import { FaUser, FaLock } from "react-icons/fa";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  loginId: string;
  setLoginId: (id: string) => void;
  password: string;
  setPassword: (pw: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loginId,
  setLoginId,
  password,
  setPassword,
  onSubmit,
  error,
}) => {
  const navigate = useNavigate();

  return (
      <div className="login-form">
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={onSubmit}>
          <div className="input-container">
            <FaUser className="input-icon"/>
            <input
                type="text"
                placeholder="ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
            />
          </div>

          <div className="input-container">
            <FaLock className="input-icon"/>
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <p className="pwReset-register">
          아직 회원이 아니신가요?{" "}
          <span className="pwReset-register-link" onClick={() => navigate("/auth/register")}>
            아이디로 회원가입
            </span>
        </p>
        <p className="pwReset-register">
          비밀번호를 잊으셨나요?{" "}
          <span className="pwReset-register-link" onClick={() => navigate("/auth/passwordReset-vaild")}>
            비밀번호 재설정
            </span>
        </p>
      </div>
  );
};

export default LoginForm;

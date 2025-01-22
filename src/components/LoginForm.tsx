// src/components/LoginForm.tsx
import React from "react";
import { FaUser, FaLock } from "react-icons/fa";
import "../styles/Login.css";

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
  return (
    <div className="login-form">
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={onSubmit}>
        <div className="input-container">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
        </div>

        <div className="input-container">
          <FaLock className="input-icon" />
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

      <p className="forgot-password">비밀번호를 까먹으셨나요?</p>
    </div>
  );
};

export default LoginForm;

// src/components/LoginForm.tsx

import React from "react";

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
    <div>
      <h2>로그인</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <label>아이디:</label>
        <input
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
        />
        <br />
        <label>비밀번호:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../utils/api"; // API 호출 함수
import Header from "../components/Header";
import "../styles/Register.css"; // 스타일 파일 추가

const Register: React.FC = () => {
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("MALE");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await register({ loginId, password, nickname, birthDate, gender });
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/auth/login/email");
    } catch (error) {
      console.error("회원가입 실패:", error);
      setError("회원가입에 실패했습니다. 입력값을 확인해주세요.");
    }
  };

  return (
    <div>
      <Header />
      <div className="register-container">
        <h2>회원가입</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
          </select>
          <button type="submit">회원가입</button>
        </form>
      </div>
    </div>
  );
};

export default Register;

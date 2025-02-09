import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { withdrawUser, logout } from "../utils/api";
import Header from "../components/Header";
import "../styles/Withdraw.css";

const Withdraw: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleWithdraw = async () => {
    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
  
    const confirmDelete = window.confirm("정말 탈퇴하시겠습니까?");
    if (!confirmDelete) return;
  
    try {
      await withdrawUser(password);
      alert("회원 탈퇴가 완료되었습니다.");
  
      try {
        localStorage.removeItem("jwt");
      } catch (logoutError: any) {
        if (logoutError.response?.status !== 401) {
          console.error("로그아웃 중 오류 발생:", logoutError);
        }
      }
  
      window.location.href = "/";
    } catch (err) {
      setError("비밀번호 입력을 실패하셨습니다.");
    }
  };

  return (
    <div className="withdraw-container">
      <Header />
      <div className="withdraw-content">
        <h2>회원 탈퇴</h2>
        
        <h3>탈퇴하려면 비밀번호를 입력하세요.</h3>
        
        <div className="withdraw-form">
          <div className="withdraw-input-container">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-msg">{error}</p>}

          <button className="withdraw-button" onClick={handleWithdraw}>
            탈퇴하기
          </button>

          <button className="cancel-button" onClick={() => navigate(-1)}>
            취소
          </button>
          <p>탈퇴시 30일간 회원정보가 유지되며 30일 이후에는 데이터 복구가 불가능 합니다.</p>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;

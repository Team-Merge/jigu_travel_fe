import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, checkNickname, checkLoginId } from "../utils/api";
import Header from "../components/Header";
import "../styles/Register.css";

const Register: React.FC = () => {
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("MALE");
  const [email,setEmail]=useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null);

  const navigate = useNavigate();

  /** 아이디 중복 확인 */
  const handleCheckLoginId = async () => {
    console.log("아이디 입력값:", loginId);
    if (!loginId.trim()) return;

    try {
      const response = await checkLoginId(loginId);
      console.log("아이디 중복 확인 응답:", response);
      setLoginIdAvailable(response.data);
    } catch (error) {
      console.error("아이디 중복 확인 실패:", error);
      setLoginIdAvailable(null);
    }
  };

  /** 닉네임 중복 확인 */
  const handleCheckNickname = async () => {
    console.log("닉네임 입력값:", nickname);
    if (!nickname.trim()) return;

    try {
      const response = await checkNickname(nickname);
      console.log("닉네임 중복 확인 응답:", response);
      setNicknameAvailable(response.data);
    } catch (error) {
      console.error("닉네임 중복 확인 실패:", error);
      setNicknameAvailable(null);
    }
  };
  

  /** 🔹 회원가입 요청 */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (loginIdAvailable === null) {
      setError("아이디 중복 확인을 해주세요.");
      return;
    } else if (loginIdAvailable === false) {
      setError("이미 사용 중인 아이디입니다.");
      return;
    }

    if (nicknameAvailable === null) {
      setError("닉네임 중복 확인을 해주세요.");
      return;
    } else if (nicknameAvailable === false) {
      setError("이미 사용 중인 닉네임입니다.");
      return;
    }

    try {
      await register({ loginId, password, nickname, birthDate, gender,email });
      alert("회원가입 성공!");
      navigate("/auth/login/email");
    } catch (error) {
      console.error("회원가입 실패:", error);
      setError("회원가입에 실패했습니다. 입력값을 확인해주세요.");
    }
  };

  return (
    <div className="register-wrapper">
      <Header />
      <div className="register-container">
        <h2>회원가입</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="register-form" onSubmit={handleSubmit}>

          {/* 아이디 입력 + 중복 확인 */}
          <div className="input-wrapper">
            <label>아이디<span className="required">*</span></label>
            <div className="nickname-container">
              <input
                  type="text"
                  placeholder="이메일을 입력하세요"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setLoginIdAvailable(null); // 아이디 변경 시 중복 확인 초기화
                  }}
                  required
              />
              <button type="button" className="check-btn" onClick={handleCheckLoginId}>
                중복확인
              </button>
            </div>
            {loginIdAvailable !== null && (
                <p className={`nickname-status ${loginIdAvailable ? "nickname-success" : "nickname-error"}`}>
                  {loginIdAvailable ? "✔ 사용 가능한 아이디입니다." : "❌ 이미 사용 중인 아이디입니다."}
                </p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div className="input-wrapper">
            <label>비밀번호<span className="required">*</span></label>
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}
                   required/>
          </div>

          {/* 비밀번호 확인 */}
          <div className="input-wrapper">
            <label>비밀번호 확인<span className="required">*</span></label>
            <input type="password" placeholder="비밀번호 확인" value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)} required/>
          </div>

            {/* 생년월일 */}
            <div className="input-wrapper">
              <label>생년월일<span className="required">*</span></label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required/>
            </div>

            {/* 닉네임 입력 + 중복 확인 */}
            <div className="input-wrapper">
              <label>닉네임<span className="required">*</span></label>
              <div className="nickname-container">
                <input
                    type="text"
                    placeholder="닉네임 입력"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameAvailable(null);
                    }}
                    required
                />
                <button type="button" className="check-btn" onClick={handleCheckNickname}>
                  중복확인
                </button>
              </div>
              {nicknameAvailable !== null && (
                  <p className={`nickname-status ${nicknameAvailable ? "nickname-success" : "nickname-error"}`}>
                    {nicknameAvailable ? "✔ 사용 가능한 닉네임입니다." : "❌ 이미 사용 중인 닉네임입니다."}
                  </p>
              )}
            </div>

            {/* 이메일 입력*/}
            <div className="input-wrapper">
              <label>이메일<span className="required">*</span></label>
              <div className="email-container">
                <input
                    type="email"
                    placeholder="이메일 입력"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    required
                />
              </div>
            </div>

            {/* 성별 선택 */}
            <div className="input-wrapper">
              <label>성별<span className="required">*</span></label>
              <div className="gender-container">
                <div>
                <label className="gender-option">
                  <input style={{width:"auto"}} type="radio" value="MALE" checked={gender === "MALE"} onChange={() => setGender("MALE")}/>
                  남성
                </label>
                </div>
                <div>
                <label className="gender-option">
                  <input  style={{width:"auto"}} type="radio" value="FEMALE" checked={gender === "FEMALE"}
                         onChange={() => setGender("FEMALE")}/>
                  여성
                </label>
                </div>
              </div>
            </div>

            {/* 다음 버튼 */}
            <button type="submit" className="next-btn">다음</button>
        </form>
      </div>
    </div>
);
};

export default Register;

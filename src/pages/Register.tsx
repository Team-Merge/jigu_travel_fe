import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register, checkNickname, checkLoginId, calculateDateYearsAge } from "../utils/api";
import Header from "../components/Header";
import "../styles/Register.css";
import { termsContent } from "../constants/terms";

const Register: React.FC = () => {
  const navigate = useNavigate();

  /** STEP 상태 추가 */
  const [step, setStep] = useState<number>(1);

  /** 약관 동의 상태 */
  const [terms, setTerms] = useState({
    terms1: false,
    terms2: false,
    terms3: false,
  });

  /** 회원가입 입력값 */
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("MALE");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null);
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  /** 약관 동의 체크 */
  const handleCheckboxChange = (name: string) => {
    setTerms((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
  };

  /** 모두 동의 버튼 */
  const handleAgreeAll = () => {
    setTerms({ terms1: true, terms2: true, terms3: true });
  };

  const allChecked = terms.terms1 && terms.terms2 && terms.terms3;

  /** STEP 1 → STEP 2 이동 */
  const handleNextStep = () => {
    if (!terms.terms1 || !terms.terms2 || !terms.terms3) {
      setError("모든 약관에 동의해야 합니다.");
      return;
    }
    setError(null);
    setStep(2);
  };

  /** 아이디 중복 확인 */
  const handleCheckLoginId = async () => {
    if (!loginId.trim()) return;
    try {
      const response = await checkLoginId(loginId);
      setLoginIdAvailable(response.data);
    } catch (error) {
      console.error("아이디 중복 확인 실패:", error);
      setLoginIdAvailable(null);
    }
  };

  /** 닉네임 중복 확인 */
  const handleCheckNickname = async () => {
    if (!nickname.trim()) return;
    try {
      const response = await checkNickname(nickname);
      setNicknameAvailable(response.data);
    } catch (error) {
      console.error("닉네임 중복 확인 실패:", error);
      setNicknameAvailable(null);
    }
  };

  useEffect(() => {
    const fetchDates = async () => {
      const min = await calculateDateYearsAge(110); // 110세까지 허용
      const max = await calculateDateYearsAge(14);  // 14세 이상만 입력 가능
      setMinDate(min);
      setMaxDate(max);
    };
    fetchDates();
  }, []);

  /** 회원가입 요청 */
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
      await register({ loginId, password, nickname, birthDate, gender, email });
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
        {step === 1 ? (
          /** STEP 1: 이용약관 동의 */
          <form className="register-form">
            <h2>이용약관 동의</h2>
            {error && <p className="error-message">{error}</p>}

            {/* 약관 동의 항목 */}
            {Object.keys(terms).map((key, index) => (
              <div key={index} className="input-wrapper">
                <div className="terms-content">
                  <p>{termsContent[key as keyof typeof termsContent]}</p>
                </div>
                <label className="checkbox-container">
                  <input type="checkbox" checked={terms[key as keyof typeof terms]} onChange={() => handleCheckboxChange(key)} />
                  {["이용약관", "개인정보 처리방침", "마케팅 활용 동의"][index]}에 동의합니다.
                </label>
              </div>
            ))}

            <div className="input-wrapper">
              <label className="checkbox-container">
                <input type="checkbox" checked={allChecked} onChange={handleAgreeAll} />
                모두 동의
              </label>
            </div>

            {/* 다음 버튼 */}
            <button type="button" className="next-btn" onClick={handleNextStep}>
              다음
            </button>
          </form>
        ) : (
          /** STEP 2: 회원가입 (기존 코드 유지) */
          
        <form className="register-form" onSubmit={handleSubmit}>
            <h2>회원가입</h2>

          {/* 아이디 입력 + 중복 확인 */}
          <div className="input-wrapper">
            <label>아이디<span className="required">*</span></label>
            <div className="nickname-container">
              <input
                  type="text"
                  placeholder="아이디를 입력하세요"
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
              <input type="date" value={birthDate} min={minDate} max={maxDate} onChange={(e) => setBirthDate(e.target.value)} required
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("14세 이상만 가입 가능합니다.")}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}/>
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
        )}
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import Header from "../components/layout/Header";
import { checkUserExists, requestPasswordReset } from "../utils/api"; // API 호출 함수 임포트
import "../styles/PasswordReset.css";


const PasswordReset: React.FC = () => {
    const [email, setEmail] = useState("");
    const [loginId, setLoginId] = useState("");
    const [storedEmail, setStoredEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    /** 아이디 존재 여부 확인 */
    const handleCheckUserExists = async () => {
        if (!loginId) return;
        try {
            const emailFromServer = await checkUserExists(loginId);
            setStoredEmail(emailFromServer);
            setMessage("아이디 확인 완료! 이메일을 입력하세요.");
        } catch (error) {
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("해당 아이디가 존재하지 않습니다.");
            }
            setStoredEmail("");
        }
    };

    /** 이메일 검증 (입력한 이메일이 저장된 이메일과 일치하는지 확인) */
    const validateEmail = (inputEmail: string) => {
        setEmail(inputEmail);
        if (inputEmail === storedEmail) {
            setIsVerified(true);
            setMessage("이메일 확인 완료! 비밀번호 재설정을 요청하세요.");
        } else {
            setIsVerified(false);
            setMessage("이메일이 일치하지 않습니다.");
        }
    };

    /** 비밀번호 재설정 요청 */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isVerified) return;
        setMessage("");
        setLoading(true);

        try {
            await requestPasswordReset(email);
            setMessage("비밀번호 재설정 이메일이 전송되었습니다.");
        } catch (error) {
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("비밀번호 재설정 요청에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="viewportWrapper">
            <div className="header-wrapper">
                <Header/>
            </div>
            <div className="passwordReset-wrapper">
                <h2 className="title">비밀번호 찾기</h2>
                <form onSubmit={handleSubmit} className="password-form">
                    {/* 아이디 입력 */}
                    <input
                        type="text"
                        placeholder="아이디를 입력하세요."
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        onBlur={handleCheckUserExists} // 입력 후 서버 확인
                        required
                    />

                    {/* 이메일 입력 */}
                    <input
                        type="email"
                        placeholder="이메일을 입력하세요."
                        value={email}
                        onChange={(e) => validateEmail(e.target.value)}
                        required
                        disabled={!storedEmail} // 아이디 확인 후 활성화
                    />

                    {/* 비밀번호 재설정 요청 버튼 */}
                    <button type="submit" className="send-email-button" disabled={!isVerified || loading}>
                        {loading ? "전송 중..." : "비밀번호 재설정 이메일 요청"}
                    </button>
                </form>
                {message && <p className="password-message">{message}</p>}
            </div>
        </div>
    );
};

export default PasswordReset;

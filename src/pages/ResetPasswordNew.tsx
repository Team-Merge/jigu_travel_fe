import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";

import { resetPassword } from "../utils/api"; // API 함수 임포트
import "../styles/PasswordReset.css";

const ResetPasswordNew: React.FC = () => {
    const [searchParams] = useSearchParams(); // URL에서 token 추출
    const navigate = useNavigate();

    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // URL에서 토큰 자동 추출
    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setMessage("잘못된 접근입니다. 이메일을 확인해주세요.");
        }
    }, [searchParams]);

    /** 비밀번호 재설정 요청 */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (password !== confirmPassword) {
            setMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);

        try {
            const responseMessage = await resetPassword(token, password);
            setMessage(responseMessage);
            setTimeout(() => navigate("/auth/login"), 1500); // 1.5초 후 로그인 페이지로 이동
        } catch (error) {
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
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
                <h2 className="title">비밀번호 재설정</h2>
                <form onSubmit={handleSubmit} className="password-form">
                    {/* 토큰 자동 입력 (숨김) */}
                    <input type="hidden" value={token}/>

                    {/* 새 비밀번호 입력 */}
                    <input
                        type="password"
                        placeholder="새로운 비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* 비밀번호 확인 입력 */}
                    <input
                        type="password"
                        placeholder="비밀번호 확인"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {/* 비밀번호 재설정 버튼 */}
                    <button type="submit" className="send-email-button" disabled={loading}>
                        {loading ? "변경 중..." : "비밀번호 변경"}
                    </button>
                </form>

                {message && <p className="password-message">{message}</p>}
            </div>
        </div>
    );
};

export default ResetPasswordNew;

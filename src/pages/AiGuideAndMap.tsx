import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AiGuide from "../components/AiGuide";
import Chat_icon from "../assets/images/chat_icon.png";
import "../styles/AskAI.css";
import MapComponemt from "../pages/TravelWithAI";

const AiGuideAndMap: React.FC = () => {
    const [chatVisible, setChatVisible] = useState(false);  // 기본적으로 채팅창 닫힘
    const [chatHeight, setChatHeight] = useState<number>(0);
    const [buttonVisible, setButtonVisible] = useState(true);  // 버튼을 보이도록 설정
    const [aiGuideMessage, setAiGuideMessage] = useState("");
    const chatbotRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();


    // 로그인 확인
    useEffect(() => {
        const jwtToken = localStorage.getItem("jwt");
        if (!jwtToken || jwtToken === "undefined") {
            alert("로그인 후 사용해주세요.");
            navigate("/auth/login");
            return;
        }
    }, [navigate]);

    // 채팅창 토글
    const toggleChat = () => {
        setChatVisible((prev) => !prev);
        setButtonVisible((prev) => !prev); // 채팅방을 닫을 때 버튼도 토글
    };

    // 채팅창 드래그 기능
    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
        const startY = "touches" in e ? e.touches[0].clientY : e.clientY;
        const initialHeight = chatbotRef.current?.clientHeight || 0;
        const maxHeight = window.innerHeight * 0.8; // 화면 높이의 80%로 제한

        const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
            const currentY = "touches" in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
            const newHeight = initialHeight - (currentY - startY);
            const finalHeight = Math.min(Math.max(newHeight, 100), maxHeight); // 최소 100px, 최대 maxHeight

            if (chatbotRef.current) {
                chatbotRef.current.style.height = `${finalHeight}px`;
                setChatHeight(finalHeight);
            }
        };

        const stopDrag = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onMouseMove);
            window.removeEventListener("mouseup", stopDrag);
            window.removeEventListener("touchend", stopDrag);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onMouseMove);
        window.addEventListener("mouseup", stopDrag);
        window.addEventListener("touchend", stopDrag);
    };


    // 특정 명소의 AI 가이드 요청 시 호출할 함수
    const requestAiGuide = (placeName: string) => {
        setAiGuideMessage(`${placeName}에 대해 알려줘`);
        setChatVisible(true);
        setButtonVisible(false);
    };

    return (
        <div className="ai-guide-map">
            <div className="header-wrapper">
                <Header />
            </div>

            <div className="main-container" style={{ height: "calc(100vh - 60px)", overflow: "hidden" }}>
                <div className="main-content">
                    {/* 맵 영역 */}
                    <div className="map-section" style={{ height: "100%", width: "100%" }}>
                        <MapComponemt onAiGuideRequest={requestAiGuide} />
                    </div>

                    {/* 채팅방 토글 버튼 */}
                    {buttonVisible && (
                        <button className="open-chat" onClick={toggleChat}
                        style={{"z-index":"2000",right:"20px",left:"auto"}}> {/*오른쪽으로 버튼 이동*/}
                            <img src={Chat_icon} alt="Chat Icon" className="chat-icon" />
                        </button>
                    )}

                    {/* 채팅방 표시 */}
                    {chatVisible && (
                        <>
                            <div
                                className={`chatbot-section ${chatVisible ? "visible" : ""}`}
                                ref={chatbotRef}
                                style={{
                                    position: "fixed", // 화면에 고정
                                    bottom: 0, // 화면 하단에 위치
                                    left: 0,
                                    width: "100%", // 전체 너비
                                    backgroundColor: "white",
                                    zIndex: 1000, // 다른 요소 위에 표시되도록 설정
                                    height: chatHeight ? `${chatHeight}px` : "50vh", // 기본 높이를 50%로 설정
                                }}
                            >
                                <div className="drag-handle" onMouseDown={startDrag} onTouchStart={startDrag}>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                                <button className="close-chat" onClick={toggleChat}>
                                    ✖
                                </button>
                                <AiGuide defaultMessage={aiGuideMessage} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiGuideAndMap;

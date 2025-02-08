// src/pages/AskAI.tsx

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AiGuide from "../components/AiGuide";
import { sendImageToAPI, Detection } from "../utils/api";
import Chat_icon from "../assets/images/chat_icon.png";
import Camera_icon from "../assets/images/camera-icon.png";
import AiProfile from "../assets/images/ai-profile.png";
import "../styles/AskAI.css";
import "../styles/AskAiChatBot.css";

const convertClassNameToCustom = (className: string): string => {
  const customTranslationMap: { [key: string]: string } = {
    DDP: "DDP",
    coex: "코엑스",
    garak: "가락몰",
    world1: "롯데월드몰",
    world2: "롯데월드몰",
  };
  return customTranslationMap[className] || className;
};

const AskAI: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [imageHeight, setImageHeight] = useState("100%");
  const [detectionResults, setDetectionResults] = useState<Detection[]>([]);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeightState, setImageHeightState] = useState<number>(0);
  const [wscaleRatio, setWScaleRatio] = useState<number>(1);
  const [hscaleRatio, setHScaleRatio] = useState<number>(1);
  const [chatHeight, setChatHeight] = useState<number>(0);
  const [isDetecting, setIsDetecting] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const chatbotRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken || jwtToken === "undefined") {
      alert("로그인 후 사용해주세요.");
      navigate("/auth/login");
      return;
    }
  }, []);

  useEffect(() => {
    if (imageRef.current && imageWidth && imageHeightState) {
      const currentRenderedWidth = imageRef.current.offsetWidth;
      const currentRenderedHeight = imageRef.current.offsetHeight;
      setWScaleRatio(currentRenderedWidth / imageWidth);
      setHScaleRatio(currentRenderedHeight / imageHeightState);
    }
  }, [image, imageWidth, imageHeightState]);

  useLayoutEffect(() => {
    if (chatVisible && chatbotRef.current) {
      requestAnimationFrame(() => {
        setChatHeight(chatbotRef.current!.offsetHeight);
      });
    }
  }, [chatVisible]);

  useEffect(() => {
    if (chatVisible) {
      setImageHeight(`calc(100% - ${chatHeight}px)`);
    } else {
      setImageHeight("100%");
    }
  }, [chatVisible, chatHeight]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImageWidth(img.width);
      setImageHeightState(img.height);
    };

    setImage(URL.createObjectURL(file));
    setIsUploaded(true);
    setDetectionResults([]);
    setChatVisible(false);
    setIsDetecting(true);

    sendImageToAPI(file)
      .then((detections) => {
        setDetectionResults(detections);
        setIsDetecting(false);
        if (detections.length > 0) {
          setChatVisible(true);
        }
      })
      .catch(() => setIsDetecting(false));
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
  };
  
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const startY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const initialHeight = chatbotRef.current?.clientHeight || 0;
    const maxHeight = window.innerHeight * 0.8; // 화면 높이의 80%까지 확장 가능

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentY = "touches" in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
        const newHeight = Math.min(Math.max(initialHeight - (currentY - startY), 100), maxHeight);

        if (chatbotRef.current) {
            chatbotRef.current.style.height = `${newHeight}px`;
            setChatHeight(newHeight);
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

  return (
    <div className="ask-ai">
      <div className="header-wrapper">
        <Header />
      </div>

      <div className="main-container">
        {!isUploaded ? (
          <div className="initial-screen">
            <div className="upload-button">
              <label htmlFor="image-upload" className="camera-label">
                <div className="camera-icon-container">
                  <img src={Camera_icon} alt="camera icon" className="camera-icon" />
                </div>
                <p>사진촬영</p>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>
        ) : (
          <div className="main-content">
              <div className="image-section" style={{ height: `calc(100vh - ${chatHeight}px - 80px) ` }}>
                <div className="image-section-container">
                  <div className="image-container" style={{ position: "relative" }}>
                    <img
                      ref={imageRef}
                      className="uploaded-image"
                      src={image || ""}
                      alt="Uploaded Preview"
                    />

                    {detectionResults.map((detection, index) => (
                      <div
                        key={index}
                        className="bounding-box"
                        style={{
                          left: `${(detection.x1 / imageWidth) * 100}%`,
                          top: `${(detection.y1 / imageHeightState) * 100}%`,
                          width: `${(detection.x2 - detection.x1) * wscaleRatio}px`,
                          height: `${(detection.y2 - detection.y1) * hscaleRatio}px`,
                        }}
                      >
                        <span className="bounding-label">
                          {convertClassNameToCustom(detection.className)} ({(detection.confidence * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="image-upload-wrapper">
                    <label htmlFor="image-upload" className="retake-button">
                      사진 다시 촬영하기
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="image-result-section">
                    <img src={AiProfile} alt="ai-profile" width="40" height="40" />
                    <div className="image-result-message">
                      {isDetecting ? (
                        <>AI 모델이 건물을 탐지 중입니다...<br/>잠시만 기다려주세요.</>
                      ) : detectionResults.length > 0 ? (
                        <>
                          사진 분석 결과, <span className="blue-text">{(detectionResults[0].confidence * 100).toFixed(1)}%</span>의 확률로 <span className="blue-text">{convertClassNameToCustom(detectionResults[0].className)}</span>로 감지되었습니다.
                          <br/>AI와 대화를 나누어보세요!
                        </>
                      ) : (
                        <>건물이 감지되지 않았습니다.<br />다시 찍어주세요.</>
                      )}
                    </div>
                  </div>

                  <p className="ask-ai-p">
                    {detectionResults.length > 0
                      ? "YOLO11을 통해 학습된 자체 모델로 평가한 결과입니다."
                      : "다른 사진을 찍어 여행 친구에게 질문해 보세요!"}
                  </p>
                </div>
              </div>

            {detectionResults.length > 0 && (
              <>
                <button className="open-chat" onClick={toggleChat}>
                  <img src={Chat_icon} alt="Chat Icon" className="chat-icon"/>
                </button>

                <div className={`chatbot-section ${chatVisible ? "visible" : ""}`} ref={chatbotRef}>
                  <div className="drag-handle" onMouseDown={startDrag} onTouchStart={startDrag}>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <button className="close-chat" onClick={toggleChat}>✖</button>
                  <AiGuide defaultMessage={`${convertClassNameToCustom(detectionResults[0].className)}는(은) 어떤 건물 인가요?`} />
                </div>
              </>
            )}
          </div>
          )}
       </div>
    </div>
  );
};

export default AskAI;

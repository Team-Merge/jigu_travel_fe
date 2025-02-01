// src/pages/AskAI.tsx

import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import "../styles/AskAI.css";
import AiGuide from "../components/AiGuide";
import Chat_icon from "../assets/images/chat_icon.png";
import Camera_icon from "../assets/images/camera-icon.png";
import AiProfile from "../assets/images/ai-profile.png";

// api.ts에서 API 호출 함수와 Detection 인터페이스를 import 합니다.
import { sendImageToAPI, Detection } from "../utils/api";

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

  // const [renderedWidth, setRenderedWidth] = useState<number>(0); // 렌더링된 이미지 너비
  // const [renderedHeight, setRenderedHeight] = useState<number>(0); // 렌더링된 이미지 높이
  const [wscaleRatio, setWScaleRatio] = useState<number>(1); // 실제 크기와 렌더링 크기의 비율
  const [hscaleRatio, setHScaleRatio] = useState<number>(1); // 실제 크기와 렌더링 크기의 비율

  const imageRef = useRef<HTMLImageElement | null>(null); // 이미지 요소 접근용 ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  // 이미지 크기 비율 계산 (onLoad에서도 계산)
  useEffect(() => {
    if (imageRef.current) {
      const currentRenderedWidth = imageRef.current.offsetWidth;
      const currentRenderedHeight = imageRef.current.offsetHeight;
      // setRenderedWidth(currentRenderedWidth);
      // setRenderedHeight(currentRenderedHeight);
      setWScaleRatio(currentRenderedWidth / imageWidth);
      setHScaleRatio(currentRenderedHeight / imageHeightState);
    }
  }, [image, imageWidth, imageHeightState]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    // 이미지 실제 크기를 미리 계산
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImageWidth(img.width); // 실제 이미지 너비
      setImageHeightState(img.height); // 실제 이미지 높이
    };

    setImage(URL.createObjectURL(file));
    setIsUploaded(true);

    // api.ts의 sendImageToAPI 함수를 사용합니다.
    sendImageToAPI(file).then((detections) => {
      setDetectionResults(detections);
    });

    toggleChat();
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
    if (chatVisible) {
      setImageHeight("100%");
    } else {
      setImageHeight("calc((100% - 60px) / 2)");
    }
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
                <div className="image-section" style={{ height: imageHeight }}>
                  <div className="image-container">
                    <img
                        ref={imageRef}
                        className="uploaded-image"
                        src={image || ""}
                        alt="Uploaded Preview"
                        onLoad={() => {
                          if (imageRef.current) {
                            const currentRenderedWidth = imageRef.current.offsetWidth;
                            const currentRenderedHeight = imageRef.current.offsetHeight;
                            // setRenderedWidth(currentRenderedWidth);
                            // setRenderedHeight(currentRenderedHeight);
                            setWScaleRatio(currentRenderedWidth / imageWidth);
                            setHScaleRatio(currentRenderedHeight / imageHeightState);
                            console.log("onLoad - 렌더링된 이미지 크기:", currentRenderedWidth, currentRenderedHeight);
                          }
                        }}
                    />

                    {detectionResults.map((detection, index) => {
                      const width = detection.x2 - detection.x1; // 실제 이미지 내에서의 너비
                      const height = detection.y2 - detection.y1; // 실제 이미지 내에서의 높이

                      // 렌더링된 이미지 크기에 맞춰 바운딩 박스 크기 계산
                      const renderedBoxWidth = width * wscaleRatio;
                      const renderedBoxHeight = height * hscaleRatio;

                      return (
                          <div
                              key={index}
                              className="bounding-box"
                              style={{
                                left: `${(detection.x1 / imageWidth) * 100}%`,
                                top: `${(detection.y1 / imageHeightState) * 100}%`,
                                width: `${renderedBoxWidth}px`,
                                height: `${renderedBoxHeight}px`,
                              }}
                          >
                      <span className="bounding-label">
                        {convertClassNameToCustom(detection.className)} (
                        {(detection.confidence * 100).toFixed(1)}%)
                      </span>
                          </div>
                      );
                    })}
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
                  {/* 분석 결과가 있을 때만 image-result-section 표시 */}
                  {detectionResults.length > 0 && (
                      <div className="image-result-section">
                        <img src={AiProfile} alt="ai-profile" width="40" height="40" />
                        <div className="image-result-message">
                          {/* 확률과 인식된 이름만 blue-text 클래스 적용 */}
                          사진 분석 결과,{" "}
                          <span className="blue-text">
                      {(detectionResults[0].confidence * 100).toFixed(1)}%
                    </span>{" "}
                          의 확률로<br />{" "}
                          <span className="blue-text">
                      {convertClassNameToCustom(detectionResults[0].className)}
                    </span>
                          로 감지되었습니다.
                        </div>
                      </div>
                  )}
                  <p className="ask-ai-p">여행 친구에게 관광지에 대해 질문해 보세요!</p>
                </div>
                {/* 분석 결과가 있을 때만 채팅봇 버튼 및 AiGuide 표시 */}
                {detectionResults.length > 0 && (
                    <>
                      <button className="open-chat" onClick={toggleChat}>
                        <img src={Chat_icon} alt="Chat Icon" className="chat-icon" />
                      </button>
                      <div
                          className={`chatbot-section ${chatVisible ? "visible" : ""}`}
                          style={{ display: "block" }}
                      >
                        <button className="close-chat" onClick={toggleChat}>
                          ✖
                        </button>
                        <AiGuide
                            defaultMessage={`${convertClassNameToCustom(
                                detectionResults[0].className
                            )}이 무엇인가요?`}
                        />
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

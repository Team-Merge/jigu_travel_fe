import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import "../styles/AskAI.css";
import AiGuide from "../components/AiGuide";
import Chat_icon from "../assets/images/chat_icon.png";
import Camera_icon from "../assets/images/camera-icon.png";

interface Detection {
  className: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * 📌 특정 className을 원하는 한국어 명칭으로 변환하는 함수
 */
const convertClassNameToCustom = (className: string): string => {
  const customTranslationMap: { [key: string]: string } = {
    "DDP": "DDP",
    "coex": "코엑스",
    "garak": "가락몰",
    "world1": "롯데월드몰",
    "world2": "롯데월드몰",
  };

  return customTranslationMap[className] || className; // 매핑되지 않은 경우 원래 이름 반환
};

const AskAI: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [imageHeight, setImageHeight] = useState("100%");
  const [detectionResults, setDetectionResults] = useState<Detection[]>([]); // 여러 개의 탐지된 객체 저장

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  /**
   * 📌 FastAPI로 이미지를 전송하고 객체 탐지 결과를 받아오는 함수
   */
  const sendImageToAPI = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/image_search", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("객체 탐지 결과:", data);

      if (data.data.length > 0) {
        setDetectionResults(data.data); // 모든 탐지된 객체 저장
      } else {
        setDetectionResults([]);
      }
    } catch (error) {
      console.error("객체 탐지 API 호출 실패:", error);
      setDetectionResults([]);
    }
  };

  /**
   * 📌 이미지 업로드 핸들러
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    setImage(URL.createObjectURL(file));
    setIsUploaded(true);
    sendImageToAPI(file);
    toggleChat();
  };

  /**
   * 📌 채팅창 토글 및 UI 조정
   */
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
                <img className="uploaded-image" src={image || ""} alt="Uploaded Preview" />

                {/* 📌 바운딩 박스 표시 */}
                {detectionResults.map((detection, index) => (
                  <div
                    key={index}
                    className="bounding-box"
                    style={{
                      left: `${detection.x1}px`,
                      top: `${detection.y1}px`,
                      width: `${detection.x2 - detection.x1}px`,
                      height: `${detection.y2 - detection.y1}px`,
                      border: "2px solid red",
                      position: "absolute",
                    }}
                  >
                    <span className="bounding-label">
                      {convertClassNameToCustom(detection.className)} ({(detection.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
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
            </div>
            {isUploaded && (
              <button className="open-chat" onClick={toggleChat}>
                <img src={Chat_icon} alt="Chat Icon" className="chat-icon" />
              </button>
            )}
            <div
              className={`chatbot-section ${chatVisible ? "visible" : ""}`}
              style={{ display: isUploaded ? "block" : "none" }}
            >
              <button className="close-chat" onClick={toggleChat}>
                ✖
              </button>

              {/* 📌 챗봇: 가장 확률이 높은 탐지된 객체 정보를 제공 */}
              <AiGuide
                defaultMessage={
                  detectionResults.length > 0
                    ? `${convertClassNameToCustom(detectionResults[0].className)}이 무엇인가요?`
                    : "이곳이 어디인가요?"
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskAI;

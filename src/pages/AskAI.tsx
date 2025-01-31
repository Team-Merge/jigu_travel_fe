import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import "../styles/AskAI.css";
import AiGuide from "../components/AiGuide";
import Chat_icon from "../assets/images/chat_icon.png"
import Camera_icon from "../assets/images/camera-icon.png"




const AskAI: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const [chatVisible, setChatVisible] = useState(false); // 채팅창 상태 관리
  const [imageHeight, setImageHeight] = useState("100%"); // 이미지 섹션의 높이

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    setImage(URL.createObjectURL(file));
    setIsUploaded(true);
    toggleChat();
  };



  const toggleChat = () => {
    setChatVisible((prev) => !prev); // 채팅창 열고 닫기
    if (chatVisible) {
      setImageHeight("100%"); // 채팅창 닫으면 이미지 높이 원래대로
    } else {
      setImageHeight("calc(( 100% - 60px )/2)"); // 채팅창 열면 이미지 높이 50%로 설정
    }
  };

  return (
      <div className="ask-ai">
        <div className="header-wrapper">
          <Header/>
        </div>
        <div className="main-container">
          {!isUploaded ? (
              <div className="initial-screen">
                <div className="upload-button">
                  <label htmlFor="image-upload" className="camera-label">
                    <div className="camera-icon-container">
                      <img
                          src={Camera_icon}
                          alt="camera icon"
                          className="camera-icon"
                      />
                    </div>
                    <p>사진촬영</p>
                  </label>
                  <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{display: "none"}}
                  />
                </div>
              </div>
          ) : (
              <div className="main-content">
                <div className="image-section" style={{height: imageHeight}}>
                  <div className="image-container">
                    <img
                        className="uploaded-image"
                        src={image || ""}
                        alt="Uploaded Preview"
                    />
                    <label htmlFor="image-upload" className="retake-button">
                      사진 다시 촬영하기
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{display: "none"}}
                    />
                  </div>
                  <div className="image-result-wrapper">
                    {/**아직 수정중**/}
                    {/**이 부분에 확률이랑 예측 결과 감지부분만 response 데이터로 대입되게 변경해주세요.**/}
                    <p>해당 사진은 98.2 %의 확률로 가락몰로 감지됩니다.</p>
                    <p>여행 친구에게 관광지에대해 질문해 보세요!</p>
                  </div>
                </div>
                {isUploaded && (
                    <button className="open-chat" onClick={toggleChat}>
                      <img
                          src={Chat_icon}
                          alt="Chat Icon"
                          className="chat-icon"
                      />
                    </button>
                )}
                <div
                    className={`chatbot-section ${chatVisible ? "visible" : ""}`}
                    style={{display: isUploaded ? "block" : "none"}}
                >
                  <button className="close-chat" onClick={toggleChat}>
                    ✖
                  </button>

                  <AiGuide defaultMessage="가락몰이 무엇인가요?"/> {/**백에서 받아온 건물 이름으로 질문 예정**/}
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default AskAI;

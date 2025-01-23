import React, { useState } from 'react';
import Header from "../components/Header";
import "../styles/AskAI.css";

interface Message {
    sender: "user" | "ai";
    text: string;
}

const AskAI: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isUploaded, setIsUploaded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: "ai", text: "앱: 해당 이미지는 가락몰로 보입니다." },
        { sender: "user", text: "가락몰에 대해 자세히 설명해주세요." },
        { sender: "ai", text: "앱: 가락몰은 연면적 21만㎡ 규모의 가락도매시장이며..." },
    ]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            console.error("No file selected");
            return;
        }

        setImage(URL.createObjectURL(file));
        setIsUploaded(true);
    };

    const handleSendMessage = (text: string) => {
        if (text.trim() === "") return;
        setMessages((prev) => [...prev, { sender: "user", text }]);

        // Simulate AI response
        setTimeout(() => {
            setMessages((prev) => [...prev, { sender: "ai", text: "AI의 응답이 여기에 표시됩니다." }]);
        }, 1000);
    };

    return (
        <div className="ask-ai">
            {!isUploaded ? (
                <div className="initial-screen">
                    <div className="upload-button">
                        <label htmlFor="image-upload" className="camera-label">
                            <div className="camera-icon-container">
                                <img
                                    src="../src/assets/images/camera-icon.png"
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
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <Header />
                    <div className="main-content">
                        <div className="chatbot-section">
                            <div className="chatbot-messages">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message ${msg.sender}`}
                                    >
                                        {msg.sender === "ai" && (
                                            <div className="profile-pic">
                                                <img
                                                    src="../src/assets/images/ai-profile.png"
                                                    alt="AI Profile"
                                                />
                                            </div>
                                        )}
                                        <div className="message-bubble">
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    placeholder="메시지를 입력하세요..."
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSendMessage(e.currentTarget.value);
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.querySelector<HTMLInputElement>('.chat-input input');
                                        if (input) {
                                            handleSendMessage(input.value);
                                            input.value = "";
                                        }
                                    }}
                                >
                                    보내기
                                </button>
                            </div>
                        </div>

                        <div className="image-section">
                            <div className="image-container">
                                {image && (
                                    <>
                                        <img
                                            src={image}
                                            alt="Uploaded"
                                            className="uploaded-image"
                                        />
                                        <label
                                            className="retake-button"
                                            htmlFor="image-upload"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            사진 다시 촬영하기
                                        </label>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AskAI;

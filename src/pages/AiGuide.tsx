import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { getChatHistory, sendTextQuestion, sendAudio } from "../utils/api";

import "../styles/AiGuide.css";
import AiGuideChat from "../components/AiGuideChat";

const AiVoiceGuide: React.FC = () => {
    const [messages, setMessages] = useState<{ type: "user" | "bot"; text: string }[]>([]);
    const [textQuestion, setTextQuestion] = useState<string>(""); // 질문 입력 상태
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false); // 녹음 모드 여부

    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any>(null); // SpeechRecognition 참조
    const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
    const limit = 5;

    // 컴포넌트 초기화
    useEffect(() => {
        const jwtToken = localStorage.getItem("jwt");
        if (!jwtToken || jwtToken === "undefined") {
            alert("로그인 후 사용해주세요.");
            return;
        }
        loadChatHistory();
        // scrollToBottomOfContainer();
    }, []);

    // 대화 기록 로드
    const loadChatHistory = async () => {
        try {
            const currentOffset = offset;
            const data = await getChatHistory(currentOffset, limit);

            if (data && data.length > 0) {
                const formattedMessages = data
                    .reverse()
                    .map((item: any) => [
                        { type: "user", text: `${item.conversationQuestion}` },
                        { type: "bot", text: `${item.conversationAnswer}` },
                    ])
                    .flat();

                setMessages((prev) => [...formattedMessages, ...prev]);
                setOffset(currentOffset + limit);
                setHasMore(data.length >= limit);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };

    // 스크롤을 가장 아래로 이동
    const scrollToBottomOfContainer = () => {
        if (messagesContainerRef.current) {
            console.log('스크롤됨');
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // 텍스트 질문 전송
    const handleSendQuestion = async () => {
        if (!textQuestion.trim()) {
            alert("질문을 입력하세요.");
            return;
        }

        // 사용자 질문 추가
        setMessages((prev) => [...prev, { type: "user", text: `${textQuestion}` }]);

        try {
            setTextQuestion(""); // 질문 입력창 초기화

            // API 요청으로 질문 전송
            const data = await sendTextQuestion(textQuestion);

            // 봇의 응답 처리
            setMessages((prev) => [
                ...prev,
                { type: "bot", text: `${data.conversation_history.history[0]?.assistant_response || "No answer provided."}` },
            ]);

            scrollToBottomOfContainer(); // 응답 후 스크롤 이동

            if (data.file_url) {
                playAudioFromUrl(data.file_url); // 음성 파일이 있으면 재생
            }
        } catch (error) {
            console.error("Failed to send question:", error);
        }

    };

    // 음성 녹음 시작
    const handleStartRecording = async () => {
        if (isRecording) {
            handleStopRecording();
            return;
        }

        setIsRecording(true);
        setIsRecordingMode(true); // 녹음 모드로 변경

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const audioChunks: Blob[] = [];

            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = "ko-KR";
            recognition.interimResults = true;
            recognition.continuous = true;

            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join("");

                setTextQuestion(transcript); // 텍스트 입력창에 실시간 반영

                if (event.results[0].isFinal) {
                    displayMessage({ type: "user", text: `${transcript}` }); // 음성 인식 결과를 메시지로 추가
                }
            };

            recognition.onerror = (error: any) => {
                console.error("Speech recognition error:", error);
            };

            recognitionRef.current = recognition;
            recognition.start();

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                setTextQuestion(""); // 텍스트 입력창 초기화

                try {
                    const response = await sendAudio(audioBlob);

                    setMessages((prev) => [
                        ...prev,
                        { type: "bot", text: `${response.conversation_history.history[0]?.assistant_response || "No answer provided."}` },
                    ]);

                    if (response.file_url) {
                        playAudioFromUrl(response.file_url); // 음성 파일이 있으면 재생
                    }

                    scrollToBottomOfContainer(); // 응답 후 스크롤 이동
                } catch (error) {
                    console.error("Failed to upload audio:", error);
                }
            };

            mediaRecorder.start();
        } catch (error) {
            console.error("Failed to start recording:", error);
        }
    };

    // 음성 녹음 중지
    const handleStopRecording = () => {
        setIsRecording(false);
        setIsRecordingMode(false); // 녹음 모드 종료

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    // 음성 파일 재생
    const playAudioFromUrl = (url: string) => {
        const audioPlayback = audioPlaybackRef.current;
        if (audioPlayback) {
            audioPlayback.src = url;
            audioPlayback.style.display = "block";
            audioPlayback.play().catch((err) => console.error("오디오 재생 실패:", err));
        }
    };

    // 메시지 추가
    const displayMessage = (message: { type: "user" | "bot"; text: string }) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottomOfContainer(); // 메시지 추가 후 스크롤 이동
    };

    // 텍스트 전송 버튼과 복귀 버튼 토글
    const toggleButtonVisibility = () => {
        handleStopRecording();
        setIsRecordingMode(!isRecordingMode);
    };

    return (
        <div id="chatContainer">
            <Header />
            <div id="messagesContainer"
            ref={messagesContainerRef}>
                <AiGuideChat
                    messages={messages}
                    hasMore={hasMore}
                    loadMore={loadChatHistory}  // 더보기 버튼 클릭 시 호출할 함수 전달
                />
            </div>
            <div id="userInputContainer">
                <input
                    type="text"
                    id="textQuestion"
                    value={textQuestion}
                    onChange={(e) => setTextQuestion(e.target.value)} // 질문 입력 값 변경
                    placeholder="여행 친구에게 관광지에 대해 질문하세요!"
                    disabled={isRecordingMode} // 녹음 모드일 때는 텍스트 입력 비활성화
                />
                {!isRecordingMode ? (
                    <>
                        <button id="sendButton" onClick={handleSendQuestion}>
                            <img src="src/assets/images/arrow-up.png" alt="Arrow Icon" width="24" height="24"/>
                        </button>
                    </>
                ) : (
                    <button id="stopButton" onClick={toggleButtonVisibility}>
                        <img src="src/assets/images/keyboard.png" alt="Arrow Icon" width="24" height="24"/>
                    </button> // 텍스트 질문 버튼
                )}

                <button id="recordButton" onClick={handleStartRecording}>
                    {isRecording ?
                        /* 녹음 종료 버튼 */
                        <img src="src/assets/images/arrow-up.png" alt="Arrow Icon" width="24" height="24"/> :
                        /* 녹음 시작 버튼 */
                        <img src="src/assets/images/microphone.png" alt="Arrow Icon" width="24" height="24"/>}
                </button>
            </div>
            <div id="audioContainer">
                <audio id="audioPlayback" ref={audioPlaybackRef} controls style={{display: "none"}}/>
            </div>
        </div>
    );
};

export default AiVoiceGuide;

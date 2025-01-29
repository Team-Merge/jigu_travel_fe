// src/components/AiVoiceGuide.tsx

import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { getChatHistory, sendTextQuestion, sendAudio } from "../utils/api";

import "../styles/AiGuide.css";
import AiGuideChat from "../components/AiGuideChat";
import arrowUp from '../assets/images/arrow-up.png';
import keyboard from '../assets/images/keyboard.png';
import microphone from '../assets/images/microphone.png';

interface Message {
    id: number;
    type: "user" | "bot";
    text: string;
    isNew?: boolean; // 새로운 메시지 여부
}

const AiVoiceGuide: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [textQuestion, setTextQuestion] = useState<string>(""); // 질문 입력 상태
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false); // 녹음 모드 여부
    const [inputPlaceholder, setInputPlaceholder] = useState<string>("여행 친구에게 관광지에 대해 질문하세요!"); // 질문창 placeholder 텍스트

    const messageIdRef = useRef<number>(0); // 메시지 고유 ID ref

    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null); // MediaRecorder 객체를 참조
    const audioChunksRef = useRef<Blob[]>([]); // 녹음된 데이터 저장용 배열
    const audioPlaybackRef = useRef<HTMLAudioElement | null>(null); // 오디오 플레이백 참조
    const audioBlobRef = useRef<Blob | null>(null); // 녹음된 오디오 Blob 참조
    const recognitionRef = useRef<any>(null); // SpeechRecognition 참조

    const limit = 5;

    useEffect(() => {
        const jwtToken = localStorage.getItem("jwt");
        if (!jwtToken || jwtToken === "undefined") {
            alert("로그인 후 사용해주세요.");
            return;
        }
        loadChatHistory();
    }, []);

    const generateMessageId = () => {
        messageIdRef.current += 1;
        return messageIdRef.current;
    };

    const loadChatHistory = async () => {
        try {
            const currentOffset = offset;
            const data = await getChatHistory(currentOffset, limit);

            if (data && data.length > 0) {
                const formattedMessages: Message[] = data
                    .reverse()
                    .map((item: any) => [
                        { id: generateMessageId(), type: "user", text: `${item.conversationQuestion}`, isNew: false },
                        { id: generateMessageId(), type: "bot", text: `${item.conversationAnswer}`, isNew: false },
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

    const scrollToBottomOfContainer = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const handleSendQuestion = async () => {
        if (!textQuestion.trim()) {
            alert("질문을 입력하세요.");
            return;
        }

        const userMessage: Message = { id: generateMessageId(), type: "user", text: textQuestion };
        const loadingMessage: Message = { id: generateMessageId(), type: "bot", text: "loading", isNew: true };

        console.log("Sending question:", userMessage);
        console.log("Adding loading message:", loadingMessage);

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setTextQuestion(""); // 질문 입력창 초기화
        scrollToBottomOfContainer();

        try {
            const data = await sendTextQuestion(userMessage.text);

            console.log("Received response:", data);

            // 실제 응답 메시지로 교체 (isNew 유지)
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? { ...msg, text: `${data.conversation_history.history[0]?.assistant_response || "No answer provided."}`, isNew: true }
                        : msg
                )
            );

            if (data.file_url) {
                playAudioFromUrl(data.file_url);
            }

            scrollToBottomOfContainer();

        } catch (error) {
            console.error("Failed to send question:", error);
            // 에러 발생 시 로딩 메시지 제거 및 에러 메시지 추가
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== loadingMessage.id).concat({
                    id: generateMessageId(),
                    type: "bot",
                    text: "답변을 가져오는 데 실패했습니다.",
                    isNew: true
                })
            );
        }
    };

    // 음성 녹음 시작
    const handleStartRecording = async () => {
        console.log("handleStartRecording 호출됨");

        // 기존 녹음 데이터와 오디오 Blob 초기화
        audioChunksRef.current = [];
        audioBlobRef.current = null;

        // 녹음 중이라면, 기존의 녹음을 중지하고 초기화
        if (isRecording) {
            handleStopRecording();
        }

        const audioPlayback = audioPlaybackRef.current;
        if (audioPlayback) {
            // 이전 오디오 재생 중지 및 리셋
            audioPlayback.pause();
            audioPlayback.currentTime = 0;
        }

        console.log("녹음 시작");
        setIsRecording(true); // 녹음 상태로 설정
        setIsRecordingMode(true); // 녹음 모드 활성화
        setInputPlaceholder("음성 인식 중..."); // 질문창 텍스트 변경

        try {
            // 사용자 미디어(마이크) 접근
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("마이크 스트림 획득:", stream);

            // MediaRecorder 생성 시 MIME 타입 명시적으로 설정
            const options = { mimeType: 'audio/webm; codecs=opus' };
            let mediaRecorder: MediaRecorder;

            if (MediaRecorder.isTypeSupported(options.mimeType)) {
                mediaRecorder = new MediaRecorder(stream, options);
            } else {
                // 지원되지 않는 경우 기본 MIME 타입 사용
                mediaRecorder = new MediaRecorder(stream);
                console.warn("지정한 MIME 타입을 지원하지 않습니다. 기본 MIME 타입을 사용합니다.");
            }

            mediaRecorderRef.current = mediaRecorder; // mediaRecorder 참조

            // MediaRecorder MIME 타입 확인
            console.log("MediaRecorder MIME type:", mediaRecorder.mimeType);

            // 음성 인식 객체 설정
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Speech Recognition API를 지원하지 않는 브라우저입니다.");
                setIsRecording(false);
                setIsRecordingMode(false);
                setInputPlaceholder("여행 친구에게 관광지에 대해 질문하세요!");
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = "ko-KR";
            recognition.interimResults = true;
            recognition.continuous = true;

            recognition.onresult = (event: any) => {
                // 실시간으로 음성 텍스트 변환
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join("");
                setTextQuestion(transcript); // 텍스트 입력창에 실시간 반영
            };

            recognition.onerror = (error: any) => {
                console.error("Speech recognition error:", error);
            };

            recognitionRef.current = recognition; // recognition 객체 참조
            recognition.start(); // 음성 인식 시작

            mediaRecorder.ondataavailable = (event) => {
                console.log("데이터 수집됨:", event.data);
                audioChunksRef.current.push(event.data); // 음성 데이터를 배열에 추가
            };

            mediaRecorder.onstop = () => {
                console.log("mediaRecorder onstop 호출됨");
                // 녹음 종료 후 오디오 Blob 생성 (MIME 타입 일치)
                const audio = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                audioBlobRef.current = audio; // 녹음된 오디오 Blob 참조
                console.log("녹음 종료, Blob 크기:", audio.size);
            };

            mediaRecorder.onerror = (error) => {
                console.error("mediaRecorder 에러:", error);
            };

            mediaRecorder.start(); // 녹음 시작
            console.log("MediaRecorder 시작됨");
        } catch (error) {
            console.error("Failed to start recording:", error);
            setIsRecording(false);
            setIsRecordingMode(false);
            setInputPlaceholder("여행 친구에게 관광지에 대해 질문하세요!");
        }
    };

    // 음성 녹음 중지
    const handleStopRecording = () => {
        console.log("handleStopRecording 호출됨");
        setIsRecording(false); // 녹음 중지 상태
        setIsRecordingMode(false); // 녹음 모드 비활성화
        setInputPlaceholder("여행 친구에게 관광지에 대해 질문하세요!"); // 텍스트로 복귀

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop(); // MediaRecorder 중지
            console.log("MediaRecorder 중지 요청됨");
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop(); // SpeechRecognition 중지
        }
    };

    const handleSendAudio = async () => {
        console.log("handleSendAudio 호출됨");
        handleStopRecording(); // 녹음 중지

        // 녹음이 완료되고 audioBlobRef.current이 설정될 때까지 대기
        setTimeout(async () => {
            if (!audioBlobRef.current || audioBlobRef.current.size === 0) {
                alert("녹음된 오디오가 없습니다.");
                console.log("audioBlob이 null이거나 크기가 0입니다.");
                return;
            }

            const audioBlob = audioBlobRef.current;

            // 사용자 메시지 추가
            const userMessage: Message = { id: generateMessageId(), type: "user", text: textQuestion };
            const loadingMessage: Message = { id: generateMessageId(), type: "bot", text: "loading", isNew: true };

            console.log("Sending audio question:", userMessage);
            console.log("Adding loading message:", loadingMessage);

            setMessages((prev) => [...prev, userMessage, loadingMessage]);
            setTextQuestion(""); // 텍스트 입력창 초기화

            try {
                const response = await sendAudio(audioBlob); // 오디오 전송

                console.log("Received audio response:", response);

                // 실제 응답 메시지로 교체 (isNew 유지)
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === loadingMessage.id
                            ? { ...msg, text: `${response.conversation_history.history[0]?.assistant_response || "No answer provided."}`, isNew: true }
                            : msg
                    )
                );

                if (response.file_url) {
                    playAudioFromUrl(response.file_url);
                }

                scrollToBottomOfContainer();
            } catch (error) {
                console.error("Failed to upload audio:", error);
                // 에러 발생 시 로딩 메시지 제거 및 에러 메시지 추가
                setMessages((prev) =>
                    prev.filter((msg) => msg.id !== loadingMessage.id).concat({
                        id: generateMessageId(),
                        type: "bot",
                        text: "답변을 가져오는 데 실패했습니다.",
                        isNew: true
                    })
                );
            }
        }, 500); // 500ms 지연
    };

    const playAudioFromUrl = (url: string) => {
        const audioPlayback = audioPlaybackRef.current;
        if (audioPlayback) {
            // 이전 오디오 재생 중지 및 리셋
            audioPlayback.pause();
            audioPlayback.currentTime = 0;

            // 캐싱 방지를 위해 고유한 쿼리 파라미터 추가
            const uniqueUrl = `${url}?t=${new Date().getTime()}`;
            audioPlayback.src = uniqueUrl;

            // 오디오 요소를 다시 로드
            audioPlayback.load();

            // 오디오 요소 보이기
            audioPlayback.style.display = "block";

            // 오디오 재생
            audioPlayback.play().catch((err) => console.error("오디오 재생 실패:", err));
        }
    };

    // const displayMessage = (message: { type: "user" | "bot"; text: string }) => {
    //     const newMessage: Message = { id: generateMessageId(), ...message };
    //     setMessages((prevMessages) => [...prevMessages, newMessage]);
    //     scrollToBottomOfContainer(); // 메시지 추가 후 스크롤 이동
    // };

    return (
        <div id="chatContainer">
            <Header />
            <div id="messagesContainer" ref={messagesContainerRef}>
                <AiGuideChat messages={messages} hasMore={hasMore} loadMore={loadChatHistory} />
            </div>
            <div id="userInputContainer">
                <input
                    type="text"
                    id="textQuestion"
                    value={textQuestion}
                    onChange={(e) => setTextQuestion(e.target.value)}
                    placeholder={inputPlaceholder}
                    disabled={isRecordingMode}
                    required
                />

                {/* 텍스트 질문 전송 버튼 */}
                {!isRecording && (
                    <button id="sendButton" onClick={handleSendQuestion}>
                        <img src={arrowUp} alt="Arrow Icon" width="24" height="24" />
                    </button>
                )}

                {/* 텍스트 전송 모드로 변경 버튼 */}
                {isRecordingMode && isRecording && (
                    <button id="stopButton" onClick={handleStopRecording}>
                        <img src={keyboard} alt="Keyboard Icon" width="24" height="24" />
                    </button>
                )}

                {/* 녹음 시작 버튼 */}
                {!isRecording && (
                    <button id="startRecordingButton" onClick={handleStartRecording}>
                        <img src={microphone} alt="Microphone Icon" width="24" height="24" />
                    </button>
                )}

                {/* 녹음 종료 및 전송 버튼 */}
                {isRecording && isRecordingMode && (
                    <button id="stopRecordingButton" onClick={handleSendAudio}>
                        <img src={arrowUp} alt="Arrow Icon" width="24" height="24" />
                    </button>
                )}
            </div>
            <div id="audioContainer">
                <audio id="audioPlayback" ref={audioPlaybackRef} controls style={{ display: "none" }} />
            </div>
        </div>
    );
};

export default AiVoiceGuide;

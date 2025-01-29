import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion"; // framer-motion import
import aiProfile from '../assets/images/ai-profile.png';




interface AiGuideChatProps {
    messages: { type: "user" | "bot"; text: string }[];
    hasMore: boolean;
    loadMore: () => void;
}

const AiGuideChat: React.FC<AiGuideChatProps> = ({ messages, hasMore, loadMore }) => {
    const [isLoadMore, setIsLoadMore] = useState(false); // 더보기 버튼 눌렀는지 여부
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    // useEffect: 메시지가 변경될 때마다 실행
    useEffect(() => {
        if (messagesContainerRef.current) {
            if (isLoadMore) {
                // 더보기 버튼 클릭 시 스크롤을 위로 이동
                messagesContainerRef.current.scrollTop = 0;
            } else {
                // 새 메시지가 오면 자동으로 아래로 스크롤
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }
    }, [messages, isLoadMore]); // messages 또는 isLoadMore가 변경될 때마다 실행

    // 더보기 버튼 클릭 시 처리
    const handleLoadMore = async () => {
        setIsLoadMore(true); // 더보기 버튼 클릭 시 상태 변경
        await loadMore(); // 실제 데이터 로딩 함수 호출
        setIsLoadMore(false); // 데이터 로딩이 끝난 후 isLoadMore 상태를 false로 리셋
    };

    return (
        <div id="messagesContainer-scroll" ref={messagesContainerRef}>
            <div className="div-loadMoreButton">
                {/* "더보기" 버튼을 messagesContainer 상단에 추가 */}
                {hasMore && (
                    <button
                        id="loadMoreButton"
                        onClick={handleLoadMore}
                    >
                        •••
                    </button>
                )}
            </div>

            {/* 메시지 목록 표시 */}
            {messages.map((message, index) => (
                <motion.div
                    key={index}
                    className="chat-row"
                    initial={{ y: 30, opacity: 0 }}  // 메시지가 처음에 보이지 않도록 설정
                    animate={{ y: 0, opacity: 1 }}  // 메시지가 올라오면서 나타나는 애니메이션
                    transition={{ type: "spring", duration: 1  }}  // 스프링 애니메이션 적용
                >
                    {/* 봇 메시지에만 아이콘 추가 */}
                    {message.type === "bot" && (
                        <img
                            src={aiProfile} // 아이콘 이미지 경로
                            alt="ai-profile"
                        />
                    )}

                    <div className={`message ${message.type}`}>
                        {/* 메시지 내용 */}
                        <div>{message.text}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default AiGuideChat;
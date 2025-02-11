import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface TypingEffectProps {
    text: string;
    onTypingFinished: () => void; // 타이핑 완료 시 호출되는 콜백 추가
}

export function TypingEffect({ text, onTypingFinished }: TypingEffectProps) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    const [displayedText, setDisplayedText] = useState<string>(""); // 타이핑 중 표시될 텍스트
    const [finalText, setFinalText] = useState<string>(""); // 최종 변환된 텍스트
    const [typingFinished, setTypingFinished] = useState<boolean>(false); // 타이핑 완료 여부

    // 텍스트 포맷팅 (볼드체, 줄바꿈 처리)
    const formatText = (inputText: string) => {
        return inputText
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // **bold** -> <b>bold</b>
            .replace(/\n/g, "<br>"); // 줄바꿈을 <br>로 변환
    };

    useEffect(() => {
        // 최종 텍스트 포맷팅
        const formatted = formatText(text);
        setFinalText(formatted); // 최종 변환된 텍스트 저장
    }, [text]);

    useEffect(() => {
        let index = 0;
        const length = text.length;

        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text[index]); // 타이핑 중인 텍스트 추가
            index++;

            if (index === length) {
                clearInterval(interval);
                setTypingFinished(true); // 타이핑 완료
            }
        }, 20); // 타이핑 속도

        return () => clearInterval(interval);
    }, [text]);

    useEffect(() => {
        if (typingFinished) {
            onTypingFinished(); // 타이핑이 끝난 후에 부모로 신호 전송
        }
    }, [typingFinished, onTypingFinished]);

    return (
        <motion.div ref={ref}>
            {/* 타이핑 중인 텍스트는 그대로 처리하고 */}
            {!typingFinished ? (
                text.split('').map((letter, index) => (
                    <motion.span
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.02, delay: index * 0.02 }}
                    >
                        {letter === ' ' ? '\u00A0' : letter}
                    </motion.span>
                ))
            ) : (
                // 타이핑이 끝난 후에는 HTML로 변환된 텍스트를 보여줍니다
                <div
                    dangerouslySetInnerHTML={{
                        __html: finalText, // HTML 태그로 변환된 텍스트 출력
                    }}
                />
            )}
        </motion.div>
    );
}

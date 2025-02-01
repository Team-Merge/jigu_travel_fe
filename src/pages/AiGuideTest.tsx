import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import AiGuide from "../components/AiGuide";
import "../styles/global.css";
import expand from '../assets/images/expand.png';
import fold from '../assets/images/fold.png';

const AiGuideTest: React.FC = () => {
    const [height, setHeight] = useState(300); // AiGuide 기본 높이 (px로 설정)
    const [isMinimized, setIsMinimized] = useState(false); // 크기 최소화 여부
    const dragRef = useRef<HTMLDivElement | null>(null);
    const minHeight = 70;  // AiGuide 최소 높이 (100px)
    const maxHeight = 600;  // AiGuide 최대 높이 (600px)
    const viewportWrapperRef = useRef<HTMLDivElement | null>(null); // 부모 요소 참조

    // 부모 요소의 크기 구하기
    const [parentHeight, setParentHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            if (viewportWrapperRef.current) {
                setParentHeight(viewportWrapperRef.current.clientHeight);
            }
        };

        window.addEventListener("resize", updateHeight);
        updateHeight(); // 초기 크기 설정

        return () => {
            window.removeEventListener("resize", updateHeight);
        };
    }, []);

    // 마우스 드래그로 크기 조정 (모바일 터치 지원)
    const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY; // 터치 이벤트에서 Y값을 가져오도록 처리
        const startY = clientY;
        const startHeight = height;

        const handleDragMove = (moveEvent: TouchEvent | MouseEvent) => {
            const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
            const newHeight = startHeight + (startY - clientY); // 위에서부터 크기 조정
            // 높이가 minHeight와 maxHeight 사이에 있도록 제한
            if (newHeight >= minHeight && newHeight <= maxHeight) {
                setHeight(newHeight);
            }
        };

        const handleDragEnd = () => {
            document.removeEventListener("mousemove", handleDragMove);
            document.removeEventListener("mouseup", handleDragEnd);
            document.removeEventListener("touchmove", handleDragMove);
            document.removeEventListener("touchend", handleDragEnd);
        };

        document.addEventListener("mousemove", handleDragMove);
        document.addEventListener("mouseup", handleDragEnd);
        document.addEventListener("touchmove", handleDragMove);
        document.addEventListener("touchend", handleDragEnd);
    };

    // 크기 최소화 및 복원
    const toggleSize = () => {
        if (isMinimized) {
            setHeight(parentHeight/2); // 원래 크기로 되돌리기
        } else {
            setHeight(minHeight); // 최소화된 크기로 설정
        }
        setIsMinimized(!isMinimized); // 상태 변경
    };

    return (
        <div className="viewportWrapper">
            <div className="header-wrapper">
                <Header />
            </div>

            <div className="content-wrapper" ref={viewportWrapperRef}>
                {/* up div (위에 있는 div) */}
                <div style={{ height: `${parentHeight - height}px`, overflow: 'scroll' }}>
                    <div>~~지도나 추천 명소 자리~~</div>
                </div>

                {/* AiGuide 및 resize handle 포함한 부모 div */}
                <div className="resizeable-container" style={{ height: `${height}px` }}>
                    <AiGuide defaultMessage="" />
                    {/* resize-handle */}
                    <div
                        ref={dragRef}
                        className="resize-handle"
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    >
                        {/* 버튼을 클릭하여 크기 최소화/최대화 */}
                        <button id="expandFoldBtn" onClick={toggleSize} >
                            {isMinimized ?
                                <img src={expand} alt="Expand Icon" width="24" height="12"/>
                                : <img src={fold} alt="Fold Icon" width="24" height="12"/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiGuideTest;

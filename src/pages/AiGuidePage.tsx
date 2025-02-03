import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import AiGuide from "../components/AiGuide";
import "../styles/global.css";

const AiGuideTest: React.FC = () => {
   
    
    return (
        <div className="viewportWrapper">
            <div className="header-wrapper">
                <Header />
            </div>
            
                    <AiGuide defaultMessage="" />
        </div>
                    
    );
};

export default AiGuideTest;

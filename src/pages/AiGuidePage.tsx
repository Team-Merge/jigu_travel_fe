import React, { useState, useRef, useEffect } from "react";
import Header from "../components/layout/Header";
import AiGuide from "../components/AiGuide";
import "../styles/global.css";
import { useNavigate } from "react-router-dom";


const AiGuideTest: React.FC = () => {

    const navigate = useNavigate();


    useEffect(() => {
        const jwtToken = localStorage.getItem("jwt");
        if (!jwtToken || jwtToken === "undefined") {
            alert("로그인 후 사용해주세요.");
            navigate("/auth/login");
            return;
        }
    }, []);




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

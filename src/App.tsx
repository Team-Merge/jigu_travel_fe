import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AuthLogin from "./pages/AuthLogin";
import Register from "./pages/Register";
import AskAI from "./pages/AskAI";
import RecommendTravel from "./pages/RecommendTravel";
import AiGuide from "./pages/AiGuide";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/auth/login/email" element={<Login />} />
        <Route path="/auth/login" element={<AuthLogin />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ask-ai" element={<AskAI />} />
        <Route path="/recommend-travel" element={<RecommendTravel />} />
        <Route path="/ai-guide" element={<AiGuide />} />


        <Route path="*" element={<h2>404 - 페이지를 찾을 수 없습니다</h2>} />
      </Routes>
    </Router>
  );
};

export default App;

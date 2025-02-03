import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AuthLogin from "./pages/AuthLogin";
import Register from "./pages/Register";
import AskAI from "./pages/AskAI";
import RecommendTravel from "./pages/RecommendTravel";
import TravelWithAI from "./pages/TravelWithAI";
import AiGuideTest from "./pages/AiGuideTest";


import BoardList from "./pages/BoardList";
import BoardDetail from "./pages/BoardDetail";
import BoardCreate from "./pages/BoardCreate";
import BoardEdit from "./pages/BoardEdit";


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
        <Route path="/travel-with-ai" element={<TravelWithAI />} />
        <Route path="/ai-guide" element={<AiGuideTest />} />

        <Route path="/board" element={<BoardList />} />
        <Route path="/board/:boardId" element={<BoardDetail />} />
        <Route path="/board/create" element={<BoardCreate />} />
        <Route path="/board/edit/:boardId" element={<BoardEdit />} />


        <Route path="*" element={<h2>404 - 페이지를 찾을 수 없습니다</h2>} />
      </Routes>
    </Router>
  );
};

export default App;

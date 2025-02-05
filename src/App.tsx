import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AuthLogin from "./pages/AuthLogin";
import Register from "./pages/Register";
import AskAI from "./pages/AskAI";
import RecommendTravel from "./pages/RecommendTravel";
import TravelWithAI from "./pages/TravelWithAI";
import AiGuideTest from "./pages/AiGuidePage";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetNew from "./pages/ResetPasswordNew";


import BoardList from "./pages/BoardList";
import BoardDetail from "./pages/BoardDetail";
import BoardCreate from "./pages/BoardCreate";
import BoardEdit from "./pages/BoardEdit";

import BoardTabs from "./components/BoardTab";

import AdminDashboard from "./pages/AdminDashboard";
import AdminVisitorPage from "./pages/AdminVisitorPage";



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
        <Route path="/auth/passwordReset-vaild" element={<PasswordReset />} />
        <Route path="/auth/reset-password" element={<PasswordResetNew />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/visitor" element={<AdminVisitorPage />} />

        {/* <Route path="/board" element={<BoardTabs />} /> */}
        <Route path="/board" element={<BoardList />} />
        <Route path="/board/:postId" element={<BoardDetail />} />
        <Route path="/board/create" element={<BoardCreate />} />
        <Route path="/board/edit/:postId" element={<BoardEdit />} />



        <Route path="*" element={<h2>404 - 페이지를 찾을 수 없습니다</h2>} />
      </Routes>
    </Router>
  );
};

export default App;

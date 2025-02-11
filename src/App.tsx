import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/pages/Login";
import Home from "./home/pages/Home";
import AuthLogin from "./auth/pages/AuthLogin";
import Register from "./auth/pages/Register";
import AskAI from "./Imagequeryai/pages/AskAI";
import RecommendTravel from "./interestai/pages/RecommendTravel";
import TravelWithAI from "./TravelWithAi/pages/TravelWithAI";
import AiGuideTest from "./AiGuide/pages/AiGuidePage";
import PasswordReset from "./auth/pages/PasswordReset";
import PasswordResetNew from "./auth/pages/ResetPasswordNew";
import AdminLocationPage from "./admin/pages/AdminLocationPage";
import Withdraw from "./auth/pages/Withdraw";
import AiGuideAndMap from "./TravelWithAi/pages/AiGuideAndMap";

import ErrorPage from "./error/pages/ErrorPage";

import BoardList from "./board/pages/BoardList";
import BoardDetail from "./board/pages/BoardDetail";
import BoardCreate from "./board/pages/BoardCreate";
import BoardEdit from "./board/pages/BoardEdit";

// import BoardTabs from "./components/BoardTab";

import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminVisitorPage from "./admin/pages/AdminVisitorPage";

import ProtectedRoute from "./auth/components/ProtectedRoute";
import AdminUsersPage from "./admin/pages/AdminUsersPage";

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
        <Route path="/travel-with-ai" element={<AiGuideAndMap />} />

        {/* <Route path="/travel-with-ai" element={<TravelWithAI />} /> */}
        <Route path="/ai-guide" element={<AiGuideTest />} />
        <Route path="/auth/passwordReset-vaild" element={<PasswordReset />} />
        <Route path="/auth/reset-password" element={<PasswordResetNew />} />
        <Route path="/withdraw" element={<Withdraw />} />
        {/* <Route path="/ai-guid-map" element={<AiGuideAndMap />} /> */}

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/visitor" element={<AdminVisitorPage />} />
          <Route path="/admin/location" element={<AdminLocationPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        {/* <Route path="/board" element={<BoardTabs />} /> */}
        <Route path="/board" element={<BoardList />} />
        <Route path="/board/:postId" element={<BoardDetail />} />
        <Route path="/board/create" element={<BoardCreate />} />
        <Route path="/board/edit/:postId" element={<BoardEdit />} />

        <Route path="/*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default App;

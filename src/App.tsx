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
import AdminLocationPage from "./pages/AdminLocationPage";
import Withdraw from "./pages/Withdraw";
import AiGuideAndMap from "./pages/AiGuideAndMap";

import ErrorPage from "./pages/ErrorPage";

import BoardList from "./pages/board/BoardList";
import BoardDetail from "./pages/board/BoardDetail";
import BoardCreate from "./pages/board/BoardCreate";
import BoardEdit from "./pages/board/BoardEdit";

// import BoardTabs from "./components/BoardTab";

import AdminDashboard from "./pages/AdminDashboard";
import AdminVisitorPage from "./pages/AdminVisitorPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsersPage from "./pages/AdminUsersPage";

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

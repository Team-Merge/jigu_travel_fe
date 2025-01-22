import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/home" element={<Home />} />


        <Route path="*" element={<h2>404 - 페이지를 찾을 수 없습니다</h2>} />
      </Routes>
    </Router>
  );
};

export default App;

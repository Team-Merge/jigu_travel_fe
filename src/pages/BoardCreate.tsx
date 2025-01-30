import React from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/boardApi";
import BoardForm from "../components/BoardForm";

const BoardCreate: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (title: string, content: string) => {
    try {
      await createPost(title, content); // ✅ 토큰을 직접 전달하지 않아도 됨!
      navigate("/board");
    } catch (error) {
      console.error("게시글 작성 실패:", error);
    }
  };

  return (
    <div>
      <h2>게시글 작성</h2>
      <BoardForm onSubmit={handleSubmit} />
    </div>
  );
};

export default BoardCreate;

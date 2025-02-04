import React from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/boardApi";
import BoardForm from "../components/BoardForm";
import "../styles/BoardCreate.css"
import { data } from "react-router-dom";
import Header from "../components/Header";

const BoardCreate: React.FC<{ goToList: () => void }> = ({ goToList })  => {
  const navigate = useNavigate();

  const handleSubmit = async (title: string, content: string, files: File[]) => {
    try {
      await createPost(title, content, files); // ✅ 토큰을 직접 전달하지 않아도 됨!
      alert("게시글이 작성되었습니다.");
      console.log("데이터:", FormData)
      navigate("/board"); 
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성 중 오류 발생");
    }
  };

  return (
    <div className="board-create-wrapper">
    <Header/>
    <div className="board-create-container">
      <h2 className="board-create-title">궁금한 사항을 작성해주세요.</h2>
      
      <div className="board-create-form">
        <BoardForm onSubmit={handleSubmit} mode="create"/>
      </div>
    </div>
    </div>
  );
};

export default BoardCreate;

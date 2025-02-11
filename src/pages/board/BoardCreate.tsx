import React from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../api/boardApi";
import BoardForm from "../../components/board/BoardForm";
import "../../styles/board/BoardCreate.css"
import Header from "../../components/layout/Header";

const BoardCreate: React.FC<{}> = ()  => {
  const navigate = useNavigate();

  const handleSubmit = async (title: string, content: string, inquiryType: string, files: File[]) => {
    try {
      await createPost(title, content, inquiryType, files); 
      alert("게시글이 작성되었습니다.");
      console.log("데이터:", FormData)
      navigate("/board"); 
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성 중 오류 발생");
      console.log("데이터:", FormData)
    }
  };

  return (
    <div className="board-create-wrapper">
    <Header/>
    <div className="board-create-container">
      <div className="board-create-title">
      <h2 className="qna-header">QnA 게시판</h2>
      <h2 className="title-header">궁금한 사항을 작성해주세요.</h2>
      </div>
      <div className="board-create-form">
        <BoardForm onSubmit={handleSubmit} mode="create"/>
      </div>
    </div>
    </div>
  );
};

export default BoardCreate;

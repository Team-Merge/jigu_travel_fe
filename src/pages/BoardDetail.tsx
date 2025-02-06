import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostDetail, deletePost, downloadFile } from "../api/boardApi";
import "../styles/BoardDetail.css"
import Header from "../components/Header";

// 첨부파일 타입 정의
interface Attachment {
  fileId: number;
  fileName: string;
  fileSize: number;
}

const BoardDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  console.log("[DEBUG] postId:", postId);

  const [post, setPost] = useState<{ 
    boardId: number;
    title: string;
    content: string;
    inquiryType: string;
    nickname: string;
    createdAt: string;
    attachments: Attachment[]; 
  } | null>(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        console.error("postId가 undefined입니다!");
        return;
      }

      try {
        console.log("[DEBUG] 게시글 요청 ID:", postId);
        const data = await getPostDetail(Number(postId));
        setPost(data);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      }
    };
    fetchPost();
  }, [postId]);

  const handleDownload = async (fileName: string) => {
    try {
      await downloadFile(fileName);
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert("파일을 다운로드할 수 없습니다.");
    }
  };
  

  const handleDelete = async () => {
    console.error("현재 토큰" + token);
    if (!token) return alert("로그인이 필요합니다.");
    try {
      await deletePost(Number(postId));
      alert("삭제 완료");
      navigate("/board");
      // goToList();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div className="board-detail-wrapper">
    <Header/>
    <div className="board-detail-container">
      <div className="board-detail-header">
      <h2 className="qna-header">QnA 게시판</h2>
      </div>
    <div className="board-detail-form-container">
    <div className="board-detail-form">
      {post ? (
        <>
          <div className="detail-title">
          <h2 className="board-detail-title">[{post.inquiryType}] {post.title}</h2>
          </div>
          <div className="detail-title">
          <p className="board-detal-author">작성자 : {post.nickname}</p>
          <p className="board-detail-date">
            작성 날짜 : {new Date(post.createdAt).toLocaleDateString()}
            {/* {new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(post.createdAt))} */}
          </p> 
          </div>
          <div className="board-detail-content">
            <p>{post.content}</p>
            </div>

          {/* ✅ 첨부파일 목록만 표시 */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="board-detail-attachments">
              <h3>첨부파일</h3>
              <ul>
                {post.attachments.map((file) => (
                  <li key={file.fileId}>
                    {file.fileName} ({(file.fileSize / 1024).toFixed(2)} KB)
                    <button onClick={() => handleDownload(file.fileName)}>다운로드</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="board-detail-buttons">
            <button className="back-button" onClick={() => navigate("/board")}>목록</button>
            <button className="edit-button" onClick={() => navigate(`/board/edit/${post.boardId}`)}>수정</button>
            <button className="delete-button" onClick={handleDelete}>삭제</button>
          </div>
        </>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
    </div>
    </div>
    </div>
  );
};

export default BoardDetail;

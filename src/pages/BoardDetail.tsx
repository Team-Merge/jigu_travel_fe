import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostDetail, deletePost } from "../api/boardApi";
import "../styles/BoardDetail.css"
// 첨부파일 타입 정의
interface Attachment {
  fileId: number;
  fileName: string;
  fileSize: number;
}

interface BoardDetailProps {
  postId: number;  
  goToList: () => void; // ✅ 목록으로 돌아가기 기능 추가
  goToEdit: () => void;
}

const BoardDetail: React.FC<BoardDetailProps> = ({postId, goToList, goToEdit}) => {
  // const { boardId } = useParams<{ boardId: string }>();
  // const [post, setPost] = useState<any>(null);
  const [post, setPost] = useState<{ 
    boardId: number;
    title: string;
    content: string;
    nickname: string;
    attachments: Attachment[]; // ✅ attachments 배열의 타입 지정
  } | null>(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostDetail(postId);
        setPost(data);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      }
    };
    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    console.error("현재 토큰" + token);
    if (!token) return alert("로그인이 필요합니다.");
    try {
      await deletePost(Number(postId));
      alert("삭제 완료");
      // navigate("/board");
      goToList();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div className="board-detail-container">
      {post ? (
        <>
          {/* <button onClick={() => navigate("/board")}>뒤로가기(게시판 목록)</button> */}
          <h2 className="board-detail-title">{post.title}</h2>
          <p className="board-detal-author">작성자: {post.nickname}</p>
          <div className="board-detail-content">{post.content}</div>

          {/* ✅ 첨부파일 목록만 표시 (다운로드 버튼 없음) */}
          {post.attachments && post.attachments.length > 0 && (
            <div>
              <h3>📎 첨부파일</h3>
              <ul>
                {post.attachments.map((file) => (
                  <li key={file.fileId}>
                    {file.fileName} ({(file.fileSize / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* <button onClick={() => navigate(`/board/edit/${boardId}`)}>수정</button>
          <button onClick={handleDelete}>삭제</button> */}
          <div className="board-detail-buttons">
            <button className="back-button" onClick={goToList}>뒤로가기</button>
            {/* <button className="edit-button" onClick={() => navigate(`/board/edit/${boardId}`)}>수정</button> */}
            <button className="edit-button" onClick={goToEdit}>수정</button>
            <button className="delete-button" onClick={handleDelete}>삭제</button>
          </div>
        </>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
};

export default BoardDetail;

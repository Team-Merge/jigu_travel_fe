import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostDetail, deletePost } from "../api/boardApi";

const BoardDetail: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [post, setPost] = useState<any>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostDetail(Number(boardId));
        setPost(data);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      }
    };
    fetchPost();
  }, [boardId]);

  const handleDelete = async () => {
    console.error("현재 토큰" + token);
    if (!token) return alert("로그인이 필요합니다.");
    try {
      await deletePost(Number(boardId));
      alert("삭제 완료");
      navigate("/board");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div>
      {post ? (
        <>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>작성자: {post.nickname}</p>
          <button onClick={() => navigate(`/board/edit/${boardId}`)}>수정</button>
          <button onClick={handleDelete}>삭제</button>
        </>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
};

export default BoardDetail;

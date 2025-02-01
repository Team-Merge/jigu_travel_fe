import React, { useEffect, useState } from "react";
import { getPostDetail, updatePost } from "../api/boardApi";
import { useNavigate, useParams } from "react-router-dom";
import BoardForm from "../components/BoardForm";

const BoardEdit: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [post, setPost] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostDetail(Number(boardId));
        setPost(data);
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };
    fetchPost();
  }, [boardId]);

  const handleSubmit = async (title: string, content: string) => {
    try {
    //   const token = localStorage.getItem("token") || "";
      await updatePost(Number(boardId), title, content);
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
    }
  };

  if (!post) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>게시글 수정</h2>
      <BoardForm onSubmit={handleSubmit} initialTitle={post.title} initialContent={post.content} />
    </div>
  );
};

export default BoardEdit;

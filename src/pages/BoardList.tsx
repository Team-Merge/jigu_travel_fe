import React, { useEffect, useState } from "react";
import { getBoardList } from "../api/boardApi";
import { useNavigate } from "react-router-dom";

const BoardList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBoardList();
        setPosts(data);
      } catch (error) {
        console.error("게시글 목록 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h2>게시판</h2>
      <button onClick={() => navigate("/board/create")}>글쓰기</button>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.boardId} onClick={() => navigate(`/board/${post.boardId}`)}>
              {post.title} - {post.nickname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BoardList;

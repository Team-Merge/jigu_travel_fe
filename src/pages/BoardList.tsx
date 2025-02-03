import React, { useEffect, useState } from "react";
import { getBoardList } from "../api/boardApi";
import { useNavigate } from "react-router-dom";
import "../styles/BoardList.css";

interface BoardListProps {
  goToCreate: () => void;
  goToDetail: (boardId: number) => void; // ✅ 상세 페이지로 이동하는 함수 추가
}

const BoardList: React.FC<BoardListProps> = ({ goToCreate, goToDetail }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBoardList();
        setPosts(data);
        console.log("📢 [DEBUG] API 응답 데이터:", data); // 백엔드 응답 출력
      } catch (error) {
        console.error("게시글 목록 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="board-list-container">
      {/* 📌 상단: 게시판 타이틀 & 글쓰기 버튼 */}
      <div className="board-header">
        <h2 className="qna-header">QnA</h2>
        <button className="write-button" onClick={goToCreate}>
          질문하기
        </button>
      </div>

      {/* 📌 게시판 목록 */}
      {loading ? (
        <p className="loading-text">⏳ 로딩 중...</p>
      ) : (
        <table className="qa-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>날짜</th>
              {/* <th>답변 여부</th> */}
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <tr key={post.boardId} onClick={() => goToDetail(post.boardId)}>
                  <td>{index + 1}</td>
                  <td className="qa-title">{post.title}</td>
                  <td>{post.nickname}</td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  {/* <td className={post.isAnswered ? "answered" : "not-answered"}>
                    {post.isAnswered ? "✅ 답변 완료" : "❌ 미답변"}
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-questions">아직 질문이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BoardList;

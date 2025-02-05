import React, { useEffect, useState } from "react";
import { getBoardList } from "../api/boardApi";
import { useNavigate } from "react-router-dom";
import "../styles/BoardList.css";
import Header from "../components/Header";

const BoardList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {

    fetchPosts(currentPage);
  }, [currentPage]);

    const fetchPosts = async (page: number) => {
      try {
        // const data = await getBoardList();
        // setPosts(data);
        // console.log("📢 [DEBUG] API 응답 데이터:", data); // 백엔드 응답 출력
        const response = await getBoardList(page, 10); // ✅ API 호출

        console.log("📢 [DEBUG] API 응답 데이터:", response);

        setPosts(response.data.posts); // ✅ `posts` 대신 `content` 사용???
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("게시글 목록 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
  //   fetchPosts();
  // }, []);

  // ✅ 페이지 이동 함수
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

   // ✅ 게시글 상세 페이지 이동 함수
  const goToDetail = (boardId: number) => {
    navigate(`/board/${boardId}`);
  };

    // ✅ 글쓰기 페이지 이동 함수
  const goToCreate = () => {
    navigate("/board/create");
  };

  return (
    <div className="board-wrapper">
      <Header/>
    <div className="board-list-container">
      <div className="qna-container">
      <div className="board-header">
        <h2 className="qna-header">QnA 게시판</h2>
      </div>
      <div className="qna-table-wrapper">
      {loading ? (
        <p className="loading-text">⏳ 로딩 중...</p>
      ) : (
        <>
        <table className="qna-table">
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
            {Array.isArray(posts) && posts.length >= 0 ? (
              posts.map((post, index) => (
                <tr key={post.boardId} onClick={() => navigate(`/board/${post.boardId}`)}>
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
        </>
      )}
      </div>
      {/* 페이지네이션 버튼 */}
      <div className="pagination-buttons">
          <button onClick={goToPrevPage} disabled={currentPage === 0}>
            ◀ 이전
          </button>
          <span>{currentPage + 1} / {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1}>
            다음 ▶
          </button>
        </div>
      </div>
      
    </div>
    {/* ✅ Floating Button 추가 */}
    <button className="floating-button" onClick={goToCreate}>
      +
    </button>
    </div>
  );
};

export default BoardList;

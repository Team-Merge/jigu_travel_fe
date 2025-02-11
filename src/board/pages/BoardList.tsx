import React, { useEffect, useState } from "react";
import { getBoardList } from "../../api/boardApi";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import "../styles/BoardList.css";
import Header from "../../layout/components/Header";

const BoardList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {

    fetchPosts(currentPage);
  }, [currentPage]);

    const fetchPosts = async (page: number) => {
      try {
        const response = await getBoardList(page, 10); // 

        console.log("API 응답 데이터:", response);

        setPosts(response.data.posts); //`posts` 대신 `content` 사용???
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalItems);
      } catch (error) {
        console.error("게시글 목록 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

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

  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  return (
    <div className="board-wrapper">
      <Header/>
    <div className="board-list-container">
      <div className="qna-container">
      <div className="board-header">
        <h2 className="qna-header">QnA 게시판</h2>
      </div>

      <div className="total-posts-container">
        <p className="total-posts-text">
          총 <span className="total-posts-number">{totalItems}</span>건의 게시글이 있습니다.</p> 
      </div>

      <div className="qna-table-wrapper">
              {loading ? (
        <p className="loading-text">⏳ 로딩 중...</p>
      ) : (
        <>
        
        <table className="qna-table">
          <thead>
            <tr>
              <th className="qna-title">제목</th>
              <th className="qna-author">작성자</th>
              <th className="qna-date">날짜</th>
              {/* <th>답변 여부</th> */}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(posts) && posts.length >= 0 ? (
              posts.map((post, index) => (
                <tr key={post.boardId} onClick={() => navigate(`/board/${post.boardId}`)}>
                  <td className="qa-title">[{post.inquiryType}] {post.title}</td>
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
      
      {/* <div className="pagination-buttons">
          <button onClick={goToPrevPage} disabled={currentPage === 0}>
            ◀ 이전
          </button>
          <span>{currentPage + 1} / {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1}>
            다음 ▶
          </button>
        </div> */}
      <ReactPaginate
            previousLabel="〈"
            nextLabel="〉"
            breakLabel="..."
            pageCount={totalPages}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName="pagination"
            activeClassName="active"
            previousClassName="prev"
            nextClassName="next"
            disabledClassName="disabled"
          />
      </div>
    </div>
    <button className="floating-button" onClick={() => navigate(`/board/create`)}>
      +
    </button>
    </div>
  );
};

export default BoardList;

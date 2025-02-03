// import React, { useEffect, useState } from "react";
// import { getBoardList } from "../api/boardApi";
// import { useNavigate } from "react-router-dom";
// import "../styles/BoardList.css";

// const BoardList: React.FC = () => {
//   // const [activeTab, setActiveTab] = useState("서비스 소개"); // ✅ 탭 상태 관리
//   const [posts, setPosts] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const data = await getBoardList();
//         setPosts(data);
//       } catch (error) {
//         console.error("게시글 목록 가져오기 실패:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPosts();
//   }, []);

//   return (
//     <div >
//       <h2>게시판</h2>
//       <button onClick={() => navigate("/board/create")}>글쓰기</button>
//       {loading ? (
//         <p>로딩 중...</p>
//       ) : (
//         <ul>
//           {posts.map((post) => (
//             <li key={post.boardId} onClick={() => navigate(`/board/${post.boardId}`)}>
//               {post.title} - {post.nickname}
//             </li>
//           ))}
//         </ul>
//       )}
    
//     </div>
//   );
// };

// export default BoardList;

import React, { useEffect, useState } from "react";
import { getBoardList } from "../api/boardApi";
import { useNavigate } from "react-router-dom";
import "../styles/BoardList.css";


const BoardList: React.FC<{ goToCreate: () => void; goToEdit: (boardId: number) => void }> = ({ goToCreate, goToEdit }) => {
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
              <th>답변 여부</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <tr key={post.boardId} onClick={() => navigate(`/board/${post.boardId}`)}>
                  <td>{index + 1}</td>
                  <td className="qa-title">{post.title}</td>
                  <td>{post.nickname}</td>
                  <td>{new Date(post.date).toLocaleDateString()}</td>
                  <td className={post.isAnswered ? "answered" : "not-answered"}>
                    {post.isAnswered ? "✅ 답변 완료" : "❌ 미답변"}
                  </td>
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

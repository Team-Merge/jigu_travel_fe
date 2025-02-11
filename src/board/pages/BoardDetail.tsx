import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CgMoreVertical } from "react-icons/cg";
import { getPostDetail, deletePost, downloadFile } from "../../api/boardApi";
import "../styles/BoardDetail.css"
import Header from "../../layout/components/Header";
import CommentSection from "../components/CommentsSection";
import { jwtDecode } from "jwt-decode";

import profile from '../../assets/images/profile.png';

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
    userId: string;
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  let currentUserNickname = "";

  if (token) {
    try {
      const decoded = jwtDecode<{ sub?: string }>(token);
      console.log("[DEBUG] 디코딩된 토큰 데이터:", decoded);
  
      if (decoded.sub) {
        currentUserNickname = decoded.sub;
      } else {
        console.warn("[WARN] 토큰에 nickname 필드가 없습니다.");
      }
    } catch (error) {
      console.error("[ERROR] JWT 디코딩 실패:", error);
    }
  }
  
  console.log("[DEBUG] 현재 로그인한 사용자 닉네임:", currentUserNickname);


  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        const data = await getPostDetail(Number(postId));
        setPost(data);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      }
    };
    fetchPost();
  }, [postId]);

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
          <h2 className="board-detail-title-post">게시글</h2>

          <h2 className="board-detail-title">[{post.inquiryType}] {post.title}</h2>
          </div>
          {/* ✅ 작성자 & 날짜 + 옵션 버튼 */}
          <div className="detail-header">
                  <div className="detail-info">
                    <img 
                      src={profile}
                      alt="작성자 프로필"
                      className="profile-image"
                    />
                    <p className="board-detail-author">{post.nickname}</p>
                    <p className="board-detail-date">
                      작성 날짜 : {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* ✅ 작성자만 메뉴 보이기 */}
                  {post.nickname === currentUserNickname && (
                    <div className="detail-menu-container" ref={menuRef}>
                      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
                        <CgMoreVertical size={20} />
                      </button>

                      {menuOpen && (
                        <div className="dropdown-menu">
                          <button onClick={() => navigate(`/board/edit/${post.boardId}`)}>수정하기</button>
                          <button onClick={handleDelete}>삭제하기</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <hr className="divider-line"/>
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
           <hr className="divider-line"/>
          <div className="board-detail-buttons">
            <button className="back-button" onClick={() => navigate("/board")}>목록</button>
            {/* <button className="edit-button" onClick={() => navigate(`/board/edit/${post.boardId}`)}>수정</button>
            <button className="delete-button" onClick={handleDelete}>삭제</button> */}
          </div>
          <CommentSection boardId={Number(postId)} />
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

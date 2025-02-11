import React, {useEffect, useState, useRef} from "react";
import { getComments, addComment, updateComments, deleteComment } from "../../api/boardApi";
import { jwtDecode } from "jwt-decode";
import "../styles/CommentSection.css"
import { CgMoreVertical } from "react-icons/cg";
import profile from '../../assets/images/profile.png';

interface Comment {
    commentId: number;
    boardId: number;
    nickname: string;
    comment: string;
    createdAt: string;
}

interface CommentSectionProps {
    boardId: number
}

const CommentSection: React.FC<CommentSectionProps> = ({ boardId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    useEffect(() => {
        const fetchComments = async () => {
          try {
            const response = await getComments(boardId);
            setComments(response);
          } catch (error) {
            console.error("댓글 불러오기 실패:", error);
          }
        };
        fetchComments();
      }, [boardId]);

      const token = localStorage.getItem("jwt");
      let currentUserNickname = "";

      if (token) {
        const decoded = jwtDecode<{ sub: string }>(token);
        currentUserNickname = decoded.sub;
      }
    
      // ✅ 댓글 작성
      const handleCommentSubmit = async () => {
        if (!newComment.trim()) {
          alert("댓글을 입력해주세요.");
          return;
        }
    
        try {
          await addComment(boardId, newComment);
          setNewComment(""); // ✅ 입력창 초기화
          const updatedComments = await getComments(boardId); // ✅ 최신 댓글 불러오기
          setComments(updatedComments);
        } catch (error) {
          console.error("댓글 작성 실패:", error);
        }
      };

      const handleUpdateComment = async () => {
        if (!editingComment) return;
      
        try {
          await updateComments(editingComment.commentId, newComment);
          setEditingComment(null); // ✅ 수정 완료 후 초기화
          setNewComment(""); // ✅ 입력창 초기화
          const updatedComments = await getComments(boardId); // ✅ 최신 댓글 다시 불러오기
          setComments(updatedComments);
        } catch (error) {
          console.error("댓글 수정 실패:", error);
        }
      };

      const handleEdit = (comment: Comment) => {
        setEditingComment(comment);  // 현재 수정 중인 댓글 저장
        setNewComment(comment.comment); // 기존 댓글 내용을 불러오기
      };
      
      // ✅ 댓글 삭제 핸들러
      const handleDelete = async (commentId: number) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
      
        try {
          await deleteComment(commentId);
          console.log(`[DEBUG] 댓글 삭제 완료 - ID: ${commentId}`);
          setComments((prevComments) => prevComments.filter((c) => c.commentId !== commentId));
        
        } catch (error) {
          console.error("댓글 삭제 실패:", error);
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

      const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

      const toggleMenu = (commentId: number) => {
        if (menuOpenId === commentId) {
          setMenuOpenId(null); // 같은 버튼을 누르면 닫기
        } else {
          setMenuOpenId(commentId); // 해당 댓글의 ID로 상태 설정
        }
      };

      return (
        <div className="comments-section">
          <h3>댓글</h3>
    
          {/* 댓글 입력창 */}
          <div className="comment-input">
            <textarea
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            {editingComment ? (
                <button onClick={handleUpdateComment}>수정 완료</button>
              ) : (
                <button onClick={handleCommentSubmit}>댓글 작성</button>
              )}          
              </div>
    
          {/* 기존 댓글 목록 */}
          {comments.length > 0 ? (
            <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.commentId} className="comment-item">
                <div className="comment-header">
                  <div className="comment-info">
                  <img 
                        src={profile}
                        alt="작성자 프로필"
                        className="profile-image"
                      />
                  <strong>{comment.nickname}</strong>
                  </div>
                  {comment.nickname === currentUserNickname && (
                    <div className="detail-menu-container" ref={menuRef}>
                      <button className="menu-button" onClick={() => toggleMenu(comment.commentId)}>
                        <CgMoreVertical size={20} />
                      </button>

                      {menuOpenId === comment.commentId && ( // 현재 댓글 id와 일치할 때만 메뉴 표시
                        <div className="dropdown-menu">
                          <button onClick={() => handleEdit(comment)}>수정하기</button>
                          <button onClick={() => handleDelete(comment.commentId)}>삭제하기</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="comment-content">{comment.comment}</p>
                <p className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
              </li>
            ))}
          </ul>
          ) : (
            <p>아직 댓글이 없습니다.</p>
          )}
        </div>
      );
    };
    
    export default CommentSection;
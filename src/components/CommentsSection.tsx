import React, {useEffect, useState} from "react";
import { getComments, addComment, updateComments, deleteComment } from "../api/boardApi";

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
    
      return (
        <div className="comments-section">
          <h3>댓글</h3>
    
          {/* ✅ 댓글 입력창 */}
          <div className="comment-input">
            <textarea
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleCommentSubmit}>댓글 작성</button>
          </div>
    
          {/* ✅ 기존 댓글 목록 */}
          {comments.length > 0 ? (
            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.commentId}>
                  <p>
                    <strong>{comment.nickname}</strong>: {comment.comment}
                  </p>
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
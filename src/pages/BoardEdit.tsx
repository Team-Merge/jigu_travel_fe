import React, { useEffect, useState } from "react";
import { getPostDetail, updatePost } from "../api/boardApi";
import { useNavigate, useParams } from "react-router-dom";
import BoardForm from "../components/BoardForm";
import Header from "../components/Header";
import "../styles/BoardEdit.css"

interface BoardEditProps {
  postId: number;
  goToDetail: () => void; // ✅ 수정 완료 후 상세보기로 이동
  goToList: () => void; // ✅ 취소 버튼 클릭 시 목록으로 이동
}

const BoardEdit: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  console.log(`📢 [DEBUG] postId: ${postId}`);
  console.log("📢 [DEBUG] postId:", postId);
  // const [post, setPost] = useState<any>(null);
  console.log("📢 [DEBUG] useParams():", useParams());
  const [post, setPost] = useState<{
    title: string;
    content: string;
    attachments: { fileName: string; filePath: string }[];
  } | null>(null);
  const [existingFiles, setExistingFiles] = useState<{ fileName: string; filePath: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostDetail(Number(postId));
        setPost(data);
        if (data.attachments) {
          setExistingFiles(
            data.attachments.map((file: { fileName: string; filePath: string }) => ({
              fileName: file.fileName,
              filePath: file.filePath,
            }))
          );
        }
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };
    fetchPost();
  }, [postId]);

  const handleSubmit = async (title: string, content: string, newFiles: File[], removedFiles: string[]) => {
    try {
     // const token = localStorage.getItem("token") || "";
      await updatePost(Number(postId), title, content, newFiles, removedFiles);
      // goToDetail();
      alert("게시글이 수정되었습니다.");
      navigate(`/board/${postId}`);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
    }
  };

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className="board-edit-wrapper">
    <Header/>
    <div className="board-edit-container">
      <div className="board-edit-header">
      <h2 className="qna-header">QnA 게시판</h2>
      <h2 className="title-header">게시글 수정</h2>
      </div>

      <div className="board-edit-form">
      <BoardForm 
        onSubmit={handleSubmit} 
        mode="edit" 
        boardId={Number(postId)}
        initialTitle={post?.title} 
        initialContent={post?.content} 
        initialFiles={existingFiles} // ✅ 기존 파일 목록 전달
      />
      </div>
    </div>
    </div>
  );
};

export default BoardEdit;

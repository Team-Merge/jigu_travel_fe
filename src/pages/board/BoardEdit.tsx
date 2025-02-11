import React, { useEffect, useState } from "react";
import { getPostDetail, updatePost } from "../../api/boardApi";
import { useNavigate, useParams } from "react-router-dom";
import BoardForm from "../../components/board/BoardForm";
import Header from "../../components/layout/Header";
import "../../styles/board/BoardEdit.css"


const BoardEdit: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  console.log(`postId: ${postId}`);
  console.log("postId:", postId);
  console.log("useParams():", useParams());
  const [post, setPost] = useState<{
    title: string;
    content: string;
    inquiryType: string;
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

  const handleSubmit = async (title: string, content: string, inquiryType: string, newFiles: File[], removedFiles: string[]) => {
    try {
      await updatePost(Number(postId), title, content, inquiryType, newFiles, removedFiles);
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
        initialInquiryType={post?.inquiryType}
        initialFiles={existingFiles} 
      />
      </div>
    </div>
    </div>
  );
};

export default BoardEdit;

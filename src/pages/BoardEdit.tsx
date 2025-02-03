import React, { useEffect, useState } from "react";
import { getPostDetail, updatePost } from "../api/boardApi";
import { useNavigate, useParams } from "react-router-dom";
import BoardForm from "../components/BoardForm";
import "../styles/BoardList.css"

const BoardEdit: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [post, setPost] = useState<any>(null);
  const [existingFiles, setExistingFiles] = useState<{ fileName: string; filePath: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostDetail(Number(boardId));
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
  }, [boardId]);

  const handleSubmit = async (title: string, content: string, newFiles: File[], removedFiles: string[]) => {
    try {
     // const token = localStorage.getItem("token") || "";
      await updatePost(Number(boardId), title, content, newFiles, removedFiles);
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
    }
  };

  if (!post) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>게시글 수정</h2>
      {/* <BoardForm onSubmit={handleSubmit} initialTitle={post.title} initialContent={post.content} /> */}
      {/* ✅ 기존 첨부파일 목록 표시 */}
      {/* {existingFiles.length > 0 && (
        <div>
          <h3>📎 기존 첨부파일</h3>
          <ul>
            {existingFiles.map((file) => (
              <li key={file.fileId}>
                {file.fileName} ({(file.fileSize / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )} */}
      <button onClick={() => navigate("/board/${boardId}")}>뒤로가기</button>
      <BoardForm 
        onSubmit={handleSubmit} 
        initialTitle={post?.title} 
        initialContent={post?.content} 
        initialFiles={existingFiles}
        goToList={() => navigate} // ✅ 기존 파일 목록 전달
    />

    </div>
  );
};

export default BoardEdit;

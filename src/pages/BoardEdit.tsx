import React, { useEffect, useState } from "react";
import { getPostDetail, updatePost } from "../api/boardApi";
import { useNavigate, useParams } from "react-router-dom";
import BoardForm from "../components/BoardForm";
import "../styles/BoardList.css"
import "../styles/BoardEdit.css"

interface BoardEditProps {
  postId: number;
  goToDetail: () => void; // ✅ 수정 완료 후 상세보기로 이동
  goToList: () => void; // ✅ 취소 버튼 클릭 시 목록으로 이동
}

const BoardEdit: React.FC<BoardEditProps> = ({ postId, goToDetail, goToList }) => {
  // const { boardId } = useParams<{ boardId: string }>();
  const [post, setPost] = useState<any>(null);
  const [existingFiles, setExistingFiles] = useState<{ fileName: string; filePath: string }[]>([]);
  // const navigate = useNavigate();

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
      await updatePost(postId, title, content, newFiles, removedFiles);
      goToDetail();
    } catch (error) {
      console.error("게시글 수정 실패:", error);
    }
  };

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className="board-edit-container">
      <h2 className="board-edit-title">게시글 수정</h2>
      {/* <button onClick={goToList}>뒤로가기</button> */}

      <div className="board-edit-form">
      <BoardForm 
        onSubmit={handleSubmit} 
        initialTitle={post?.title} 
        initialContent={post?.content} 
        initialFiles={existingFiles}
        goToList={goToList} // ✅ 기존 파일 목록 전달
      />
      </div>

    </div>
  );
};

export default BoardEdit;

import React, { useState } from "react";
import "../styles/BoardForm.css"
import { useNavigate } from "react-router-dom";

interface BoardFormProps {
  onSubmit: (title: string, content: string, newFiles: File[], removedFiles: string[]) => void;
  initialTitle?: string;
  initialContent?: string;
  initialFiles?: { fileName: string; filePath: string }[]; 
  mode: "create" | "edit";
  boardId?: number;
}

const BoardForm: React.FC<BoardFormProps> = ({ onSubmit, initialTitle = "", initialContent = "", initialFiles = [], mode, boardId  }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [existingFiles, setExistingFiles] = useState(initialFiles);
  const [files, setFiles] = useState<File[]>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);

  const allowedExtensions = ["jpg", "png", "jpeg", "gif", "pdf", "txt", "docx"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files) {
      const fileList = Array.from(e.target.files);

      const validFiles = fileList.filter((file) => {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        return fileExt && allowedExtensions.includes(fileExt);
      });
  
      if (validFiles.length !== fileList.length) {
        alert("허용되지 않은 파일 형식이 포함되어 있습니다.");
      }

      setFiles(fileList);
    }
  }
  const handleRemoveExistingFile = (fileName: string) => {
    setRemovedFiles([...removedFiles, fileName]);
    setExistingFiles(existingFiles.filter((file) => file.fileName !== fileName));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, content, files, removedFiles);
  };

  const handleCancel = () => {
    if (mode === "edit" && boardId) {
      navigate(`/board/${boardId}`); // 🔹 수정 모드일 때 게시글 상세 페이지로 이동
    } else {
      navigate("/board"); // 🔹 작성 모드일 때 게시글 목록으로 이동
    }
  };

  return (
    <div className="board-form-container">
    <form onSubmit={handleSubmit} className="board-form">
      {/* 제목 필드 */}
      <div className="form-group">
        <label htmlFor="title" className="required">제목</label>
        <input 
          type="text" 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          placeholder="제목을 입력해 주세요." 
        />
      </div>

      {/* 내용 필드 */}
      <div className="form-group">
        <label htmlFor="content" className="required">문의 내용</label>
        <textarea 
          id="content" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          placeholder="문의 내용을 입력해 주세요."
          rows={6}
        />
      </div>

      {/* 파일 업로드 필드 */}
      <div className="form-group file-upload-group">
        <label className="file-label">파일 첨부</label>
        <div className="file-upload-container">
          <input type="file" id="file-upload" multiple onChange={handleFileChange} className="file-input" />
        </div>
      </div>

      {/* ✅ 기존 파일 목록 표시 & 삭제 버튼 추가 */}
      {existingFiles.length > 0 && (
        <div>
          <h3>📎 기존 첨부파일</h3>
          <ul>
            {existingFiles.map((file) => (
              <li key={file.fileName}>
                {file.fileName} 
                <button type="button" onClick={() => handleRemoveExistingFile(file.fileName)}> ❌ 삭제 </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="board-buttons">
        <button type="button" className="back-button" onClick={handleCancel}>취소</button>
        <button type="submit" className="submit-button">저장</button>
      </div>
    </form>
    </div>
  );
};

export default BoardForm;

import React, { useState } from "react";

interface BoardFormProps {
  onSubmit: (title: string, content: string) => void;
  initialTitle?: string;
  initialContent?: string;
}

const BoardForm: React.FC<BoardFormProps> = ({ onSubmit, initialTitle = "", initialContent = "" }) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, content);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>제목:</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label>내용:</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
      <button type="submit">저장</button>
    </form>
  );
};

export default BoardForm;

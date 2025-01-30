import React from "react";
import { useNavigate } from "react-router-dom";

interface BoardItemProps {
  boardId: number;
  title: string;
  nickname: string;
}

const BoardItem: React.FC<BoardItemProps> = ({ boardId, title, nickname }) => {
  const navigate = useNavigate();

  return (
    <li onClick={() => navigate(`/board/${boardId}`)}>
      <strong>{title}</strong> - {nickname}
    </li>
  );
};

export default BoardItem;

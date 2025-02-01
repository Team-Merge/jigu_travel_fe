import { fetchWithAuth } from "../utils/api";

// ✅ API 기본 URL 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:8080"
    : "http://jigu-travel.kro.kr:8080");

/** 📌 게시글 목록 조회 (GET) */
export const getBoardList = async (page = 0, size = 5) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/board/list?page=${page}&size=${size}`);
  return response.data.content;
};

/** 📌 게시글 작성 (POST) */
export const createPost = async (title: string, content: string) => {
  return fetchWithAuth(`${API_BASE_URL}/board/posts`, {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
};

/** 📌 게시글 상세 조회 (GET) */
export const getPostDetail = async (boardId: number) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/board/detail/${boardId}`);
  return response.data;
};

/** 📌 게시글 수정 (PATCH) */
export const updatePost = async (boardId: number, title: string, content: string) => {
  return fetchWithAuth(`${API_BASE_URL}/board/update`, {
    method: "PATCH",
    body: JSON.stringify({ boardId, title, content }),
  });
};

/** 📌 게시글 삭제 (DELETE) */
export const deletePost = async (boardId: number) => {
  return fetchWithAuth(`${API_BASE_URL}/board/deletion?boardId=${boardId}`, {
    method: "DELETE",
  });
};
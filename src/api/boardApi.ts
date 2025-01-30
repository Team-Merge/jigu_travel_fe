// import axios from "axios";

// // ✅ 환경에 따라 API_BASE_URL 자동 설정
// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL ||
//   (import.meta.env.MODE === "development"
//     ? "http://localhost:8080/board"
//     : "http://jigu-travel.kro.kr:8080/board");

// // ✅ Axios 인스턴스 생성
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
// });

// // ✅ 요청 시 `Bearer ` 접두어 추가하여 토큰 포함
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("jwt"); // ✅ "jwt" 키 사용
//   console.log("🔹 [DEBUG] 저장된 토큰:", token);

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`; // ✅ `Bearer ` 접두어 추가
//   } else {
//     console.warn("⚠️ [DEBUG] 토큰 없음 - 인증 필요한 요청이 실패할 수 있음");
//   }
//   return config;
// });

// // ✅ 응답 인터셉터 (401 Unauthorized 시 로그만 출력)
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       console.error("❌ [DEBUG] 401 Unauthorized - 로그인 필요");
//     }
//     return Promise.reject(error);
//   }
// );

// // ✅ 게시글 목록 조회
// export const getBoardList = async (page = 0, size = 5) => {
//   const response = await apiClient.get(`/board/list`, { params: { page, size } });
//   return response.data.data.content;
// };

// // ✅ 게시글 작성
// export const createPost = async (title: string, content: string) => {
//   await apiClient.post(`/board/posts`, { title, content });
// };

// // ✅ 게시글 상세 조회
// export const getPostDetail = async (boardId: number) => {
//   const response = await apiClient.get(`/board/detail/${boardId}`);
//   return response.data.data;
// };

// // ✅ 게시글 수정
// export const updatePost = async (boardId: number, title: string, content: string) => {
//   await apiClient.patch(`/board/update`, { boardId, title, content });
// };

// // ✅ 게시글 삭제
// export const deletePost = async (boardId: number) => {
//   await apiClient.delete(`/board/deletion`, { params: { boardId } });
// };

// export default apiClient;
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
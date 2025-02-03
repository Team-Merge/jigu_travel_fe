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
export const createPost = async (title: string, content: string, files?: File[]) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  

  // if (files) {
  //   Array.from(files).forEach((file) => formData.append("files", file));
  //   console.log("📁 [DEBUG] 업로드할 파일 개수::", files.length); // ✅ 업로드할 파일명 출력
  // }
  if(files) {
    files.forEach((file) => formData.append("files", file)); // ✅ 여러 개의 파일 추가
    console.log("📁 [DEBUG] 업로드할 파일 개수::", files.length);
  }
  // 🔥 FormData 내부 값을 출력 (디버깅용)
  for (let [key, value] of formData.entries()) {
    console.log(`📝 [DEBUG] FormData key: ${key}, value:`, value);
  }
  
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/board/posts`, {
      method: "POST",
      body: formData, // ✅ FormData 사용
    });

    console.log("✅ [DEBUG] 게시글 작성 성공:", response);
    return response;
  } catch (error) {
    console.error("❌ [ERROR] 게시글 작성 실패:", error);
    throw error;
  }
};

/** 📌 게시글 상세 조회 (GET) */
export const getPostDetail = async (boardId: number) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/board/detail/${boardId}`);
  return response.data;
};

/** 📌 게시글 수정 (PATCH) */
export const updatePost = async (boardId: number, title: string, content: string, files?: File[], removedFiles?: string[]) => {
  const formData = new FormData();
  formData.append("boardId", boardId.toString());
  formData.append("title", title);
  formData.append("content", content);

  if (files && files.length > 0) {
    files.forEach((file) => formData.append("files", file));
    console.log("📁 [DEBUG] 업로드할 파일 개수:", files.length); // ✅ 업로드할 파일명 출력
  }

  // ✅ 삭제할 파일 목록이 존재할 경우에만 추가
  if (removedFiles && removedFiles.length > 0) {
    removedFiles.forEach((fileName) => formData.append("removedFiles", fileName));
    console.log("🗑 [DEBUG] 삭제할 파일 개수:", removedFiles.length);
  }
  return fetchWithAuth(`${API_BASE_URL}/board/update`, {
    method: "PATCH",
    body: formData,
  });
};

/** 📌 게시글 삭제 (DELETE) */
export const deletePost = async (boardId: number) => {
  return fetchWithAuth(`${API_BASE_URL}/board/deletion?boardId=${boardId}`, {
    method: "DELETE",
  });
};
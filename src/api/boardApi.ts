import { fetchWithAuth } from "../utils/api";

// API 기본 URL 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:8080"
    : "http://jigu-travel.kro.kr:8080");

/** 게시글 목록 조회 (GET) */
export const getBoardList = async (page = 0, size = 5) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/board/list?page=${page}&size=${size}`);
  // return response.data;
  // const json = await response.json();

    console.log("[DEBUG] API 응답 데이터:", response);
    return response;

};

/** 게시글 작성 (POST) */
export const createPost = async (title: string, content: string, inquiryType: string, files?: File[]) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  formData.append("inquiryType", inquiryType);
  
  if(files) {
    files.forEach((file) => formData.append("files", file)); 
    console.log("📁 [DEBUG] 업로드할 파일 개수::", files.length);
  }
  // FormData 내부 값을 출력 (디버깅용)
  for (let [key, value] of formData.entries()) {
    console.log(`[DEBUG] FormData key: ${key}, value:`, value);
  }
  
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/board/posts`, {
      method: "POST",
      body: formData, 
    });

    console.log("[DEBUG] 게시글 작성 성공:", response);
    return response;
  } catch (error) {
    console.error("[ERROR] 게시글 작성 실패:", error);
    throw error;
  }
};

/** 게시글 상세 조회 (GET) */
export const getPostDetail = async (boardId: number) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/board/detail/${boardId}`);
  return response.data;
};

/** 게시글 수정 (PATCH) */
export const updatePost = async (boardId: number, title: string, content: string, inquiryType: string, files?: File[], removedFiles?: string[]) => {
  const formData = new FormData();
  formData.append("boardId", boardId.toString());
  formData.append("title", title);
  formData.append("content", content);
  formData.append("inquiryType", inquiryType);

  if (files && files.length > 0) {
    files.forEach((file) => formData.append("files", file));
    console.log("[DEBUG] 업로드할 파일 개수:", files.length, "[DEBUG] 업로드하는 파일 이름:", files.map(file => file.name)); 
  }

  // 삭제할 파일 목록이 존재할 경우에만 추가
  if (removedFiles && removedFiles.length > 0) {
    removedFiles.forEach((fileName) => formData.append("removedFiles", fileName));
    console.log("[DEBUG] 삭제할 파일 개수:", removedFiles.length);
  }
  // return fetchWithAuth(`${API_BASE_URL}/api/board/update`, {
  //   method: "PATCH",
  //   body: formData,
  // });

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/board/update`, {
      method: "PATCH",
      body: formData, 
    });

    console.log("[DEBUG] 게시글 수정 성공:", response);
    return response;
  } catch (error) {
    console.error("[ERROR] 게시글 수정 실패:", error);
    throw error;
  }
};

/** 게시글 삭제 (DELETE) */
export const deletePost = async (boardId: number) => {
  return fetchWithAuth(`${API_BASE_URL}/api/board/deletion?boardId=${boardId}`, {
    method: "DELETE",
  });
};

/** 첨부파일 다운로드 */
export const downloadFile = async (fileName: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/download?fileName=${encodeURIComponent(fileName)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`파일 다운로드 실패: ${response.status} ${response.statusText}`);
  }
  console.log("response.status:", response.status);

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Blob URL 해제
  window.URL.revokeObjectURL(url);
};

// 댓글 조회
export const getComments = async (boardId: number) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/comments/${boardId}`);
  return response.data;
}

// 댓글 작성
export const addComment = async (boardId: number, content: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/comments`, {
    method: "POST",
    body: JSON.stringify({ boardId, content }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// 댓글 수정
export const updateComments = async (commentId: number, content: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// 댓글 삭제
export const deleteComment = async (commentId: number) => {
  try {
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken) {
      throw new Error("JWT 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
    }

    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 204 No Content 응답 처리
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      console.log(`[DEBUG] 댓글 삭제 완료 - ID: ${commentId}`);
      return; // JSON 파싱을 하지 않도록 함
    }

    return await response.json(); // 혹시라도 JSON 응답이 있을 경우 대비
  } catch (error) {
    console.error("[ERROR] 댓글 삭제 실패:", error);
    throw error;
  }
};

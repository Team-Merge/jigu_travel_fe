import axios, { AxiosError } from "axios";

// src/utils/api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:8080"
    : "http://jigu-travel.kro.kr:8080");

/** 로그인 */
export const login = async (loginId: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId, password }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("로그인 실패");

    const responseData = await response.json();
    if (responseData.code !== 200) throw new Error(responseData.message);

    localStorage.setItem("jwt", responseData.data.accessToken);
    console.log("저장된 JWT:", responseData.data.accessToken);

    return responseData.data;
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

/** 회원가입 */
export const register = async (userData: {
  loginId: string;
  password: string;
  nickname: string;
  birthDate: string;
  gender: string;
}) => {
  try {
    console.log("회원가입 요청 데이터:", userData);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();
    if (responseData.code !== 200) throw new Error(responseData.message);

    console.log("회원가입 성공:", responseData.message);
    return responseData;
  } catch (error) {
    console.error("회원가입 오류:", error);
    throw error;
  }
};

/** Access Token 갱신 (Refresh Token 사용) */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    console.log("Access Token 갱신 요청...");
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    const responseData = await response.json();
    if (responseData.code !== 200) throw new Error(responseData.message);

    const newAccessToken = responseData.data.accessToken;
    console.log("새 Access Token 발급 성공:", newAccessToken);

    localStorage.setItem("jwt", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Access Token 갱신 실패:", error);
    return null;
  }
};
export const fetchWithAuth = async <T = any>(url: string, options: RequestInit = {}, retry = true): Promise<T> => {
  let jwtToken = localStorage.getItem("jwt");
  if (!jwtToken) throw new Error("JWT 토큰 없음. 로그인 필요");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  });

  // ✅ 403 Forbidden: 권한이 없으므로 Access Token 갱신 X
  if (response.status === 403) {
    console.warn("🚨 [DEBUG] 403 Forbidden - 권한 없음");
    throw new Error("권한이 없습니다.");
  }

  // ✅ 401 Unauthorized: Access Token 만료 확인 후 갱신 시도
  if (response.status === 401) {
    console.warn("⏳ [DEBUG] 401 Unauthorized - Access Token 만료 확인 중...");

    if (!retry) throw new Error("Access Token 갱신 실패. 다시 로그인 필요.");

    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) throw new Error("토큰 갱신 실패. 다시 로그인 필요.");

    // 새 Access Token 저장 후, 재요청 (최대 1회만)
    localStorage.setItem("jwt", newAccessToken);
    return fetchWithAuth<T>(url, options, false);
  }

  return response.json() as Promise<T>;
};

/** 사용자 정보 타입 정의 */
export interface UserInfo {
  userId: string;
  loginId: string;
  nickname: string;
  birthDate: string;
  gender: string;
  location: string;
  role: string;
  isAdmin: boolean;
}

/** 사용자 정보 가져오기 */
export const getUserInfo = async () => {
  const responseData = await fetchWithAuth(`${API_BASE_URL}/api/user/me`);
  
  console.log("[getUserInfo] 응답 데이터:", responseData);
  return responseData.data;
};

/** 로그아웃 */
export const logout = async () => {
  await fetchWithAuth(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
  localStorage.removeItem("jwt");
};

/** FastAPI 추천 요청 타입 */
export interface RecommendationRequest {
  age: number;
  gender: number;
  annual_travel_frequency: number;
  selected_genres: string[];
  method: string;
}

/** FastAPI 추천 응답 타입 */
export interface RecommendationResponse {
  category_scores: Record<string, number>;
  top2_recommendations: string[];
}

/** FastAPI로 추천 요청 보내기 (`category_scores` 포함) */
export const getRecommendations = async (requestData: RecommendationRequest): Promise<RecommendationResponse> => {
  console.log("[DEBUG] 요청 데이터:", JSON.stringify(requestData));

  // `fetchWithAuth`에서 이미 JSON으로 변환되므로 `response.json()` 호출 불필요
  const responseData = await fetchWithAuth(`${API_BASE_URL}/api/ai/ai_classification/fetch`, {
    method: "POST",
    body: JSON.stringify(requestData),
  });

  console.log("[DEBUG] FastAPI 응답 (정제됨):", responseData);

  if (responseData.code !== 200) {
    throw new Error(`FastAPI 오류: ${responseData.message}`);
  }

  return responseData.data; // 중첩된 `data`만 반환
};

/** AI-GUIDE : 채팅 기록 가져오기**/
export const getChatHistory = async (offset: number, limit: number) => {
  const jwtToken = localStorage.getItem("jwt");
  if (!jwtToken) throw new Error("JWT 토큰 없음");

  const response = await fetch(`${API_BASE_URL}/api/ai-guide/get-chat-history?offset=${offset}&limit=${limit}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  if (!response.ok) throw new Error("대화 기록 불러오기 실패");
  return response.json();
};

/** AI-GUIDE : 텍스트 질문 요청**/
export const sendTextQuestion = async (textQuestion: string) => {
  const jwtToken = localStorage.getItem("jwt");
  if (!jwtToken) throw new Error("JWT 토큰 없음");

  const response = await fetch(`${API_BASE_URL}/api/ai-guide/upload-text`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_question: textQuestion }),
  });

  if (!response.ok) throw new Error("질문 전송 실패");
  return response.json();
};

/** AI-GUIDE : 음성 질문 요청**/
export const sendAudio = async (audioBlob: Blob) => {
  const jwtToken = localStorage.getItem("jwt");
  if (!jwtToken) throw new Error("JWT 토큰 없음");

  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");

  const response = await fetch(`${API_BASE_URL}/api/ai-guide/upload-audio`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwtToken}` },
    body: formData,
  });

  if (!response.ok) throw new Error("오디오 전송 실패");
  return response.json();
};

/** 닉네임 중복 확인 */
export const checkNickname = async (nickname: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/check-nickname`, {
      params: { nickname },
    });
    return response.data;
  } catch (error) {
    // error를 AxiosError 타입으로 캐스팅
    const axiosError = error as AxiosError;
    
    return axiosError.response?.data || { code: 500, message: "서버 오류", data: false };
  }
};

/** 아이디 중복 확인 API */
export const checkLoginId = async (loginId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/check-loginId`, {
      params: { loginId },
    });
    return response.data;
  } catch (error) {
    // error를 AxiosError 타입으로 캐스팅
    const axiosError = error as AxiosError;
    
    return axiosError.response?.data || { code: 500, message: "서버 오류", data: false };
  }
};
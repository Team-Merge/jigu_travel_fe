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

  // 403 Forbidden: 권한이 없으므로 Access Token 갱신 X
  if (response.status === 403) {
    console.warn("[DEBUG] 403 Forbidden - 권한 없음");
    throw new Error("권한이 없습니다.");
  }

  // 401 Unauthorized: Access Token 만료 확인 후 갱신 시도
  if (response.status === 401) {
    console.warn("[DEBUG] 401 Unauthorized - Access Token 만료 확인 중...");

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

export interface Place {
  placeId: number;
  name: string;
  address: string;
  tel?: string;
  latitude: number;
  longitude: number;
  types: string[]; // 카테고리 정보
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

/** MAP : 네이버맵 API KEY 반환 **/
export const loadApiKey = async (): Promise<string | null> => {
  try {
    const response = await fetch("/service_account_key.json");
    if (!response.ok) {
      throw new Error(`JSON 파일을 불러올 수 없습니다. 상태 코드: ${response.status}`);
    }
    const data = await response.json();

    if (!data.NAVER_MAP_API_KEY) {
      throw new Error("네이버 API 키가 JSON 파일에 없습니다.");
    }
    return data.NAVER_MAP_API_KEY;
  } catch (error) {
    console.error("API 키 로드 중 오류 발생:", error);
    return null;
  }
};

/** MAP : 사용자 위치 저장 **/
export const saveUserLocation = async (latitude: number, longitude: number): Promise<void> => {
  try {
      const jwtToken = localStorage.getItem("jwt");
      if (!jwtToken) throw new Error("JWT 토큰 없음");

    const response = await fetch(`${API_BASE_URL}/location/user-location`, {
      method: "POST",
      headers: {
          Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude }),
      credentials: "include"
    });

    if (!response.ok) throw new Error("위치 저장 실패");

    const data = await response.json();
    console.log("위치 저장 성공:", data);
  } catch (error) {
    console.error("saveUserLocation 에러 발생:", error);
  }
};

/** MAP : 위치 기반 주변 명소 검색**/
export const fetchNearbyPlaces = async (lat: number, lng: number): Promise<Place[]> => {
  try {
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken) throw new Error("JWT 토큰 없음");

    const response = await fetch(`${API_BASE_URL}/place/nearby-places?latitude=${lat}&longitude=${lng}&radius=1.0`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",  // 캐시 무시하도록 설정
        Pragma: "no-cache",
        Expires: "0"
      },
    });

    if (!response.ok) throw new Error("명소 정보를 가져올 수 없음");

    const data = await response.json();
    console.log("서버 응답 데이터:", data);

    return data.data || [];
  } catch (error) {
    console.error("fetchNearbyPlaces 에러 발생:", error);
    return [];
  }
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


/** 관심사 존재 여부 체크 */
// export const checkUserInterest = async () => {
//   const response = await axios.get(`${API_BASE_URL}/api/ai/ai_classification/exists`, {
//     withCredentials: true, // 로그인 상태 유지
//   });
//   return response.data.data; // true (관심사 있음) / false (관심사 없음)
// };

export const checkUserInterest = async () => {
  try {
    const jwtToken = localStorage.getItem("jwt");
    const response = await axios.get(`${API_BASE_URL}/api/ai/ai_classification/exists`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // JWT 토큰 추가
      },
      withCredentials: true, // 로그인 세션 유지
    });
    return response.data.data; // true (관심사 있음) / false (관심사 없음)
  } catch (error) {
    console.error("관심사 확인 API 호출 실패:", error);
    return false; // 기본값 반환 (에러 발생 시 false 처리)
  }
};

/**객체탐지: response**/

export interface Detection {
  className: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
/**객체탐지: request**/
export const sendImageToAPI = async (file: File): Promise<Detection[]> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/image/image_search`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log("객체 탐지 결과:", data);

    if (data.data && data.data.detections && data.data.detections.length > 0) {
      return data.data.detections;
    }
  } catch (error) {
    console.error("객체 탐지 API 호출 실패:", error);
  }
  return [];
};

/** 사용자 관심사 (카테고리) 불러오기 */
export const getUserInterest = async (): Promise<string[]> => {
  try {
    const responseData = await fetchWithAuth(`${API_BASE_URL}/api/ai/ai_classification/get-user-interest`);
    
    if (!responseData.data) {
      console.warn("사용자 관심사 없음");
      return [];
    }

    const { interest, interest2 } = responseData.data;
    return [interest, interest2];  // ✅ 관심사 2개 배열로 반환
  } catch (error) {
    console.error("사용자 관심사 불러오기 실패:", error);
    return [];
  }
};

/** 모든 장소 불러오기 (페이징 적용) */
export const fetchPlaces = async (page: number, size: number, category: string): Promise<Place[]> => {
  try {
    const responseData = await fetchWithAuth(
      `${API_BASE_URL}/place/all?page=${page}&size=${size}`
    );

    if (!responseData.data) {
      console.warn("장소 데이터 없음");
      return [];
    }

    // 카테고리가 '전체'가 아닐 경우 필터링
    return category === "전체"
      ? responseData.data
      : responseData.data.filter((place: any) => place.types.includes(category));
  } catch (error) {
    console.error("장소 데이터 불러오기 실패:", error);
    return [];
  }
};

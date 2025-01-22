// src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

/** Access Token 갱신 (Refresh Token 사용) */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    console.log("🔄 Access Token 갱신 요청...");
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

/** 공통 API 요청 함수 (모든 API 요청에서 사용) */
export const fetchWithAuth = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
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

  if (response.status === 401) {
    console.log("⏳ Access Token 만료됨, 갱신 시도...");
    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) throw new Error("토큰 갱신 실패. 다시 로그인 필요.");

    return fetchWithAuth<T>(url, options);
  }

  return response.json() as Promise<T>;
};

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

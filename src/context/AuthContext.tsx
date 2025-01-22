// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import { getUserInfo, refreshAccessToken, logout } from "../utils/api";

interface AuthContextType {
  user: any;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let userData = await getUserInfo();
        setUser(userData);
      } catch (error) {
        console.warn("⏳ Access Token 만료됨. 갱신 시도...");
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          try {
            let userData = await getUserInfo();
            setUser(userData);
          } catch (error) {
            console.error("사용자 정보 가져오기 실패:", error);
          }
        }
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

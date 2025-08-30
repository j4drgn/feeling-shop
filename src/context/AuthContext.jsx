import { createContext, useState, useContext, useEffect } from "react";

// 인증 컨텍스트 생성
export const AuthContext = createContext();

// 인증 컨텍스트 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 토큰 저장 함수
  const saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  // 토큰 가져오기 함수
  const getTokens = () => {
    return {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  };

  // 토큰 삭제 함수 (로그아웃)
  const removeTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  // 로그인 함수
  const login = async (tokens) => {
    try {
      // 토큰 저장
      saveTokens(tokens.accessToken, tokens.refreshToken);

      // 사용자 정보 가져오기
      const userInfo = await fetchUserInfo(tokens.accessToken);
      setUser(userInfo);
      setIsAuthenticated(true);
      setAuthError(null);
      return userInfo;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    removeTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  // 사용자 정보 가져오기 함수
  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await fetch("http://localhost:8080/api/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("사용자 정보 가져오기 오류:", error);
      throw error;
    }
  };

  // 토큰 갱신 함수
  const refreshToken = async () => {
    try {
      const { refreshToken } = getTokens();

      if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      const response = await fetch("http://localhost:8080/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("토큰 갱신에 실패했습니다.");
      }

      const data = await response.json();
      saveTokens(data.data.accessToken, data.data.refreshToken);
      return data.data;
    } catch (error) {
      console.error("토큰 갱신 오류:", error);
      logout();
      throw error;
    }
  };

  // 앱 시작 시 토큰 확인 및 사용자 정보 로드
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const { accessToken } = getTokens();

        if (accessToken) {
          // 토큰이 있으면 사용자 정보 가져오기
          const userInfo = await fetchUserInfo(accessToken);
          setUser(userInfo);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("인증 초기화 오류:", error);
        // 토큰이 유효하지 않으면 리프레시 시도
        try {
          await refreshToken();
          const { accessToken } = getTokens();
          const userInfo = await fetchUserInfo(accessToken);
          setUser(userInfo);
          setIsAuthenticated(true);
        } catch (refreshError) {
          // 리프레시도 실패하면 로그아웃
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 카카오 로그인 콜백 처리 함수
  const handleKakaoCallback = async (code) => {
    try {
      // 서버에 인증 코드 전송
      const response = await fetch(
        "http://localhost:8080/api/auth/kakao/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        throw new Error("카카오 로그인에 실패했습니다.");
      }

      const data = await response.json();

      // 토큰 저장 및 사용자 정보 설정
      await login(data.data);
      return true;
    } catch (error) {
      console.error("카카오 콜백 처리 오류:", error);
      setAuthError(error.message);
      return false;
    }
  };

  // 컨텍스트 값
  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    refreshToken,
    handleKakaoCallback,
    getTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내에서 사용해야 합니다.");
  }
  return context;
};

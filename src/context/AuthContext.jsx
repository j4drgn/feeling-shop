import { createContext, useState, useContext, useEffect } from "react";
import authApi from "@/api/authApi";

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
      console.log('AuthContext login 시작, tokens:', tokens);
      // 토큰 저장
      saveTokens(tokens.accessToken, tokens.refreshToken);
      console.log('토큰 저장 완료');

      // 사용자 정보 가져오기
      const userInfo = await fetchUserInfo(tokens.accessToken);
      console.log('사용자 정보:', userInfo);
      setUser(userInfo);
      setIsAuthenticated(true);
      setAuthError(null);
      return userInfo;
    } catch (error) {
      console.log('AuthContext login 에러:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    removeTokens();
    localStorage.removeItem("isAuthenticated");
    setUser(null);
    setIsAuthenticated(false);
  };

  // 사용자 정보 가져오기 함수
  const fetchUserInfo = async (accessToken) => {
    try {
      console.log('fetchUserInfo 호출, token:', accessToken);
      const response = await authApi.getUserMe(accessToken);
      console.log('fetchUserInfo 데이터:', response);
      return response.data; // 백엔드 응답 구조에 맞게 수정
    } catch (error) {
      console.error("사용자 정보 가져오기 오류:", error);
      throw error;
    }
  };

  // 토큰 갱신 함수
  const refreshToken = async () => {
    try {
      const { refreshToken: token } = getTokens();

      if (!token) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      const response = await authApi.refreshToken(token);
      saveTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
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
        } else {
          // 토큰이 없으면 인증되지 않은 상태
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("인증 초기화 오류:", error);
        // 토큰이 유효하지 않으면 로그아웃
        logout();
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
        "http://localhost:8090/api/auth/kakao/callback",
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

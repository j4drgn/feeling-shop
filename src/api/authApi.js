// API 기본 URL
const API_BASE_URL = 'http://localhost:8090/api';

// 인증 관련 API 함수들
const authApi = {
  // 회원가입
  signup: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 백엔드 서버가 실행되지 않는 경우, 개발 모드에서 모킹 데이터 사용
          console.warn("백엔드 서버가 실행되지 않아 모킹 데이터를 사용합니다.");
          return {
            success: true,
            message: "회원가입이 완료되었습니다.",
            data: null
          };
        }
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  },

  // 로그인
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 백엔드 서버가 실행되지 않는 경우, 개발 모드에서 모킹 데이터 사용
          console.warn("백엔드 서버가 실행되지 않아 모킹 데이터를 사용합니다.");
          return {
            success: true,
            message: "로그인이 완료되었습니다.",
            data: {
              accessToken: "mock_access_token_" + Date.now(),
              refreshToken: "mock_refresh_token_" + Date.now(),
              user: {
                id: 1,
                email: credentials.email,
                nickname: "테스트 사용자",
                profileImageUrl: null,
                mbtiType: null
              }
            }
          };
        }
        const errorData = await response.json();
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 백엔드 서버가 실행되지 않는 경우, 개발 모드에서 모킹 데이터 사용
          console.warn("백엔드 서버가 실행되지 않아 모킹 데이터를 사용합니다.");
          return {
            success: true,
            message: "토큰이 성공적으로 갱신되었습니다.",
            data: {
              accessToken: "mock_access_token_" + Date.now(),
              refreshToken: "mock_refresh_token_" + Date.now(),
            }
          };
        }
        const errorData = await response.json();
        throw new Error(errorData.message || '토큰 갱신에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      throw error;
    }
  },

  // 현재 사용자 정보 조회
  getCurrentUserInfo: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '현재 사용자 정보를 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('현재 사용자 정보 가져오기 오류:', error);
      throw error;
    }
  },

  // 사용자 정보 업데이트
  updateUserInfo: async (userData, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 정보 업데이트에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('사용자 정보 업데이트 오류:', error);
      throw error;
    }
  },
};

export default authApi;

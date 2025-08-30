// API 기본 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 인증 관련 API 함수들
const authApi = {
  // 카카오 로그인 URL 가져오기
  getKakaoLoginUrl: () => {
    return `${API_BASE_URL}/auth/kakao`;
  },

  // 카카오 콜백 처리
  handleKakaoCallback: async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/kakao/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '카카오 로그인에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('카카오 콜백 처리 오류:', error);
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
        const errorData = await response.json();
        throw new Error(errorData.message || '토큰 갱신에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      throw error;
    }
  },

  // 사용자 정보 가져오기
  getUserInfo: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 정보를 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  logout: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로그아웃에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  },
};

export default authApi;

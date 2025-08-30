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
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
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
  // 서버가 응답하지 않거나 에러를 반환하면 그대로 예외로 처리
        const errorData = await response.json();
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
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
  // 서버가 응답하지 않거나 에러를 반환하면 그대로 예외로 처리
        const errorData = await response.json();
        throw new Error(errorData.message || '토큰 갱신에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 현재 사용자 정보 조회 (UserController)
  getUserMe: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
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
      throw error;
    }
  },

  // 사용자 정보 업데이트
  updateUserInfo: async (userData, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
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
      throw error;
    }
  },

  // 사용자 프로필 조회
  getUserProfile: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 프로필을 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 사용자 프로필 업데이트
  updateUserProfile: async (profileData, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 프로필 업데이트에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },
};

export default authApi;

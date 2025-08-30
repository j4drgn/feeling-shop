// API 기본 URL
const API_BASE_URL = 'http://localhost:8090/api';

// 건강 체크 관련 API 함수들
const healthApi = {
  // 서버 상태 확인
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 상태 확인에 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('서버 상태 확인 오류:', error);
      throw error;
    }
  },
};

export default healthApi;

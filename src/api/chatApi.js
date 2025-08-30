// API 기본 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 인증 헤더 생성 함수
const createAuthHeader = (accessToken) => {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

// 채팅 관련 API 함수들
const chatApi = {
  // ChatGPT 단일 메시지 전송
  sendChatMessage: async (message, emotionType, emotionScore, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatgpt/chat`, {
        method: 'POST',
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({
          message,
          emotionType,
          emotionScore,
          chatSessionId: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '메시지 전송에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      throw error;
    }
  },

  // 세션 기반 메시지 전송
  sendSessionMessage: async (sessionId, message, emotionType, emotionScore, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatgpt/chat/session/${sessionId}`, {
        method: 'POST',
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({
          message,
          emotionType,
          emotionScore,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '세션 메시지 전송에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('세션 메시지 전송 오류:', error);
      throw error;
    }
  },

  // 채팅 세션 생성
  createChatSession: async (title, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '채팅 세션 생성에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('채팅 세션 생성 오류:', error);
      throw error;
    }
  },

  // 채팅 세션 목록 가져오기
  getChatSessions: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        headers: createAuthHeader(accessToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '채팅 세션 목록을 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('채팅 세션 목록 가져오기 오류:', error);
      throw error;
    }
  },

  // 특정 세션의 메시지 목록 가져오기
  getSessionMessages: async (sessionId, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
        headers: createAuthHeader(accessToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '세션 메시지를 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('세션 메시지 가져오기 오류:', error);
      throw error;
    }
  },
};

export default chatApi;

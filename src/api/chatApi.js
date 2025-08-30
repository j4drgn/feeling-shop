// API 기본 URL
const API_BASE_URL = "http://localhost:8090/api";

// 인증 헤더 생성 함수
const createAuthHeader = (accessToken) => {
  if (!accessToken) {
    return {
      "Content-Type": "application/json",
    };
  }
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

// 채팅 관련 API 함수들
const chatApi = {
  // ChatGPT 단일 메시지 전송 (세션 기반으로 변경)
  sendChatMessage: async (message, emotionType, emotionScore, accessToken, sessionId = null) => {
    try {
      // 세션 ID가 없으면 새 세션 생성
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        console.log("세션 ID가 없어 새 세션 생성 시도");
        const sessionResponse = await chatApi.createChatSession(`대화 ${new Date().toLocaleString("ko-KR")}`, accessToken);
        console.log("세션 생성 응답:", sessionResponse);
        let sessionId = null;
        if (sessionResponse && sessionResponse.data) {
          if (sessionResponse.data.data && sessionResponse.data.data.id) {
            sessionId = sessionResponse.data.data.id;
          } else if (sessionResponse.data.id) {
            sessionId = sessionResponse.data.id;
          } else if (sessionResponse.data.sessionId) {
            sessionId = sessionResponse.data.sessionId;
          }
        }
        if (sessionId) {
          currentSessionId = sessionId;
          console.log("새 세션 ID:", currentSessionId);
        } else {
          console.error("세션 생성 응답에서 ID를 찾을 수 없음:", sessionResponse);
          throw new Error("세션 생성 실패");
        }
      }

      // 세션 기반 메시지 전송
      const response = await fetch(
        `${API_BASE_URL}/chatgpt/chat/session/${currentSessionId}`,
        {
          method: "POST",
          headers: createAuthHeader(accessToken),
          body: JSON.stringify({
            message,
            emotionType,
            emotionScore,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      // 세션 ID를 응답에 포함
      return { ...responseData, sessionId: currentSessionId };
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      throw error;
    }
  },

  // 세션 기반 메시지 전송
  sendSessionMessage: async (
    sessionId,
    message,
    emotionType,
    emotionScore,
    accessToken
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chatgpt/chat/session/${sessionId}`,
        {
          method: "POST",
          headers: createAuthHeader(accessToken),
          body: JSON.stringify({
            message,
            emotionType,
            emotionScore,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("세션 메시지 전송 오류:", error);
      throw error;
    }
  },

  // 채팅 세션 생성
  createChatSession: async (title, accessToken) => {
    try {
      console.log("채팅 세션 생성 요청:", title, "토큰:", accessToken ? "있음" : "없음");
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: "POST",
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("세션 생성 HTTP 오류:", response.status, errorData);
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("세션 생성 성공 응답:", responseData);
      return responseData;
    } catch (error) {
      console.error("채팅 세션 생성 오류:", error);
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
        throw new Error(
          errorData.message || "채팅 세션 목록을 가져오는데 실패했습니다."
        );
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("채팅 세션 목록 가져오기 오류:", error);
      throw error;
    }
  },

  // 특정 채팅 세션 정보 가져오기
  getSession: async (sessionId, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        headers: createAuthHeader(accessToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "채팅 세션 정보를 가져오는데 실패했습니다.");
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("채팅 세션 정보 가져오기 오류:", error);
      throw error;
    }
  },

  // 채팅 세션 업데이트
  updateSession: async (sessionId, title, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: "PUT",
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "채팅 세션 업데이트에 실패했습니다.");
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("채팅 세션 업데이트 오류:", error);
      throw error;
    }
  },

  // 채팅 세션 삭제
  deleteSession: async (sessionId, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: "DELETE",
        headers: createAuthHeader(accessToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "채팅 세션 삭제에 실패했습니다.");
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("채팅 세션 삭제 오류:", error);
      throw error;
    }
  },

  // 메시지 저장
  saveMessage: async (messageData, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: "POST",
        headers: createAuthHeader(accessToken),
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "메시지 저장에 실패했습니다.");
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("메시지 저장 오류:", error);
      throw error;
    }
  },

  // 메시지 목록 가져오기 (페이징)
  getMessages: async (page = 0, size = 10, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages?page=${page}&size=${size}`, {
        headers: createAuthHeader(accessToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "메시지 목록을 가져오는데 실패했습니다.");
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("메시지 목록 가져오기 오류:", error);
      throw error;
    }
  },

  // 특정 세션의 메시지 목록 가져오기
  getSessionMessages: async (sessionId, accessToken) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
        {
          headers: createAuthHeader(accessToken),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("세션 메시지 가져오기 오류:", error);
      throw error;
    }
  },
};

export default chatApi;

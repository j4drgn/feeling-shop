// API 기본 URL
const API_BASE_URL = "http://localhost:8090";

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
  // ChatGPT 단일 메시지 전송
  sendChatMessage: async (message, emotionType, emotionScore, accessToken) => {
    try {
      // 실제 API 호출
      const response = await fetch(`${API_BASE_URL}/api/chatgpt/chat`, {
        method: "POST",
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
        throw new Error(errorData.message || "메시지 전송에 실패했습니다.");
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      
      // API 연결 실패 시 백업용 모의 응답 사용
      let content = "";
      if (emotionType === "happy") {
        content = `기분이 좋으시군요! 그런 기분에는 밝고 활기찬 음악이 어울릴 것 같아요. 방탄소년단의 'Dynamite'나 아이유의 'Blueming' 같은 곡을 추천해 드릴게요!`;
      } else if (emotionType === "sad") {
        content = `마음이 무거우신가 봐요. 위로가 필요하실 때는 잔잔한 책이나 영화가 도움이 될 수 있어요. '아몬드'라는 소설이나 '어바웃 타임' 같은 따뜻한 영화는 어떨까요?`;
      } else {
        content = `안녕하세요! 오늘은 어떤 문화 콘텐츠를 추천해 드릴까요? 책, 영화, 음악 중에서 어떤 것에 관심이 있으신가요?`;
      }

      return {
        data: {
          id: Math.floor(Math.random() * 1000) + 1,
          content: content,
          type: "ASSISTANT",
          timestamp: new Date().toISOString(),
          chatSessionId: null,
        },
      };
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
        `${API_BASE_URL}/api/chatgpt/chat/session/${sessionId}`,
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
        const errorData = await response.json();
        throw new Error(
          errorData.message || "세션 메시지 전송에 실패했습니다."
        );
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("세션 메시지 전송 오류:", error);
      
      // API 연결 실패 시 백업용 모의 응답 사용
      let content = "";
      if (emotionType === "happy") {
        content = `기분이 좋으시군요! 그런 기분에는 밝고 활기찬 음악이 어울릴 것 같아요. 방탄소년단의 'Dynamite'나 아이유의 'Blueming' 같은 곡을 추천해 드릴게요!`;
      } else if (emotionType === "sad") {
        content = `마음이 무거우신가 봐요. 위로가 필요하실 때는 잔잔한 책이나 영화가 도움이 될 수 있어요. '아몬드'라는 소설이나 '어바웃 타임' 같은 따뜻한 영화는 어떨까요?`;
      } else {
        content = `안녕하세요! 오늘은 어떤 문화 콘텐츠를 추천해 드릴까요? 책, 영화, 음악 중에서 어떤 것에 관심이 있으신가요?`;
      }

      return {
        data: {
          id: Math.floor(Math.random() * 1000) + 1,
          content: content,
          type: "ASSISTANT",
          timestamp: new Date().toISOString(),
          chatSessionId: sessionId,
        },
      };
    }
  },

  // 채팅 세션 생성
  createChatSession: async (title, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
        method: "POST",
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "채팅 세션 생성에 실패했습니다.");
      }

      return await response.json();
    } catch (error) {
      console.error("채팅 세션 생성 오류:", error);
      throw error;
    }
  },

  // 채팅 세션 목록 가져오기
  getChatSessions: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
        headers: createAuthHeader(accessToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "채팅 세션 목록을 가져오는데 실패했습니다."
        );
      }

      return await response.json();
    } catch (error) {
      console.error("채팅 세션 목록 가져오기 오류:", error);
      throw error;
    }
  },

  // 특정 세션의 메시지 목록 가져오기
  getSessionMessages: async (sessionId, accessToken) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`,
        {
          headers: createAuthHeader(accessToken),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "세션 메시지를 가져오는데 실패했습니다."
        );
      }

      return await response.json();
    } catch (error) {
      console.error("세션 메시지 가져오기 오류:", error);
      throw error;
    }
  },
};

export default chatApi;

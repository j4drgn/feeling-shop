// API 기본 URL
const API_BASE_URL = "http://localhost:8090";

// 인증 헤더 생성 함수
const createAuthHeader = (accessToken) => {
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
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
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

      return await response.json();

      // 백업용 모의 응답 (API 연결 실패 시 사용)
      /*
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
      */
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
      // 서버 연결 오류를 피하기 위한 모의 응답
      // 실제 백엔드 서버가 연결되면 아래 코드를 사용
      /*
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
        const errorData = await response.json();
        throw new Error(
          errorData.message || "세션 메시지 전송에 실패했습니다."
        );
      }

      return await response.json();
      */

      // 모의 응답
      // 감정에 따른 응답 생성
      let content = "";
      if (emotionType === "happy") {
        content = `기분이 좋으시군요! 그런 기분에는 밝고 활기찬 음악이 어울릴 것 같아요. 방탄소년단의 'Dynamite'나 아이유의 'Blueming' 같은 곡을 추천해 드릴게요!`;
      } else if (emotionType === "sad") {
        content = `마음이 무거우신가 봐요. 위로가 필요하실 때는 잔잔한 책이나 영화가 도움이 될 수 있어요. '아몬드'라는 소설이나 '어바웃 타임' 같은 따뜻한 영화는 어떨까요?`;
      } else if (message.includes("책") || message.includes("독서")) {
        content = `책을 찾고 계시는군요! '사피엔스'나 '달러구트 꿈 백화점' 같은 책이 인기가 많아요. 어떤 장르를 선호하시나요?`;
      } else if (message.includes("영화") || message.includes("시청")) {
        content = `영화 추천을 원하시는군요! '인터스텔라'나 '기생충' 같은 작품은 어떠세요? 스릴러, 로맨스, SF 중에 어떤 장르를 좋아하시나요?`;
      } else if (message.includes("음악") || message.includes("노래")) {
        content = `음악 추천이군요! 지금 감정에 맞는 플레이리스트를 추천해 드릴게요. '비 오는 날 감성 플레이리스트'는 어떨까요?`;
      } else {
        content = `세션 ${sessionId}에서의 대화를 계속해요! 어떤 문화 콘텐츠에 관심이 있으신가요?`;
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
    } catch (error) {
      console.error("세션 메시지 전송 오류:", error);
      throw error;
    }
  },

  // 채팅 세션 생성
  createChatSession: async (title, accessToken) => {
    try {
      // 서버 연결 오류를 피하기 위한 모의 응답
      // 실제 백엔드 서버가 연결되면 아래 코드를 사용
      /*
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
      */

      // 모의 응답
      return {
        data: {
          id: Math.floor(Math.random() * 1000) + 1,
          title: title,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("채팅 세션 생성 오류:", error);
      throw error;
    }
  },

  // 채팅 세션 목록 가져오기
  getChatSessions: async (accessToken) => {
    try {
      // 서버 연결 오류를 피하기 위한 모의 응답
      // 실제 백엔드 서버가 연결되면 아래 코드를 사용
      /*
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
      */

      // 모의 응답
      return {
        data: [
          {
            id: 1,
            title: "오늘의 대화",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: "어제의 대화",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      };
    } catch (error) {
      console.error("채팅 세션 목록 가져오기 오류:", error);
      throw error;
    }
  },

  // 특정 세션의 메시지 목록 가져오기
  getSessionMessages: async (sessionId, accessToken) => {
    try {
      // 서버 연결 오류를 피하기 위한 모의 응답
      // 실제 백엔드 서버가 연결되면 아래 코드를 사용
      /*
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
      */

      // 모의 응답
      return {
        data: [
          {
            id: 101,
            content: "안녕하세요! 무엇을 도와드릴까요?",
            type: "ASSISTANT",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            order: 1,
          },
          {
            id: 102,
            content: "오늘 기분이 좋아요!",
            type: "USER",
            emotionType: "happy",
            emotionScore: 0.8,
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            order: 2,
          },
          {
            id: 103,
            content:
              "기분이 좋으시다니 저도 기뻐요! 오늘 어떤 일이 있으셨나요?",
            type: "ASSISTANT",
            createdAt: new Date(Date.now() - 3400000).toISOString(),
            order: 3,
          },
        ],
      };
    } catch (error) {
      console.error("세션 메시지 가져오기 오류:", error);
      throw error;
    }
  },
};

export default chatApi;

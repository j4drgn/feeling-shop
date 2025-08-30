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
  // ChatGPT 단일 메시지 전송 (세션 기반 음성으로 변경)
  sendChatMessage: async (message, voiceMetadata, accessToken, sessionId = null) => {
    try {
      // 세션 ID 유효성 검증
      let currentSessionId = sessionId;
      if (currentSessionId && (isNaN(currentSessionId) || currentSessionId <= 0)) {
        console.warn('Invalid sessionId provided:', currentSessionId, 'Creating new session...');
        currentSessionId = null;
      }
      
      // 세션 ID가 없으면 새 세션 생성
      if (!currentSessionId) {
        const sessionResponse = await chatApi.createChatSession(`대화 ${new Date().toLocaleString("ko-KR")}`, accessToken);
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
        if (sessionId && !isNaN(sessionId) && sessionId > 0) {
          currentSessionId = sessionId;
        } else {
          throw new Error("세션 생성 실패: 유효한 세션 ID를 받지 못했습니다.");
        }
      }

      // 세션 기반 메시지 전송
      const response = await fetch(
        `${API_BASE_URL}/chatgpt/chat/session/${currentSessionId}/voice`,
        {
          method: "POST",
          headers: createAuthHeader(accessToken),
          body: JSON.stringify({
            message,
            isVoiceInput: true,
            voiceMetadata: voiceMetadata ? {
              duration: voiceMetadata.duration || 1.0,
              sampleRate: voiceMetadata.sampleRate || 16000,
            } : {
              duration: 1.0,
              sampleRate: 16000,
            },
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
      console.error('sendChatMessage error:', error);
      throw error;
    }
  },

  // 세션 기반 메시지 전송 (음성 메타데이터 포함)
  sendSessionMessageWithVoice: async (
    sessionId,
    message,
    voiceMetadata,
    accessToken
  ) => {
    try {
      // 세션 ID 유효성 검증
      if (!sessionId || isNaN(sessionId) || sessionId <= 0) {
        throw new Error('유효하지 않은 세션 ID입니다.');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/chatgpt/chat/session/${sessionId}/voice`,
        {
          method: "POST",
          headers: createAuthHeader(accessToken),
          body: JSON.stringify({
            message,
            isVoiceInput: true,
            voiceMetadata: voiceMetadata ? {
              duration: voiceMetadata.duration || 1.0,
              sampleRate: voiceMetadata.sampleRate || 16000,
            } : {
              duration: 1.0,
              sampleRate: 16000,
            },
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
      console.error('sendSessionMessageWithVoice error:', error);
      throw error;
    }
  },

  // 채팅 세션 생성
  createChatSession: async (title, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: "POST",
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
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
      throw error;
    }
  },

  // 음성 채팅
  sendVoiceChatMessage: async (message, voiceMetadata, accessToken, sessionId = null) => {
    try {
      let currentSessionId = sessionId;
      
      // 세션 ID 유효성 검증
      if (currentSessionId && (isNaN(currentSessionId) || currentSessionId <= 0)) {
        console.warn('Invalid sessionId provided:', currentSessionId, 'Creating new session...');
        currentSessionId = null;
      }
      
      if (!currentSessionId) {
        const sessionResponse = await chatApi.createChatSession(`대화 ${new Date().toLocaleString("ko-KR")}`, accessToken);
        if (sessionResponse && sessionResponse.data) {
          if (sessionResponse.data.data && sessionResponse.data.data.id) {
            currentSessionId = sessionResponse.data.data.id;
          } else if (sessionResponse.data.id) {
            currentSessionId = sessionResponse.data.id;
          } else if (sessionResponse.data.sessionId) {
            currentSessionId = sessionResponse.data.sessionId;
          }
        }
        if (!currentSessionId || isNaN(currentSessionId) || currentSessionId <= 0) {
          throw new Error("세션 생성 실패: 유효한 세션 ID를 받지 못했습니다.");
        }
      }

      const response = await fetch(`${API_BASE_URL}/chatgpt/chat/voice`, {
        method: "POST",
        headers: createAuthHeader(accessToken),
        body: JSON.stringify({
          message,
          chatSessionId: currentSessionId,
          isVoiceInput: true,
          voiceMetadata: voiceMetadata ? {
            duration: voiceMetadata.duration || 1.0,
            sampleRate: voiceMetadata.sampleRate || 16000,
          } : {
            duration: 1.0,
            sampleRate: 16000,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      return { ...responseData, sessionId: currentSessionId };
    } catch (error) {
      console.error('sendVoiceChatMessage error:', error);
      throw error;
    }
  },

  // 오디오 파일 업로드 후 서버에서 Whisper 등으로 전사 및 라벨링 요청
  sendVoiceFileAndTranscribe: (audioBlob, message = '', voiceMetadata = {}, accessToken = null, sessionId = null, onUploadProgress = null, onUploadComplete = null) => {
    return new Promise((resolve, reject) => {
      try {
        const form = new FormData();
        form.append('file', audioBlob, 'voice.webm');
        if (message) form.append('message', message);
        if (sessionId) form.append('chatSessionId', sessionId);
        if (voiceMetadata) form.append('voiceMetadata', JSON.stringify(voiceMetadata));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/chatgpt/chat/voice/file`);

        if (accessToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        }

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && typeof onUploadProgress === 'function') {
            const percent = Math.round((event.loaded / event.total) * 100);
            try { onUploadProgress(percent); } catch (e) { /* ignore */ }
          }
        });

        xhr.upload.addEventListener('load', () => {
          if (typeof onUploadComplete === 'function') {
            try { onUploadComplete(); } catch (e) { /* ignore */ }
          }
        });

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText || '{}');
                resolve(json);
              } catch (err) {
                resolve({});
              }
            } else {
              let errMsg = `HTTP ${xhr.status}`;
              try {
                const parsed = JSON.parse(xhr.responseText || '{}');
                if (parsed.message) errMsg = parsed.message;
              } catch (e) {}
              reject(new Error(errMsg));
            }
          }
        };

        xhr.onerror = (e) => reject(new Error('Network error during audio upload'));
        xhr.send(form);
      } catch (error) {
        reject(error);
      }
    });
  },
};

export default chatApi;

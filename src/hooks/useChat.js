import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import chatApi from "@/api/chatApi";

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getTokens } = useAuth();

  // 단일 메시지 전송
  const sendMessage = async (message, emotionType = "NEUTRAL", emotionScore = 0.5) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { accessToken } = getTokens();
      
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }
      
      const response = await chatApi.sendChatMessage(
        message,
        emotionType,
        emotionScore,
        accessToken
      );
      
      return response.data;
    } catch (error) {
      setError(error.message || "메시지 전송 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 기반 메시지 전송
  const sendSessionMessage = async (sessionId, message, emotionType = "NEUTRAL", emotionScore = 0.5) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { accessToken } = getTokens();
      
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }
      
      const response = await chatApi.sendSessionMessage(
        sessionId,
        message,
        emotionType,
        emotionScore,
        accessToken
      );
      
      return response.data;
    } catch (error) {
      setError(error.message || "세션 메시지 전송 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 채팅 세션 생성
  const createChatSession = async (title) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { accessToken } = getTokens();
      
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }
      
      const response = await chatApi.createChatSession(title, accessToken);
      return response.data;
    } catch (error) {
      setError(error.message || "채팅 세션 생성 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 채팅 세션 목록 가져오기
  const getChatSessions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { accessToken } = getTokens();
      
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }
      
      const response = await chatApi.getChatSessions(accessToken);
      return response.data;
    } catch (error) {
      setError(error.message || "채팅 세션 목록을 가져오는 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 메시지 목록 가져오기
  const getSessionMessages = async (sessionId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { accessToken } = getTokens();
      
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }
      
      const response = await chatApi.getSessionMessages(sessionId, accessToken);
      return response.data;
    } catch (error) {
      setError(error.message || "세션 메시지를 가져오는 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    sendMessage,
    sendSessionMessage,
    createChatSession,
    getChatSessions,
    getSessionMessages,
  };
};

import { useState } from "react";

const INITIAL_GREETING = {
  role: "assistant",
  content: "안녕하세요! 덕키에요. 오늘 어떤 이야기를 나누고 싶으세요?",
  id: 'initial-greeting',
};

export const useAppNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState("main");
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatHistory, setChatHistory] = useState([INITIAL_GREETING]);

  const navigateToProducts = () => {
    setCurrentScreen("products");
    setIsChatActive(false);
  };

  const navigateToHistory = () => {
    setCurrentScreen("history");
  };

  const navigateToMain = () => {
    setCurrentScreen("main");
  };

  const startChat = () => {
    setIsChatActive(true);
    if (chatHistory.length === 0) {
      setChatHistory([INITIAL_GREETING]);
    }
  };

  const addMessage = (role, content, emotion) => {
    setChatHistory((prev) => [
      ...prev,
      {
        role,
        content,
        id: Date.now().toString(),
        emotion,
      },
    ]);
  };

  const endChat = () => {
    setIsChatActive(false);
    setChatHistory([INITIAL_GREETING]); 
    navigateToMain();
  };

  return {
    currentScreen,
    isChatActive,
    chatHistory,
    navigateToProducts,
    navigateToHistory,
    navigateToMain,
    startChat,
    addMessage,
    endChat,
  };
};
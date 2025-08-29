import { useState } from "react";

export type AppScreen = "main" | "products" | "history";

export const useAppNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("main");
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string; id: string }>
  >([]);

  const navigateToProducts = () => {
    setCurrentScreen("products");
    setIsChatActive(false);
  };

  const navigateToHistory = () => {
    setCurrentScreen("history");
  };

  const navigateToMain = () => {
    setCurrentScreen("main");
    setIsChatActive(false);
  };

  const startChat = () => {
    setIsChatActive(true);
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          role: "assistant",
          content:
            "Hi there! I'm your friendly shopping duck 🦆 What are you looking for today?",
          id: Date.now().toString(),
        },
      ]);
    }
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        role,
        content,
        id: Date.now().toString(),
      },
    ]);
  };

  const endChat = () => {
    // 취소 버튼 클릭 시 전체 메인 화면(헤더, 토글 버튼 등)이 보이도록 메인 화면으로 이동
    setIsChatActive(false);
    navigateToMain(); // 메인 화면으로 이동하여 전체 UI가 보이도록 함
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

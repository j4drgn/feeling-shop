import { useState } from 'react';

export type AppScreen = 'main' | 'products' | 'history';

export const useAppNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main');
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string; id: string }>>([]);

  const navigateToProducts = () => {
    setCurrentScreen('products');
    setIsChatActive(false);
  };

  const navigateToHistory = () => {
    setCurrentScreen('history');
  };

  const navigateToMain = () => {
    setCurrentScreen('main');
    setIsChatActive(false);
  };

  const startChat = () => {
    setIsChatActive(true);
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        content: "Hi there! I'm your friendly shopping duck 🦆 What are you looking for today?",
        id: Date.now().toString()
      }]);
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setChatHistory(prev => [...prev, {
      role,
      content,
      id: Date.now().toString()
    }]);
  };

  const endChat = () => {
    setIsChatActive(false);
    navigateToProducts();
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
    endChat
  };
};
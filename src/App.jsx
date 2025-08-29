import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainScreen } from "@/screens/MainScreen";
import { ProductScreen } from "@/screens/ProductScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { FadeTransition } from "@/components/ui/page-transitions";

const queryClient = new QueryClient();

const App = () => {
  const {
    currentScreen,
    isChatActive,
    chatHistory,
    navigateToProducts,
    navigateToHistory,
    navigateToMain,
    startChat,
    addMessage,
    endChat,
  } = useAppNavigation();

  const [likedProducts, setLikedProducts] = useState([]);

  const handleSendMessage = (message) => {
    addMessage("user", message);

    // Simulate assistant response after user message
    setTimeout(() => {
      const responses = [
        "Great choice! Let me find some perfect options for you.",
        "I understand exactly what you're looking for! Give me a moment.",
        "Perfect! I have some amazing recommendations coming up.",
        "Excellent taste! Let me show you what I found.",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage("assistant", response);
    }, 1000); // 시간을 1초로 줄여 더 빠르게 응답
  };

  const handleProductLiked = (product) => {
    setLikedProducts((prev) => [...prev, product]);
  };

  // 화면 전환 애니메이션을 위한 상태 관리
  const [prevScreen, setPrevScreen] = useState(currentScreen);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (prevScreen !== currentScreen) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setPrevScreen(currentScreen);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, prevScreen]);

  const renderScreen = (screenType) => {
    switch (screenType) {
      case "main":
        return (
          <MainScreen
            isChatActive={isChatActive}
            chatMessages={chatHistory}
            onStartChat={startChat}
            onSendMessage={(message) => {
              handleSendMessage(message);
            }}
            onEndChat={endChat}
            onNavigateToHistory={navigateToHistory}
            onNavigateToProducts={navigateToProducts}
          />
        );
      case "products":
        return (
          <ProductScreen
            onNavigateToMain={navigateToMain}
            onProductLiked={handleProductLiked}
          />
        );
      case "history":
        return (
          <HistoryScreen
            onNavigateToMain={navigateToMain}
            likedProducts={likedProducts}
            chatHistory={chatHistory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen max-w-md mx-auto w-full relative overflow-hidden max-h-screen bg-background">
            <div className="absolute inset-0 pointer-events-none border-x border-border/30"></div>
            <FadeTransition isActive={!isTransitioning} duration={150}>
              {renderScreen(currentScreen)}
            </FadeTransition>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

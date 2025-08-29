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

  const handleSendMessage = (message, emotion) => {
    addMessage("user", message, emotion);

    // 간단하고 실용적인 응답 생성
    setTimeout(() => {
      let responses = [];
      
      // 메시지 내용 기반 키워드 매칭
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('안녕') || lowerMessage.includes('하이') || lowerMessage.includes('헬로')) {
        responses = [
          "안녕하세요! 오늘 어떤 상품을 찾고 계신가요?",
          "반가워요! 무엇을 도와드릴까요?",
          "안녕하세요! 쇼핑을 도와드릴게요 🦆"
        ];
      } else if (lowerMessage.includes('옷') || lowerMessage.includes('의류') || lowerMessage.includes('패션')) {
        responses = [
          "패션 아이템을 찾고 계시는군요! 어떤 스타일을 원하시나요?",
          "의류 쇼핑이네요! 계절이나 용도를 알려주시면 더 좋은 추천을 드릴 수 있어요.",
          "멋진 옷들을 찾아드릴게요! 상품 페이지로 이동해볼까요?"
        ];
      } else if (lowerMessage.includes('음식') || lowerMessage.includes('먹을것') || lowerMessage.includes('맛있')) {
        responses = [
          "맛있는 음식을 찾고 계시는군요! 어떤 종류의 음식을 원하시나요?",
          "음식 관련 상품들이 궁금하시군요! 간식이나 요리 재료 등 다양해요.",
          "먹거리 추천 드릴게요! 상품을 구경해보세요!"
        ];
      } else if (lowerMessage.includes('전자제품') || lowerMessage.includes('컴퓨터') || lowerMessage.includes('폰')) {
        responses = [
          "전자제품에 관심이 있으시군요! 어떤 기기를 찾고 계신가요?",
          "IT 제품들도 많아요! 구체적으로 어떤 것이 필요하신지 알려주세요.",
          "전자제품 카테고리를 확인해보세요!"
        ];
      } else if (lowerMessage.includes('추천') || lowerMessage.includes('뭐가 좋')) {
        responses = [
          "추천을 원하시는군요! 상품 페이지에서 인기 아이템들을 확인해보세요!",
          "좋은 상품들이 많아요! 어떤 분야의 추천을 원하시나요?",
          "인기 상품들을 보여드릴게요! 상품 목록으로 이동해볼까요?"
        ];
      } else {
        // 감정 기반 기본 응답
        if (emotion?.emotion === 'sarcastic') {
          responses = [
            "아하~ 그렇게 말씀하시는군요! 😏 상품들을 구경해보시는 것은 어떨까요?",
            "재미있는 톤이네요! 뭔가 특별한 걸 찾아드릴게요!"
          ];
        } else if (emotion?.emotion === 'happy') {
          responses = [
            "좋은 기분이 전해져요! 😊 행복한 쇼핑 도와드릴게요!",
            "밝은 에너지가 좋네요! 멋진 상품들을 찾아드릴게요!"
          ];
        } else {
          responses = [
            "네, 들었어요! 어떤 상품을 찾고 계신가요?",
            "무엇을 도와드릴까요? 상품을 구경해보세요!",
            "쇼핑을 도와드릴게요! 궁금한 게 있으시면 말씀해주세요."
          ];
        }
      }
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage("assistant", response);
    }, 800);
  };

  const handleProductLiked = (product) => {
    setLikedProducts((prev) => [...prev, product]);
  };

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

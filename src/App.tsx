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
import { EmotionAnalysis } from "@/hooks/useSpeechRecognition";

const queryClient = new QueryClient();

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  emotion?: EmotionAnalysis;
}

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

  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [prevScreen, setPrevScreen] = useState<string>(currentScreen);
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

  const handleSendMessage = (message: string, emotion?: EmotionAnalysis) => {
    addMessage("user", message, emotion);

    // 감정에 따른 응답 생성
    setTimeout(() => {
      let responses: string[] = [];
      
      if (emotion) {
        switch (emotion.emotion) {
          case 'sarcastic':
            responses = [
              "아, 그렇게 말씀하시는군요~ 재미있네요! 😏",
              "흠... 그런 톤이시군요. 뭔가 특별한 상품을 찾아드릴게요!",
              "비꼬시는 것 같지만, 정말 좋은 추천 준비했어요! ✨"
            ];
            break;
          case 'excited':
            responses = [
              "우와! 정말 신나시는군요! 저도 덩달아 기대돼요! 🎉",
              "이런 열정! 완벽한 상품들을 준비해드릴게요!",
              "활기찬 에너지가 느껴져요! 최고의 추천 드릴게요! ⚡"
            ];
            break;
          case 'happy':
            responses = [
              "좋은 기분이 전해져요! 행복한 쇼핑 도와드릴게요! 😊",
              "밝은 목소리네요! 기분 좋은 상품들 찾아드릴게요!",
              "긍정적인 에너지가 좋아요! 완벽한 매치 찾아드릴게요! ✨"
            ];
            break;
          case 'sad':
            responses = [
              "조금 우울해 보이시네요... 기분 좋아질 상품 찾아드릴게요 💙",
              "힘든 일이 있으셨나요? 마음을 달래줄 상품들 준비했어요.",
              "괜찮으세요? 조금이라도 기분이 나아질 추천 드릴게요."
            ];
            break;
          case 'angry':
            responses = [
              "화가 나신 것 같네요. 스트레스 해소에 도움 될 상품들 찾아보겠습니다.",
              "마음이 편해질 수 있는 것들로 추천드릴게요.",
              "진정하세요~ 좋은 상품으로 기분 전환 도와드릴게요."
            ];
            break;
          default:
            responses = [
              "네, 잘 들었어요! 완벽한 추천 준비해드릴게요.",
              "알겠습니다! 최고의 상품들 찾아드릴게요!",
              "좋아요! 딱 맞는 추천 드리겠습니다."
            ];
        }
      } else {
        responses = [
          "네, 잘 들었어요! 완벽한 추천 준비해드릴게요.",
          "알겠습니다! 최고의 상품들 찾아드릴게요!",
          "좋아요! 딱 맞는 추천 드리겠습니다."
        ];
      }
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage("assistant", response);
    }, 1000);
  };

  const handleProductLiked = (product: Product) => {
    setLikedProducts((prev) => [...prev, product]);
  };

  const renderScreen = (screenType: string) => {
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

import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainScreen } from "@/screens/MainScreen";
import { ContentScreen } from "@/screens/ContentScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FadeTransition } from "@/components/ui/page-transitions";

const queryClient = new QueryClient();

// 인증이 필요한 라우트를 위한 컴포넌트 (현재는 인증 검사를 하지 않음)
const ProtectedRoute = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-layer-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // 인증 여부와 상관없이 항상 자식 컴포넌트 렌더링
  return children;
};

// 앱의 실제 내용을 담당하는 컴포넌트
const AppContent = () => {
  const {
    currentScreen,
    isChatActive,
    chatHistory,
    navigateToContent,
    navigateToHistory,
    navigateToMain,
    startChat,
    addMessage,
    endChat,
  } = useAppNavigation();

  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const [likedContents, setLikedContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
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

  const handleSendMessage = (message, emotion, onResponseComplete) => {
    addMessage("user", message, emotion);

    // Simulate assistant response after user message
    setTimeout(() => {
      let responses = [];

      // 메시지 내용 기반 키워드 매칭
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("안녕") ||
        lowerMessage.includes("하이") ||
        lowerMessage.includes("헬로")
      ) {
        responses = [
          "안녕하세요! 오늘 기분은 어떠세요?",
          "반가워요! 무엇을 도와드릴까요?",
          "안녕하세요! 오늘도 좋은 하루 되세요!",
        ];
      } else if (
        lowerMessage.includes("옷") ||
        lowerMessage.includes("의류") ||
        lowerMessage.includes("패션")
      ) {
        responses = [
          "패션에 관심이 있으시군요! 어떤 스타일을 좋아하세요?",
          "옷 쇼핑을 도와드릴게요! 어떤 걸 찾고 계신가요?",
          "멋진 스타일을 찾아드릴게요!",
        ];
      } else if (
        lowerMessage.includes("음식") ||
        lowerMessage.includes("먹을것") ||
        lowerMessage.includes("맛있")
      ) {
        responses = [
          "맛있는 걸 좋아하시는군요! 어떤 음식이 좋으세요?",
          "먹거리 얘기하니 배가 고파지네요!",
          "맛있는 음식 추천해드릴게요!",
        ];
      } else if (
        lowerMessage.includes("전자제품") ||
        lowerMessage.includes("컴퓨터") ||
        lowerMessage.includes("폰")
      ) {
        responses = [
          "기술에 관심이 많으시군요! 어떤 기기를 찾고 계신가요?",
          "전자제품도 많이 알고 있어요! 뭘 도와드릴까요?",
          "최신 기기들 궁금하시죠?",
        ];
      } else if (
        lowerMessage.includes("추천") ||
        lowerMessage.includes("뭐가 좋")
      ) {
        responses = [
          "추천을 원하시는군요! 제가 도움을 드릴게요!",
          "좋은 걸 찾아드릴게요! 어떤 분야에 관심이 있으세요?",
          "맞춤 추천해드릴게요!",
        ];
      } else {
        // 감정 기반 기본 응답
        if (emotion?.emotion === "sarcastic") {
          responses = [
            "재미있는 톤이네요! 뭔가 특별한 걸 도와드릴까요?",
            "유머러스하시네요! 어떤 도움이 필요하세요?",
          ];
        } else if (emotion?.emotion === "happy") {
          responses = [
            "좋은 기분이 전해져요! 저도 기뻐요!",
            "밝은 에너지가 좋네요! 오늘 하루 어떠셨어요?",
          ];
        } else if (emotion?.emotion === "sad") {
          responses = [
            "조금 우울해 보이시네요. 괜찮으신가요?",
            "무슨 일 있으셨나요? 제가 도움이 될 수 있을까요?",
          ];
        } else {
          responses = [
            "네, 잘 들었어요! 더 이야기해 주세요.",
            "흥미로운 얘기네요! 계속 들려주세요.",
            "그렇군요! 어떤 도움이 필요하신가요?",
          ];
        }
      }

      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage("assistant", response);

      // 응답 완료 콜백 호출
      if (onResponseComplete) {
        onResponseComplete(response);
      }
    }, 300);
  };

  const handleContentLiked = (content) => {
    // 중복 방지 - 이미 좋아요한 콘텐츠가 아닌 경우만 추가
    if (!likedContents.some((c) => c.id === content.id)) {
      setLikedContents((prev) => [...prev, content]);
    }
  };

  // 화면 전환 효과
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
            onSendMessage={handleSendMessage}
            onEndChat={endChat}
            onNavigateToHistory={navigateToHistory}
            onNavigateToContent={navigateToContent}
          />
        );
      case "content":
        return (
          <ContentScreen
            onNavigateToMain={navigateToMain}
            onContentLiked={handleContentLiked}
            selectedContent={selectedContent}
          />
        );
      case "history":
        return (
          <HistoryScreen
            onNavigateToMain={navigateToMain}
            likedContents={likedContents}
            chatHistory={chatHistory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] max-w-[560px] mx-auto w-full relative overflow-hidden max-h-[100dvh] bg-layer-background">
      <div className="absolute inset-0 pointer-events-none border-x border-layer-surface/30"></div>
      <FadeTransition isActive={!isTransitioning} duration={150}>
        {renderScreen(currentScreen)}
      </FadeTransition>
    </div>
  );
};

// 메인 앱 컴포넌트
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* 로그인 화면 */}
              <Route
                path="/login"
                element={
                  <LoginScreen
                    onNavigateToMain={() => {
                      // 인증 상태를 true로 설정하고 메인 화면으로 이동
                      window.location.href = "/";
                    }}
                  />
                }
              />

              {/* 회원가입 화면 */}
              <Route path="/signup" element={<SignupScreen />} />

              {/* 인증이 필요한 라우트들 */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppContent />
                  </ProtectedRoute>
                }
              />

              {/* 존재하지 않는 경로는 메인으로 리디렉션 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

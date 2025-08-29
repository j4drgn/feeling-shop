import React, { useState } from "react";
import { User, Brain, Heart, Ear, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThumbSwitch } from "@/components/ui/ThumbSwitch";
import { DuckCharacter } from "@/components/DuckCharacter";
import { ChatInterface } from "@/components/ChatInterface";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/context/ThemeContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
export const MainScreen = ({
  isChatActive,
  chatMessages,
  onStartChat,
  onSendMessage,
  onEndChat,
  onNavigateToHistory,
  onNavigateToProducts,
}) => {
  const { isThinking, colors, toggleTheme } = useThemeContext();

  // 텍스트 표시 상태 관리
  const [showWelcomeText, setShowWelcomeText] = useState(true);
  const [isInConversation, setIsInConversation] = useState(false);
  
  // 음성 인식 훅 사용
  const {
    isListening,
    isSupported,
    error,
    result,
    startListening,
    stopListening,
    resetResult
  } = useSpeechRecognition();

  // 음성 합성 훅 사용
  const {
    isSpeaking,
    isSupported: isSpeechSupported,
    speak,
    stopSpeaking
  } = useSpeechSynthesis();

  // 음성 인식 결과 처리
  React.useEffect(() => {
    if (result) {
      // 채팅이 시작되지 않았으면 시작
      if (!isChatActive) {
        onStartChat();
        setIsInConversation(true);
      }
      
      // 음성 메시지 전송 (응답 완료 콜백 포함)
      onSendMessage(result.transcript, result.emotion, (response) => {
        // 음성으로 응답 재생
        if (isSpeechSupported && response) {
          // 이모지 제거하고 음성으로 읽기
          const cleanResponse = response.replace(/[🦆😊😏]/g, '').trim();
          speak(cleanResponse, {
            rate: 1.0,
            pitch: 1.1,
            volume: 0.8
          });
        }
      });
      
      // 결과 리셋
      resetResult();
    }
  }, [result, isChatActive, onStartChat, onSendMessage, resetResult, isSpeechSupported, speak]);

  const handleDuckClick = () => {
    // 이전 음성이 재생 중이면 중지
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    // 첫 번째 클릭: 대화 시작
    if (!isChatActive && !isListening && !isInConversation) {
      setShowWelcomeText(false);
      setIsInConversation(true);
      startListening();
      return;
    }

    // 대화 중: 연속 음성 인식
    if (isInConversation && !isListening && !isSpeaking) {
      startListening();
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden max-h-screen">
      {/* Background yellow - changes based on T/F toggle */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: colors.background }}
      />

      {/* Header with MBTI T/F toggle and profile icon - 글래스모피즘 효과 강화 */}
      <header className="relative z-10 w-full mt-4 mb-2 px-4">
        <div className="glassmorphism-card mx-auto rounded-full py-2 px-4 flex justify-between items-center shadow-lg border border-white/60 backdrop-blur-lg">
          {/* MBTI T/F Toggle - 토글 버튼과 아이콘을 하나의 플로우로 통합 */}
          <div
            className="flex items-center gap-4 rounded-full py-1 px-4 backdrop-blur-sm border border-white/40"
            style={{ backgroundColor: "#FFF2D1" }}
          >
            <div className="flex items-center gap-1">
              <Brain className="h-5 w-5" style={{ color: "#5585FF" }} />
              <span className="text-xs font-semibold">T</span>
            </div>

            <ThumbSwitch
              checked={!isThinking}
              onCheckedChange={() => toggleTheme()}
              aria-label="Toggle between T and F"
              thumbColor={!isThinking ? "#FFBB15" : "#5585FF"}
              borderColor={!isThinking ? "#FFBB15" : "#5585FF"}
              backgroundColor={!isThinking ? "#FFF2D1" : "#D6E4FF"}
              trackColor={!isThinking ? colors.trackColor : colors.trackColor}
            />

            <div className="flex items-center gap-1">
              <Heart className="h-5 w-5" style={{ color: "#FFBB15" }} />
              <span className="text-xs font-semibold">F</span>
            </div>
          </div>

          {/* Profile Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToHistory}
            className="rounded-full bg-white/40 hover:bg-white/60 text-foreground shadow-sm border border-white/40"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content area - PERFECT CENTER LAYOUT */}
      <main className="h-screen flex flex-col items-center justify-center px-6 relative z-10 overflow-hidden max-h-[calc(100vh-56px)]">
        {/* Duck character - perfectly centered - ALWAYS VISIBLE */}
        <div className="flex flex-col items-center justify-center mt-[-80px]">
          <div className="relative">
            <DuckCharacter
              size="xxl"
              onClick={handleDuckClick}
              className={cn(
                "transition-all duration-300 mb-6",
                isChatActive && "scale-75",
                isListening && "listening-glow",
                isSpeaking && "speaking-pulse",
                isInConversation && "cursor-pointer hover:scale-105"
              )}
              circleColor={colors.circle}
            />
            {isListening && (
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <div className="inline-flex items-center gap-1 bg-white/90 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/60 shadow-md animate-pulse">
                  <Ear className="h-5 w-5 text-blue-500" />
                  <span className="font-bold">듣고 있어요...</span>
                </div>
              </div>
            )}
            {isSpeaking && (
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <div className="inline-flex items-center gap-1 bg-green-100/90 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-green-200/60 shadow-md animate-pulse">
                  <Volume2 className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-800">말하고 있어요...</span>
                </div>
              </div>
            )}
            {!isSupported && !isChatActive && (
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <div className="inline-flex items-center gap-1 bg-red-100 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-red-200 shadow-md">
                  <span className="text-red-600 font-bold">음성 인식을 지원하지 않는 브라우저입니다</span>
                </div>
              </div>
            )}
            {error && !isChatActive && (
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <div className="inline-flex items-center gap-1 bg-yellow-100 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-yellow-200 shadow-md">
                  <span className="text-yellow-700 font-bold">{error}</span>
                </div>
              </div>
            )}
          </div>

          {!isChatActive && showWelcomeText && (
            <div className="text-center space-y-3 mb-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground">
                덕키랑 음성으로 대화해봐요!
              </h1>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                오리를 클릭하고 말해주세요. 음성으로 답해드릴게요!
              </p>
            </div>
          )}

          {isInConversation && !isChatActive && !isListening && !isSpeaking && (
            <div className="text-center space-y-3 mb-8 animate-fade-in">
              <h1 className="text-xl font-bold text-foreground">
                계속 대화하려면 다시 클릭하세요!
              </h1>
              <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
                음성으로 자연스럽게 대화를 이어가세요
              </p>
            </div>
          )}
        </div>

        {/* Chat interface area - appears below duck when active, keeping duck centered */}
        {isChatActive && (
          <div className="w-full max-w-lg animate-fade-in -mt-4">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={(message, emotion) => {
                onSendMessage(message, emotion, (response) => {
                  // 채팅 인터페이스에서도 음성 응답 재생
                  if (isSpeechSupported && response) {
                    const cleanResponse = response.replace(/[🦆😊😏]/g, '').trim();
                    speak(cleanResponse, {
                      rate: 1.0,
                      pitch: 1.1,
                      volume: 0.8
                    });
                  }
                });
              }}
              onEndChat={() => {
                onEndChat();
                setIsInConversation(false);
                setShowWelcomeText(true);
                stopSpeaking(); // 대화 종료 시 음성도 중지
              }}
              isActive={isChatActive}
              onNavigateToProducts={onNavigateToProducts}
              isSpeaking={isSpeaking}
              onStopSpeaking={stopSpeaking}
            />
          </div>
        )}
      </main>
    </div>
  );
};

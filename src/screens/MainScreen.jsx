import { useState, useEffect, useRef } from "react";
import AnimatedDuckCharacter from "@/components/AnimatedDuckCharacter";
import SpeechBubble from "@/components/SpeechBubble";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useDuckAnimation } from "@/hooks/useDuckAnimation";
import { User, Mic, Volume2, VolumeX, Send, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbSwitch } from "@/components/ui/ThumbSwitch";
import { Brain, Heart } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import QuickAccessButton from "@/components/QuickAccessButton";

export const MainScreen = ({ onNavigateToHistory, onNavigateToProducts }) => {
  const { isThinking, toggleTheme } = useThemeContext();
  const [characterText, setCharacterText] = useState(
    "안녕! 나는 덕키야. 오늘 기분은 어때? 나를 터치하고 말해봐!"
  );

  // 앱 시작시 환영 애니메이션 - 훅 정의 후에 이동
  const [userText, setUserText] = useState("");
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationContext, setConversationContext] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [isAIThinking, setIsAIThinking] = useState(false);
  const characterRef = useRef(null);

  const {
    isListening,
    result,
    startListening,
    stopListening,
    isSupported,
    error,
    resetResult,
  } = useSpeechRecognition();

  const { speak, isSpeaking, stopSpeaking } = useSpeechSynthesis({
    onEnd: () => {
      // 음성 출력이 끝났을 때 애니메이션을 idle로 복원
      if (currentAnimation !== "idle" && !isListening) {
        triggerAnimation("idle");
      }
    },
  });

  // Duck animation management
  const {
    currentAnimation,
    triggerCount,
    triggerAnimation,
    handleAnimationComplete,
    isAnimating,
  } = useDuckAnimation({
    emotion: result?.emotion,
    isListening,
    isSpeaking,
    conversationContext,
  });

  // 앱 시작시 환영 애니메이션
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      if (triggerAnimation) {
        triggerAnimation("happy", true);
      }
    }, 1000);

    return () => clearTimeout(welcomeTimer);
  }, [triggerAnimation]);

  const handleUserInput = (input, emotion) => {
    const lowerInput = input.toLowerCase();
    let response = "";
    let context = null;

    // 감정 기반 응답 추가
    const emotionContext = emotion?.emotion || "neutral";

    if (
      lowerInput.includes("안녕") ||
      lowerInput.includes("하이") ||
      lowerInput.includes("헬로")
    ) {
      response = "반가워! 오늘 뭐 하고 싶어? 쇼핑? 아니면 그냥 수다?";
      context = "greeting";
      triggerAnimation("happy", true);
      setShowFloatingEmojis(true);
      setTimeout(() => setShowFloatingEmojis(false), 3000);
    } else if (
      lowerInput.includes("쇼핑") ||
      lowerInput.includes("상품") ||
      lowerInput.includes("추천")
    ) {
      response = "좋아! 내가 너한테 딱 맞는 걸 찾아줄게! 잠깐만 기다려~";
      context = "shopping";
      triggerAnimation("gift_sequence", true);
      setTimeout(() => onNavigateToProducts(), 6000); // Increased delay for full sequence
    } else if (lowerInput.includes("기분") || lowerInput.includes("감정")) {
      if (emotionContext === "happy" || emotionContext === "excited") {
        response = "와! 정말 기분이 좋아 보여! 나도 기뻐~";
        context = "happy";
      } else if (emotionContext === "sad" || emotionContext === "frustrated") {
        response = "괜찮아... 내가 여기 있을게. 힘내!";
        context = "sad";
      } else {
        response = "너의 기분을 이해해! 내가 여기 있어줄게~";
        context = "neutral";
      }
    } else if (
      lowerInput.includes("고마워") ||
      lowerInput.includes("감사") ||
      lowerInput.includes("thanks")
    ) {
      response = "천만에! 또 도움이 필요하면 언제든지 말해~";
      context = "thanking";
      triggerAnimation("happy", true);
      setShowFloatingEmojis(true);
      setTimeout(() => setShowFloatingEmojis(false), 3000);
    } else if (
      lowerInput.includes("싫어") ||
      lowerInput.includes("짜증") ||
      lowerInput.includes("화나")
    ) {
      response = "어? 뭔가 마음에 안 드는 게 있어? 괜찮아, 다른 걸 찾아보자!";
      context = "frustrated";
      triggerAnimation("mad", true);
    } else {
      const responses =
        emotionContext === "sarcastic"
          ? [
              "어머~ 재밌는 얘기네!",
              "그래~ 그래~ 알겠어~",
              "와~ 정말 대단하다~",
            ]
          : emotionContext === "excited"
            ? [
                "우와! 신난다! 더 얘기해줘!",
                "정말 재밌겠다! 계속 들려줘!",
                "대박! 완전 좋은데?!",
              ]
            : [
                "흥미로운 얘기야! 더 들려줘~",
                "정말? 신기하다! 계속 말해봐~",
                "우와! 그거 완전 재밌겠다!",
                "좋은 생각이야! 나도 그렇게 생각해~",
              ];
      response = responses[Math.floor(Math.random() * responses.length)];
      context = emotionContext;
    }

    setCharacterText(response);
    setConversationContext(context);
    setIsAIThinking(false);
  };

  const handleCharacterClick = () => {
    if (!isSupported) {
      setCharacterText(
        "음성 인식이 지원되지 않는 브라우저예요. 아래 텍스트 입력을 사용해보세요!"
      );
      return;
    }

    if (error) {
      // 오류 상태를 초기화
      resetResult();
      setCharacterText("다시 한 번 클릭해서 말해보세요!");
      return; // 바로 듣기 모드로 전환하지 않고 사용자의 다음 클릭을 기다림
    }

    if (isSpeaking) {
      stopSpeaking();
      setCharacterText("말하기를 멈췄어요. 다시 터치해서 대화해보세요!");
      return;
    }

    if (isListening) {
      stopListening();
      setCharacterText("듣기를 멈췄어요. 다시 터치해서 말해보세요!");
    } else {
      // 클릭할 때마다 살짝 기뻐하는 애니메이션
      if (currentAnimation === "idle") {
        triggerAnimation("happy");
      }

      startListening();
      setCharacterText("듣고 있어요... 편안하게 말해보세요!");
      setUserText(""); // 이전 텍스트 초기화
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isSpeaking && !isMuted) {
      stopSpeaking();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setUserText(textInput);
    
    // AI 응답 생성 중 표시
    setIsAIThinking(true);
    setCharacterText("생각하고 있어요...");

    // 텍스트 입력의 경우 기본 neutral 감정으로 처리
    const mockEmotion = {
      emotion: "neutral",
      confidence: 0.5,
      description: "텍스트 입력",
    };

    setTimeout(() => {
      handleUserInput(textInput, mockEmotion);
      setTextInput("");
    }, 500);
  };

  // 음성 인식 결과 처리
  useEffect(() => {
    if (result && result.transcript) {
      console.log("음성 인식 결과:", result);
      setUserText(result.transcript);

      // 감정 분석 정보 표시
      if (result.emotion) {
        console.log("감정 분석:", result.emotion);
      }

      // AI 응답 생성 중 표시
      setIsAIThinking(true);
      setCharacterText("생각하고 있어요...");
      
      // 자동으로 응답 생성
      setTimeout(() => {
        handleUserInput(result.transcript, result.emotion);
      }, 500);
    }
  }, [result]);

  // 캐릭터 텍스트가 변경되면 음성 출력 (특정 메시지 제외)
  useEffect(() => {
    if (characterText && 
        !isMuted && 
        !characterText.includes("듣고 있어요") &&
        !characterText.includes("생각하고 있어요") &&
        !characterText.includes("잘 들리지 않았어요") &&
        !characterText.includes("마이크") &&
        !characterText.includes("인터넷") &&
        !characterText.includes("음성을 인식하지")) {
      speak(characterText);
    }
  }, [characterText, isMuted, speak]);

  return (
    <div className="min-h-[100dvh] bg-layer-background">
      <main className="relative flex flex-col min-h-[100dvh]">
        {/* Clean AppBar with warm background */}
        <header className="sticky top-0 z-10 bg-layer-background/90 backdrop-blur mb-2 sm:mb-4">
          <div className="mx-auto max-w-[560px] px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex justify-between items-center">
              {/* MBTI Toggle - Simplified */}
              <div className="flex items-center gap-2 sm:gap-3 bg-[#FDFBF6] rounded-3xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-surface">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-layer-muted rounded-full flex items-center justify-center">
                    <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-layer-surface" />
                  </div>
                  <span className="text-xs sm:text-caption text-layer-content">T</span>
                </div>

                <ThumbSwitch
                  checked={!isThinking}
                  onCheckedChange={toggleTheme}
                  aria-label="Toggle between T and F"
                  thumbColor={!isThinking ? "#6B7280" : "#6B7280"}
                  borderColor="#E5E7EB"
                  backgroundColor="#FDFBF6"
                  trackColor="#E5E7EB"
                />

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-layer-muted rounded-full flex items-center justify-center">
                    <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-layer-surface" />
                  </div>
                  <span className="text-xs sm:text-caption text-layer-content">F</span>
                </div>
              </div>

              {/* Minimal action buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-surface bg-layer-surface/80 hover:bg-layer-surface shadow-surface transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-layer-muted" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-layer-muted" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNavigateToHistory}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-surface bg-layer-surface/80 hover:bg-layer-surface text-layer-muted shadow-surface transition-colors"
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <section className="flex-1 mx-auto w-full max-w-[560px] px-4 py-5 flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8">
          {/* Speech Bubble - White Surface (위치 변경됨) */}
          <SpeechBubble 
            text={characterText} 
            isListening={isListening} 
            isThinking={isAIThinking} 
          />

          {/* Duck Character - White Surface Container (위치 변경됨) */}
          <div ref={characterRef} className="relative mt-1">
            {/* Floating emojis */}
            {showFloatingEmojis && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 animate-bounce delay-0 text-2xl">
                  💕
                </div>
                <div className="absolute top-8 right-6 animate-bounce delay-200 text-xl">
                  ✨
                </div>
                <div className="absolute bottom-12 left-8 animate-bounce delay-400 text-lg">
                  🌟
                </div>
                <div className="absolute top-1/2 right-4 animate-bounce delay-600 text-xl">
                  💫
                </div>
              </div>
            )}
            <div
              className={cn(
                "w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] rounded-full bg-layer-surface shadow-surface grid place-items-center transition-all duration-300",
                isListening && "scale-[1.02] shadow-glow",
                isSpeaking && "scale-[1.01]",
                isAnimating && !isListening && !isSpeaking && "scale-[1.005]"
              )}
            >
              {/* Subtle glow for states */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-500 opacity-0",
                  isListening && "opacity-100 bg-accent-ducky/10",
                  isSpeaking && "opacity-100 bg-accent-ducky/5"
                )}
              />

              <AnimatedDuckCharacter
                animation={currentAnimation}
                trigger={triggerCount}
                size="xl"
                onClick={handleCharacterClick}
                onAnimationComplete={handleAnimationComplete}
                className="relative z-10"
              />

              {/* Status indicators */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                {isListening && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-layer-surface text-layer-content px-2 sm:px-3 py-1 rounded-surface text-xs sm:text-caption font-medium shadow-surface border border-layer-border">
                    <div className="relative">
                      <Mic className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent-ducky" />
                      <div className="absolute -inset-1 bg-accent-ducky/20 rounded-full animate-pulse" />
                    </div>
                    <span>듣는 중...</span>
                  </div>
                )}
                {isSpeaking && !isListening && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-layer-surface text-layer-content px-2 sm:px-3 py-1 rounded-surface text-xs sm:text-caption font-medium shadow-surface border border-layer-border">
                    <div className="relative">
                      <Volume2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent-ducky" />
                      <div className="absolute -inset-1 bg-accent-ducky/20 rounded-full animate-pulse" />
                    </div>
                    <span>말하는 중...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Response Display */}
          {userText && !isListening && (
            <div className="space-y-3 sm:space-y-4 w-full max-w-[540px]">
              <div className="bg-layer-surface rounded-surface px-3 sm:px-4 py-2 sm:py-3 shadow-surface border border-layer-border">
                <p className="text-sm sm:text-body text-layer-content">{userText}</p>
              </div>

              {/* Emotion info */}
              {result?.emotion && (
                <div className="bg-layer-surface rounded-surface px-3 sm:px-4 py-2 sm:py-3 shadow-surface border border-layer-border">
                  <p className="text-xs sm:text-caption text-layer-muted">
                    <span className="font-medium">감정:</span>{" "}
                    {result.emotion.description}
                  </p>
                  <div className="flex gap-3 sm:gap-4 mt-1">
                    <span className="text-xs sm:text-caption text-layer-muted/70">
                      음량 {Math.round(result.emotion.volume * 100)}%
                    </span>
                    <span className="text-xs sm:text-caption text-layer-muted/70">
                      피치 {Math.round(result.emotion.pitch)}Hz
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bottom CTA - Fixed position */}
        <footer className="sticky bottom-0 z-10 bg-layer-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-[560px] px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 sm:pt-4">
            {/* CTA Button - Only show when user has spoken */}
            {userText && !isListening && (
              <Button
                onClick={onNavigateToProducts}
                className="w-full rounded-surface bg-layer-surface text-layer-content text-sm sm:text-body font-bold py-3 sm:py-4 shadow-surface border border-layer-border active:scale-[0.98] transition-all duration-150 hover:shadow-glow"
              >
                시작하기
              </Button>
            )}

            {/* Text input for unsupported browsers */}
            {!isSupported && !userText && (
              <form
                onSubmit={handleTextSubmit}
                className="w-full max-w-[540px] space-y-2"
              >
                <div className="flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="덕키에게 메시지를 입력하세요..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!textInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-caption text-layer-muted text-center">
                  음성 인식을 지원하지 않는 브라우저입니다. 텍스트로
                  대화해보세요!
                </p>
              </form>
            )}

            {/* Tutorial hint */}
            {!userText && !isListening && !error && isSupported && (
              <div className="text-center">
                <p className="text-xs sm:text-caption text-layer-muted bg-layer-surface/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-surface border border-layer-border">
                  덕키를 터치하고 말해보세요
                </p>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="text-center">
                <p className="text-xs sm:text-caption text-red-600 bg-red-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-surface border border-red-200">
                  오류: {error}
                </p>
              </div>
            )}
          </div>
        </footer>
      </main>

      {/* 상세 제품 화면으로 이동하는 퀵 액세스 버튼 */}
      <QuickAccessButton
        icon={<ShoppingBag className="h-5 w-5" />}
        label="상품 보기"
        onClick={onNavigateToProducts}
        position="bottom-right"
        variant="ghost"
        size="md"
        showLabel={true}
        labelPosition="top"
        className="z-50"
        data-testid="product-quick-access"
      />
    </div>
  );
};

export default MainScreen;

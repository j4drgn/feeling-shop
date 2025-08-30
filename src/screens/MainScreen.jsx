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
import { userProfileService } from "@/services/userProfile";
import { recommendationEngine } from "@/services/recommendationEngine";

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
  const [profileQuestion, setProfileQuestion] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
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

  const handleUserInput = async (input, emotion) => {
    try {
      // 1. 사용자 입력을 프로필에 반영
      userProfileService.updateFromConversation(input, emotion);
      
      // 2. 프로필 질문이 대기 중인지 확인
      if (profileQuestion) {
        const response = await handleProfileAnswer(input);
        setCharacterText(response);
        setProfileQuestion(null);
        setIsAIThinking(false);
        return;
      }

      const lowerInput = input.toLowerCase();
      let response = "";
      let context = null;
      const emotionContext = emotion?.emotion || "neutral";

      // 3. 상품 추천 요청 감지
      if (lowerInput.includes("추천") || lowerInput.includes("뭐 살까") || 
          lowerInput.includes("쇼핑") || lowerInput.includes("상품") ||
          lowerInput.includes("필요해") || lowerInput.includes("사고싶")) {
        
        const personalizedRecs = await recommendationEngine.getPersonalizedRecommendations({
          mood: emotionContext,
          context: 'shopping_request'
        });
        
        setRecommendations(personalizedRecs.slice(0, 3));
        
        if (personalizedRecs.length > 0) {
          response = `맞춤 추천이야! 🎯\n\n` +
            `**${personalizedRecs[0].name}**\n` +
            `${personalizedRecs[0].price.toLocaleString()}원\n` +
            `${personalizedRecs[0].recommendationReason}\n\n` +
            `더 보려면 🛍️ 버튼을 눌러봐!`;
          
          setTimeout(() => onNavigateToProducts(), 3000);
        } else {
          response = "아직 너에 대해 더 알아야 좋은 추천을 해줄 수 있어! 조금 더 대화해볼까?";
        }
        
        triggerAnimation("gift_sequence", true);
        context = "recommendation";

      // 4. 기본 감정/인사 응답
      } else if (lowerInput.includes("안녕") || lowerInput.includes("하이") || lowerInput.includes("헬로")) {
        const profileCompleteness = userProfileService.getProfileCompleteness();
        
        if (profileCompleteness < 50) {
          response = "안녕! 나는 덕키야 🦆 너에게 딱 맞는 상품을 추천해주고 싶어! 먼저 너에 대해 알려줄래?";
          
          const questions = recommendationEngine.generateProfileQuestions();
          if (questions.length > 0) {
            setProfileQuestion(questions[0]);
            response += `\n\n${questions[0].question}`;
          }
        } else {
          response = `안녕! 반가워 😊 오늘은 어떤 걸 찾고 있어?`;
        }
        
        context = "greeting";
        triggerAnimation("happy", true);
        setShowFloatingEmojis(true);
        setTimeout(() => setShowFloatingEmojis(false), 3000);

      } else if (lowerInput.includes("기분") || lowerInput.includes("감정")) {
        if (emotionContext === "happy" || emotionContext === "excited") {
          response = "와! 정말 기분이 좋아 보여! 나도 기뻐~ 🎉 기분 좋을 때 뭔가 특별한 걸 사보는 건 어때?";
          context = "happy";
        } else if (emotionContext === "sad" || emotionContext === "frustrated") {
          response = "괜찮아... 내가 여기 있을게. 힘내! 😊 가끔은 자신에게 선물을 해주는 것도 좋아!";
          context = "sad";
        } else {
          response = "너의 기분을 이해해! 내가 여기 있어줄게~";
          context = "neutral";
        }

      } else if (lowerInput.includes("고마워") || lowerInput.includes("감사")) {
        response = "천만에! 또 도움이 필요하면 언제든지 말해~";
        context = "thanking";
        triggerAnimation("happy", true);
        setShowFloatingEmojis(true);
        setTimeout(() => setShowFloatingEmojis(false), 3000);

      } else {
        // 5. 개인화된 일반 응답
        const profile = userProfileService.getProfile();
        const responses = generatePersonalizedResponse(input, profile, emotionContext);
        response = responses[Math.floor(Math.random() * responses.length)];
        context = emotionContext;
        
        // 가끔 프로필 질문 삽입
        if (Math.random() < 0.3 && userProfileService.getProfileCompleteness() < 80) {
          const questions = recommendationEngine.generateProfileQuestions();
          if (questions.length > 0) {
            setProfileQuestion(questions[0]);
            response += `\n\n그런데 ${questions[0].question}`;
          }
        }
      }

      setCharacterText(response);
      setConversationContext(context);
      setIsAIThinking(false);
      
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      setCharacterText("어? 뭔가 문제가 생겼어! 다시 말해줄래?");
      setIsAIThinking(false);
    }
  };

  // 프로필 질문 답변 처리
  const handleProfileAnswer = async (answer) => {
    const lowerAnswer = answer.toLowerCase();
    
    if (profileQuestion.type === 'age') {
      let age = null;
      if (lowerAnswer.includes('10')) age = 15;
      else if (lowerAnswer.includes('20')) age = 25;
      else if (lowerAnswer.includes('30')) age = 35;
      else if (lowerAnswer.includes('40')) age = 45;
      else if (lowerAnswer.includes('50')) age = 55;
      
      if (age) {
        userProfileService.userProfile.demographics.age = age;
        userProfileService.saveProfile();
      }
      
      return "좋아! 이제 더 정확한 추천을 해줄 수 있을 거야! 😊";
      
    } else if (profileQuestion.type === 'living') {
      let livingType = null;
      if (lowerAnswer.includes('원룸') || lowerAnswer.includes('오피스텔')) livingType = '원룸';
      else if (lowerAnswer.includes('아파트')) livingType = '아파트';
      else if (lowerAnswer.includes('빌라')) livingType = '빌라'; 
      else if (lowerAnswer.includes('주택')) livingType = '주택';
      
      if (livingType) {
        userProfileService.userProfile.demographics.livingType = livingType;
        userProfileService.saveProfile();
      }
      
      return `${livingType}에서 살고 있구나! 공간에 딱 맞는 제품들을 추천해줄게! 🏠`;
      
    } else if (profileQuestion.type === 'hobbies') {
      const hobbies = [];
      if (lowerAnswer.includes('요리')) hobbies.push('cooking');
      if (lowerAnswer.includes('운동')) hobbies.push('exercise');
      if (lowerAnswer.includes('게임')) hobbies.push('gaming');
      if (lowerAnswer.includes('독서')) hobbies.push('reading');
      if (lowerAnswer.includes('영화')) hobbies.push('movies');
      if (lowerAnswer.includes('여행')) hobbies.push('travel');
      if (lowerAnswer.includes('인테리어')) hobbies.push('interior');
      
      if (hobbies.length > 0) {
        userProfileService.userProfile.lifestyle.hobbies = [
          ...new Set([...userProfileService.userProfile.lifestyle.hobbies, ...hobbies])
        ];
        userProfileService.saveProfile();
      }
      
      return "오~ 취향을 알겠어! 이제 네 관심사에 맞는 상품들을 찾아줄 수 있을 거야! ✨";
    }
    
    return "답변 고마워! 이제 더 나은 추천을 해줄 수 있을 거야! 😊";
  };

  // 개인화된 일반 응답 생성
  const generatePersonalizedResponse = (input, profile, emotion) => {
    const baseResponses = [
      "그렇구나! 재밌는 얘기네~",
      "오~ 그거 좋은데? 더 얘기해봐!",
      "정말? 신기하다!",
      "우와~ 흥미롭네!"
    ];

    // 프로필 기반 맞춤 응답
    if (profile.lifestyle.hobbies.includes('cooking')) {
      baseResponses.push("요리 좋아하는구나! 혹시 주방용품 관심 있어?");
    }
    if (profile.lifestyle.hobbies.includes('exercise')) {
      baseResponses.push("운동하는구나! 홈트 용품 어때?");
    }
    if (profile.demographics.livingType === '원룸') {
      baseResponses.push("원룸에서 쓰기 좋은 것들 많이 알고 있어!");
    }

    return baseResponses;
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

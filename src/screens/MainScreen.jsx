import { useState, useEffect, useRef } from "react";
import { DuckCharacter } from "@/components/DuckCharacter";
import SpeechBubble from "@/components/SpeechBubble";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { User, Mic, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThumbSwitch } from "@/components/ui/ThumbSwitch";
import { Brain, Heart, Sparkles } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export const MainScreen = ({
  onNavigateToHistory,
  onNavigateToProducts,
}) => {
  const { isThinking, toggleTheme } = useThemeContext();
  const [characterText, setCharacterText] = useState(
    "안녕! 나는 덕키야. 오늘 기분은 어때? 나를 터치하고 말해봐!"
  );
  const [userText, setUserText] = useState("");
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const characterRef = useRef(null);

  const {
    isListening,
    result,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useSpeechRecognition();

  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis({
    onEnd: () => {
      // 음성 출력이 끝났을 때의 처리
    },
  });

  const handleUserInput = (input, emotion) => {
    const lowerInput = input.toLowerCase();
    let response = "";
    
    // 감정 기반 응답 추가
    const emotionContext = emotion?.emotion || 'neutral';
    
    if (lowerInput.includes("안녕") || lowerInput.includes("하이")) {
      response = "반가워! 오늘 뭐 하고 싶어? 쇼핑? 아니면 그냥 수다?";
      setShowFloatingEmojis(true);
      setTimeout(() => setShowFloatingEmojis(false), 3000);
    } else if (lowerInput.includes("쇼핑") || lowerInput.includes("상품")) {
      response = "좋아! 내가 너한테 딱 맞는 걸 찾아줄게! 잠깐만 기다려~";
      setTimeout(() => onNavigateToProducts(), 2000);
    } else if (lowerInput.includes("기분") || lowerInput.includes("감정")) {
      if (emotionContext === 'happy' || emotionContext === 'excited') {
        response = "와! 정말 기분이 좋아 보여! 나도 기뻐~";
      } else if (emotionContext === 'sad' || emotionContext === 'frustrated') {
        response = "괜찮아... 내가 여기 있을게. 힘내!";
      } else {
        response = "너의 기분을 이해해! 내가 여기 있어줄게~";
      }
    } else {
      const responses = emotionContext === 'sarcastic' ? [
        "어머~ 재밌는 얘기네!",
        "그래~ 그래~ 알겠어~",
        "와~ 정말 대단하다~"
      ] : [
        "흥미로운 얘기야! 더 들려줘~",
        "정말? 신기하다! 계속 말해봐~",
        "우와! 그거 완전 재밌겠다!",
        "좋은 생각이야! 나도 그렇게 생각해~"
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    
    setCharacterText(response);
  };

  const handleCharacterClick = () => {
    if (!isSupported) {
      setCharacterText("음성 인식이 지원되지 않는 브라우저예요");
      return;
    }
    
    if (error) {
      setCharacterText(`오류가 발생했어요: ${error}`);
      return;
    }
    
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
      setCharacterText("듣고 있어요...");
      setUserText(""); // 이전 텍스트 초기화
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isSpeaking && !isMuted) {
      stopSpeaking();
    }
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
      
      // 자동으로 응답 생성
      setTimeout(() => {
        handleUserInput(result.transcript, result.emotion);
      }, 500);
    }
  }, [result]);

  // 캐릭터 텍스트가 변경되면 음성 출력
  useEffect(() => {
    if (characterText && !isMuted && !characterText.includes("듣고 있어요")) {
      speak(characterText);
    }
  }, [characterText, isMuted, speak]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-bg">
      {/* Minimal background decoration */}

      {/* Removed floating emojis for cleaner design */}

      {/* Clean Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-3 flex justify-between items-center shadow-sm">
            {/* MBTI Toggle - simplified design */}
            <div className="flex items-center gap-3 bg-neutral-bg rounded-full px-4 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-secondary rounded-full flex items-center justify-center">
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-neutral-text">T</span>
              </div>
              
              <ThumbSwitch
                checked={!isThinking}
                onCheckedChange={toggleTheme}
                aria-label="Toggle between T and F"
                thumbColor={!isThinking ? "#9C6ADE" : "#4DA3FF"}
                borderColor="#E5E7EB"
                backgroundColor="#F8F9FA"
                trackColor="#E5E7EB"
              />
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-neutral-text">F</span>
              </div>
            </div>

            {/* Minimal Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg bg-neutral-bg border border-gray-200 hover:bg-gray-100 transition-all"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-neutral-text" />
                ) : (
                  <Volume2 className="h-4 w-4 text-neutral-text" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onNavigateToHistory}
                className="w-8 h-8 rounded-lg bg-neutral-bg border border-gray-200 hover:bg-gray-100 text-neutral-text transition-all"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center h-full px-6">
        {/* Duck Character with professional animations */}
        <div 
          ref={characterRef}
          className="relative mb-8"
        >
          <div className={cn(
            "relative transition-all duration-500",
            isListening && "scale-110",
            isSpeaking && "animate-bounce"
          )}>
            {/* Glow Effect */}
            <div className={cn(
              "absolute inset-0 rounded-full transition-all duration-1000",
              isListening && "listening-glow",
              isSpeaking && "speaking-pulse"
            )} />
            
            <DuckCharacter
              size="xl"
              onClick={handleCharacterClick}
              className={cn(
                "relative z-10 cursor-pointer transition-all duration-300",
                "hover:scale-105 active:scale-95"
              )}
            />
            
            {/* Status Indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              {isListening && (
                <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  <Mic className="h-3 w-3" />
                  <span>듣는 중...</span>
                </div>
              )}
              {isSpeaking && !isListening && (
                <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  <Volume2 className="h-3 w-3" />
                  <span>말하는 중...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Speech Bubble with enhanced design */}
        <div className="relative w-full max-w-sm">
          <SpeechBubble 
            text={characterText}
            className="shadow-2xl"
          />
        </div>

        {/* Kawaii User Transcript Display */}
        {userText && !isListening && (
          <div className="mt-6 space-y-2">
            <div className="bg-white/90 rounded-3xl px-6 py-4 max-w-sm animate-slide-up border-3 border-blue-200 shadow-lg">
              <p className="text-base font-bold text-gray-700">
                <span className="text-blue-500">You:</span> {userText}
              </p>
            </div>
            
            {/* Emotion Display */}
            {result?.emotion && (
              <div className="glassmorphism-card rounded-xl px-4 py-2 max-w-sm animate-fade-in">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">감정:</span> {result.emotion.description}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    음량: {Math.round(result.emotion.volume * 100)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    피치: {Math.round(result.emotion.pitch)}Hz
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kawaii CTA Button */}
        {userText && !isListening && (
          <div className="mt-6 animate-fade-in">
            <Button
              onClick={onNavigateToProducts}
              className="relative rounded-full px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 text-black font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              AI 추천 상품 보기
            </Button>
          </div>
        )}

        {/* Tutorial Hint */}
        {!userText && !isListening && !error && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-pulse">
            <p className="text-sm text-neutral-text bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              덕키를 터치하고 말해보세요
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <p className="text-sm text-red-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              오류: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainScreen;
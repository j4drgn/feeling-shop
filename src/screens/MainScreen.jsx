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
    "안녕! 나는 덕키야 🦆 오늘 기분은 어때? 나를 터치하고 말해봐!"
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
      response = "반가워! 오늘 뭐 하고 싶어? 쇼핑? 아니면 그냥 수다? 😊";
      setShowFloatingEmojis(true);
      setTimeout(() => setShowFloatingEmojis(false), 3000);
    } else if (lowerInput.includes("쇼핑") || lowerInput.includes("상품")) {
      response = "좋아! 내가 너한테 딱 맞는 걸 찾아줄게! 잠깐만 기다려~ 🛍️";
      setTimeout(() => onNavigateToProducts(), 2000);
    } else if (lowerInput.includes("기분") || lowerInput.includes("감정")) {
      if (emotionContext === 'happy' || emotionContext === 'excited') {
        response = "와! 정말 기분이 좋아 보여! 나도 기뻐~ 💛";
      } else if (emotionContext === 'sad' || emotionContext === 'frustrated') {
        response = "괜찮아... 내가 여기 있을게. 힘내! 🤗";
      } else {
        response = "너의 기분을 이해해! 내가 여기 있어줄게~ 💛";
      }
    } else {
      const responses = emotionContext === 'sarcastic' ? [
        "어머~ 재밌는 얘기네! 😏",
        "그래~ 그래~ 알겠어~ 😄",
        "와~ 정말 대단하다~ 👏"
      ] : [
        "흥미로운 얘기야! 더 들려줘~ 🎧",
        "정말? 신기하다! 계속 말해봐~ ✨",
        "우와! 그거 완전 재밌겠다! 😄",
        "좋은 생각이야! 나도 그렇게 생각해~ 💭"
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    
    setCharacterText(response);
  };

  const handleCharacterClick = () => {
    if (!isSupported) {
      setCharacterText("음성 인식이 지원되지 않는 브라우저예요 😢");
      return;
    }
    
    if (error) {
      setCharacterText(`오류가 발생했어요: ${error} 😓`);
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
      setCharacterText("듣고 있어요... 🎤");
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
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50">
      {/* Kawaii pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff69b4' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Animated floating clouds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-20 bg-white/40 rounded-full blur-2xl animate-float-up" />
        <div className="absolute top-20 right-20 w-40 h-24 bg-pink-200/30 rounded-full blur-2xl animate-float-up delay-150" />
        <div className="absolute bottom-20 left-20 w-36 h-22 bg-blue-200/30 rounded-full blur-2xl animate-float-up delay-300" />
      </div>

      {/* Floating Emojis */}
      {showFloatingEmojis && (
        <div className="absolute inset-0 pointer-events-none">
          {["💛", "✨", "🌟", "💫", "🦆"].map((emoji, i) => (
            <div
              key={i}
              className="absolute animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <span className="text-4xl">{emoji}</span>
            </div>
          ))}
        </div>
      )}

      {/* Kawaii Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-lg rounded-full p-3 flex justify-between items-center shadow-lg border-3 border-pink-200">
            {/* MBTI Toggle with kawaii design */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-pink-100 rounded-full px-5 py-2.5 border-2 border-white shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center shadow-sm">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-black text-blue-600">T</span>
              </div>
              
              <ThumbSwitch
                checked={!isThinking}
                onCheckedChange={toggleTheme}
                aria-label="Toggle between T and F"
                thumbColor={!isThinking ? "#FF69B4" : "#4FC3F7"}
                borderColor={!isThinking ? "#FFB6C1" : "#81D4FA"}
                backgroundColor={!isThinking ? "#FFF0F5" : "#E1F5FE"}
                trackColor={!isThinking ? "#FFE4E1" : "#B3E5FC"}
              />
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-black text-pink-600">F</span>
              </div>
            </div>

            {/* Kawaii Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-white border-2 border-pink-200 hover:bg-pink-100 transition-all hover:scale-110 shadow-md"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-pink-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-pink-400" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onNavigateToHistory}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg transition-all hover:scale-110 border-2 border-white"
              >
                <User className="h-5 w-5" />
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
              className="relative rounded-full px-10 py-6 bg-gradient-to-r from-yellow-300 to-pink-300 hover:from-yellow-400 hover:to-pink-400 text-white font-black text-lg shadow-xl transform hover:scale-110 transition-all duration-300 border-3 border-white"
            >
              <span className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</span>
              <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
              AI 추천 상품 보기
            </Button>
          </div>
        )}

        {/* Tutorial Hint */}
        {!userText && !isListening && !error && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-pulse">
            <p className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              💡 덕키를 터치하고 말해보세요!
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <p className="text-sm text-red-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              ⚠️ {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainScreen;
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, X, ArrowRight, ArrowLeft, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition, EmotionAnalysis } from "@/hooks/useSpeechRecognition";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  emotion?: EmotionAnalysis;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, emotion?: EmotionAnalysis) => void;
  onEndChat: () => void;
  isActive: boolean;
  onNavigateToProducts?: () => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
}

export const ChatInterface = ({
  messages,
  onSendMessage,
  onEndChat,
  isActive,
  onNavigateToProducts,
  onStartListening,
  onStopListening,
}: ChatInterfaceProps) => {
  const [showProductsPrompt, setShowProductsPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isListening,
    isSupported,
    error,
    result,
    startListening,
    stopListening,
    resetResult
  } = useSpeechRecognition();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 음성 인식 결과 처리
  useEffect(() => {
    if (result) {
      onSendMessage(result.transcript, result.emotion);
      setShowProductsPrompt(false);
      // 결과 처리 후 리셋
      resetResult();
    }
  }, [result, onSendMessage, resetResult]);

  // 음성 인식 시작/종료 처리
  const handleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
      onStopListening?.();
    } else {
      startListening();
      onStartListening?.();
    }
  };

  // 음성 인식 취소 처리
  const handleCancelRecording = () => {
    // 녹음 중이라면 녹음 상태 해제
    if (isListening) {
      stopListening();
      onStopListening?.();
    }

    // 상품 화면으로 이동 프롬프트가 표시되어 있다면 해당 프롬프트만 닫기
    if (showProductsPrompt) {
      setShowProductsPrompt(false);
    } else {
      // 오리 캐릭터가 보이는 메인 화면으로 돌아가기 위해 채팅만 끄기
      onEndChat();
    }
  };

  if (!isActive) return null;

  return (
    <div className="w-full max-w-lg mx-auto relative">
      {/* Cancel Button - 좌측 상단에 위치하고 여백 추가 */}
      <div className="flex justify-start mb-3 mt-2 ml-2">
        <Button
          onClick={handleCancelRecording}
          variant="ghost"
          size="icon"
          className="rounded-full glassmorphism-button"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Chat Messages - 더 크게 조정하고 아래로 위치 조정 */}
      <div className="h-80 overflow-y-auto mb-8 space-y-3 px-2 glassmorphism-card p-4 rounded-xl">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex chat-bubble-enter",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-4 py-2 rounded-2xl relative",
                message.role === "user"
                  ? "chat-bubble-user rounded-br-md"
                  : "chat-bubble-assistant rounded-bl-md"
              )}
            >
              <p
                className={cn(
                  "text-sm",
                  message.role === "assistant" && "line-clamp-3"
                )}
              >
                {message.content}
              </p>
              
              {/* 감정 분석 정보 표시 */}
              {message.emotion && message.role === "user" && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <Volume2 className="h-3 w-3" />
                    <span className="font-medium">{message.emotion.description}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-black/50 mt-1">
                    <span>음정: {message.emotion.pitch.toFixed(0)}Hz</span>
                    <span>속도: {message.emotion.speed.toFixed(1)}</span>
                    <span>볼륨: {(message.emotion.volume * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
              
              {/* 상품 추천 화면으로 이동하는 버튼 - 마지막 응답 메시지의 우측 하단에 표시 */}
              {message.role === "assistant" && index === messages.length - 1 && !isListening && !showProductsPrompt && (
                <Button
                  onClick={() => onNavigateToProducts && onNavigateToProducts()}
                  size="icon"
                  className="absolute -bottom-3 -right-3 rounded-full w-8 h-8 p-0 bg-white hover:bg-gray-100 shadow-md border border-gray-200"
                >
                  <ArrowRight className="h-4 w-4 text-black" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 음성 인식 버튼 제거 - 대신 오리 캐릭터를 클릭하여 음성 인식 시작 */}
      <div className="flex flex-col items-center gap-4">
        {!showProductsPrompt ? (
          <>
            {isListening && (
              <div className="text-center text-sm text-muted-foreground animate-pulse space-y-2">
                <span>오리에게 말하는 중...</span>
                {!isSupported && (
                  <p className="text-red-500 text-xs">브라우저가 음성 인식을 지원하지 않습니다</p>
                )}
                {error && (
                  <p className="text-red-500 text-xs">{error}</p>
                )}
              </div>
            )}
            
            {/* 음성 인식 버튼 - 수동 제어용 (필요시) */}
            {!isListening && (
              <Button
                onClick={handleVoiceRecognition}
                variant="outline"
                className="rounded-full px-6 py-4 border border-white/50 glassmorphism-button flex items-center gap-2"
                disabled={!isSupported}
              >
                <Mic className="h-4 w-4" />
                <span>다시 말하기</span>
              </Button>
            )}
          </>
        ) : (
          <>
            {/* 상품 화면으로 이동 프롬프트 삭제 - 대신 응답 메시지 우측 하단에 화살표 버튼 추가 */}
            <Button
              onClick={() => setShowProductsPrompt(false)}
              variant="outline"
              className="rounded-full px-6 py-4 border border-white/50 glassmorphism-button"
            >
              <span>계속 대화하기</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

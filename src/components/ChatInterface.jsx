import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
export const ChatInterface = ({
  messages,
  onSendMessage,
  onEndChat,
  isActive,
  onNavigateToProducts,
  isSpeaking,
  onStopSpeaking,
}) => {
  const [showProductsPrompt, setShowProductsPrompt] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 취소 처리
  const handleCancel = () => {
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
      {/* Control Buttons - 좌측에 뒤로가기, 우측에 음성 제어 */}
      <div className="flex justify-between items-center mb-3 mt-2 px-2">
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="icon"
          className="rounded-full glassmorphism-button"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {isSpeaking && (
          <Button
            onClick={onStopSpeaking}
            variant="ghost"
            size="icon"
            className="rounded-full glassmorphism-button bg-green-100/50 hover:bg-green-200/60"
          >
            <VolumeX className="h-5 w-5 text-green-700" />
          </Button>
        )}
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
              {message.role === "assistant" && index === messages.length - 1 && !showProductsPrompt && (
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

      {/* 하단 메시지 */}
      <div className="flex flex-col items-center gap-4">
        {!showProductsPrompt && (
          <div className="text-center text-sm text-muted-foreground">
            {isSpeaking ? (
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-green-600 animate-pulse" />
                <span>음성으로 응답 중... (터치하면 중지)</span>
              </div>
            ) : (
              <span>오리를 클릭하고 계속 대화해보세요!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

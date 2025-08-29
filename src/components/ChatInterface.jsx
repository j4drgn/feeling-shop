import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Volume2, VolumeX } from "lucide-react";
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
      
      {/* Animal Crossing Style Text Box - 동물의 숲 스타일 하단 텍스트 박스 */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-white/95 backdrop-blur-lg border-t-2 border-gray-300 px-6 py-4 mx-4 mb-4 rounded-t-3xl shadow-2xl">
            {/* 현재 메시지 표시 */}
            {messages.length > 0 && (
              <div className="space-y-3">
                {/* 캐릭터 이름 표시 */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-sm">🦆</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {messages[messages.length - 1].role === "user" ? "나" : "덕키"}
                  </span>
                </div>
                
                {/* 메시지 텍스트 */}
                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {messages[messages.length - 1].content}
                  </p>
                  
                  {/* 감정 분석 정보 (사용자 메시지일 때만) */}
                  {messages[messages.length - 1].emotion && messages[messages.length - 1].role === "user" && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Volume2 className="h-3 w-3" />
                        <span className="font-medium">{messages[messages.length - 1].emotion.description}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 상품 화면 이동 버튼 */}
                {messages[messages.length - 1].role === "assistant" && !showProductsPrompt && (
                  <div className="flex justify-end mt-3">
                    <Button
                      onClick={() => onNavigateToProducts && onNavigateToProducts()}
                      variant="outline"
                      size="sm"
                      className="bg-white/80 hover:bg-white border-gray-300"
                    >
                      상품 보러가기
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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

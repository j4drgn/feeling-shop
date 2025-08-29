import React, { useState, useEffect, useRef } from "react";
import { User, Brain, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThumbSwitch } from "@/components/ui/ThumbSwitch";
import { DuckCharacter } from "@/components/DuckCharacter";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/context/ThemeContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import duckImage from "@/assets/duck-character.png";

export const MainScreen = ({
  isChatActive,
  chatMessages,
  onStartChat,
  onSendMessage,
  onEndChat,
  onNavigateToHistory,
}) => {
  const { isThinking, colors, toggleTheme } = useThemeContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef(null);

  const { isListening, result, startListening, stopListening, resetResult } =
    useSpeechRecognition();

  const {
    isSpeaking,
    isSupported: isSpeechSupported,
    speak,
    stopSpeaking,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (result) {
      if (!isChatActive) {
        onStartChat();
      }
      setIsProcessing(true);
      onSendMessage(result.transcript, result.emotion, (response) => {
        setIsProcessing(false);
        if (isSpeechSupported && response) {
          const cleanResponse = response.replace(/[🦆😊😏]/g, "").trim();
          speak(cleanResponse, { rate: 1.0, pitch: 1.1, volume: 0.8 });
        }
      });
      resetResult();
    }
  }, [
    result,
    isChatActive,
    onStartChat,
    onSendMessage,
    resetResult,
    isSpeechSupported,
    speak,
  ]);

  const handleDuckClick = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (isProcessing) return;

    if (!isChatActive && !isListening) {
      startListening();
      return;
    }
    if (isChatActive && !isListening && !isSpeaking) {
      startListening();
      return;
    }
    if (isListening) {
      stopListening();
    }
  };

  const getStatusText = () => {
    if (isListening) return "듣고 있어요...";
    if (isProcessing) return "덕키가 생각 중이에요...";
    if (isSpeaking) return "말하는 중...";
    if (!isChatActive) return "덕키를 터치해서 대화를 시작하세요";
    return "덕키를 터치해서 말하기";
  };

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <header className="relative z-10 w-full px-4 pt-6 pb-2 safe-area-top">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNavigateToHistory}
              className="rounded-full bg-white/80 hover:bg-white/90 text-gray-700 shadow-md border border-gray-200/60 backdrop-blur-sm w-10 h-10"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-center">
            <div className="flex items-center gap-3 bg-white/85 backdrop-blur-md rounded-full py-2 px-5 shadow-lg border border-gray-200/60">
              <div className="flex items-center gap-1.5">
                <Brain className="h-4 w-4" style={{ color: "#5585FF" }} />
                <span className="text-xs font-bold text-gray-700">T</span>
              </div>
              <ThumbSwitch
                checked={!isThinking}
                onCheckedChange={toggleTheme}
                aria-label="Toggle between T and F"
                thumbColor={!isThinking ? "#FFBB15" : "#5585FF"}
                borderColor={!isThinking ? "#FFBB15" : "#5585FF"}
                backgroundColor={!isThinking ? "#FFF2D1" : "#D6E4FF"}
                trackColor={colors.trackColor}
              />
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" style={{ color: "#FFBB15" }} />
                <span className="text-xs font-bold text-gray-700">F</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center flex-grow">
          <div className="mb-4">
            <DuckCharacter
              size="lg"
              onClick={handleDuckClick}
              className={cn(
                "transition-all duration-300 rounded-lg",
                isListening && "listening-glow",
                isSpeaking && "speaking-pulse",
                isProcessing && "thinking-animation",
                (isChatActive || isListening) &&
                  "cursor-pointer hover:scale-105"
              )}
              circleColor={colors.circle}
            />
          </div>

          <div className="text-center h-6 mb-2 text-gray-600 font-medium">
            <p>{getStatusText()}</p>
          </div>

          <div
            ref={chatContainerRef}
            className="w-full h-full flex-grow overflow-y-auto p-3 space-y-4 bg-white/70 rounded-2xl shadow-inner"
          >
            {chatMessages.map((message) => {
              if (message.role === "assistant") {
                return (
                  <div
                    key={message.id}
                    className="flex items-end w-full justify-start gap-2"
                  >
                    <img
                      src={duckImage}
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="bg-white border border-gray-200 rounded-t-xl rounded-br-xl px-4 py-3 max-w-[80%] shadow-sm">
                      <p className="text-base leading-relaxed text-gray-800">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              }
              if (message.role === "user") {
                return (
                  <div
                    key={message.id}
                    className="flex items-end w-full justify-end gap-2"
                  >
                    <div className="bg-sky-500 text-white rounded-t-xl rounded-bl-xl px-4 py-3 max-w-[80%] shadow-sm">
                      <p className="text-base leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                );
              }
              return null;
            })}
            {isListening && result && (
              <div className="flex items-end w-full justify-end gap-2">
                <div className="bg-sky-500/70 text-white rounded-t-xl rounded-bl-xl px-4 py-3 max-w-[80%] shadow-sm">
                  <p className="text-base leading-relaxed">
                    {result.transcript}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-200/70 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

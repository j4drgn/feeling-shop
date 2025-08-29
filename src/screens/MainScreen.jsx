import { useState, useEffect } from "react";
import { DuckCharacter } from "@/components/DuckCharacter";
import SpeechBubble from "@/components/SpeechBubble";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThumbSwitch } from "@/components/ui/ThumbSwitch";
import { Brain, Heart } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";

export const MainScreen = ({
  onNavigateToHistory,
  onNavigateToProducts,
}) => {
  const { isThinking, colors, toggleTheme } = useThemeContext();
  const [characterText, setCharacterText] = useState(
    "안녕! 오늘 기분은 어때? 나를 클릭하고 원하는 걸 말해봐!"
  );
  const [userText, setUserText] = useState("");

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechRecognition({
    onResult: (result) => {
      setUserText(result);
    },
  });

  const { speak, isSpeaking } = useSpeechSynthesis({
    onEnd: () => {
      if (isListening) {
        stopListening();
      }
    },
  });

  const handleCharacterClick = () => {
    if (!isSupported) {
      setCharacterText("お使いのブラウザは音声認識をサポートしていません。");
      return;
    }
    if (isSpeaking) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (isListening) {
      setCharacterText("듣고 있어요...");
    } else if (transcript) {
      setCharacterText(`'${transcript}' 라고 말씀하셨네요!`);
    }
  }, [isListening, transcript]);

  useEffect(() => {
    if (characterText) {
      speak(characterText);
    }
  }, [characterText]);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Header with MBTI T/F toggle and profile icon */}
      <header className="absolute top-0 left-0 right-0 z-10 w-full mt-4 mb-2 px-4">
        <div className="glassmorphism-card mx-auto rounded-full py-2 px-4 flex justify-between items-center shadow-lg border border-white/60 backdrop-blur-lg max-w-md">
          {/* MBTI T/F Toggle */}
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

      {/* Duck Character - centered */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <DuckCharacter
          src="https://i.pinimg.com/originals/2f/85/3d/2f853d0d25410ea49f6e1c4628e63dd9.gif"
          size="xl"
          onClick={handleCharacterClick}
          className={isListening ? "animate-pulse-glow" : ""}
        />
      </div>

      {/* Speech Bubble */}
      <SpeechBubble text={isListening ? "듣고 있어요..." : characterText} />

      {/* Navigate to Products Button */}
      {userText && !isListening && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <Button
            onClick={onNavigateToProducts}
            className="rounded-full px-6 py-3 bg-primary hover:bg-primary/90 text-white shadow-lg"
          >
            상품 추천 보기
          </Button>
        </div>
      )}
    </div>
  );
};

export default MainScreen;
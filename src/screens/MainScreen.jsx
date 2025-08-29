import { useState, useEffect } from "react";
import { DuckCharacter } from "@/components/DuckCharacter";
import SpeechBubble from "@/components/SpeechBubble";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

export const MainScreen = () => {
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
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <DuckCharacter
          src="https://i.pinimg.com/originals/2f/85/3d/2f853d0d25410ea49f6e1c4628e63dd9.gif"
          size="xl"
          onClick={handleCharacterClick}
          className={isListening ? "animate-pulse-glow" : ""}
        />
      </div>

      <SpeechBubble text={isListening ? "듣고 있어요..." : characterText} />
    </div>
  );
};

export default MainScreen;

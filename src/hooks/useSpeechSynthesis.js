import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const utteranceRef = useRef(null);

  // 브라우저 지원 확인
  useEffect(() => {
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      setIsSupported(true);
    } else {
      setError('음성 합성을 지원하지 않는 브라우저입니다.');
    }
  }, []);

  // 음성으로 텍스트 읽기
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !text.trim()) return;

    // 이전 음성이 재생 중이면 중지
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // 음성 설정
    utterance.lang = options.lang || 'ko-KR';
    utterance.rate = options.rate || 0.9; // 조금 느리게
    utterance.pitch = options.pitch || 1.1; // 조금 높게 (친근함)
    utterance.volume = options.volume || 0.8;

    // 이벤트 리스너
    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      setError(`음성 재생 오류: ${event.error}`);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    // 음성 재생 시작
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setError('음성 재생에 실패했습니다.');
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // 음성 중지
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  // 일시정지/재생
  const pauseSpeaking = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking]);

  const resumeSpeaking = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    error,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking
  };
};
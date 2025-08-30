import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpeechSynthesis = (options = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const utteranceRef = useRef(null);

  // 브라우저 지원 확인 및 음성 초기화
  useEffect(() => {
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      // 음성 목록 로드를 위한 트리거
      window.speechSynthesis.getVoices();
      
      // 음성이 로드된 후 지원 확인
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setIsSupported(true);
        } else {
          // 음성이 아직 로드되지 않은 경우 재시도
          setTimeout(checkVoices, 100);
        }
      };
      
      // voiceschanged 이벤트 리스너 추가
      window.speechSynthesis.addEventListener('voiceschanged', checkVoices);
      checkVoices();
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', checkVoices);
      };
    } else {
      setError('음성 합성을 지원하지 않는 브라우저입니다.');
    }
  }, []);

  // 텍스트를 Animalese 스타일로 변환 (의성어화)
  const convertToAnimalese = (text) => {
    // 동물의 숲 스타일 음소들
    const animalSounds = ['a', 'e', 'i', 'o', 'u', 'ah', 'eh', 'oh', 'uh'];
    const duckSounds = ['quack', 'kwek', 'kwe', 'qua', 'kwa', 'a', 'e', 'o'];
    
    const animalizedText = text
      .split('')
      .map((char, index) => {
        if (/[가-힣]/.test(char)) {
          // 한글을 덕키 의성어로 변환
          const soundIndex = char.charCodeAt(0) % duckSounds.length;
          return index % 3 === 0 ? duckSounds[soundIndex] : animalSounds[soundIndex % animalSounds.length];
        } else if (/[A-Za-z]/.test(char)) {
          // 영어를 간단한 모음으로 변환
          const vowelMap = {
            'a': 'ah', 'e': 'eh', 'i': 'ee', 'o': 'oh', 'u': 'oo',
            'b': 'ba', 'c': 'ka', 'd': 'da', 'f': 'fa', 'g': 'ga',
            'h': 'ha', 'j': 'ja', 'k': 'ka', 'l': 'la', 'm': 'ma',
            'n': 'na', 'p': 'pa', 'q': 'kwa', 'r': 'ra', 's': 'sa',
            't': 'ta', 'v': 'va', 'w': 'wa', 'x': 'xa', 'y': 'ya', 'z': 'za'
          };
          return vowelMap[char.toLowerCase()] || 'a';
        } else if (/\s/.test(char)) {
          return ' ';
        }
        return '';
      })
      .join(' ');
    
    return animalizedText;
  };

  // Animalese 스타일로 음성 읽기
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !text.trim()) return;

    // 이전 음성이 재생 중이면 중지
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    // 텍스트를 Animalese 스타일로 변환
    const animalizedText = convertToAnimalese(text);
    
    const utterance = new SpeechSynthesisUtterance(animalizedText);
    utteranceRef.current = utterance;

    // Animalese 스타일 음성 설정 (덕키에 최적화)
    utterance.lang = 'en-US'; // 영어로 설정하여 자연스러운 소리
    utterance.rate = options.rate || 2.5; // 매우 빠르게 (동물의 숲 스타일)
    utterance.pitch = options.pitch || 2.0; // 더 높은 피치 (귀여운 덕키)
    utterance.volume = options.volume || 0.7;

    // 여성 음성 선택 (더 귀여운 소리)
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.lang.includes('en') && 
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('zira') ||
       voice.name.toLowerCase().includes('susan') ||
       voice.name.toLowerCase().includes('samantha'))
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // 이벤트 리스너
    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      if (options.onEnd) {
        options.onEnd();
      }
    };

    utterance.onerror = (event) => {
      setError(`Animalese 음성 재생 오류: ${event.error}`);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    // 음성 재생 시작
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setError('Animalese 음성 재생에 실패했습니다.');
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
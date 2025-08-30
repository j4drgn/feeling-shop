import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpeechSynthesis = (options = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);

  // 사용자 상호작용 감지
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // 이벤트 리스너는 유지 (여러 번 상호작용 가능)
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

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
          // 음성이 아직 로드되지 않은 경우 재시도 (최대 5번)
          setTimeout(checkVoices, 100);
        }
      };
      
      // voiceschanged 이벤트 리스너 추가
      window.speechSynthesis.addEventListener('voiceschanged', checkVoices);
      // 초기 확인도 실행
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

  // 텍스트에 맞는 음성 파일 선택 (더 이상 사용하지 않음)
  const getVoiceFileForText = (text) => {
    // 이 함수는 더 이상 사용되지 않지만 유지
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('안녕') || lowerText.includes('반가워')) {
      return '/audio/greeting.mp3';
    } else if (lowerText.includes('고마워') || lowerText.includes('감사')) {
      return '/audio/thanks.mp3';
    } else if (lowerText.includes('기분') || lowerText.includes('행복')) {
      return '/audio/happy.mp3';
    } else if (lowerText.includes('슬퍼') || lowerText.includes('힘들어')) {
      return '/audio/sad.mp3';
    } else if (lowerText.includes('생각')) {
      return '/audio/thinking.mp3';
    } else {
      return '/audio/default.mp3';
    }
  };

  // 실제 음성 파일 재생 (더 이상 사용하지 않음)
  const playVoiceFile = useCallback((audioSrc) => {
    // 이 함수는 더 이상 사용되지 않지만 유지
    if (!hasUserInteracted) {
      setError('음성을 재생하려면 먼저 화면을 터치하거나 클릭하세요.');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsSpeaking(true);
      setError(null);
    };

    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
      if (options.onEnd) {
        options.onEnd();
      }
    };

    audio.onerror = (event) => {
      console.error('Audio playback error:', event);
      setError('음성 파일 재생에 실패했습니다.');
      setIsSpeaking(false);
      audioRef.current = null;
    };

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 재생 성공
          })
          .catch((err) => {
            console.error('Audio play failed:', err);
            if (err.name === 'NotAllowedError') {
              setError('음성을 재생하려면 먼저 화면을 터치하거나 클릭하세요.');
            } else {
              setError('음성 파일 재생에 실패했습니다.');
            }
            setIsSpeaking(false);
            audioRef.current = null;
          });
      }
    } catch (err) {
      console.error('Audio play exception:', err);
      setError('음성 파일 재생에 실패했습니다.');
      setIsSpeaking(false);
    }
  }, [options, hasUserInteracted]);

  // Animalese 스타일로 음성 읽기 (TTS)
  const speakWithTTS = useCallback((text, options = {}) => {
    if (!isSupported || !text.trim()) {
      console.warn('TTS not supported or no text provided');
      return;
    }

    // 이미 말하고 있는 경우 스킵
    if (isSpeaking) {
      console.warn('Already speaking in TTS, skipping:', text);
      return;
    }

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
    utterance.pitch = options.pitch || 2.0; // 더 높은 피치 (귀여운 소리)
    utterance.volume = options.volume || 0.7;

    // 음성 선택 개선
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.warn('No voices available, using default');
      // 음성이 없어도 기본 utterance 사용
    } else {
      const preferredVoices = voices.filter(voice => 
        voice.lang.includes('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('zira') ||
         voice.name.toLowerCase().includes('susan') ||
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('karen') ||
         voice.name.toLowerCase().includes('sara'))
      );
      
      // 우선순위에 따라 음성 선택
      let selectedVoice = null;
      if (preferredVoices.length > 0) {
        selectedVoice = preferredVoices[0];
      } else {
        // 기본 영어 음성 선택
        const englishVoices = voices.filter(voice => voice.lang.includes('en'));
        if (englishVoices.length > 0) {
          selectedVoice = englishVoices[0];
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
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
      console.error('TTS error:', event);
      // 'canceled' 오류는 무시 (의도적인 중지)
      if (event.error === 'canceled') {
        setIsSpeaking(false);
        utteranceRef.current = null;
        return;
      }
      setError(`Animalese 음성 재생 오류: ${event.error || 'Unknown error'}`);
      setIsSpeaking(false);
      utteranceRef.current = null;
      // 에러 발생 시 더 이상 재시도하지 않도록 함
    };

    // 음성 재생 시작
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS speak exception:', err);
      setError('Animalese 음성 재생에 실패했습니다.');
      setIsSpeaking(false);
    }
  }, [isSupported, isSpeaking]);

  // 메인 speak 함수 - TTS만 사용 (음성 파일 생략)
  const speak = useCallback((text, options = {}) => {
    if (!text.trim()) return;

    // 이미 말하고 있는 경우 스킵
    if (isSpeaking) {
      console.warn('Already speaking, skipping:', text);
      return;
    }

    // TTS 지원하지 않는 경우 voices를 다시 확인
    if (!isSupported) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.warn('TTS not supported, skipping speech');
        return;
      }
    }

    // TTS만 사용하도록 간소화
    speakWithTTS(text, options);
  }, [isSpeaking, isSupported, speakWithTTS]);

  // 음성 중지
  const stopSpeaking = useCallback(() => {
    // TTS 중지
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
    
    // 음성 파일 중지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  // 일시정지/재생
  const pauseSpeaking = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isSpeaking]);

  const resumeSpeaking = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    error,
    hasUserInteracted,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking
  };
};
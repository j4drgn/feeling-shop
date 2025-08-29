import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioDataRef = useRef(null);

  // 브라우저 호환성 확인
  useEffect(() => {
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;
    
    if (SpeechRecognition && navigator.mediaDevices?.getUserMedia) {
      setIsSupported(true);
    } else {
      setError('음성 인식을 지원하지 않는 브라우저입니다.');
    }
  }, []);

  // 음성 특징 분석 함수
  const analyzeAudioFeatures = useCallback((audioData) => {
    // 음량 계산
    const volume = audioData.reduce((sum, sample) => sum + Math.abs(sample), 0) / audioData.length;
    
    // 피치 추정 (간단한 자기상관 방식)
    let pitch = 0;
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const minPeriod = Math.floor(sampleRate / 500); // 최대 500Hz
    const maxPeriod = Math.floor(sampleRate / 50);  // 최소 50Hz
    
    let maxCorrelation = 0;
    for (let period = minPeriod; period < maxPeriod && period < audioData.length / 2; period++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        pitch = sampleRate / period;
      }
    }
    
    // 속도 추정 (음성의 변화율)
    let speed = 0;
    for (let i = 1; i < audioData.length; i++) {
      speed += Math.abs(audioData[i] - audioData[i - 1]);
    }
    speed = speed / (audioData.length - 1);
    
    return {
      confidence: Math.min(volume * 10, 1), // 0-1 범위로 정규화
      pitch: Math.min(pitch, 500),
      speed: Math.min(speed * 1000, 10), // 적절한 범위로 스케일링
      volume: Math.min(volume * 10, 1)
    };
  }, []);

  // 감정 분석 함수
  const analyzeEmotion = useCallback((transcript, audioFeatures) => {
    const { pitch, speed, volume, confidence } = audioFeatures;
    
    // 텍스트 패턴 분석
    const elongatedPattern = /(.)\1{2,}/g; // "아~~~", "네~~~" 등
    const hasElongation = elongatedPattern.test(transcript);
    const exclamationCount = (transcript.match(/[!?~]/g) || []).length;
    
    // 감정 규칙 기반 분석
    let emotion = 'neutral';
    let description = '중립적인 톤';
    
    if (hasElongation && pitch > 200 && exclamationCount > 0) {
      emotion = 'sarcastic';
      description = '비꼬는 듯한 톤으로 들립니다';
    } else if (pitch > 250 && speed > 5 && volume > 0.7) {
      emotion = 'excited';
      description = '흥미롭고 활기찬 톤입니다';
    } else if (pitch > 200 && volume > 0.6) {
      emotion = 'happy';
      description = '밝고 긍정적인 톤입니다';
    } else if (pitch < 150 && speed < 3) {
      emotion = 'sad';
      description = '침울하고 느린 톤입니다';
    } else if (volume > 0.8 && speed > 6) {
      emotion = 'angry';
      description = '화가 난 듯한 강한 톤입니다';
    } else if (speed < 2 && volume < 0.3) {
      emotion = 'frustrated';
      description = '답답하고 조용한 톤입니다';
    }
    
    return {
      confidence,
      emotion,
      pitch,
      speed,
      volume,
      description
    };
  }, []);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    if (!isSupported || isListening) return;

    try {
      setError(null);
      setResult(null);
      
      // MediaStream 가져오기 (오디오 분석용)
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Web Audio API 설정
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);
      
      // 오디오 데이터 배열 초기화
      audioDataRef.current = new Float32Array(analyserRef.current.frequencyBinCount);
      
      // Speech Recognition 설정
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ko-KR';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        if (!event.results || event.results.length === 0) return;
        
        const transcript = event.results[0][0].transcript;
        const speechConfidence = event.results[0][0].confidence;
        
        // 중복 방지: 이전 결과와 같으면 무시
        if (result && result.transcript === transcript) {
          return;
        }
        
        // 오디오 특징 추출
        if (analyserRef.current && audioDataRef.current) {
          analyserRef.current.getFloatTimeDomainData(audioDataRef.current);
          const audioFeatures = analyzeAudioFeatures(audioDataRef.current);
          const emotion = analyzeEmotion(transcript, audioFeatures);
          
          setResult({
            transcript,
            emotion,
            confidence: speechConfidence
          });
        } else {
          // 오디오 분석이 실패한 경우 기본값
          setResult({
            transcript,
            emotion: {
              confidence: speechConfidence,
              emotion: 'neutral',
              pitch: 0,
              speed: 0,
              volume: 0,
              description: '음성 분석을 완료했습니다'
            },
            confidence: speechConfidence
          });
        }
        
        // 음성 인식 완료 후 즉시 중지
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        setError(`음성 인식 오류: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        cleanup();
      };
      
      recognitionRef.current.start();
    } catch (err) {
      setError('마이크 접근 권한이 필요합니다.');
      setIsListening(false);
    }
  }, [isSupported, analyzeAudioFeatures, analyzeEmotion]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    cleanup();
  }, []);

  // 리소스 정리
  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    audioDataRef.current = null;
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 결과 리셋
  const resetResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    error,
    result,
    startListening,
    stopListening,
    resetResult
  };
};

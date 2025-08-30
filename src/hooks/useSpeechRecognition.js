import { useState, useEffect, useRef, useCallback } from 'react';
import chatApi from '@/api/chatApi';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioDataRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timeoutRef = useRef(null);

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
    
    // 의문문 패턴 감지 (한국어)
    const questionPatterns = [
      /\b(왜|어떻게|무엇|언제|어디|누구|뭐|어떤|어느)\b/,
      /\b(해|돼|돼요|인가요|나요|까|을까|ㄹ까)\b$/,
      /\b(있어|없어|할까|먹을까|갈까)\b$/
    ];
    
    const hasQuestionWords = questionPatterns.some(pattern => pattern.test(transcript));
    
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
      description,
      hasQuestionWords // 의문문 감지 결과 추가
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
      
      // MediaRecorder 초기화 (음성 데이터 녹음용)
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current);
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        // 녹음된 데이터를 Blob으로 변환
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // 기존 결과에 음성 데이터 추가
        setResult(prevResult => ({
          ...prevResult,
          audioBlob,
          audioUrl,
          audioDuration: 0, // 추후 계산 가능
        }));
      };
      
      // 녹음 시작
      mediaRecorderRef.current.start();
      
      // Speech Recognition 설정
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ko-KR';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        
        // 5초 후 자동 타임아웃
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            setError("듣기 시간이 초과되었어요. 다시 시도해주세요!");
            setIsListening(false);
          }
        }, 5000);
      };
      
      recognitionRef.current.onresult = (event) => {
        // 타임아웃 클리어
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (!event.results || event.results.length === 0) return;
        
        let transcript = event.results[0][0].transcript;
        const speechConfidence = event.results[0][0].confidence;
        
        // 중복 방지: 이전 결과와 같으면 무시
        if (result && result.transcript === transcript) {
          return;
        }
        
        // 의문문 패턴 감지 및 물음표 추가
        const questionPatterns = [
          /\b(왜|어떻게|무엇|언제|어디|누구|뭐|어떤|어느)\b/,
          /\b(해|돼|돼요|인가요|나요|까|을까|ㄹ까)\b$/,
          /\b(있어|없어|할까|먹을까|갈까)\b$/
        ];
        
        const isQuestion = questionPatterns.some(pattern => pattern.test(transcript));
        if (isQuestion && !transcript.includes('?')) {
          transcript += '?';
        }
        
        // 오디오 특징 추출
        if (analyserRef.current && audioDataRef.current) {
          analyserRef.current.getFloatTimeDomainData(audioDataRef.current);
          const audioFeatures = analyzeAudioFeatures(audioDataRef.current);
          const emotion = analyzeEmotion(transcript, audioFeatures);
          
          setResult({
            transcript,
            emotion: {
              ...emotion,
              isVoiceInput: true,
              questionDetected: isQuestion,
              timestamp: Date.now(),
              duration: 0, // 추후 녹음 시간 추가 가능
            },
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
              description: '음성 분석을 완료했습니다',
              hasQuestionWords: isQuestion
            },
            confidence: speechConfidence
          });
        }
        
        // 음성 인식 완료 후 즉시 중지
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        // 녹음 중지
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        // 타임아웃 클리어
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        let friendlyMessage;
        switch (event.error) {
          case 'no-speech':
            friendlyMessage = "잘 들리지 않았어요. 다시 한 번 말해보세요!";
            break;
          case 'audio-capture':
            friendlyMessage = "마이크에 문제가 있는 것 같아요. 마이크를 확인해주세요!";
            break;
          case 'not-allowed':
            friendlyMessage = "마이크 사용 권한을 허용해주세요!";
            break;
          case 'network':
            friendlyMessage = "인터넷 연결을 확인해주세요!";
            break;
          case 'language-not-supported':
            friendlyMessage = "지원하지 않는 언어예요. 다른 언어로 말해보세요!";
            break;
          case 'service-not-allowed':
            friendlyMessage = "음성 인식 서비스를 사용할 수 없어요. 잠시 후 다시 시도해주세요!";
            break;
          default:
            friendlyMessage = "음성을 인식하지 못했어요. 다시 시도해주세요!";
        }
        setError(friendlyMessage);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        // 타임아웃 클리어
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        setIsListening(false);
        cleanup();
      };
      
      recognitionRef.current.start();
    } catch (err) {
      setError('마이크 접근 권한이 필요합니다.');
      setIsListening(false);
    }
  }, [isSupported, analyzeAudioFeatures, analyzeEmotion]);

  // audioBlob이 setResult에 들어오면 서버에 업로드하여 Whisper 등으로 전사 및 라벨링 요청
  useEffect(() => {
    const uploadAndTranscribe = async (audioBlob, prevResult) => {
      try {
        // 액세스 토큰이 필요한 경우 로컬스토리지에서 가져옴
        const accessToken = localStorage.getItem('accessToken') || null;

        // 기본 음성 메타데이터 (가능하면 더 정밀하게 채우세요)
        const voiceMetadata = {
          duration: prevResult?.audioDuration || 1.0,
          sampleRate: audioContextRef.current?.sampleRate || 16000,
        };

        setIsUploading(true);
        setUploadProgress(0);
        const serverResponse = await chatApi.sendVoiceFileAndTranscribe(
          audioBlob,
          prevResult?.transcript || '',
          voiceMetadata,
          accessToken,
          null,
          (percent) => {
            setUploadProgress(percent);
          },
          () => {
            // upload finished (request sent) — still waiting server processing
            setUploadProgress(100);
          }
        );
        setIsUploading(false);

        // 서버 응답 구조 예시: { transcript, emotion, labels, sessionId }
        if (serverResponse) {
          setResult(prev => ({
            ...prev,
            transcript: serverResponse.transcript || prev.transcript,
            emotion: serverResponse.emotion || prev.emotion,
            serverLabels: serverResponse.labels || null,
            serverSessionId: serverResponse.sessionId || null,
            chatResponse: serverResponse.chatResponse || null,
          }));
        }
      } catch (err) {
        // 서버 전송 실패 시 로컬 분석 결과를 그대로 사용
        console.warn('오디오 업로드/전사 실패:', err);
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    if (result && result.audioBlob) {
      uploadAndTranscribe(result.audioBlob, result);
    }
  }, [result]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    // 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    cleanup();
  }, []);

  // 리소스 정리
  const cleanup = useCallback(() => {
    // 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 음성 인식 중지
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // 녹음 중지
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
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
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
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
  ,isUploading,
  uploadProgress
  };
};



import { useState, useEffect, useRef, useCallback } from 'react';
import chatApi from '@/api/chatApi';

export const useSpeechRecognition = (sessionId = null) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskStatus, setTaskStatus] = useState(null);
  
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timeoutRef = useRef(null);
  const recordingStartTimeRef = useRef(null);

  // 미디어 호환성 확인 (음성 녹음만)
  useEffect(() => {
    if (navigator.mediaDevices?.getUserMedia) {
      setIsSupported(true);
    } else {
      setError('음성 녹음을 지원하지 않는 브라우저입니다.');
    }
  }, []);


  // 음성 녹음 시작 (Whisper 전용)
  const startListening = useCallback(async () => {
    if (!isSupported || isListening) return;

    try {
      setError(null);
      setResult(null);
      
      // MediaStream 가져오기 (녹음용)
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // MediaRecorder 초기화 (음성 데이터 녹음용)
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
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
        
        // 음성 파일을 결과에 추가 (Whisper가 처리)
        setResult({
          audioBlob,
          audioUrl,
          audioDuration: recordingStartTimeRef.current ? Date.now() - recordingStartTimeRef.current : 0,
          timestamp: Date.now(),
          isVoiceInput: true,
          // transcript는 Whisper가 처리 후 서버에서 받음
          transcript: null,
          emotion: null
        });
      };
      
      // 녹음 시작
      recordingStartTimeRef.current = Date.now();
      mediaRecorderRef.current.start();
      setIsListening(true);
      
      // 10초 후 자동 녹음 중지 (사용자가 길게 말할 수 있도록 연장)
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsListening(false);
        }
      }, 10000); // 10초로 연장
      
    } catch (err) {
      setError('마이크 접근 권한이 필요합니다.');
      setIsListening(false);
      console.error('음성 녹음 시작 실패:', err);
    }
  }, [isSupported]);

  // audioBlob이 setResult에 들어오면 서버에 업로드하여 Whisper 등으로 전사 및 라벨링 요청
  useEffect(() => {
    const uploadAndTranscribe = async (audioBlob, prevResult) => {
      try {
        console.log('🎤 음성 파일 업로드 시작:', { size: audioBlob.size, type: audioBlob.type });
        setIsUploading(true);
        setUploadProgress(0);

        // 액세스 토큰이 필요한 경우 로컬스토리지에서 가져옴
        const accessToken = localStorage.getItem('accessToken') || null;
        console.log('🔑 액세스 토큰:', accessToken ? '있음' : '없음');

        // 음성 메타데이터 준비 (Whisper가 처리하므로 기본값 사용)
        const voiceMetadata = {
          duration: prevResult?.audioDuration || 1.0,
          sampleRate: 16000, // 고정값 사용
          pitch: 0,
          volume: 0,
          speed: 0,
          confidence: 0.5,
        };

        console.log('📊 음성 메타데이터:', voiceMetadata);

        // 서버로 음성 파일 업로드 및 전사 요청
        const uploadResponse = await chatApi.sendVoiceFileAndTranscribe(
          audioBlob,
          prevResult?.transcript || '',
          voiceMetadata,
          accessToken,
          sessionId, // 전달받은 sessionId 사용
          true, // asyncMode 활성화
          (progress) => {
            console.log(`📤 업로드 진행률: ${progress}%`);
            setUploadProgress(progress);
          },
          () => {
            console.log('✅ 업로드 완료');
            setUploadProgress(100);
          }
        );

        console.log('📥 서버 응답:', uploadResponse);

        // DuckK API 응답 처리
        if (uploadResponse) {
          console.log('📥 DuckK API 응답:', uploadResponse);
          
          // 비동기 작업인 경우 (jobId 있음)
          if (uploadResponse.success && typeof uploadResponse.data === 'string') {
            const jobId = uploadResponse.data;
            console.log('⏳ 비동기 작업 시작, jobId:', jobId);
            setResult(prev => ({
              ...prev,
              serverJobId: jobId,
              isProcessing: false, // 폴링을 시작하기 위해 false로 설정
              audioBlob: null, // 업로드 완료 후 audioBlob 제거
            }));
          } 
          // 동기 응답인 경우 (content 있음)
          else if (uploadResponse.success && uploadResponse.data && uploadResponse.data.content) {
            console.log('✅ 동기 응답 받음:', uploadResponse.data.content);
            setResult(prev => ({
              ...prev,
              chatResponse: uploadResponse.data,
              serverSessionId: uploadResponse.data.chatSessionId || sessionId,
              audioBlob: null, // 업로드 완료 후 audioBlob 제거
            }));
          }
          // 기타 응답 구조 처리
          else if (uploadResponse.data) {
            console.log('📦 기타 응답:', uploadResponse.data);
            setResult(prev => ({
              ...prev,
              serverResponse: uploadResponse.data,
              audioBlob: null,
            }));
          }
        }

        setIsUploading(false);
        console.log('🎉 음성 파일 처리 완료');
      } catch (err) {
        console.error('❌ 오디오 업로드/전사 실패:', err);
        setIsUploading(false);
        setUploadProgress(0);
        setError('서버 업로드/전사 실패: ' + (err.message || String(err)));
        // 서버 전송 실패 시 로컬 결과 유지
      }
    };

    if (result && result.audioBlob && !result.serverJobId && !isUploading) {
      console.log('🎵 audioBlob 감지됨, 업로드 시작');
      uploadAndTranscribe(result.audioBlob, result);
    }
  }, [result]);

  // Polling for async job status
  useEffect(() => {
    let intervalId = null;
    let currentJobId = null;
    let pollCount = 0;
    const maxPollAttempts = 40; // 최대 2분 (3초 * 40 = 120초)
    
    const startPolling = (jobId) => {
      // 이미 같은 jobId로 폴링 중이면 무시
      if (currentJobId === jobId && intervalId) {
        console.log('🔄 이미 폴링 중:', jobId);
        return;
      }
      // 기존 폴링 중지 (다른 jobId인 경우만)
      if (intervalId && currentJobId !== jobId) {
        console.log('🛑 기존 폴링 중지 (새 작업):', currentJobId, '->', jobId);
        clearTimeout(intervalId);
        intervalId = null;
      }
      currentJobId = jobId;
      pollCount = 0;
      console.log('🔄 폴링 시작, jobId:', jobId);
      setIsProcessing(true);
      setTaskStatus({ status: 'pending', jobId, message: '음성 처리 중입니다. 잠시만 기다려주세요.' });

      // 지수 백오프 방식으로 interval을 점진적으로 늘림
      const getInterval = (count) => {
        if (count < 3) return 1000; // 처음 3회는 1초 간격
        if (count < 8) return 2000; // 4~8회는 2초 간격
        if (count < 20) return 3000; // 9~20회는 3초 간격
        return 5000; // 이후는 5초 간격
      };

      const poll = async () => {
        pollCount++;
        try {
          setTaskStatus(ts => ({ ...(ts || {}), message: `음성 처리 중... (${pollCount}회 시도)` }));
          console.log(`📡 작업 상태 조회 중... (${pollCount}/${maxPollAttempts})`);
          const status = await chatApi.getVoiceTaskStatus(jobId);
          console.log('📊 작업 상태 상세:', JSON.stringify(status, null, 2));
          if (status && status.success && status.data) {
            const taskData = status.data;
            console.log('🔍 DuckK 작업 데이터:', JSON.stringify(taskData, null, 2));
            const isCompleted = taskData.status === 'DONE' || 
                               taskData.status === 'COMPLETED' ||
                               (taskData.assistantResponse && taskData.assistantResponse.trim());
            if (isCompleted) {
              console.log('✅ DuckK 작업 완료!', { 
                status: taskData.status,
                hasTranscript: !!taskData.transcript,
                hasAssistantResponse: !!taskData.assistantResponse
              });
              
              // DuckK API 응답 구조에 맞게 결과 업데이트
              setResult(prev => ({
                ...prev,
                transcript: taskData.transcript || prev.transcript,
                chatResponse: taskData.assistantResponse ? {
                  content: taskData.assistantResponse,
                  type: 'ASSISTANT',
                  timestamp: new Date().toISOString(),
                  chatSessionId: taskData.sessionId || prev.serverSessionId
                } : prev.chatResponse,
                serverSessionId: taskData.sessionId || prev.serverSessionId,
                serverLabels: taskData.analysisJson ? (() => {
                  try {
                    return JSON.parse(taskData.analysisJson);
                  } catch (e) {
                    console.warn('JSON 파싱 실패:', taskData.analysisJson);
                    return prev.serverLabels;
                  }
                })() : prev.serverLabels,
                audioBlob: null,
                // serverJobId를 완료 후에도 유지하여 폴링이 중단되지 않도록 함
                isProcessing: false,
              }));
              setIsProcessing(false);
              clearTimeout(intervalId);
              intervalId = null;
              currentJobId = null;
              setTimeout(() => {
                setResult(prev => ({
                  ...prev,
                  serverJobId: null
                }));
              }, 100);
              return;
            } else if (taskData.status === 'FAILED' || taskData.errorMessage) {
              console.log('❌ DuckK 작업 실패:', taskData.errorMessage);
              setError(taskData.errorMessage || '음성 처리 작업이 실패했습니다.');
              setIsProcessing(false);
              clearTimeout(intervalId);
              intervalId = null;
              currentJobId = null;
              return;
            } else if (pollCount >= maxPollAttempts) {
              console.log('⏰ 폴링 타임아웃');
              setError('음성 처리 작업이 시간 초과되었습니다. 다시 시도해주세요.');
              setIsProcessing(false);
              clearTimeout(intervalId);
              intervalId = null;
              currentJobId = null;
              return;
            } else {
              const eta = Math.max(0, (maxPollAttempts - pollCount) * 3);
              console.log('⏳ DuckK 작업 진행 중:', taskData.status || 'PENDING', `(남은 시간: ~${eta}초)`);
              setTaskStatus({ status: taskData.status || 'PENDING', jobId, eta });
            }
          } else {
            console.log('⚠️ DuckK 작업 상태 데이터 없음', { status });
            if (pollCount >= maxPollAttempts) {
              setError('음성 처리 작업 상태를 가져올 수 없습니다.');
              setIsProcessing(false);
              clearTimeout(intervalId);
              intervalId = null;
              currentJobId = null;
              return;
            }
          }
        } catch (err) {
          console.error('❌ 폴링 실패:', err);
          if (pollCount >= maxPollAttempts) {
            setError('서버 작업 상태 조회 실패: ' + (err.message || String(err)));
            setIsProcessing(false);
            clearTimeout(intervalId);
            intervalId = null;
            currentJobId = null;
            return;
          } else {
            console.log(`🔄 폴링 재시도 중... (${pollCount}/${maxPollAttempts})`);
          }
        }
        intervalId = setTimeout(poll, getInterval(pollCount));
      };
      poll();
    };


    if (result && result.serverJobId && result.isProcessing === false) {
      console.log('🚀 serverJobId 감지됨, 폴링 시작:', result.serverJobId);
      startPolling(result.serverJobId);
    }

    return () => {
      // 완료된 작업의 경우 cleanup을 하지 않음
      if (intervalId && result && result.isProcessing !== false) {
        console.log('🛑 폴링 중지 (cleanup)');
        clearInterval(intervalId);
        intervalId = null;
        currentJobId = null;
      }
    };
  }, [result?.serverJobId, result?.isProcessing]);

  // 음성 녹음 중지
  const stopListening = useCallback(() => {
    // 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 녹음 중지
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsListening(false);
    cleanup();
  }, []);

  // 리소스 정리
  const cleanup = useCallback(() => {
    // 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 녹음 중지
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    recordingStartTimeRef.current = null;
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
  ,isProcessing,
  taskStatus
  };
};



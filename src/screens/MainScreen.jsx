import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedDuckCharacter from "@/components/AnimatedDuckCharacter";
import SpeechBubble from "@/components/SpeechBubble";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useDuckAnimation } from "@/hooks/useDuckAnimation";
import { User, Mic, Volume2, VolumeX, Send, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbSwitch } from "@/components/ui/ThumbSwitch";
import { Brain, Heart } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import QuickAccessButton from "@/components/QuickAccessButton";
import ChatHistoryButton from "@/components/ChatHistoryButton";
import { userProfileService } from "@/services/userProfile";
import { contentRecommendationEngine } from "@/services/contentRecommendationEngine";
import chatApi from "@/api/chatApi";
import { recommendationEngine } from "@/services/recommendationEngine";
import { emotionAnalysisEngine } from "@/services/emotionAnalysis";
import { emotionCommerceEngine } from "@/services/emotionCommerceEngine";
import { conversionTracking } from "@/services/conversionTracking";
import healthApi from "@/api/healthApi";

export const MainScreen = () => {
  const navigate = useNavigate();
    const { toggleTheme } = useThemeContext();
  const [characterProfile, setCharacterProfile] = useState("F형"); // 'F형' or 'T형'
  const [characterText, setCharacterText] = useState(
    "안녕! 나는 덕키야. 오늘 기분은 어때? 나를 터치하고 말해봐!"
  );

  // 앱 시작시 환영 애니메이션 - 훅 정의 후에 이동
  const [userText, setUserText] = useState("");
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationContext, setConversationContext] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [profileQuestion, setProfileQuestion] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [contentRecommendations, setContentRecommendations] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const characterRef = useRef(null);
  const lastSpokenTextRef = useRef(null);
  const speakTimeoutRef = useRef(null);

  // 서버 헬스체크 함수
  const checkServerHealth = async () => {
    try {
      const healthResponse = await healthApi.checkHealth();
      if (healthResponse && healthResponse.success) {
        console.log('Backend health OK');
        const wasOffline = isOfflineMode;
        setIsOfflineMode(false);
        // 오프라인에서 온라인으로 전환된 경우에만 세션 초기화 재시도
        if (wasOffline && !chatSessionId) {
          initializeChatSession();
        }
        return true;
      } else {
        console.warn('Backend health check failed:', healthResponse && healthResponse.message);
        setCharacterText('백엔드 서버에 연결할 수 없습니다. 오프라인 모드로 전환합니다.');
        setIsOfflineMode(true);
        return false;
      }
    } catch (error) {
      console.error('checkServerHealth exception', error);
      setCharacterText('서버에 연결할 수 없습니다. 오프라인 모드로 전환합니다.');
      setIsOfflineMode(true);
      return false;
    }
  };

  // 채팅 세션 초기화 함수
  const initializeChatSession = async () => {
    try {
      // 백엔드가 오프라인 상태라면 세션 초기화를 건너뜀
      if (isOfflineMode) {
        console.log('오프라인 모드: 채팅 세션 초기화 건너뜀');
        return;
      }

      const storedSessionId = localStorage.getItem("currentChatSessionId");
      if (storedSessionId) {
        const isValid = await validateChatSession(parseInt(storedSessionId, 10));
        if (isValid) {
          setChatSessionId(parseInt(storedSessionId, 10));
        } else {
          localStorage.removeItem("currentChatSessionId");
          await createNewChatSession();
        }
      } else {
        // 새 세션 생성
        await createNewChatSession();
      }
    } catch (error) {
      console.error('채팅 세션 초기화 실패:', error);
      // 백엔드 오류 시 오프라인 모드로 전환
      setIsOfflineMode(true);
      setCharacterText('백엔드 서버에 연결할 수 없습니다. 오프라인 모드로 전환합니다.');
    }
  };

  const {
    isListening,
    result,
    startListening,
    stopListening,
    isSupported,
    error,
    resetResult,
    isUploading,
    uploadProgress,
    isProcessing,
    taskStatus,
  } = useSpeechRecognition(chatSessionId);

  const { speak, isSpeaking, stopSpeaking, hasUserInteracted, setUserInteracted } = useSpeechSynthesis({
    onEnd: () => {
      // 음성 출력이 끝났을 때 애니메이션을 idle로 복원
      if (currentAnimation !== "idle" && !isListening) {
        triggerAnimation("idle");
      }
    },
  });

  // Duck animation management
  const {
    currentAnimation,
    triggerCount,
    triggerAnimation,
    isAnimating,
  } = useDuckAnimation({
    emotion: result?.emotion,
    isListening,
    isSpeaking,
    conversationContext,
  });

  // 애니메이션 완료 처리
  const handleAnimationComplete = (completedAnimation) => {
    // product_recommendation 애니메이션이 끝나면 쇼츠 페이지로 이동
    if (completedAnimation === 'product_recommendation') {
      setTimeout(() => {
        navigate('/content');
      }, 500); // 약간의 딜레이 후 이동
    }
  };

    // 앱 시작시 환영 애니메이션과 채팅 세션 생성
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      if (triggerAnimation) {
        triggerAnimation("happy", true);
      }
    }, 1000);

    // 서버 헬스체크
    checkServerHealth();

    // 로컬 스토리지에서 세션 ID 확인 및 유효성 검증
    initializeChatSession();

    // 서버 상태 주기적 모니터링 (오프라인 모드일 때만)
    const serverMonitorInterval = setInterval(async () => {
      if (isOfflineMode) {
        const isServerBack = await checkServerHealth();
        if (isServerBack) {
          clearInterval(serverMonitorInterval);
        }
      }
    }, 30000); // 30초마다 확인

    return () => {
      clearTimeout(welcomeTimer);
      clearInterval(serverMonitorInterval);
    };
  }, [triggerAnimation]);

  // 새 채팅 세션 생성 함수
  const createNewChatSession = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken") || null;
      
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!accessToken) {
        console.log('액세스 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
        return;
      }
      
      const sessionTitle = `대화 ${new Date().toLocaleString("ko-KR")}`;
      const response = await chatApi.createChatSession(sessionTitle, accessToken);

      if (!response || !response.success) {
        console.warn('createChatSession failed or returned invalid:', response && response.message);
        // 인증 오류인 경우 로그인 페이지로 리다이렉트
        if (response && response.message && response.message.includes('인증')) {
          console.log('인증 오류로 로그인 페이지로 이동합니다.');
          navigate('/login');
          return;
        }
        // 백엔드 오류 시 오프라인 모드로 전환
        setIsOfflineMode(true);
        setCharacterText('백엔드 서버에 연결할 수 없습니다. 오프라인 모드로 전환합니다.');
        return;
      }

      // response.data는 서버 응답 본문
      let sessionId = null;
      const d = response.data || {};
      if (d.data && d.data.id) sessionId = d.data.id;
      else if (d.id) sessionId = d.id;
      else if (d.sessionId) sessionId = d.sessionId;

      if (sessionId && !isNaN(sessionId)) {
        setChatSessionId(sessionId);
        localStorage.setItem("currentChatSessionId", sessionId.toString());
      } else {
        throw new Error('세션 ID를 응답에서 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('채팅 세션 생성 실패:', error);
      // 인증 관련 오류인 경우 로그인 페이지로 리다이렉트
      if (error.message && (error.message.includes('인증') || error.message.includes('토큰') || error.message.includes('401'))) {
        console.log('인증 오류로 로그인 페이지로 이동합니다.');
        navigate('/login');
        return;
      }
      // 백엔드 오류 시 오프라인 모드로 전환
      setIsOfflineMode(true);
      setCharacterText('백엔드 서버에 연결할 수 없습니다. 오프라인 모드로 전환합니다.');
      // 세션 ID를 null로 설정하여 세션 없는 모드로 전환
      setChatSessionId(null);
      localStorage.removeItem("currentChatSessionId");
    }
  };

  // 세션 유효성 검증 함수
  const validateChatSession = async (sessionId) => {
    try {
      const accessToken = localStorage.getItem("accessToken") || null;
      
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!accessToken) {
        console.log('액세스 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
        return false;
      }
      
      // 세션의 메시지를 가져와서 세션이 유효한지 확인
      await chatApi.getSessionMessages(sessionId, accessToken);
      return true;
    } catch (error) {
      // 인증 오류인 경우 로그인 페이지로 리다이렉트
      if (error.message && (error.message.includes('인증') || error.message.includes('토큰') || error.message.includes('401') || error.message.includes('403'))) {
        console.log('인증 오류로 로그인 페이지로 이동합니다.');
        navigate('/login');
        return false;
      }
      // 404 오류 또는 세션 관련 오류는 세션이 존재하지 않는다는 의미
      if (
        error.message.includes("404") ||
        error.message.includes("세션 메시지를 가져오는데 실패했습니다") ||
        error.message.includes("채팅 세션을 찾을 수 없습니다") ||
        error.message.includes("400")
      ) {
        return false;
      }
      // 다른 오류(네트워크 오류 등)는 서버 문제로 간주하고 오프라인 모드로 전환
      console.error('세션 검증 중 서버 오류:', error);
      setIsOfflineMode(true);
      setCharacterText('백엔드 서버에 연결할 수 없습니다. 오프라인 모드로 전환합니다.');
      return false;
    }
  };

  const handleUserInput = async (input, emotion) => {
    try {
      const accessToken = localStorage.getItem("accessToken") || null;
      const emotionAnalysis = emotionAnalysisEngine.analyzeEmotion(input);
      
      // 2. 사용자 프로필에 반영
      userProfileService.updateFromConversation(input, emotionAnalysis);
      
      // 3. 감정 변화 추적
      if (emotion) {
        conversionTracking.trackEmotionChange(
          emotion.previousEmotion || 'neutral',
          emotionAnalysis.dominant,
          'conversation'
        );
      }

      // 사용자 메시지를 히스토리에 추가
      const userMessage = {
        role: 'user',
        content: input,
        emotion: emotionAnalysis,
        timestamp: new Date().toISOString()
      };
      setConversationHistory(prev => [...prev, userMessage]);
      
      // 오프라인 모드 처리
      if (isOfflineMode) {
        const offlineResponse = generateOfflineResponse(input, emotionAnalysis);
        setCharacterText(offlineResponse);
        setConversationContext(emotionAnalysis.dominant);
        setIsAIThinking(false);
        return;
      }
      
      // 2. 프로필 질문이 대기 중인지 확인
      if (profileQuestion) {
        const response = await handleProfileAnswer(input);
        setCharacterText(response);
        setProfileQuestion(null);
        setIsAIThinking(false);
        return;
      }

      const lowerInput = input.toLowerCase();
      let response = "";
      let context = null;
      const emotionContext = emotion?.emotion || "neutral";

      // API 호출 시도
      try {
        // 토큰이 없으면 로그인 페이지로 리다이렉트
        if (!accessToken) {
          console.log('액세스 토큰이 없습니다. 로그인 페이지로 이동합니다.');
          navigate('/login');
          return;
        }

        // Duckey Chat API 호출 - 대화 히스토리 포함
        const apiResponse = await chatApi.sendDuckyChatMessage(
          {
            message: input,
            characterProfile: characterProfile, // "F형" or "T형"
            extractedLabelsJson: emotion ? JSON.stringify(emotion) : null, // 감정 분석 결과를 JSON으로
            conversationHistory: conversationHistory.slice(-5), // 최근 5개의 메시지만 포함
          },
          accessToken
        );

        if (apiResponse && apiResponse.data) {
          // 백엔드 응답 구조에 따라 content 추출
          if (typeof apiResponse.data === 'string') {
            response = apiResponse.data;
          } else if (apiResponse.data.content) {
            response = apiResponse.data.content;
          } else if (apiResponse.data.data && apiResponse.data.data.content) {
            response = apiResponse.data.data.content;
          } else {
            throw new Error("API 응답이 올바르지 않습니다.");
          }
          
          // AI 응답을 히스토리에 추가
          const aiMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
          };
          setConversationHistory(prev => [...prev, aiMessage]);

          // 새 세션 ID가 생성되었으면 설정
          if (apiResponse.sessionId) {
            setChatSessionId(apiResponse.sessionId);
            localStorage.setItem("currentChatSessionId", apiResponse.sessionId.toString());
          }

          // API 응답을 사용하므로 로컬 로직 건너뜀
          setCharacterText(response);
          setConversationContext(emotionContext);
          setIsAIThinking(false);
          return;
        } else {
          throw new Error("API 응답이 올바르지 않습니다.");
        }
      } catch (apiError) {
        console.error("API 호출 실패:", apiError);
        // 인증 오류인 경우 로그인 페이지로 리다이렉트
        if (apiError.message && (apiError.message.includes('인증') || apiError.message.includes('토큰') || apiError.message.includes('401') || apiError.message.includes('403'))) {
          console.log('인증 오류로 로그인 페이지로 이동합니다.');
          navigate('/login');
          return;
        }
        // 서버 연결 실패 감지
        if (apiError.message.includes('Failed to fetch') || apiError.message.includes('ERR_CONNECTION_REFUSED')) {
          setCharacterText('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
          setIsAIThinking(false);
          return;
        }
        // 다른 API 오류는 로컬 로직으로 폴백
        const offlineResponse = generateOfflineResponse(input, emotionAnalysis);
        setCharacterText(offlineResponse);
        setConversationContext(emotionAnalysis.dominant);
        setIsAIThinking(false);
      }
    } catch (error) {
      console.error("Error in handleUserInput:", error);
      setCharacterText("어? 뭔가 문제가 생겼어! 다시 말해줄래?");
      setIsAIThinking(false);
    }
  };

  // 프로필 질문 답변 처리
  const handleProfileAnswer = async (answer) => {
    const lowerAnswer = answer.toLowerCase();

    if (profileQuestion.type === "age") {
      let age = null;
      if (lowerAnswer.includes("10")) age = 15;
      else if (lowerAnswer.includes("20")) age = 25;
      else if (lowerAnswer.includes("30")) age = 35;
      else if (lowerAnswer.includes("40")) age = 45;
      else if (lowerAnswer.includes("50")) age = 55;

      if (age) {
        userProfileService.userProfile.demographics.age = age;
        userProfileService.saveProfile();
      }

      return "좋아! 이제 더 정확한 추천을 해줄 수 있을 거야!";
    } else if (profileQuestion.type === "living") {
      let livingType = null;
      if (lowerAnswer.includes("원룸") || lowerAnswer.includes("오피스텔"))
        livingType = "원룸";
      else if (lowerAnswer.includes("아파트")) livingType = "아파트";
      else if (lowerAnswer.includes("빌라")) livingType = "빌라";
      else if (lowerAnswer.includes("주택")) livingType = "주택";

      if (livingType) {
        userProfileService.userProfile.demographics.livingType = livingType;
        userProfileService.saveProfile();
      }

      return `${livingType}에서 살고 있구나! 공간에 딱 맞는 제품들을 추천해줄게!`;
    } else if (profileQuestion.type === "hobbies") {
      const hobbies = [];
      if (lowerAnswer.includes("요리")) hobbies.push("cooking");
      if (lowerAnswer.includes("운동")) hobbies.push("exercise");
      if (lowerAnswer.includes("게임")) hobbies.push("gaming");
      if (lowerAnswer.includes("독서")) hobbies.push("reading");
      if (lowerAnswer.includes("영화")) hobbies.push("movies");
      if (lowerAnswer.includes("여행")) hobbies.push("travel");
      if (lowerAnswer.includes("인테리어")) hobbies.push("interior");

      if (hobbies.length > 0) {
        userProfileService.userProfile.lifestyle.hobbies = [
          ...new Set([
            ...userProfileService.userProfile.lifestyle.hobbies,
            ...hobbies,
          ]),
        ];
        userProfileService.saveProfile();
      }

      return "오~ 취향을 알겠어! 이제 네 관심사에 맞는 상품들을 찾아줄 수 있을 거야!";
    }

    return "답변 고마워! 이제 더 나은 추천을 해줄 수 있을 거야!";
  };

  // 개인화된 일반 응답 생성
  const generatePersonalizedResponse = (input, profile, emotion) => {
    const baseResponses = [
      "그렇구나! 재밌는 얘기네~",
      "오~ 그거 좋은데? 더 얘기해봐!",
      "정말? 신기하다!",
      "우와~ 흥미롭네!",
    ];

    // 프로필 기반 맞춤 응답
    if (profile.lifestyle.hobbies.includes("cooking")) {
      baseResponses.push("요리 좋아하는구나! 혹시 주방용품 관심 있어?");
    }
    if (profile.lifestyle.hobbies.includes("exercise")) {
      baseResponses.push("운동하는구나! 홈트 용품 어때?");
    }
    if (profile.demographics.livingType === "원룸") {
      baseResponses.push("원룸에서 쓰기 좋은 것들 많이 알고 있어!");
    }

    return baseResponses;
  };

  // 오프라인 모드 응답 생성
  const generateOfflineResponse = (input, emotionAnalysis) => {
    const lowerInput = input.toLowerCase();
    
    // 추천 관련 응답
    if (
      lowerInput.includes("추천") ||
      lowerInput.includes("볼만한") ||
      lowerInput.includes("들을만한") ||
      lowerInput.includes("읽을만한") ||
      lowerInput.includes("영화") ||
      lowerInput.includes("책") ||
      lowerInput.includes("음악") ||
      lowerInput.includes("플레이리스트")
    ) {
      const offlineRecommendations = [
        "오프라인 모드에서는 기본적인 추천만 할 수 있어요. 서버에 연결되면 더 정확한 추천을 받을 수 있습니다!",
        "지금은 서버에 연결할 수 없어서 간단한 제안만 할게요. 나중에 다시 물어봐주세요!",
        "백엔드 서버가 실행 중일 때 더 좋은 추천을 해줄 수 있어요. 지금은 기본적인 답변만 드릴게요."
      ];
      return offlineRecommendations[Math.floor(Math.random() * offlineRecommendations.length)];
    }
    
    // 인사 관련 응답
    if (
      lowerInput.includes("안녕") ||
      lowerInput.includes("하이") ||
      lowerInput.includes("헬로")
    ) {
      const greetingResponses = [
        "안녕! 오프라인 모드에서도 대화할 수 있어요",
        "하이! 지금은 서버에 연결할 수 없지만, 계속 이야기 나눠요!",
        "안녕하세요! 오프라인 모드에서도 기분 좋은 대화 해보죠!"
      ];
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }
    
    // 기분 관련 응답
    if (lowerInput.includes("기분") || lowerInput.includes("감정")) {
      if (emotionAnalysis.dominant === "happy" || emotionAnalysis.dominant === "excited") {
        return "와! 기분이 좋아 보여요! 오프라인 모드에서도 함께 기분 좋게 이야기해요";
      } else if (emotionAnalysis.dominant === "sad" || emotionAnalysis.dominant === "frustrated") {
        return "괜찮아요... 오프라인 모드에서도 제가 여기 있어요. 힘내세요!";
      } else {
        return "오프라인 모드에서도 당신의 기분을 함께 느껴보고 있어요!";
      }
    }
    
    // 감사 관련 응답
    if (lowerInput.includes("고마워") || lowerInput.includes("감사")) {
      const thankResponses = [
        "천만에요! 오프라인 모드에서도 도움 드릴 수 있어 기분이 좋아요!",
        "별말씀을요! 서버 연결이 되면 더 많은 도움을 드릴게요",
        "고마워요! 오프라인에서도 계속 이야기 나눠요!"
      ];
      return thankResponses[Math.floor(Math.random() * thankResponses.length)];
    }
    
    // 기본 응답
    const defaultResponses = [
      "오프라인 모드에서도 재미있는 이야기네요!",
      "그렇군요! 오프라인 모드에서도 계속 대화해요.",
      "흥미롭네요! 서버 연결이 되면 더 자세한 이야기를 나눠볼까요?",
      "알겠어요! 지금은 오프라인 모드지만, 좋은 대화였어요.",
      "오프라인 모드에서도 당신의 이야기를 듣고 있어요!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleCharacterClick = () => {
    if (!isSupported) {
      setCharacterText(
        "음성 인식이 지원되지 않는 브라우저예요. 아래 텍스트 입력을 사용해보세요!"
      );
      return;
    }

    if (error) {
      // 오류 상태를 초기화
      resetResult();
      setCharacterText("다시 한 번 클릭해서 말해보세요!");
      return; // 바로 듣기 모드로 전환하지 않고 사용자의 다음 클릭을 기다림
    }

    if (isSpeaking) {
      stopSpeaking();
      setCharacterText("말하기를 멈췄어요. 다시 터치해서 대화해보세요!");
      return;
    }

    if (isListening) {
      stopListening();
      setCharacterText("듣기를 멈췄어요. 다시 터치해서 말해보세요!");
    } else {
      // 클릭할 때마다 살짝 기뻐하는 애니메이션
      if (currentAnimation === "idle") {
        triggerAnimation("happy");
      }

      // 음성 녹음 시작시 사용자 상호작용 수동 설정 (TTS 허용)
      setUserInteracted();
      
      startListening();
      setCharacterText("듣고 있어요... 편안하게 말해보세요!");
      setUserText(""); // 이전 텍스트 초기화
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isSpeaking && !isMuted) {
      stopSpeaking();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setUserText(textInput);

    // AI 응답 생성 중 표시
    setIsAIThinking(true);
    setCharacterText("생각하고 있어요...");

    // 텍스트 입력의 경우 기본 neutral 감정으로 처리
    const mockEmotion = {
      emotion: "neutral",
      confidence: 0.5,
      description: "텍스트 입력",
    };

    setTimeout(() => {
      handleUserInput(textInput, mockEmotion);
      setTextInput("");
    }, 500);
  };

  // 음성 인식 결과 처리 - 한 번만 실행하도록 수정
  const lastProcessedTranscriptRef = useRef(null);
  // 서버에서 온 assistant 응답이 중복 처리되는 것을 막기 위한 ref
  const lastProcessedChatResponseRef = useRef(null);

  useEffect(() => {
    if (result && result.transcript && result.transcript !== lastProcessedTranscriptRef.current) {
      lastProcessedTranscriptRef.current = result.transcript;

      setUserText(result.transcript);

      // AI 응답 생성 중 표시
      setIsAIThinking(true);
      setCharacterText("생각하고 있어요...");

      // 음성 메타데이터 수집 개선
      const voiceMetadata = {
        duration: result.emotion?.duration || 1.0,
        sampleRate: result.emotion?.sampleRate || 16000,
        pitch: result.emotion?.pitch || 0,
        volume: result.emotion?.volume || 0,
        speed: result.emotion?.speed || 0,
        confidence: result.emotion?.confidence || 0.5,
      };

      // 감정 분석 결과가 있으면 사용, 없으면 voiceMetadata 사용
      const emotionData = result.serverLabels || voiceMetadata;

      console.log('handleUserInput 호출:', result.transcript, emotionData);

      // 만약 서버에 비동기 작업(job)을 생성한 경우(serverJobId가 있는 경우),
      // 서버의 assistantResponse가 도착할 것이므로 로컬에서 다시 메시지를 보내지 않음
      if (result.serverJobId) {
        console.log('비동기 서버 작업 중이므로 로컬 handleUserInput 호출을 건너뜁니다. 서버 응답을 기다립니다.');
        return;
      }

      // 자동으로 응답 생성 (클라이언트 -> 서버 흐름)
      setTimeout(() => {
        handleUserInput(result.transcript, emotionData)
          .finally(() => {
            // API 호출 완료 후 result 초기화
            resetResult();
          });
      }, 500);
    }
  }, [result]);

  useEffect(() => {
    // 서버 폴링으로 assistant response가 들어왔을 때 처리
    if (result && result.chatResponse && result.chatResponse.content) {
      const chatKey = result.chatResponse.content + '|' + (result.chatResponse.chatSessionId || '');
      if (lastProcessedChatResponseRef.current === chatKey) {
        return; // 이미 처리됨
      }
      lastProcessedChatResponseRef.current = chatKey;

      // AI 응답을 히스토리에 추가
      const aiMessage = {
        role: 'assistant',
        content: result.chatResponse.content,
        timestamp: new Date().toISOString(),
        chatSessionId: result.chatResponse.chatSessionId || result.chatResponse.sessionId || null,
      };
      setConversationHistory(prev => [...prev, aiMessage]);

      // UI 업데이트
      setCharacterText(result.chatResponse.content);
      setConversationContext(result.chatResponse.type || 'assistant');
      setIsAIThinking(false);

      // 서버에서 전달한 세션 ID가 있으면 저장
      if (result.chatResponse.chatSessionId) {
        const sid = result.chatResponse.chatSessionId;
        setChatSessionId(sid);
        try {
          localStorage.setItem('currentChatSessionId', sid.toString());
        } catch (e) {
          // ignore
        }
      }
    }
  }, [result?.chatResponse]);

  useEffect(() => {
    // 이전에 말한 텍스트와 같으면 스킵
    if (lastSpokenTextRef.current === characterText) {
      return;
    }

    // 기존 타이머 클리어
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    if (
      characterText &&
      !isMuted &&
      hasUserInteracted &&
      !characterText.includes("듣고 있어요") &&
      !characterText.includes("생각하고 있어요") &&
      !characterText.includes("잘 들리지 않았어요") &&
      !characterText.includes("마이크") &&
      !characterText.includes("인터넷")
    ) {
      // 약간의 지연을 주어 상태 변경이 안정화되도록 함
      speakTimeoutRef.current = setTimeout(() => {
        lastSpokenTextRef.current = characterText;
        speak(characterText);
      }, 100);
    }

    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
    };
  }, [characterText, isMuted, hasUserInteracted]); // hasUserInteracted 추가

  return (
    <div className="min-h-[100dvh] bg-layer-background">
      <main className="relative flex flex-col min-h-[100dvh]">
        {/* Clean AppBar with warm background */}
        <header className="sticky top-0 z-10 bg-layer-background/90 backdrop-blur mb-2 sm:mb-4">
          <div className="mx-auto max-w-[560px] px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex justify-between items-center">
              {/* MBTI Toggle - Simplified */}
              <div className="flex items-center gap-2 sm:gap-3 bg-[#FDFBF6] rounded-3xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-surface">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-layer-muted rounded-full flex items-center justify-center">
                    <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-layer-surface" />
                  </div>
                  <span className="text-xs sm:text-caption text-layer-content">
                    T
                  </span>
                </div>

                <ThumbSwitch
                  checked={characterProfile === 'F형'}
                  onCheckedChange={(checked) => {
                    const newProfile = checked ? 'F형' : 'T형';
                    setCharacterProfile(newProfile);
                    toggleTheme();
                  }}
                  aria-label="Toggle between T and F"
                  thumbColor={characterProfile === 'F형' ? "#6B7280" : "#6B7280"}
                  borderColor="#E5E7EB"
                  backgroundColor="#FDFBF6"
                  trackColor="#E5E7EB"
                />

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-layer-muted rounded-full flex items-center justify-center">
                    <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-layer-surface" />
                  </div>
                  <span className="text-xs sm:text-caption text-layer-content">
                    F
                  </span>
                </div>
              </div>

              {/* Minimal action buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isOfflineMode && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-surface text-xs font-medium">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    오프라인 모드
                  </div>
                )}
                {isOfflineMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkServerHealth}
                    className="text-xs px-2 py-1 h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-surface"
                  >
                    재연결
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-surface bg-layer-surface/80 hover:bg-layer-surface shadow-surface transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-layer-muted" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-layer-muted" />
                  )}
                </Button>

                <ChatHistoryButton
                  onSelectSession={(sessionId) => {
                    if (sessionId) {
                      setChatSessionId(sessionId);
                      localStorage.setItem(
                        "currentChatSessionId",
                        sessionId.toString()
                      );
                    } else {
                      createNewChatSession();
                    }
                  }}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/history')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-surface bg-layer-surface/80 hover:bg-layer-surface text-layer-muted shadow-surface transition-colors"
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <section className="flex-1 mx-auto w-full max-w-[560px] px-4 py-5 flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8">
          {/* Speech Bubble - White Surface (위치 변경됨) */}
          <SpeechBubble
            text={characterText}
            isListening={isListening}
            isThinking={isAIThinking}
          />

          {/* Upload / Analysis status */}
          <div className="w-full max-w-[540px] mt-3">
            {isUploading && (
              <div className="bg-layer-surface rounded-surface px-3 py-2 shadow-surface border border-layer-border">
                <p className="text-xs text-layer-muted mb-2">오디오 업로드 중... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-accent-ducky" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {!isUploading && result?.audioBlob && !result?.chatResponse && (
              <div className="bg-layer-surface rounded-surface px-3 py-2 shadow-surface border border-layer-border">
                <p className="text-xs text-layer-muted">오디오 분석 중... 잠시만 기다려주세요.</p>
              </div>
            )}
            {/* Async task status */}
            {isProcessing && taskStatus && (
              <div className="mt-2 bg-layer-surface rounded-surface px-3 py-2 shadow-surface border border-layer-border">
                <p className="text-xs text-layer-muted">서버에서 분석 중: {taskStatus.status}</p>
                {taskStatus.jobId && (
                  <p className="text-xs text-layer-muted mt-1">작업 ID: {taskStatus.jobId}</p>
                )}
                {taskStatus.eta && (
                  <p className="text-xs text-layer-muted mt-1">예상 남은시간: {taskStatus.eta}s</p>
                )}
              </div>
            )}
          </div>

          {/* Duck Character - White Surface Container (위치 변경됨) */}
          <div ref={characterRef} className="relative mt-1">
            {/* Floating emojis */}
            {showFloatingEmojis && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 animate-bounce delay-0 text-2xl">
                  <span className="text-yellow-400">*</span>
                </div>
                <div className="absolute top-8 right-6 animate-bounce delay-200 text-xl">
                  <span className="text-yellow-400">*</span>
                </div>
                <div className="absolute bottom-12 left-8 animate-bounce delay-400 text-lg">
                  <span className="text-yellow-400">*</span>
                </div>
                <div className="absolute top-1/2 right-4 animate-bounce delay-600 text-xl">
                  <span className="text-yellow-400">*</span>
                </div>
              </div>
            )}
            <div
              className={cn(
                "w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] rounded-full bg-layer-surface shadow-surface grid place-items-center transition-all duration-300",
                isListening && "scale-[1.02] shadow-glow",
                isSpeaking && "scale-[1.01]",
                isAnimating && !isListening && !isSpeaking && "scale-[1.005]"
              )}
            >
              {/* Subtle glow for states */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-500 opacity-0",
                  isListening && "opacity-100 bg-accent-ducky/10",
                  isSpeaking && "opacity-100 bg-accent-ducky/5"
                )}
              />

              <AnimatedDuckCharacter
                animation={currentAnimation}
                trigger={triggerCount}
                size="xl"
                onClick={handleCharacterClick}
                onAnimationComplete={handleAnimationComplete}
                className="relative z-10"
              />

              {/* Status indicators */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                {isListening && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-layer-surface text-layer-content px-2 sm:px-3 py-1 rounded-surface text-xs sm:text-caption font-medium shadow-surface border border-layer-border">
                    <div className="relative">
                      <Mic className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent-ducky" />
                      <div className="absolute -inset-1 bg-accent-ducky/20 rounded-full animate-pulse" />
                    </div>
                    <span>듣는 중...</span>
                  </div>
                )}
                {isSpeaking && !isListening && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-layer-surface text-layer-content px-2 sm:px-3 py-1 rounded-surface text-xs sm:text-caption font-medium shadow-surface border border-layer-border">
                    <div className="relative">
                      <Volume2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent-ducky" />
                      <div className="absolute -inset-1 bg-accent-ducky/20 rounded-full animate-pulse" />
                    </div>
                    <span>말하는 중...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Response Display */}
          {userText && !isListening && (
            <div className="space-y-3 sm:space-y-4 w-full max-w-[540px]">
              <div className="bg-layer-surface rounded-surface px-3 sm:px-4 py-2 sm:py-3 shadow-surface border border-layer-border">
                <p className="text-sm sm:text-body text-layer-content">
                  {userText}
                </p>
              </div>

              {/* Emotion info */}
              {result?.emotion && (
                <div className="bg-layer-surface rounded-surface px-3 sm:px-4 py-2 sm:py-3 shadow-surface border border-layer-border">
                  <p className="text-xs sm:text-caption text-layer-muted">
                    <span className="font-medium">감정:</span>{" "}
                    {result.emotion.description}
                  </p>
                  <div className="flex gap-3 sm:gap-4 mt-1">
                    <span className="text-xs sm:text-caption text-layer-muted/70">
                      음량 {Math.round(result.emotion.volume * 100)}%
                    </span>
                    <span className="text-xs sm:text-caption text-layer-muted/70">
                      피치 {Math.round(result.emotion.pitch)}Hz
                    </span>
                    {result.emotion.hasQuestionWords && (
                      <span className="text-xs sm:text-caption text-blue-600 font-medium">
                        의문문 감지됨
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bottom CTA - Fixed position */}
        <footer className="sticky bottom-0 z-10 bg-layer-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-[560px] px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 sm:pt-4">
            {/* CTA Button - Only show when user has spoken */}
            {userText && !isListening && (
              <Button
                onClick={() => navigate('/content')}
                className="w-full rounded-surface bg-layer-surface text-layer-content text-sm sm:text-body font-bold py-3 sm:py-4 shadow-surface border border-layer-border active:scale-[0.98] transition-all duration-150 hover:shadow-glow"
              >
                시작하기
              </Button>
            )}

            {/* Text input for unsupported browsers */}
            {!isSupported && !userText && (
              <form
                onSubmit={handleTextSubmit}
                className="w-full max-w-[540px] space-y-2"
              >
                <div className="flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="덕키에게 메시지를 입력하세요..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!textInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-caption text-layer-muted text-center">
                  음성 인식을 지원하지 않는 브라우저입니다. 텍스트로
                  대화해보세요!
                </p>
              </form>
            )}

            {/* Tutorial hint */}
            {!userText && !isListening && !error && isSupported && (
              <div className="text-center">
                <p className="text-xs sm:text-caption text-layer-muted bg-layer-surface/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-surface border border-layer-border">
                  {isOfflineMode ? "오프라인 모드입니다. 기본적인 대화만 가능합니다." : "덕키를 터치하고 말해보세요"}
                </p>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="text-center">
                <p className="text-xs sm:text-caption text-red-600 bg-red-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-surface border border-red-200">
                  오류: {error}
                </p>
              </div>
            )}
          </div>
        </footer>
      </main>

      {/* 문화 콘텐츠 화면으로 이동하는 퀵 액세스 버튼 */}
      <QuickAccessButton
        icon={<ShoppingBag className="h-5 w-5" />}
        label="콘텐츠 보기"
        onClick={() => navigate('/content')}
        position="bottom-right"
        variant="ghost"
        size="md"
        showLabel={true}
        labelPosition="top"
        className="z-50"
        data-testid="content-quick-access"
      />
    </div>
  );
};

export default MainScreen;

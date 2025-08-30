import { useState, useEffect, useCallback, useRef } from 'react';

// Duck emotion/state mapping - Enhanced for better UX
const EMOTION_TO_ANIMATION = {
  // 🎤 Speech recognition states - More engaging animations
  listening: 'talk', // 👂 귀 기울이는 느낌으로 talk 사용 (더 자연스러움)
  speaking: 'talk',  // 🗣️ AI 응답 시
  
  // 😊 Positive emotions - 다양한 긍정 표현
  happy: 'happy',
  excited: 'happy',
  joyful: 'happy',
  enthusiastic: 'happy',
  delighted: 'happy',
  pleased: 'happy',
  
  // 😠 Negative emotions - 공감 표현
  sad: 'idle', // 😢 슬플 때는 차분하게
  frustrated: 'mad',
  angry: 'mad',
  annoyed: 'mad',
  disappointed: 'mad',
  upset: 'mad',
  
  // 🤔 Neutral/Thinking states
  neutral: 'idle',
  calm: 'idle',
  thoughtful: 'idle',
  confused: 'idle',
  curious: 'talk', // 궁금할 때는 귀 기울이는 느낌
  
  // 🛍️ Product interest states
  hungry: 'hungry',
  wanting: 'hungry',
  interested: 'hungry',
  craving: 'hungry',
  
  // 💬 Conversation contexts - 상황별 의미있는 애니메이션
  greeting: 'welcome_greeting', // 👋 처음 만남
  farewell: 'walkback', // 👋 떠날 때
  shopping: 'product_recommendation', // 🛒 쇼핑 관심
  recommendation: 'product_recommendation', // 💝 추천 제시
  searching: 'searching', // 🔍 정보 찾기
  completed: 'task_complete', // ✅ 작업 완료
  thanking: 'happy', // 🙏 감사 표현
  apology: 'idle', // 죄송할 때는 차분하게
  
  // 🎯 Success/Error states - 새로운 상황 추가
  success: 'happy', // 성공 시 기쁨 표현
  error: 'mad', // 오류 시 당황 표현
  waiting: 'idle', // 대기 시 차분함
  
  // Default fallback
  default: 'idle'
};

// Animation priorities (higher number = higher priority) - UX-focused
const ANIMATION_PRIORITY = {
  // 🚨 Critical feedback - Always show these
  error: 120, // 오류는 가장 중요
  success: 115, // 성공도 중요 피드백
  
  // 🎯 High priority interactions
  product_recommendation: 110, // 제품 추천은 핵심 기능
  welcome_greeting: 105, // 첫 만남은 중요
  task_complete: 105, // 작업 완료는 만족스러운 경험
  
  // 🔍 Medium-high priority
  searching: 100, // 검색 중 표시
  gift: 95, // 선물/보상
  walkback: 90, // 작별 인사
  walkforward: 90, // 다가오는 느낌
  
  // 😠 Negative emotions - Need attention but not critical
  mad: 85, // 화남 감정
  frustrated: 80, // 좌절
  
  // 😊 Positive emotions - Nice to have
  happy: 70, // 기쁨
  hungry: 75, // 관심/호기심
  
  // 🗣️ Communication states
  talk: 50, // 말하기/듣기
  listening: 45, // 듣는 중
  
  // 😴 Base states - Can be interrupted easily
  idle: 10, // 기본 대기
  waiting: 5 // 대기 상태
};

// Animation durations (in milliseconds) - UX-optimized
const ANIMATION_DURATION = {
  // 🎯 Core interactions - Important but not too long
  product_recommendation: 4000, // 추천은 충분히 보여주되 너무 길지 않게
  welcome_greeting: 3000, // 인사는 적당히
  task_complete: 3500, // 완료는 만족감 유지
  
  // 🔍 Process indicators
  searching: 2000, // 검색 중은 짧게 (계속 반복될 수 있음)
  waiting: 0, // 대기는 무한
  
  // 🎁 Rewards/Special moments
  gift: 4000, // 선물은 특별하게
  success: 3000, // 성공은 긍정적 느낌 오래 유지
  
  // 😊 Emotions - Intensity-based duration
  happy: 2500, // 기쁨은 중간 정도로
  mad: 3500, // 화남은 좀 더 길게 (주의를 끌기 위해)
  hungry: 4000, // 관심은 충분히 표현
  
  // 🚶 Movement animations
  walkback: 2500, // 작별은 적당히
  walkforward: 2500, // 다가오는 건 자연스럽게
  
  // 🗣️ Communication - Context dependent
  talk: 0, // 말하는 동안은 계속 (무한 반복)
  listening: 0, // 듣는 동안은 계속
  
  // ⚠️ Feedback states
  error: 2000, // 오류는 짧지만 확실하게
  
  // 😴 Base states
  idle: 0 // 기본은 무한
};

export const useDuckAnimation = ({ 
  initialAnimation = 'idle',
  emotion,
  isListening,
  isSpeaking,
  conversationContext 
}) => {
  // Safety check for required parameters
  if (typeof initialAnimation !== 'string') {
    initialAnimation = 'idle';
  }
  
  const [currentAnimation, setCurrentAnimation] = useState(initialAnimation);
  const [animationQueue, setAnimationQueue] = useState([]);
  const [triggerCount, setTriggerCount] = useState(0);
  const timeoutRef = useRef(null);
  const lastEmotionRef = useRef(null);
  
  // Cooldown mechanism to prevent rapid animation switching
  const lastAnimationChangeRef = useRef(0);
  const COOLDOWN_DURATION = 2000; // 2 seconds cooldown for low-priority animations
  
  // StrictMode protection: track effect execution
  const executionIdRef = useRef(0);
  const isExecutingRef = useRef(false);
  
  // Sequence protection refs to sync with AnimatedDuckCharacter
  const sequenceProtectedRef = useRef(null);
  const pendingAnimRef = useRef(null);
  
  // 🔒 Enhanced animation setting prevention
  const lastSetRef = useRef({ anim: null, at: 0 });
  
  // 🔒 Happy debounce mechanism
  const lastTriggerAtRef = useRef({ happy: 0 });

  // 🔍 DEBUG: Hook state logger
  useEffect(() => {
  }, [currentAnimation, triggerCount, emotion, isListening, isSpeaking, conversationContext, animationQueue]);

  // Helper functions for improved animation setting
  const setAnimationIfChanged = useCallback((next) => {
    setCurrentAnimation(prev => (prev === next ? prev : next));
  }, []);

  // Animation request function with protection check
  const requestAnimationSafe = useCallback((targetAnim, opts = {}) => {
    const protectedAnim = sequenceProtectedRef.current;
    if (protectedAnim) {
      // 보호 중이면 상태를 바꾸지 않고 대기열에만 적재
      pendingAnimRef.current = { targetAnim, opts, ts: performance.now() };
      return false;
    }
    
    // 보호 아님 → 정상 전환
    setCurrentAnimation(targetAnim);
    setTriggerCount(c => c + 1);
    return true;
  }, []);

  const setAnimationSafely = useCallback((next, { forceRestart = false, isFromHeartbeat = false } = {}) => {
    const t = performance.now();
    const minRestartMs = 2000;

    // 🔒 CRITICAL: Happy heartbeat 차단 (시퀀스 재생 중)
    if (isFromHeartbeat && next === 'happy') {
      const isSequenceActive = currentAnimation && ANIMATION_PRIORITY[currentAnimation] >= 100;
      if (isSequenceActive) {
        return;
      }
      
      // Happy 디바운스 (3초)
      const happyLastTrigger = lastTriggerAtRef.current.happy;
      if (t - happyLastTrigger < 3000) {
        return;
      }
      lastTriggerAtRef.current.happy = t;
    }

    // Use protection-aware function
    const applied = requestAnimationSafe(next, { forceRestart, isFromHeartbeat });
    if (!applied) return; // Was blocked by protection

    lastSetRef.current = { anim: next, at: t };

    // ✅ 트리거는 "강제 재시작"이 정말 필요할 때만
    // Note: forceRestart handling can be added here if needed
  }, [requestAnimationSafe, currentAnimation]);

  // Determine target animation based on current state
  const getTargetAnimation = useCallback(() => {
    try {
      // Priority 1: Speech states
      if (isSpeaking) {
        return 'talk';
      }
      if (isListening) {
        return 'idle'; // Calm while listening
      }
      
      // Priority 2: Detected emotion from speech
      if (emotion?.emotion && emotion.emotion !== lastEmotionRef.current) {
        const emotionKey = emotion.emotion.toLowerCase();
        const targetAnim = EMOTION_TO_ANIMATION[emotionKey];
        if (targetAnim) {
          return targetAnim;
        }
      }
      
      // Priority 3: Conversation context
      if (conversationContext && EMOTION_TO_ANIMATION[conversationContext]) {
        const targetAnim = EMOTION_TO_ANIMATION[conversationContext];
        return targetAnim;
      }
      
      // Default: idle
      return 'idle';
    } catch (error) {
      return 'idle';
    }
  }, [emotion, isListening, isSpeaking, conversationContext]);

  // Queue animation with strict priority system - only allow one animation at a time
  const queueAnimation = useCallback((targetAnim) => {
    // CRITICAL: Ignore if same animation is already playing - prevents ping-pong
    if (targetAnim === currentAnimation) {
      return;
    }
    
    const currentPriority = ANIMATION_PRIORITY[currentAnimation] || 0;
    const targetPriority = ANIMATION_PRIORITY[targetAnim] || 0;
    const now = Date.now();
    const timeSinceLastChange = now - lastAnimationChangeRef.current;
    
    // Apply cooldown for low-priority animations (happy, idle) but not high-priority ones
    const isLowPriority = targetPriority <= 70; // happy and below
    const inCooldown = isLowPriority && timeSinceLastChange < COOLDOWN_DURATION;
    
    // Block low-priority animations during cooldown
    if (inCooldown) {
      return;
    }
    
    // Higher priority animations can interrupt lower priority ones, BUT respect sequence lock
    const isSequenceActive = currentAnimation && ANIMATION_PRIORITY[currentAnimation] >= 100;
    const canInterrupt = (targetPriority > currentPriority || currentAnimation === 'idle') && 
                        (!isSequenceActive || targetPriority >= 100);
    
    if (canInterrupt) {
      // Clear any existing timeout before setting new animation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Update cooldown timestamp
      lastAnimationChangeRef.current = Date.now();
      
      // Set timeout for temporary animations
      const duration = ANIMATION_DURATION[targetAnim];
      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          // Prevent timeout execution if hook was unmounted or timeout was replaced
          if (timeoutRef.current === timeoutId) {
            setAnimationSafely('idle'); // 일반 전환 (트리거 증가 ❌)
            timeoutRef.current = null;
          }
        }, duration);
        timeoutRef.current = timeoutId;
      }
      
      // Determine if this needs a force restart (happy 제외 - idle 전환용)
      const restartAnimations = ['gift', 'mad', 'hungry', 'walkback', 'walkforward', 'product_recommendation', 'welcome_greeting', 'searching', 'task_complete'];
      const needsForceRestart = restartAnimations.includes(targetAnim);
      
      // Happy는 heartbeat으로 취급 (우선순위 낮음)
      const isHappyHeartbeat = targetAnim === 'happy';
      
      // Use setAnimationSafely with appropriate flags
      setAnimationSafely(targetAnim, { 
        forceRestart: needsForceRestart, 
        isFromHeartbeat: isHappyHeartbeat 
      });
    }
  }, [currentAnimation, setAnimationSafely]);

  // React to state changes - throttled to prevent rapid animation switching
  useEffect(() => {
    // StrictMode protection: prevent duplicate execution
    const currentExecutionId = ++executionIdRef.current;
    
    // Prevent re-entry
    if (isExecutingRef.current) {
      return;
    }
    
    isExecutingRef.current = true;
    
    try {
      const targetAnim = getTargetAnimation();
      
      // Only queue new animation if it's different and not already queued
      if (targetAnim && targetAnim !== currentAnimation) {
        queueAnimation(targetAnim);
      }
      
      // Update emotion reference
      if (emotion?.emotion) {
        lastEmotionRef.current = emotion.emotion;
      }
    } finally {
      // Always reset execution flag
      setTimeout(() => {
        isExecutingRef.current = false;
      }, 0);
    }
  }, [emotion, isListening, isSpeaking, conversationContext, currentAnimation, getTargetAnimation, queueAnimation]);

  // Handle animation completion
  const handleAnimationComplete = useCallback((completedAnimation) => {
    // After non-looping animations, return to appropriate state
    const nonLoopingAnimations = ['gift', 'mad', 'happy', 'hungry', 'walkback', 'walkforward', 'product_recommendation', 'welcome_greeting', 'searching', 'task_complete'];
    
    if (nonLoopingAnimations.includes(completedAnimation)) {
      // 🛡️ CRITICAL: 시퀀스 완료 시점에서만 보호 해제 + 상태 동기화
      
      const newTarget = getTargetAnimation();
      if (newTarget === completedAnimation || !newTarget || newTarget === 'idle') {
        // If we would return to the same animation or no specific target, go to idle
        setAnimationSafely('idle'); // 일반 전환 (트리거 증가 ❌)
      } else {
        setAnimationSafely(newTarget); // 일반 전환 (트리거 증가 ❌)
      }
    }
  }, [getTargetAnimation, setAnimationSafely]);

  // Manual animation trigger (for special events)
  const triggerAnimation = useCallback((animation, force = false) => {
    // Ignore if same animation is already playing (prevents duplicate triggers)
    if (animation === currentAnimation && !force) return;
    
    if (force) {
      // Clear any existing timeouts and force new animation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setAnimationSafely(animation, { forceRestart: true }); // 강제 재시작 (트리거 증가 ⭕)
      
      const duration = ANIMATION_DURATION[animation];
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setAnimationSafely('idle'); // 일반 전환 (트리거 증가 ❌)
        }, duration);
      }
    } else {
      queueAnimation(animation);
    }
  }, [queueAnimation, currentAnimation, setAnimationSafely]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    currentAnimation,
    triggerCount, // Used to restart non-looping animations
    triggerAnimation,
    handleAnimationComplete,
    isAnimating: currentAnimation !== 'idle'
  };
};
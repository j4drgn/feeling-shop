import { useState, useEffect, useCallback, useRef } from 'react';

// Duck emotion/state mapping
const EMOTION_TO_ANIMATION = {
  // Speech recognition states
  listening: 'idle', // Attentive but calm
  speaking: 'talk',  // Duck is talking
  
  // User emotions detected from speech
  happy: 'happy',
  excited: 'happy',
  joyful: 'happy',
  enthusiastic: 'product_recommendation', // Special celebration with walk sequence
  
  sad: 'idle', // Calm, empathetic
  frustrated: 'mad',
  angry: 'mad',
  annoyed: 'mad',
  
  neutral: 'idle',
  calm: 'idle',
  thoughtful: 'idle',
  
  // New emotions for product interactions
  hungry: 'hungry',
  wanting: 'hungry',
  
  // Conversation context  
  greeting: 'welcome_greeting', // 앞으로와서 인사
  farewell: 'walkback',
  shopping: 'product_recommendation', // Full sequence: walk back -> get gift -> walk forward
  recommendation: 'product_recommendation', // 제품 추천
  searching: 'searching', // 정보 검색 중
  completed: 'task_complete', // 작업 완료
  thanking: 'happy',
  
  // Default
  default: 'idle'
};

// Animation priorities (higher number = higher priority)
const ANIMATION_PRIORITY = {
  product_recommendation: 110, // Highest - full sequence 
  welcome_greeting: 105, // Very high - greeting sequence
  searching: 100,   // High - searching sequence
  task_complete: 100, // High - completion sequence
  gift: 95,      // High - special celebrations
  walkback: 90,  // High - movement animations
  walkforward: 90, // High - movement animations
  mad: 85,       // High - negative emotions need attention
  hungry: 75,    // Medium-high - wanting emotions
  happy: 70,     // Medium-high - positive emotions
  talk: 50,      // Medium - speaking state
  idle: 10       // Lowest - default state
};

// Animation durations (in milliseconds)
const ANIMATION_DURATION = {
  product_recommendation: 0, // ⚠️ 시퀀스는 내부 step duration으로 자동 관리 - 타임아웃 금지
  welcome_greeting: 0, // ⚠️ 시퀀스는 내부 step duration으로 자동 관리 - 타임아웃 금지
  searching: 0,  // ⚠️ 시퀀스는 내부 step duration으로 자동 관리 - 타임아웃 금지
  task_complete: 5000, // 5 seconds for gift animation
  gift: 5000,    // 5 seconds for gift animation
  walkback: 3000, // 3 seconds for walking back (61 frames @ 20fps)
  walkforward: 3000, // 3 seconds for walking forward (61 frames @ 20fps)
  mad: 4000,     // 4 seconds for mad animation (81 frames @ 20fps)
  hungry: 8000,  // 8 seconds for hungry (117 frames @ 15fps)
  happy: 2000,   // 2 seconds for happy (40 frames @ 24fps)
  talk: 0,       // Continuous while speaking
  idle: 0        // Continuous
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
    console.warn('🦆 [DUCK HOOK] initialAnimation must be a string, falling back to "idle"');
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
    console.log('🦆 [DUCK HOOK STATE]', {
      timestamp: new Date().toISOString(),
      currentAnimation,
      triggerCount,
      emotion: emotion?.emotion,
      emotionConfidence: emotion?.confidence,
      isListening,
      isSpeaking,
      conversationContext,
      lastEmotion: lastEmotionRef.current,
      hasTimeout: !!timeoutRef.current,
      queueLength: animationQueue.length
    });
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
      console.log('🛡️ [DUCK HOOK] Animation queued during protection', { 
        protectedAnim, 
        requestedAnim: targetAnim 
      });
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
        console.log('💓 [DUCK HOOK] Happy heartbeat blocked - sequence active', { 
          currentAnimation, 
          currentPriority: ANIMATION_PRIORITY[currentAnimation] 
        });
        return;
      }
      
      // Happy 디바운스 (3초)
      const happyLastTrigger = lastTriggerAtRef.current.happy;
      if (t - happyLastTrigger < 3000) {
        console.log('💓 [DUCK HOOK] Happy heartbeat debounced', { 
          timeSince: t - happyLastTrigger 
        });
        return;
      }
      lastTriggerAtRef.current.happy = t;
    }

    // Use protection-aware function
    const applied = requestAnimationSafe(next, { forceRestart, isFromHeartbeat });
    if (!applied) return; // Was blocked by protection

    lastSetRef.current = { anim: next, at: t };

    // ✅ 트리거는 "강제 재시작"이 정말 필요할 때만
    if (forceRestart) {
      console.log('🔄 [DUCK HOOK] Force restart trigger increment', { animation: next });
    }
  }, [requestAnimationSafe, currentAnimation]);

  // Determine target animation based on current state
  const getTargetAnimation = useCallback(() => {
    console.log('🎯 [DUCK HOOK] Determining target animation...', {
      isSpeaking,
      isListening,
      emotion: emotion?.emotion,
      conversationContext,
      lastEmotion: lastEmotionRef.current
    });

    try {
      // Priority 1: Speech states
      if (isSpeaking) {
        console.log('🗣️ [DUCK HOOK] Speaking detected -> talk');
        return 'talk';
      }
      if (isListening) {
        console.log('👂 [DUCK HOOK] Listening detected -> idle');
        return 'idle'; // Calm while listening
      }
      
      // Priority 2: Detected emotion from speech
      if (emotion?.emotion && emotion.emotion !== lastEmotionRef.current) {
        const emotionKey = emotion.emotion.toLowerCase();
        const targetAnim = EMOTION_TO_ANIMATION[emotionKey];
        console.log('😊 [DUCK HOOK] New emotion detected', {
          emotion: emotionKey,
          previousEmotion: lastEmotionRef.current,
          targetAnimation: targetAnim
        });
        if (targetAnim) {
          return targetAnim;
        }
      }
      
      // Priority 3: Conversation context
      if (conversationContext && EMOTION_TO_ANIMATION[conversationContext]) {
        const targetAnim = EMOTION_TO_ANIMATION[conversationContext];
        console.log('💬 [DUCK HOOK] Context detected', {
          context: conversationContext,
          targetAnimation: targetAnim
        });
        return targetAnim;
      }
      
      // Default: idle
      console.log('😴 [DUCK HOOK] No specific state -> idle');
      return 'idle';
    } catch (error) {
      console.error('💥 [DUCK HOOK] Error in getTargetAnimation:', error);
      return 'idle';
    }
  }, [emotion, isListening, isSpeaking, conversationContext]);

  // Queue animation with strict priority system - only allow one animation at a time
  const queueAnimation = useCallback((targetAnim) => {
    console.log('📥 [DUCK HOOK] Queue animation request', {
      targetAnim,
      currentAnimation,
      isSame: targetAnim === currentAnimation
    });

    // CRITICAL: Ignore if same animation is already playing - prevents ping-pong
    if (targetAnim === currentAnimation) {
      console.log('⏭️ [DUCK HOOK] Same animation already playing, ignoring to prevent restart');
      return;
    }
    
    const currentPriority = ANIMATION_PRIORITY[currentAnimation] || 0;
    const targetPriority = ANIMATION_PRIORITY[targetAnim] || 0;
    const now = Date.now();
    const timeSinceLastChange = now - lastAnimationChangeRef.current;
    
    // Apply cooldown for low-priority animations (happy, idle) but not high-priority ones
    const isLowPriority = targetPriority <= 70; // happy and below
    const inCooldown = isLowPriority && timeSinceLastChange < COOLDOWN_DURATION;
    
    console.log('⚖️ [DUCK HOOK] Priority check', {
      currentAnimation,
      currentPriority,
      targetAnim,
      targetPriority,
      timeSinceLastChange,
      inCooldown,
      isSequenceActive: currentAnimation && ANIMATION_PRIORITY[currentAnimation] >= 100,
      canInterrupt: '(calculated below)'
    });
    
    // Block low-priority animations during cooldown
    if (inCooldown) {
      console.log('❄️ [DUCK HOOK] Animation blocked by cooldown mechanism', {
        targetAnim,
        targetPriority,
        timeSinceLastChange,
        cooldownRemaining: COOLDOWN_DURATION - timeSinceLastChange
      });
      return;
    }
    
    // Higher priority animations can interrupt lower priority ones, BUT respect sequence lock
    const isSequenceActive = currentAnimation && ANIMATION_PRIORITY[currentAnimation] >= 100;
    const canInterrupt = (targetPriority > currentPriority || currentAnimation === 'idle') && 
                        (!isSequenceActive || targetPriority >= 100);
    
    if (canInterrupt) {
      // Clear any existing timeout before setting new animation
      if (timeoutRef.current) {
        console.log('🛑 [DUCK HOOK] Clearing existing timeout');
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.log('✅ [DUCK HOOK] Setting new animation:', targetAnim);
      
      // Update cooldown timestamp
      lastAnimationChangeRef.current = Date.now();
      
      // Set timeout for temporary animations
      const duration = ANIMATION_DURATION[targetAnim];
      if (duration > 0) {
        console.log('⏰ [DUCK HOOK] Setting timeout for', duration, 'ms');
        const timeoutId = setTimeout(() => {
          // Prevent timeout execution if hook was unmounted or timeout was replaced
          if (timeoutRef.current === timeoutId) {
            console.log('⏰ [DUCK HOOK] Timeout fired - returning to idle');
            setAnimationSafely('idle'); // 일반 전환 (트리거 증가 ❌)
            timeoutRef.current = null;
          } else {
            console.log('⏰ [DUCK HOOK] Timeout cancelled - different timeout is active');
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
    } else {
      console.log('❌ [DUCK HOOK] Animation blocked by priority system');
    }
  }, [currentAnimation, setAnimationSafely]);

  // React to state changes - throttled to prevent rapid animation switching
  useEffect(() => {
    // StrictMode protection: prevent duplicate execution
    const currentExecutionId = ++executionIdRef.current;
    
    // Prevent re-entry
    if (isExecutingRef.current) {
      console.log('🔒 [DUCK HOOK] Effect re-entry blocked', { executionId: currentExecutionId });
      return;
    }
    
    isExecutingRef.current = true;
    
    console.log('🚀 [DUCK HOOK] Effect execution started', { 
      executionId: currentExecutionId,
      emotion: emotion?.emotion,
      isSpeaking,
      isListening,
      conversationContext 
    });
    
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
        console.log('🔓 [DUCK HOOK] Effect execution completed', { executionId: currentExecutionId });
      }, 0);
    }
  }, [emotion, isListening, isSpeaking, conversationContext, currentAnimation, getTargetAnimation, queueAnimation]);

  // Handle animation completion
  const handleAnimationComplete = useCallback((completedAnimation) => {
    // After non-looping animations, return to appropriate state
    const nonLoopingAnimations = ['gift', 'mad', 'happy', 'hungry', 'walkback', 'walkforward', 'product_recommendation', 'welcome_greeting', 'searching', 'task_complete'];
    
    if (nonLoopingAnimations.includes(completedAnimation)) {
      // 🛡️ CRITICAL: 시퀀스 완료 시점에서만 보호 해제 + 상태 동기화
      console.log('✅ [DUCK HOOK] Animation completed, clearing protection', { completedAnimation });
      
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
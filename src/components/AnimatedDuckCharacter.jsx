import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';

// Default configurations for animation types
const ANIMATION_TYPE_DEFAULTS = {
  sequence: { 
    loop: false, 
    duration: 2500,
    frameRate: 24,
    type: 'sequence'
  },
  png_sequence: { 
    frameRate: 20, 
    loop: false,
    type: 'png_sequence'
  }
};

// Duck animation configurations - PNG frame sequences for transparent backgrounds
const DUCK_ANIMATIONS = {
  // 기본 대기 상태
  idle: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_',
    frameCount: 51, // 실제 파일 개수: 51개 (0-50)
    frameRate: 20,
    loop: true
  },
  
  // 긍정적 반응 - 행복한 표정
  happy: {
    type: 'png_sequence',
    basePath: '/img/duck_happy/adult happy_',
    frameCount: 41, // 실제 파일 개수: 41개 (0-40)
    frameRate: 24,
    loop: false, // 한번만 실행 후 idle로 복귀
    duration: 2000
  },
  
  // 부정적 반응 - 화난 표정
  mad: {
    type: 'png_sequence',
    basePath: '/img/duck_mad/adult mad_',
    frameCount: 81, // 실제 파일 개수: 81개 (0-80)
    frameRate: 20,
    loop: false, // 한번만 실행 후 idle로 복귀
    duration: 4000
  },
  
  // 말하는 중 - AI 응답할 때
  talk: {
    type: 'png_sequence',
    basePath: '/img/duck_talk/adult_eating_',
    frameCount: 51, // 실제 파일 개수: 51개 (0-50)
    frameRate: 18,
    loop: true // 대화가 끝날 때까지 반복
  },
  
  // 배고프거나 관심 끄는 표현 (3자리 패딩)
  hungry: {
    type: 'png_sequence',
    basePath: '/img/duck_hungry/adult hungry_',
    frameCount: 117, // 실제 파일 개수: 117개 (0-116)
    frameRate: 15,
    loop: false, // 한번만 실행
    duration: 6000
  },
  
  // 뒤로 걸어가기
  walkback: {
    type: 'png_sequence',
    basePath: '/img/duck_wallback/adult walk back_',
    frameCount: 61, // 실제 파일 개수: 61개 (0-60)
    frameRate: 20,
    loop: false
  },
  
  // 선물 주기
  gift: {
    type: 'png_sequence',
    basePath: '/img/duck_gift/adult_gift_',
    frameCount: 100, // 실제 파일 개수: 100개 (0-99)
    frameRate: 20,
    loop: false
  },
  
  // 앞으로 걸어오기
  walkforward: {
    type: 'png_sequence',
    basePath: '/img/duck_walkforward/adult walk forward_',
    frameCount: 61, // 실제 파일 개수: 61개 (0-60)
    frameRate: 20,
    loop: false
  },

  // === 복합 시퀀스 애니메이션들 ===
  
  // 제품 추천 시퀀스: 뒤로가서 → 선물가져오기 → 앞으로오기
  product_recommendation: {
    type: 'sequence',
    steps: [
      {
        type: 'png_sequence',
        basePath: '/img/duck_wallback/adult walk back_',
        frameCount: 61,
        frameRate: 24,
        duration: 2500,
        loop: false
      },
      {
        type: 'png_sequence',
        basePath: '/img/duck_gift/adult_gift_',
        frameCount: 100,
        frameRate: 20,
        duration: 5000,
        loop: false
      },
      {
        type: 'png_sequence',
        basePath: '/img/duck_walkforward/adult walk forward_',
        frameCount: 61,
        frameRate: 24,
        duration: 2500,
        loop: false
      }
    ]
  },
  
  // 환영 인사: 앞으로와서 → 행복한 표정
  welcome_greeting: {
    type: 'sequence',
    steps: [
      {
        type: 'png_sequence',
        basePath: '/img/duck_walkforward/adult walk forward_',
        frameCount: 61,
        frameRate: 24,
        duration: 2500,
        loop: false
      },
      {
        type: 'png_sequence',
        basePath: '/img/duck_happy/adult happy_',
        frameCount: 40,
        frameRate: 24,
        duration: 2000,
        loop: false
      }
    ]
  },
  
  // 검색 중: 뒤로가서 → 앞으로오기 (찾아오는 느낌)
  searching: {
    type: 'sequence',
    steps: [
      {
        type: 'png_sequence',
        basePath: '/img/duck_wallback/adult walk back_',
        frameCount: 61,
        frameRate: 24,
        duration: 2500,
        loop: false
      },
      {
        type: 'png_sequence',
        basePath: '/img/duck_walkforward/adult walk forward_',
        frameCount: 61,
        frameRate: 24,
        duration: 2500,
        loop: false
      }
    ]
  },
  
  // 작업 완료: 선물 주기 (결과 제시하는 느낌)
  task_complete: {
    type: 'sequence',
    steps: [
      {
        type: 'png_sequence',
        basePath: '/img/duck_gift/adult_gift_',
        frameCount: 100,
        frameRate: 20,
        duration: 5000,
        loop: false
      }
    ]
  }
};

const AnimatedDuckCharacter = ({ 
  animation = 'idle', 
  size = 'xl', 
  onClick, 
  className,
  onAnimationComplete,
  trigger // External trigger to restart animation
}) => {
  // Removed internal animation state - now controlled purely by props
  const [currentSequenceStep, setCurrentSequenceStep] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPngAnimationPlaying, setIsPngAnimationPlaying] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState({});
  const [imageLoadError, setImageLoadError] = useState(false);
  const [fallbackImagePath, setFallbackImagePath] = useState('/img/duck_idle/adult idle_00.png');
  const sequenceTimeoutRef = useRef(null);
  const pngAnimationRef = useRef(null);
  const gifRef = useRef(null);
  
  // Cleanup reference for PNG animation
  const cleanupRef = useRef(null);
  
  // 🔒 Animation Control System - Single source of truth for all animation state
  const animationLockRef = useRef(false); // Global animation lock
  const animationQueueRef = useRef([]); // Animation request queue
  const currentAnimationRef = useRef(null); // Currently active animation
  const lastFrameResetRef = useRef(null); // Last animation that reset frame
  
  // 🔒 Sequence duplicate start prevention
  const lastSequenceStartKeyRef = useRef('');
  
  // 🔒 Enhanced runId system for sequence timeouts
  const sequenceRunIdRef = useRef(0);
  const activeSequenceRunIdRef = useRef(0);

  // 🔒 Duplicate key processing prevention
  const lastProcessedRef = useRef({ key: null });
  
  // 🔒 Sequence protection - prevent interruption during critical sequences
  const sequenceProtectedRef = useRef(null); // null or animation name
  const pendingAnimRef = useRef(null); // pending animation request during protection

  // 🔒 Request animation change ref to avoid initialization issues
  const requestAnimationChangeRef = useRef();

  // 🎯 Animation Priority System - Define animation groups and priorities
  const ANIMATION_PRIORITIES = {
    // High priority - Cannot be interrupted
    product_recommendation: 100,
    welcome_greeting: 100,
    searching: 100,
    task_complete: 100,
    
    // Medium priority - Can be interrupted by high priority
    gift: 50,
    walkforward: 50,
    walkback: 50,
    hungry: 50,
    
    // Low priority - Can be interrupted by any higher priority
    happy: 20,
    mad: 20,
    talk: 20,
    
    // Base priority - Always interruptible
    idle: 0
  };

  // Clear all animations
  const clearAll = useCallback(() => {
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (pngAnimationRef.current) {
      pngAnimationRef.current(); // Call cleanup function
      pngAnimationRef.current = null;
    }
    
    setIsSequencePlaying(false);
    setCurrentSequenceStep(0);
    setCurrentFrame(0);
    setIsPngAnimationPlaying(false);
  }, []);

  // 🎬 Auto-start animation when animation prop changes
  useLayoutEffect(() => {
    if (animation && animation !== 'idle') {
      console.log(`🎬 [AUTO START] Animation changed to: ${animation}`);
      if (requestAnimationChangeRef.current) {
        requestAnimationChangeRef.current(animation, 'auto');
      }
    }
  }, [animation]);

  // 🔒 Get animation config with defaults applied
  const getAnimationConfigWithDefaults = useCallback((animationName) => {
    const rawConfig = DUCK_ANIMATIONS[animationName];
    if (!rawConfig) {
      console.warn(`Animation config not found for: ${animationName}, falling back to idle`);
      return DUCK_ANIMATIONS.idle;
    }
    
    // Apply type defaults
    const defaults = ANIMATION_TYPE_DEFAULTS[rawConfig.type] || {};
    const configWithDefaults = {
      ...defaults,
      ...rawConfig
    };
    
    // Apply defaults to sequence steps
    if (configWithDefaults.type === 'sequence' && configWithDefaults.steps) {
      configWithDefaults.steps = configWithDefaults.steps.map(step => ({
        ...ANIMATION_TYPE_DEFAULTS[step.type] || {},
        ...step
      }));
    }
    
    return configWithDefaults;
  }, []);

  // Get animation config helper
  const getAnimationConfig = useCallback((animationName) => {
    return getAnimationConfigWithDefaults(animationName);
  }, [getAnimationConfigWithDefaults]);

  // PNG sequence player with proper frame boundary checks
  const playPngSequence = useCallback(({
    basePath,
    frameCount,
    frameRate = 24,
    loop = false,
    onFrame,
    onComplete,
    now = () => performance.now()
  }) => {
    let rafId = null;
    let start = now();
    const frameDur = 1000 / frameRate;
    let stopped = false;
    let lastFrame = -1; // 마지막으로 표시한 프레임 추적

    function tick(t) {
      if (stopped) return;

      const elapsed = t - start;
      const currentFrameIndex = Math.floor(elapsed / frameDur);

      // 프레임이 변경되었을 때만 업데이트 (중복 방지)
      if (currentFrameIndex !== lastFrame) {
        lastFrame = currentFrameIndex;

        if (loop) {
          const frameToShow = currentFrameIndex % frameCount;
          onFrame(frameToShow);
        } else {
          // 비반복 모드
          if (currentFrameIndex >= frameCount) {
            // 애니메이션 완료 - 마지막 프레임 표시
            console.log(`🎬 [ANIMATION COMPLETE] Finished ${basePath} at frame ${frameCount - 1}`);
            onFrame(frameCount - 1);
            stopped = true;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
            onComplete?.();
            return;
          } else {
            onFrame(currentFrameIndex);
          }
        }
      }

      // 다음 프레임 요청 (계속 진행)
      rafId = requestAnimationFrame(tick);
    }

    // 첫 프레임 즉시 표시 (0프레임)
    console.log(`🎬 [ANIMATION START] Starting ${basePath} with ${frameCount} frames at ${frameRate}fps`);
    onFrame(0);
    lastFrame = 0;

    // 애니메이션 루프 시작
    rafId = requestAnimationFrame(tick);

    // 외부에서 정리할 때 호출
    return () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };
  }, []);

  // 🔓 Animation Unlock System
  const unlockAnimation = useCallback(() => {
    console.log('🔓 [UNLOCK] Animation system unlocked');
    animationLockRef.current = false;
    
    // Clear protection if it was set
    if (sequenceProtectedRef.current) {
      sequenceProtectedRef.current = null;
    }
  }, []);

  // 🎬 Core Animation Execution - Handles the actual animation change
  const executeAnimationChange = useCallback((targetAnimation, trigger) => {
    console.log('🎬 [EXECUTE] Starting animation execution:', {
      targetAnimation,
      trigger,
      wasLocked: animationLockRef.current
    });
    
    // Lock the animation system
    animationLockRef.current = true;
    currentAnimationRef.current = targetAnimation;
    
    // Reset frame only when changing to a different animation
    if (lastFrameResetRef.current !== targetAnimation) {
      console.log('🔄 [EXECUTE] Resetting frame for new animation:', targetAnimation);
      setCurrentFrame(0);
      lastFrameResetRef.current = targetAnimation;
    }
    
    // Clear all existing animations
    clearAll();
    
    // Get animation config and start
    const cfg = getAnimationConfig(targetAnimation);
    if (!cfg) {
      console.error('❌ [EXECUTE] No config found for:', targetAnimation);
      unlockAnimation();
      return;
    }
    
    // Set up unlock callback
    const originalOnComplete = onAnimationComplete;
    const unlockingOnComplete = (completedAnimation) => {
      console.log('✅ [EXECUTE] Animation completed, unlocking:', completedAnimation);
      unlockAnimation();
      if (originalOnComplete && typeof originalOnComplete === 'function') {
        originalOnComplete(completedAnimation);
      }
      // Process next item in queue after a small delay
      setTimeout(() => {
        if (!animationLockRef.current && animationQueueRef.current.length > 0) {
          const nextRequest = animationQueueRef.current.shift();
          const { targetAnimation, trigger } = nextRequest;
          console.log('🎯 [QUEUE] Processing next queued animation:', targetAnimation);
          // Direct execution to avoid circular dependency
          executeAnimationChange(targetAnimation, trigger);
        }
      }, 50);
    };
    
    // Start animation based on type
    if (cfg.type === 'sequence') {
      playSequenceWithUnlock(cfg, unlockingOnComplete);
    } else if (cfg.type === 'png_sequence') {
      startPngAnimationWithUnlock(cfg, unlockingOnComplete);
    } else {
      // Static or other types
      if (!cfg.loop) {
        const duration = cfg.duration || 3000;
        setTimeout(() => {
          unlockingOnComplete(targetAnimation);
        }, duration);
      } else {
        unlockAnimation(); // Looping animations unlock immediately
      }
    }
  }, [clearAll, getAnimationConfig, onAnimationComplete, unlockAnimation]);


  // 🚪 Animation Gate - Single entry point for all animation changes
  const requestAnimationChange = useCallback((targetAnimation, trigger = null) => {
    const currentPriority = ANIMATION_PRIORITIES[currentAnimationRef.current] || 0;
    const targetPriority = ANIMATION_PRIORITIES[targetAnimation] || 0;
    const timestamp = performance.now();
    
    console.log('🚪 [GATE] Animation change requested:', {
      from: currentAnimationRef.current,
      to: targetAnimation,
      currentPriority,
      targetPriority,
      isLocked: animationLockRef.current,
      queueLength: animationQueueRef.current.length,
      trigger,
      timestamp
    });
    
    // If same animation, ignore (unless it's a high-priority sequence with trigger)
    if (currentAnimationRef.current === targetAnimation && !trigger && targetPriority < 100) {
      console.log('🚫 [GATE] Same animation ignored:', targetAnimation);
      return false;
    }
    
    // If locked and target priority is not higher, queue it
    if (animationLockRef.current && targetPriority <= currentPriority) {
      console.log('📋 [GATE] Animation queued (locked):', {
        targetAnimation,
        currentPriority,
        targetPriority
      });
      animationQueueRef.current.push({ targetAnimation, trigger, timestamp });
      return false;
    }
    
    // If target priority is lower than current and current is still active, ignore
    if (targetPriority < currentPriority && currentAnimationRef.current) {
      console.log('🚫 [GATE] Lower priority animation ignored:', {
        targetAnimation,
        currentAnimation: currentAnimationRef.current,
        targetPriority,
        currentPriority
      });
      return false;
    }
    
    // Clear queue of lower priority requests
    const originalQueueLength = animationQueueRef.current.length;
    animationQueueRef.current = animationQueueRef.current.filter(
      req => (ANIMATION_PRIORITIES[req.targetAnimation] || 0) >= targetPriority
    );
    
    if (originalQueueLength !== animationQueueRef.current.length) {
      console.log('🧹 [GATE] Cleared lower priority requests from queue:', {
        before: originalQueueLength,
        after: animationQueueRef.current.length
      });
    }
    
    // Execute immediately
    executeAnimationChange(targetAnimation, trigger);
    return true;
  }, [executeAnimationChange]);

  // Set the ref after definition
  requestAnimationChangeRef.current = requestAnimationChange;


  // 🔍 DEBUG: Animation state logger
  useEffect(() => {
    console.log('🦆 [ANIMATION STATE CHANGE]', {
      timestamp: new Date().toISOString(),
      animation,
      currentSequenceStep,
      isSequencePlaying,
      currentFrame,
      isPngAnimationPlaying,
      imageLoadError,
      trigger,
      hasSequenceTimeout: !!sequenceTimeoutRef.current,
      hasPngAnimationRef: !!pngAnimationRef.current
    });
  }, [animation, currentSequenceStep, isSequencePlaying, currentFrame, isPngAnimationPlaying, imageLoadError, trigger]);

  // Preload images for smoother animation
  const preloadAnimationImages = useCallback((animConfig) => {
    if (animConfig.type !== 'png_sequence') return;
    
    const imagePromises = [];
    const padLength = (animConfig.basePath.includes('duck_gift') || animConfig.basePath.includes('duck_hungry')) ? 3 : 2;
    
    for (let i = 0; i < animConfig.frameCount; i++) {
      const imagePath = `${animConfig.basePath}${String(i).padStart(padLength, '0')}.png`;
      if (!preloadedImages[imagePath]) {
        const img = new Image();
        img.src = imagePath;
        imagePromises.push(
          new Promise((resolve) => {
            img.onload = () => resolve(imagePath);
            img.onerror = () => resolve(null);
          })
        );
      }
    }
    
    Promise.all(imagePromises).then((loadedPaths) => {
      const newPreloaded = { ...preloadedImages };
      loadedPaths.forEach(path => {
        if (path) newPreloaded[path] = true;
      });
      setPreloadedImages(newPreloaded);
    });
  }, [preloadedImages]);

  // Get current animation source with robust fallback handling
  const getCurrentAnimationSource = useCallback(() => {
    try {
      const animConfig = getAnimationConfigWithDefaults(animation);
      if (!animConfig) {
        console.warn(`Animation config not found for: ${animation}, falling back to idle`);
        // Return first frame of idle animation as fallback
        return `/img/duck_idle/adult idle_00.png`;
      }
      
      if (animConfig.type === 'sequence') {
        const currentStep = animConfig.steps[currentSequenceStep];
        if (currentStep?.type === 'png_sequence') {
          // 시퀀스 스텝에서도 안전한 프레임 체크
          const safeFrame = Math.max(0, Math.min(currentFrame, currentStep.frameCount - 1));
          
          // duck_gift and duck_hungry use 3 digits, others use 2 digits
          const padLength = (currentStep.basePath.includes('duck_gift') || currentStep.basePath.includes('duck_hungry')) ? 3 : 2;
          const imagePath = `${currentStep.basePath}${String(safeFrame).padStart(padLength, '0')}.png`;
          
          // Validate image path exists
          return imagePath;
        }
        return currentStep?.path || `/img/duck_idle/adult idle_00.png`;
      } else if (animConfig.type === 'png_sequence') {
        // 안전한 프레임 인덱스 체크 - frameCount를 절대 넘지 않도록
        const safeFrame = Math.max(0, Math.min(currentFrame, animConfig.frameCount - 1));
        
        if (currentFrame !== safeFrame) {
          console.warn(`Frame ${currentFrame} clamped to ${safeFrame} for animation ${animation} (frameCount: ${animConfig.frameCount})`);
        }
        
        // duck_gift and duck_hungry use 3 digits, others use 2 digits
        const padLength = (animConfig.basePath.includes('duck_gift') || animConfig.basePath.includes('duck_hungry')) ? 3 : 2;
        const imagePath = `${animConfig.basePath}${String(safeFrame).padStart(padLength, '0')}.png`;
        
        return imagePath;
      } else {
        return animConfig.path || `/img/duck_idle/adult idle_00.png`;
      }
    } catch (error) {
      console.error('Error getting current animation source:', error);
      // Always return a valid fallback
      return `/img/duck_idle/adult idle_00.png`;
    }
  }, [animation, currentSequenceStep, currentFrame]);

  // 🔒 Locked version of startPngAnimation
  const startPngAnimationWithUnlock = useCallback((animConfig, onCompleteCallback) => {
    console.log('🎬 [PNG ANIMATION START - LOCKED]', {
      timestamp: new Date().toISOString(),
      animation: animation,
      basePath: animConfig.basePath,
      frameCount: animConfig.frameCount,
      frameRate: animConfig.frameRate,
      loop: animConfig.loop
    });

    if (animConfig.type !== 'png_sequence') {
      console.warn('❌ [PNG ANIMATION] Not a png_sequence type:', animConfig.type);
      onCompleteCallback?.(animation);
      return;
    }
    
    // ⚠️ CRITICAL: frameCount validation
    if (!animConfig.frameCount || animConfig.frameCount <= 0) {
      console.error('❌ [PNG ANIMATION] Invalid frameCount:', animConfig.frameCount);
      onCompleteCallback?.(animation);
      return;
    }
    
    setIsPngAnimationPlaying(true);
    setImageLoadError(false);
    setCurrentFrame(0); // 애니메이션 시작 전에 프레임 초기화

    // Use the new PNG sequence player
    pngAnimationRef.current = playPngSequence({
      basePath: animConfig.basePath,
      frameCount: animConfig.frameCount,
      frameRate: animConfig.frameRate || 24,
      loop: animConfig.loop,
      onFrame: (frame) => {
        console.log(`🎬 [FRAME] Displaying frame ${frame}/${animConfig.frameCount - 1} for ${animConfig.basePath}`);
        setCurrentFrame(frame);
      },
      onComplete: () => {
        setIsPngAnimationPlaying(false);
        onCompleteCallback?.(animation);
      }
    });
  }, [animation, playPngSequence]);

  // 🔒 Locked version of playSequence
  const playSequenceWithUnlock = useCallback((animConfig, onCompleteCallback) => {
    // 🔒 CRITICAL: Prevent duplicate sequence starts with same animation + trigger
    const sequenceKey = `${animation}:${trigger}`;
    if (lastSequenceStartKeyRef.current === sequenceKey) {
      console.log('🔒 [SEQUENCE] Duplicate start blocked', {
        key: sequenceKey,
        lastKey: lastSequenceStartKeyRef.current
      });
      onCompleteCallback?.(animation);
      return;
    }
    lastSequenceStartKeyRef.current = sequenceKey;

    console.log('🎭 [SEQUENCE START - LOCKED]', {
      timestamp: new Date().toISOString(),
      animation: animation,
      sequenceKey,
      stepsCount: animConfig.steps?.length || 0,
      steps: animConfig.steps?.map(step => ({
        type: step.type,
        basePath: step.basePath,
        frameCount: step.frameCount,
        duration: step.duration
      })),
      hadExistingTimeout: !!sequenceTimeoutRef.current
    });

    if (animConfig.type !== 'sequence' || !animConfig.steps) {
      console.warn('❌ [SEQUENCE] Invalid sequence config:', {
        type: animConfig.type,
        hasSteps: !!animConfig.steps
      });
      onCompleteCallback?.(animation);
      return;
    }
    
    // Clear any existing sequence timeouts first
    if (sequenceTimeoutRef.current) {
      console.log('🛑 [SEQUENCE] Clearing existing timeout');
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    
    // 🔒 Create sequence run ID for this execution
    const currentSequenceRunId = ++sequenceRunIdRef.current;
    activeSequenceRunIdRef.current = currentSequenceRunId;
    
    setIsSequencePlaying(true);
    setCurrentSequenceStep(0);
    
    // Sequence step completion handler
    const onSequenceStepComplete = (stepIndex) => {
      console.log('✅ [SEQUENCE STEP COMPLETE - LOCKED]', {
        animation: animation,
        stepIndex,
        totalSteps: animConfig.steps.length
      });
      
      // 🔒 CRITICAL: Validate sequence run ID
      if (activeSequenceRunIdRef.current !== currentSequenceRunId) {
        console.log('🛑 [SEQUENCE STEP] Stale sequence execution detected', {
          stepIndex,
          currentRunId: currentSequenceRunId,
          activeRunId: activeSequenceRunIdRef.current
        });
        return;
      }
      
      if (stepIndex < animConfig.steps.length - 1) {
        startNextStep(stepIndex + 1);
      } else {
        // All steps complete
        console.log('✅ [SEQUENCE COMPLETE - LOCKED]', {
          animation: animation,
          totalSteps: animConfig.steps.length
        });
        setIsSequencePlaying(false);
        
        // Call the unlock callback
        onCompleteCallback?.(animation);
      }
    };
    
    const startNextStep = (stepIndex) => {
      console.log('📋 [SEQUENCE STEP - LOCKED]', {
        animation: animation,
        stepIndex,
        totalSteps: animConfig.steps.length,
        step: animConfig.steps[stepIndex]
      });
      
      const step = animConfig.steps[stepIndex];
      setCurrentSequenceStep(stepIndex);
      
      // If this step is a PNG sequence, start its animation with completion handler
      if (step.type === 'png_sequence') {
        console.log('🎬 [SEQUENCE] Starting PNG step:', stepIndex);
        startPngStepWithCompletion(stepIndex, step);
      }
    };
    
    const startPngStepWithCompletion = (stepIndex, step) => {
      cleanupRef.current?.(); // Clear previous cleanup
      cleanupRef.current = playPngSequence({
        basePath: step.basePath,
        frameCount: step.frameCount,
        frameRate: step.frameRate ?? 24,
        loop: false,
        onFrame: (f) => setCurrentFrame(f),
        onComplete: () => onSequenceStepComplete(stepIndex),
      });
    };
    
    startNextStep(0);
  }, [animation, trigger, playPngSequence]);

  // Optimized PNG animation with proper state management (Legacy - kept for compatibility)
  const startPngAnimation = useCallback((animConfig) => {
    console.log('🎬 [PNG ANIMATION START]', {
      timestamp: new Date().toISOString(),
      animation: animation,
      basePath: animConfig.basePath,
      frameCount: animConfig.frameCount,
      frameRate: animConfig.frameRate,
      loop: animConfig.loop
    });

    if (animConfig.type !== 'png_sequence') {
      console.warn('❌ [PNG ANIMATION] Not a png_sequence type:', animConfig.type);
      return;
    }
    
    // ⚠️ CRITICAL: frameCount validation
    if (!animConfig.frameCount || animConfig.frameCount <= 0) {
      console.error('❌ [PNG ANIMATION] Invalid frameCount:', animConfig.frameCount);
      return;
    }
    
    setIsPngAnimationPlaying(true);
    setCurrentFrame(0);
    setImageLoadError(false);

    // Use the new PNG sequence player
    pngAnimationRef.current = playPngSequence({
      basePath: animConfig.basePath,
      frameCount: animConfig.frameCount,
      frameRate: animConfig.frameRate || 24,
      loop: animConfig.loop,
      onFrame: (frame) => setCurrentFrame(frame),
      onComplete: () => {
        setIsPngAnimationPlaying(false);
        if (onAnimationComplete && typeof onAnimationComplete === 'function') {
          onAnimationComplete(animation);
        }
      }
    });
  }, [animation, onAnimationComplete, playPngSequence]);

  const stopPngAnimation = useCallback(() => {
    if (pngAnimationRef.current) {
      pngAnimationRef.current(); // Call cleanup function
      pngAnimationRef.current = null;
    }
    setIsPngAnimationPlaying(false);
  }, []);

  // Handle sequence animations
  const playSequence = useCallback((animConfig) => {
    // 🔒 CRITICAL: Prevent duplicate sequence starts with same animation + trigger
    const sequenceKey = `${animation}:${trigger}`;
    if (lastSequenceStartKeyRef.current === sequenceKey) {
      console.log('🔒 [SEQUENCE] Duplicate start blocked', {
        key: sequenceKey,
        lastKey: lastSequenceStartKeyRef.current
      });
      return;
    }
    lastSequenceStartKeyRef.current = sequenceKey;

    console.log('🎭 [SEQUENCE START]', {
      timestamp: new Date().toISOString(),
      animation: animation,
      sequenceKey,
      stepsCount: animConfig.steps?.length || 0,
      steps: animConfig.steps?.map(step => ({
        type: step.type,
        basePath: step.basePath,
        frameCount: step.frameCount,
        duration: step.duration
      })),
      hadExistingTimeout: !!sequenceTimeoutRef.current
    });

    if (animConfig.type !== 'sequence' || !animConfig.steps) {
      console.warn('❌ [SEQUENCE] Invalid sequence config:', {
        type: animConfig.type,
        hasSteps: !!animConfig.steps
      });
      return;
    }
    
    // Clear any existing sequence timeouts first
    if (sequenceTimeoutRef.current) {
      console.log('🛑 [SEQUENCE] Clearing existing timeout');
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    
    // 🔒 Create sequence run ID for this execution
    const currentSequenceRunId = ++sequenceRunIdRef.current;
    activeSequenceRunIdRef.current = currentSequenceRunId;
    
    // 🛡️ 중요한 시퀀스는 보호 모드 활성화
    const protectedSequences = ['product_recommendation', 'welcome_greeting', 'searching'];
    if (protectedSequences.includes(animation)) {
      sequenceProtectedRef.current = animation;
      console.log('🛡️ [SEQUENCE] Protection enabled for:', animation);
    }
    
    setIsSequencePlaying(true);
    setCurrentSequenceStep(0);
    
    // Sequence step completion handler
    const onSequenceStepComplete = (stepIndex) => {
      console.log('✅ [SEQUENCE STEP COMPLETE]', {
        animation: animation,
        stepIndex,
        totalSteps: animConfig.steps.length
      });
      
      // 🔒 CRITICAL: Validate sequence run ID
      if (activeSequenceRunIdRef.current !== currentSequenceRunId) {
        console.log('🛑 [SEQUENCE STEP] Stale sequence execution detected', {
          stepIndex,
          currentRunId: currentSequenceRunId,
          activeRunId: activeSequenceRunIdRef.current
        });
        return;
      }
      
      if (stepIndex < animConfig.steps.length - 1) {
        startNextStep(stepIndex + 1);
      } else {
        // All steps complete
        console.log('✅ [SEQUENCE COMPLETE]', {
          animation: animation,
          totalSteps: animConfig.steps.length
        });
        setIsSequencePlaying(false);
        
        // 🛡️ 시퀀스 보호 해제
        if (sequenceProtectedRef.current === animation) {
          sequenceProtectedRef.current = null;
          const pending = pendingAnimRef.current;
          pendingAnimRef.current = null;
          console.log('🛡️ [SEQUENCE] Protection disabled for:', animation);
          
          // 종료 직후 대기중이던 애니를 반영 - 콜백을 통해 처리
          if (pending && onAnimationComplete) {
            console.log('📅 [SEQUENCE] Requesting pending animation:', pending.targetAnim);
            // Request the external handler to apply the pending animation
            setTimeout(() => {
              onAnimationComplete(pending.targetAnim);
            }, 100);
          }
        }
        
        // 시퀀스 완료 콜백 호출
        if (onAnimationComplete && typeof onAnimationComplete === 'function') {
          onAnimationComplete(animation);
        }
      }
    };
    
    const startNextStep = (stepIndex) => {
      console.log('📋 [SEQUENCE STEP]', {
        animation: animation,
        stepIndex,
        totalSteps: animConfig.steps.length,
        step: animConfig.steps[stepIndex]
      });
      
      const step = animConfig.steps[stepIndex];
      setCurrentSequenceStep(stepIndex);
      
      // If this step is a PNG sequence, start its animation with completion handler
      if (step.type === 'png_sequence') {
        console.log('🎬 [SEQUENCE] Starting PNG step:', stepIndex);
        startPngStepWithCompletion(stepIndex, step);
      }
    };
    
    const startPngStepWithCompletion = (stepIndex, step) => {
      cleanupRef.current?.(); // Clear previous cleanup
      cleanupRef.current = playPngSequence({
        basePath: step.basePath,
        frameCount: step.frameCount,
        frameRate: step.frameRate ?? 24,
        loop: false,
        onFrame: (f) => setCurrentFrame(f),
        onComplete: () => onSequenceStepComplete(stepIndex),
      });
    };
    
    startNextStep(0);
  }, [animation, onAnimationComplete, startPngAnimation]);

  // 🚪 Main Animation Effect - Routes all animation changes through the gate
  useLayoutEffect(() => {
    console.log('🚪 [MAIN EFFECT] Animation prop changed:', {
      animation,
      trigger,
      timestamp: new Date().toISOString()
    });
    
    // Route all animation requests through the gate system
    if (requestAnimationChangeRef.current) {
      requestAnimationChangeRef.current(animation, trigger);
    }
  }, [animation, trigger]);  // Preload images on component mount
  useEffect(() => {
    // Preload all single animations
    preloadAnimationImages(DUCK_ANIMATIONS.idle);
    preloadAnimationImages(DUCK_ANIMATIONS.happy);
    preloadAnimationImages(DUCK_ANIMATIONS.mad);
    preloadAnimationImages(DUCK_ANIMATIONS.talk);
    preloadAnimationImages(DUCK_ANIMATIONS.hungry);
    preloadAnimationImages(DUCK_ANIMATIONS.walkback);
    preloadAnimationImages(DUCK_ANIMATIONS.gift);
    preloadAnimationImages(DUCK_ANIMATIONS.walkforward);
  }, [preloadAnimationImages]);

  // Animation is now purely controlled by props - no internal state conflicts

  // Component cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 [COMPONENT] Cleaning up on unmount');
      clearAll();
      animationLockRef.current = false;
      animationQueueRef.current = [];
      currentAnimationRef.current = null;
      sequenceProtectedRef.current = null;
      pendingAnimRef.current = null;
    };
  }, [clearAll]);

  // Handle click events
  const handleClick = useCallback(() => {
    onClick?.();
    // 클릭 시 애니메이션 변경은 외부 훅에서 처리하도록 함
  }, [onClick]);

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-[180px] h-[180px]'
  };

  const imagePath = getCurrentAnimationSource();

  return (
    <div
      className={cn(
        'relative select-none cursor-pointer transition-all duration-200',
        sizeClasses[size],
        'hover:scale-[1.02]',
        className
      )}
      onClick={handleClick}
    >
      {imagePath && (
        <img
          ref={gifRef}
          src={imageLoadError ? fallbackImagePath : imagePath}
          alt={`Duck ${animation} animation`}
          className="w-full h-full object-contain"
          draggable={false}
          onError={(e) => {
            console.warn(`Failed to load duck animation: ${imagePath}, falling back to: ${fallbackImagePath}`);
            setImageLoadError(true);
            
            // If fallback also fails, try the most basic fallback
            if (e.target.src === fallbackImagePath) {
              console.error('Fallback image also failed to load, using first idle frame');
              setFallbackImagePath('/img/duck_idle/adult idle_00.png');
              
              // Stop current animation to prevent further errors
              if (pngAnimationRef.current) {
                cancelAnimationFrame(pngAnimationRef.current);
                pngAnimationRef.current = null;
              }
              setIsPngAnimationPlaying(false);
              setCurrentFrame(0);
            }
          }}
          onLoad={() => {
            // Reset error state when image loads successfully
            if (imageLoadError) {
              setImageLoadError(false);
            }
          }}
        />
      )}
      
    </div>
  );
};

export default AnimatedDuckCharacter;
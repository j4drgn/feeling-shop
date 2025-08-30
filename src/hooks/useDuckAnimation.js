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
  enthusiastic: 'gift_sequence', // Special celebration with walk sequence
  
  sad: 'idle', // Calm, empathetic
  frustrated: 'mad',
  angry: 'mad',
  annoyed: 'mad',
  
  neutral: 'idle',
  calm: 'idle',
  thoughtful: 'idle',
  
  // New emotions for product interactions
  hungry: 'hungry',
  wanting: 'hungryfast',
  
  // Conversation context  
  greeting: 'happy',
  farewell: 'walkback',
  shopping: 'gift_sequence', // Full sequence: walk back -> get gift -> walk forward
  thanking: 'happy',
  
  // Default
  default: 'idle'
};

// Animation priorities (higher number = higher priority)
const ANIMATION_PRIORITY = {
  gift_sequence: 110, // Highest - full sequence 
  gift: 100,     // High - special celebrations
  walkback: 95,  // High - movement animations
  walkforward: 95, // High - movement animations
  mad: 90,       // High - negative emotions need attention
  hungryfast: 80, // Medium-high - urgent emotions
  hungry: 75,    // Medium-high - wanting emotions
  happy: 70,     // Medium-high - positive emotions
  talk: 50,      // Medium - speaking state
  idle: 10       // Lowest - default state
};

// Animation durations (in milliseconds)
const ANIMATION_DURATION = {
  gift_sequence: 6000, // 6 seconds for full sequence
  gift: 3000,    // 3 seconds for gift animation
  walkback: 1500, // 1.5 seconds for walking back
  walkforward: 1500, // 1.5 seconds for walking forward
  mad: 3500,     // 3.5 seconds for mad animation  
  hungry: 3000,  // 3 seconds for hungry
  hungryfast: 2500, // 2.5 seconds for hungry fast
  happy: 2000,   // 2 seconds for happy
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
    console.warn('useDuckAnimation: initialAnimation must be a string, falling back to "idle"');
    initialAnimation = 'idle';
  }
  const [currentAnimation, setCurrentAnimation] = useState(initialAnimation);
  const [animationQueue, setAnimationQueue] = useState([]);
  const [triggerCount, setTriggerCount] = useState(0);
  const timeoutRef = useRef(null);
  const lastEmotionRef = useRef(null);

  // Determine target animation based on current state
  const getTargetAnimation = useCallback(() => {
    try {
      // Priority 1: Speech states
      if (isSpeaking) return 'talk';
      if (isListening) return 'idle'; // Calm while listening
      
      // Priority 2: Detected emotion from speech
      if (emotion?.emotion && emotion.emotion !== lastEmotionRef.current) {
        const emotionKey = emotion.emotion.toLowerCase();
        if (EMOTION_TO_ANIMATION[emotionKey]) {
          return EMOTION_TO_ANIMATION[emotionKey];
        }
      }
      
      // Priority 3: Conversation context
      if (conversationContext && EMOTION_TO_ANIMATION[conversationContext]) {
        return EMOTION_TO_ANIMATION[conversationContext];
      }
      
      // Default: idle
      return 'idle';
    } catch (error) {
      console.error('Error in getTargetAnimation:', error);
      return 'idle';
    }
  }, [emotion, isListening, isSpeaking, conversationContext]);

  // Queue animation with priority system
  const queueAnimation = useCallback((targetAnim) => {
    const currentPriority = ANIMATION_PRIORITY[currentAnimation] || 0;
    const targetPriority = ANIMATION_PRIORITY[targetAnim] || 0;
    
    // Higher priority animations can interrupt lower priority ones
    if (targetPriority > currentPriority || currentAnimation === 'idle') {
      setCurrentAnimation(targetAnim);
      
      // Set timeout for temporary animations
      const duration = ANIMATION_DURATION[targetAnim];
      if (duration > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setCurrentAnimation('idle');
        }, duration);
      }
      
      // Trigger animation restart for non-looping animations
      if (['gift', 'mad'].includes(targetAnim)) {
        setTriggerCount(prev => prev + 1);
      }
    }
  }, [currentAnimation]);

  // React to state changes
  useEffect(() => {
    const targetAnim = getTargetAnimation();
    
    if (targetAnim !== currentAnimation) {
      queueAnimation(targetAnim);
    }
    
    // Update emotion reference
    if (emotion?.emotion) {
      lastEmotionRef.current = emotion.emotion;
    }
  }, [emotion, isListening, isSpeaking, conversationContext, currentAnimation, getTargetAnimation, queueAnimation]);

  // Handle animation completion
  const handleAnimationComplete = useCallback((completedAnimation) => {
    // After non-looping animations, return to appropriate state
    if (['gift', 'mad'].includes(completedAnimation)) {
      const newTarget = getTargetAnimation();
      if (newTarget === completedAnimation) {
        // If we would return to the same animation, go to idle instead
        setCurrentAnimation('idle');
      } else {
        setCurrentAnimation(newTarget);
      }
    }
  }, [getTargetAnimation]);

  // Manual animation trigger (for special events)
  const triggerAnimation = useCallback((animation, force = false) => {
    if (force) {
      setCurrentAnimation(animation);
      setTriggerCount(prev => prev + 1);
      
      const duration = ANIMATION_DURATION[animation];
      if (duration > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setCurrentAnimation('idle');
        }, duration);
      }
    } else {
      queueAnimation(animation);
    }
  }, [queueAnimation]);

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
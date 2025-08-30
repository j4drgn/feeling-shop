import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Duck animation configurations - PNG frame sequences for transparent backgrounds
const DUCK_ANIMATIONS = {
  idle: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_',
    frameCount: 51, // 0-50
    frameRate: 15,
    loop: true
  },
  happy: {
    type: 'png_sequence',
    basePath: '/img/duck_happy/adult happy_',
    frameCount: 41, // 0-40
    frameRate: 20,
    loop: true
  },
  talk: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_', // fallback to idle
    frameCount: 51,
    frameRate: 18,
    loop: true
  },
  mad: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_', // fallback to idle
    frameCount: 51,
    frameRate: 25,
    loop: true
  },
  hungry: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_', // fallback to idle
    frameCount: 51,
    frameRate: 20,
    loop: true
  },
  hungryfast: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_', // fallback to idle
    frameCount: 51,
    frameRate: 30,
    loop: true
  },
  // Special sequence for product recommendation
  gift_sequence: {
    type: 'sequence',
    steps: [
      {
        type: 'png_sequence',
        basePath: '/img/duck_idle/adult idle_', // walk back simulation
        frameCount: 20,
        frameRate: 15,
        duration: 1500,
        loop: false
      },
      {
        type: 'png_sequence',
        basePath: '/img/duck_gift/adult_gift_',
        frameCount: 100, // 0-99
        frameRate: 20,
        duration: 5000,
        loop: false
      },
      {
        type: 'png_sequence',
        basePath: '/img/duck_idle/adult idle_', // walk forward simulation
        frameCount: 20,
        frameRate: 15,
        duration: 1500,
        loop: false
      }
    ]
  },
  // Individual components for manual control
  walkback: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_',
    frameCount: 20,
    frameRate: 15,
    loop: false
  },
  gift: {
    type: 'png_sequence',
    basePath: '/img/duck_gift/adult_gift_',
    frameCount: 100, // 0-99
    frameRate: 20,
    loop: false
  },
  walkforward: {
    type: 'png_sequence',
    basePath: '/img/duck_idle/adult idle_',
    frameCount: 20,
    frameRate: 15,
    loop: false
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
  const [currentAnimation, setCurrentAnimation] = useState(animation);
  const [currentSequenceStep, setCurrentSequenceStep] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPngAnimationPlaying, setIsPngAnimationPlaying] = useState(false);
  const sequenceTimeoutRef = useRef(null);
  const pngAnimationRef = useRef(null);
  const gifRef = useRef(null);

  // Get current animation source (GIF path, PNG frame, or sequence step)
  const getCurrentAnimationSource = useCallback(() => {
    try {
      const animConfig = DUCK_ANIMATIONS[currentAnimation];
      if (!animConfig) {
        console.warn(`Animation config not found for: ${currentAnimation}, falling back to idle`);
        return DUCK_ANIMATIONS['idle']?.basePath ? 
          `${DUCK_ANIMATIONS['idle'].basePath}${String(0).padStart(2, '0')}.png` : 
          DUCK_ANIMATIONS['idle']?.path || null;
      }
      
      if (animConfig.type === 'sequence') {
        const currentStep = animConfig.steps[currentSequenceStep];
        if (currentStep?.type === 'png_sequence') {
          return `${currentStep.basePath}${String(currentFrame).padStart(3, '0')}.png`;
        }
        return currentStep?.path || null;
      } else if (animConfig.type === 'png_sequence') {
        return `${animConfig.basePath}${String(currentFrame).padStart(2, '0')}.png`;
      } else {
        return animConfig.path || null;
      }
    } catch (error) {
      console.error('Error getting current animation source:', error);
      return null;
    }
  }, [currentAnimation, currentSequenceStep, currentFrame]);

  // PNG animation handler
  const playPngAnimation = useCallback((animConfig) => {
    if (animConfig.type !== 'png_sequence') return;
    
    setIsPngAnimationPlaying(true);
    setCurrentFrame(0);
    
    const frameInterval = 1000 / (animConfig.frameRate || 15);
    let frameIndex = 0;
    
    const playFrame = () => {
      if (frameIndex >= animConfig.frameCount) {
        if (animConfig.loop) {
          frameIndex = 0;
        } else {
          setIsPngAnimationPlaying(false);
          if (onAnimationComplete && typeof onAnimationComplete === 'function') {
            onAnimationComplete(currentAnimation);
          }
          return;
        }
      }
      
      setCurrentFrame(frameIndex);
      frameIndex++;
      
      if (animConfig.loop || frameIndex < animConfig.frameCount) {
        pngAnimationRef.current = setTimeout(playFrame, frameInterval);
      }
    };
    
    pngAnimationRef.current = setTimeout(playFrame, frameInterval);
  }, [currentAnimation, onAnimationComplete, isPngAnimationPlaying]);

  // Handle sequence animations
  const playSequence = useCallback((animConfig) => {
    if (animConfig.type !== 'sequence' || !animConfig.steps) return;
    
    setIsSequencePlaying(true);
    setCurrentSequenceStep(0);
    
    const playStep = (stepIndex) => {
      if (stepIndex >= animConfig.steps.length) {
        // Sequence complete
        setIsSequencePlaying(false);
        setCurrentAnimation('idle');
        if (onAnimationComplete && typeof onAnimationComplete === 'function') {
          onAnimationComplete(currentAnimation);
        }
        return;
      }
      
      const step = animConfig.steps[stepIndex];
      setCurrentSequenceStep(stepIndex);
      
      // If this step is a PNG sequence, start its animation
      if (step.type === 'png_sequence') {
        playPngAnimation(step);
      }
      
      // Schedule next step
      sequenceTimeoutRef.current = setTimeout(() => {
        playStep(stepIndex + 1);
      }, step.duration || 2000);
    };
    
    playStep(0);
  }, [currentAnimation, onAnimationComplete, playPngAnimation]);

  // Handle animation changes and sequence management
  useEffect(() => {
    try {
      const animConfig = DUCK_ANIMATIONS[currentAnimation];
      if (!animConfig) return;

      // Clear any existing timeouts
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = null;
      }
      if (pngAnimationRef.current) {
        clearTimeout(pngAnimationRef.current);
        pngAnimationRef.current = null;
      }

      if (animConfig.type === 'sequence') {
        playSequence(animConfig);
      } else if (animConfig.type === 'png_sequence') {
        setIsSequencePlaying(false);
        setCurrentSequenceStep(0);
        playPngAnimation(animConfig);
      } else {
        setIsSequencePlaying(false);
        setCurrentSequenceStep(0);
        setIsPngAnimationPlaying(false);
        setCurrentFrame(0);
        
        // For non-looping GIFs, set timeout to complete
        if (!animConfig.loop) {
          const duration = animConfig.duration || 3000; // Default 3 seconds
          sequenceTimeoutRef.current = setTimeout(() => {
            if (onAnimationComplete && typeof onAnimationComplete === 'function') {
              onAnimationComplete(currentAnimation);
            }
          }, duration);
        }
      }

      return () => {
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }
        if (pngAnimationRef.current) {
          clearTimeout(pngAnimationRef.current);
        }
      };
    } catch (error) {
      console.error('Error in animation management:', error);
      setCurrentAnimation('idle');
    }
  }, [currentAnimation, playSequence, playPngAnimation, onAnimationComplete]);

  // Handle animation prop changes
  useEffect(() => {
    if (animation !== currentAnimation) {
      setCurrentAnimation(animation);
      setCurrentSequenceStep(0);
    }
  }, [animation, currentAnimation]);

  // Handle external triggers (for restarting animations)
  useEffect(() => {
    if (trigger) {
      // Force restart current animation
      const animConfig = DUCK_ANIMATIONS[currentAnimation];
      if (animConfig?.type === 'sequence') {
        playSequence(animConfig);
      }
    }
  }, [trigger, currentAnimation, playSequence]);

  // Handle click events
  const handleClick = useCallback(() => {
    onClick?.();
    
    // Trigger a brief happy animation on click if in idle state
    if (currentAnimation === 'idle') {
      setCurrentAnimation('happy');
      setTimeout(() => {
        setCurrentAnimation('idle');
      }, 2000);
    }
  }, [onClick, currentAnimation]);

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
          src={imagePath}
          alt={`Duck ${currentAnimation} animation`}
          className="w-full h-full object-contain"
          draggable={false}
          onError={() => {
            // Fallback to idle animation if current GIF fails to load
            console.warn(`Failed to load duck animation: ${imagePath}`);
            if (currentAnimation !== 'idle') {
              setCurrentAnimation('idle');
            }
          }}
        />
      )}
      
    </div>
  );
};

export default AnimatedDuckCharacter;
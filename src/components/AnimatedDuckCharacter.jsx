import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Duck animation configurations - only include animations with existing files
const DUCK_ANIMATIONS = {
  idle: {
    path: '/img/duck_idle',
    frames: 51, // 00-50
    fps: 12,
    loop: true,
    prefix: 'adult idle_',
    format: '.png'
  },
  happy: {
    path: '/img/duck_happy', 
    frames: 41, // 00-40
    fps: 15,
    loop: true,
    prefix: 'adult happy_',
    format: '.png'
  },
  gift: {
    path: '/img/duck_gift',
    frames: 100, // 000-099
    fps: 20,
    loop: false,
    prefix: 'adult_gift_',
    format: '.png',
    frameLength: 3 // 000 format
  },
  // Fallback: use happy animation for talk/mad until files are available
  talk: {
    path: '/img/duck_happy', // Use happy animation as fallback
    frames: 41,
    fps: 18,
    loop: true,
    prefix: 'adult happy_',
    format: '.png'
  },
  mad: {
    path: '/img/duck_idle', // Use idle animation as fallback
    frames: 51,
    fps: 14,
    loop: true, // Changed to loop for better UX
    prefix: 'adult idle_',
    format: '.png'
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
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentAnimation, setCurrentAnimation] = useState(animation);
  const intervalRef = useRef(null);
  const imageCache = useRef({});

  // Preload images for smoother animation
  const preloadImages = useCallback((animConfig) => {
    const { path, frames, prefix, format, frameLength = 2 } = animConfig;
    
    for (let i = 0; i < frames; i++) {
      const frameNumber = i.toString().padStart(frameLength, '0');
      const imagePath = `${path}/${prefix}${frameNumber}${format}`;
      
      if (!imageCache.current[imagePath]) {
        const img = new Image();
        img.src = imagePath;
        imageCache.current[imagePath] = img;
      }
    }
  }, []);

  // Get current frame image path
  const getCurrentFramePath = useCallback(() => {
    try {
      const animConfig = DUCK_ANIMATIONS[currentAnimation];
      if (!animConfig) {
        console.warn(`Animation config not found for: ${currentAnimation}, falling back to idle`);
        const idleConfig = DUCK_ANIMATIONS['idle'];
        if (!idleConfig) return null;
        const { path, prefix, format, frameLength = 2 } = idleConfig;
        const frameNumber = Math.min(currentFrame, idleConfig.frames - 1).toString().padStart(frameLength, '0');
        return `${path}/${prefix}${frameNumber}${format}`;
      }
      
      const { path, prefix, format, frameLength = 2 } = animConfig;
      const frameNumber = currentFrame.toString().padStart(frameLength, '0');
      return `${path}/${prefix}${frameNumber}${format}`;
    } catch (error) {
      console.error('Error getting current frame path:', error);
      return null;
    }
  }, [currentAnimation, currentFrame]);

  // Animation loop
  useEffect(() => {
    try {
      const animConfig = DUCK_ANIMATIONS[currentAnimation];
      if (!animConfig || !isPlaying) return;

      // Preload images
      preloadImages(animConfig);

      const frameInterval = Math.max(1000 / animConfig.fps, 16); // At least 16ms (60fps max)
      
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          const nextFrame = prev + 1;
          
          // Check if animation is complete
          if (nextFrame >= animConfig.frames) {
            if (animConfig.loop) {
              return 0; // Loop back to start
            } else {
              // Animation finished
              setIsPlaying(false);
              if (onAnimationComplete && typeof onAnimationComplete === 'function') {
                onAnimationComplete(currentAnimation);
              }
              return prev; // Stay on last frame
            }
          }
          
          return nextFrame;
        });
      }, frameInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } catch (error) {
      console.error('Error in animation loop:', error);
      // Reset to idle on error
      setCurrentAnimation('idle');
      setCurrentFrame(0);
    }
  }, [currentAnimation, isPlaying, onAnimationComplete, preloadImages]);

  // Handle animation changes
  useEffect(() => {
    if (animation !== currentAnimation) {
      setCurrentAnimation(animation);
      setCurrentFrame(0);
      setIsPlaying(true);
    }
  }, [animation, currentAnimation]);

  // Handle external triggers (for restarting non-looping animations)
  useEffect(() => {
    if (trigger && !DUCK_ANIMATIONS[currentAnimation]?.loop) {
      setCurrentFrame(0);
      setIsPlaying(true);
    }
  }, [trigger, currentAnimation]);

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

  const imagePath = getCurrentFramePath();

  return (
    <div
      className={cn(
        'relative select-none cursor-pointer transition-all duration-200',
        sizeClasses[size],
        'hover:scale-105 active:scale-95',
        className
      )}
      onClick={handleClick}
    >
      {imagePath && (
        <img
          src={imagePath}
          alt={`Duck ${currentAnimation} animation frame ${currentFrame}`}
          className="w-full h-full object-contain"
          draggable={false}
          onError={(e) => {
            // Fallback to idle animation if current frame fails to load
            console.warn(`Failed to load duck frame: ${imagePath}`);
            if (currentAnimation !== 'idle') {
              setCurrentAnimation('idle');
              setCurrentFrame(0);
            }
          }}
        />
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-6 left-0 text-xs text-layer-muted bg-layer-surface px-2 py-1 rounded border">
          {currentAnimation} f:{currentFrame}
        </div>
      )}
    </div>
  );
};

export default AnimatedDuckCharacter;
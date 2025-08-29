import React from 'react';
import { cn } from "@/lib/utils";

const SpeechBubble = ({ text, className }) => {
  if (!text) {
    return null;
  }

  return (
    <div className={cn("relative animate-bubble-float", className)}>
      <div className="relative">
        {/* Main bubble with kawaii style */}
        <div className="relative bg-white rounded-[2rem] px-8 py-6 shadow-lg border-4 border-yellow-200 max-w-md mx-auto transform transition-all duration-300 hover:scale-105">
          {/* Inner gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-pink-50/50 rounded-[1.8rem]" />
          
          {/* Cute decorative elements */}
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-pink-300 rounded-full opacity-60 animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-300 rounded-full opacity-60 animate-pulse delay-75" />
          
          {/* Text content with kawaii font style */}
          <p className="relative text-gray-700 text-lg font-bold leading-relaxed text-center" 
             style={{ fontFamily: "'Noto Sans KR', sans-serif", letterSpacing: '0.5px' }}>
            {text}
          </p>
          
          {/* Cute emoji decorations based on text */}
          {text.includes('안녕') && (
            <span className="absolute -top-6 right-4 text-2xl animate-bounce">👋</span>
          )}
          {text.includes('듣고 있어') && (
            <span className="absolute -top-6 right-4 text-2xl animate-pulse">👂</span>
          )}
          {text.includes('쇼핑') && (
            <span className="absolute -top-6 right-4 text-2xl animate-bounce">🛍️</span>
          )}
        </div>
        
        {/* Kawaii-style speech bubble tail */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <svg width="40" height="30" viewBox="0 0 40 30" className="drop-shadow-md">
            <path 
              d="M20 0 C15 10, 10 25, 15 30 L25 30 C30 25, 25 10, 20 0 Z" 
              fill="white" 
              stroke="#fde68a" 
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        {/* Floating hearts animation */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2">
          <div className="space-y-2">
            <div className="text-pink-400 text-xl animate-float-hearts">💕</div>
            <div className="text-yellow-400 text-lg animate-float-hearts delay-150">⭐</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechBubble;
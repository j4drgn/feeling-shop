import { cn } from "@/lib/utils";
import { useState } from "react";

export const DuckCharacter = ({
  src = "https://i.pinimg.com/originals/2f/85/3d/2f853d0d25410ea49f6e1c4628e63dd9.gif",
  size = "lg",
  onClick,
  className,
  circleColor,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40 md:w-48 md:h-48",
    xl: "w-56 h-56 md:w-64 md:h-64",
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    if (onClick) onClick();
  };

  return (
    <div className="relative">
      {/* Floating decorative elements */}
      <div className="absolute -top-4 -right-4 animate-float-hearts">
        <span className="text-2xl">💛</span>
      </div>
      <div className="absolute -bottom-4 -left-4 animate-float-hearts delay-150">
        <span className="text-2xl">⭐</span>
      </div>
      
      {/* Main duck container with kawaii style */}
      <div
        className={cn(
          "relative rounded-full p-4 cursor-pointer transition-all duration-300",
          "bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-200",
          "shadow-2xl border-4 border-white",
          sizeClasses[size],
          isClicked && "scale-95",
          !isClicked && "hover:scale-110 hover:rotate-3",
          "hover:shadow-[0_20px_50px_rgba(255,200,0,0.4)]",
          className
        )}
        onClick={handleClick}
        style={{
          background: circleColor
            ? `linear-gradient(135deg, ${circleColor}, ${circleColor})`
            : undefined,
        }}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-md" />
        
        {/* Duck image container */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center overflow-hidden border-3 border-yellow-100 shadow-inner">
          {/* Cute sparkle effects */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-pulse" />
          <div className="absolute bottom-4 left-3 w-2 h-2 bg-white rounded-full animate-pulse delay-75" />
          
          <img
            src={src}
            alt="Cute duck friend"
            className={cn(
              "w-4/5 h-4/5 object-contain",
              isClicked && "animate-wiggle"
            )}
          />
        </div>
        
        {/* Click effect ripple */}
        {isClicked && (
          <div className="absolute inset-0 rounded-full bg-yellow-300/30 animate-ping" />
        )}
      </div>
      
      {/* Cute shadow blob */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-3/4 h-4 bg-gray-300/30 rounded-full blur-xl" />
    </div>
  );
};
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
      {/* Clean, minimal duck container */}
      <div
        className={cn(
          "relative rounded-full p-6 cursor-pointer transition-all duration-300",
          "bg-white border-2 border-gray-200",
          "shadow-lg hover:shadow-xl",
          sizeClasses[size],
          isClicked && "scale-[0.98]",
          !isClicked && "hover:scale-[1.02]",
          className
        )}
        onClick={handleClick}
        style={{
          background: circleColor || "white",
        }}
      >
        {/* Duck image container - simplified */}
        <div className="relative w-full h-full rounded-full bg-neutral-bg flex items-center justify-center overflow-hidden">
          <img
            src={src}
            alt="Duck character"
            className={cn(
              "w-4/5 h-4/5 object-contain",
              isClicked && "animate-wiggle"
            )}
          />
        </div>

        {/* Click effect - subtle */}
        {isClicked && (
          <div className="absolute inset-0 rounded-full bg-brand-primary/20 animate-ping" />
        )}
      </div>

      {/* Minimal shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1/2 h-2 bg-gray-200 rounded-full blur-sm opacity-40" />
    </div>
  );
};

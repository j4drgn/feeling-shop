import duckImage from "@/assets/duck-character.png";
import { cn } from "@/lib/utils";

export const DuckCharacter = ({
  src = duckImage,
  size = "lg",
  onClick,
  className,
  circleColor,
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32 md:w-40 md:h-40",
    xl: "w-48 h-48 md:w-56 md:h-56",
  };

  return (
    <div
      className={cn(
        "duck-container rounded-full p-3 cursor-pointer interactive-scale",
        sizeClasses[size],
        onClick && "hover:shadow-glow",
        className
      )}
      onClick={onClick}
      style={{
        background: circleColor
          ? `linear-gradient(135deg, ${circleColor}, ${circleColor})`
          : "var(--gradient-duck)",
      }}
    >
      <div className="w-full h-full rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-inner border border-white/60">
        <img
          src={src}
          alt="Friendly duck assistant"
          className="w-4/5 h-4/5 object-contain"
        />
      </div>
    </div>
  );
};

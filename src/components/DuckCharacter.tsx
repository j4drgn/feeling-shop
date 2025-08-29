import duckImage from "@/assets/duck-character.png";
import { cn } from "@/lib/utils";

interface DuckCharacterProps {
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  className?: string;
  circleColor?: string; // 오리 캐릭터 원형 배경 색상
}

export const DuckCharacter = ({
  size = "lg",
  onClick,
  className,
  circleColor,
}: DuckCharacterProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32 md:w-40 md:h-40",
    xl: "w-56 h-56 md:w-64 md:h-64", // 크기 증가
    xxl: "w-64 h-64 md:w-72 md:h-72", // 새로운 더 큰 크기 추가
  };

  return (
    <div
      className={cn(
        "duck-container rounded-full p-3 cursor-pointer interactive-scale pulsating-glow",
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
          src={duckImage}
          alt="Friendly duck assistant"
          className="w-4/5 h-4/5 object-contain"
        />
      </div>
    </div>
  );
};

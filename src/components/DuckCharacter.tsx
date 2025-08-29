import duckImage from '@/assets/duck-character.png';
import { cn } from '@/lib/utils';

interface DuckCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const DuckCharacter = ({ size = 'lg', onClick, className }: DuckCharacterProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32 md:w-40 md:h-40'
  };

  return (
    <div 
      className={cn(
        "duck-container rounded-full bg-gradient-primary p-2 cursor-pointer interactive-scale",
        sizeClasses[size],
        onClick && "hover:shadow-glow",
        className
      )}
      onClick={onClick}
    >
      <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
        <img 
          src={duckImage} 
          alt="Friendly duck assistant" 
          className="w-3/4 h-3/4 object-contain"
        />
      </div>
    </div>
  );
};
import React from 'react';
import { cn } from "@/lib/utils";

/**
 * 낮은 결합도를 가진 퀵 액세스 버튼 컴포넌트
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - 버튼에 표시할 아이콘
 * @param {string} props.label - 버튼에 표시할 텍스트 (선택 사항)
 * @param {Function} props.onClick - 클릭 이벤트 핸들러
 * @param {string} props.position - 버튼 위치 ('bottom-right', 'bottom-left', 'top-right', 'top-left')
 * @param {string} props.className - 추가 스타일 클래스
 * @param {string} props.size - 버튼 크기 ('sm', 'md', 'lg')
 * @param {string} props.variant - 버튼 스타일 ('primary', 'secondary', 'ghost')
 * @param {boolean} props.showLabel - 라벨 표시 여부
 * @param {string} props.labelPosition - 라벨 위치 ('top', 'bottom', 'left', 'right')
 */
const QuickAccessButton = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  className,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  labelPosition = 'bottom',
  ...props
}) => {
  // 위치에 따른 클래스 매핑
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  // 크기에 따른 클래스 매핑
  const sizeClasses = {
    'sm': 'w-10 h-10',
    'md': 'w-12 h-12',
    'lg': 'w-14 h-14',
  };

  // 스타일 변형에 따른 클래스 매핑
  const variantClasses = {
    'primary': 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg',
    'secondary': 'bg-white/90 text-foreground border border-gray-200 hover:bg-white shadow-md',
    'ghost': 'bg-white/50 backdrop-blur-sm text-foreground border border-white/40 hover:bg-white/70 shadow-sm',
  };

  // 라벨 위치에 따른 클래스 매핑
  const labelClasses = {
    'top': '-top-8 left-1/2 -translate-x-1/2',
    'bottom': '-bottom-8 left-1/2 -translate-x-1/2',
    'left': 'left-auto -left-20 top-1/2 -translate-y-1/2',
    'right': 'right-auto -right-20 top-1/2 -translate-y-1/2',
  };

  return (
    <div className={cn(
      "fixed z-50",
      positionClasses[position],
      className
    )}>
      <button
        onClick={onClick}
        className={cn(
          "flex items-center justify-center rounded-full transition-all duration-200",
          "active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50",
          sizeClasses[size],
          variantClasses[variant],
        )}
        aria-label={label}
        {...props}
      >
        {icon}
      </button>
      
      {showLabel && label && (
        <div className={cn(
          "absolute whitespace-nowrap px-2 py-1 text-xs bg-black/70 text-white rounded-md",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          labelClasses[labelPosition]
        )}>
          {label}
        </div>
      )}
    </div>
  );
};

export default QuickAccessButton;

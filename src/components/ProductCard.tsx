import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  aiRecommendation?: string;
}

interface ProductCardProps {
  product: Product;
  onSwipe: (direction: "left" | "right", productId: string) => void;
}

export const ProductCard = ({ product, onSwipe }: ProductCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 동작 방지
    setIsDragging(true);
    const startX = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault(); // 기본 동작 방지
      if (isDragging) {
        const deltaX = e.clientX - startX;
        setDragX(deltaX);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault(); // 기본 동작 방지
      setIsDragging(false);

      if (Math.abs(dragX) > 100) {
        const direction = dragX > 0 ? "right" : "left";
        setIsAnimating(true);
        onSwipe(direction, product.id);
      } else {
        setDragX(0);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // 이벤트 전파 방지
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    let isSwiping = false;
    let isScrolling = false;

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling) return; // 스크롤 중이면 스와이프 처리 안함
      
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      
      // 수직 스크롤인지 수평 스와이프인지 판단
      if (!isSwiping && !isScrolling) {
        if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
          isSwiping = true;
          e.preventDefault(); // 스와이프로 판단되면 기본 동작 방지
        } else if (Math.abs(deltaY) > Math.abs(deltaX) + 10) {
          isScrolling = true;
          return; // 스크롤로 판단되면 여기서 종료
        }
      }
      
      if (isSwiping) {
        e.preventDefault(); // 스와이프 중일 때만 기본 동작 방지
        e.stopPropagation();
        setDragX(deltaX);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.stopPropagation(); // 이벤트 전파 방지
      
      if (isSwiping && Math.abs(dragX) > 80) { // 임계값을 80으로 낮춤
        const direction = dragX > 0 ? "right" : "left";
        setIsAnimating(true);
        onSwipe(direction, product.id);
      } else {
        // 스와이프가 충분하지 않으면 원래 위치로 부드럽게 돌아감
        setDragX(0);
      }

      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className={cn(
        "product-card w-[350px] h-[520px] rounded-3xl p-6 cursor-grab active:cursor-grabbing select-none relative overflow-hidden glassmorphism-card",
        isAnimating && dragX > 80 && "product-card-swipe-right",
        isAnimating && dragX < -80 && "product-card-swipe-left",
        isDragging && "shadow-2xl"
      )}
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX * 0.1}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Category Badge */}
      <Badge className="absolute top-4 left-4 bg-primary/10 text-primary hover:bg-primary/20">
        {product.category}
      </Badge>

      {/* Product Image */}
      <div className="w-full h-64 rounded-2xl overflow-hidden mb-5 bg-muted/30">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-xl text-card-foreground">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-primary">{product.price}</p>

        {/* AI 추천 이유 */}
        {product.aiRecommendation && (
          <div className="mt-3 p-3 rounded-lg glassmorphism">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                <img
                  src="/duck-character.png"
                  alt="AI Duck"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-primary">
                Ducky's Recommendation
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {product.aiRecommendation}
            </p>
          </div>
        )}
      </div>

      {/* Swipe Indicators */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-6xl font-bold transition-opacity",
          dragX > 50 ? "opacity-100 text-green-500" : "opacity-0"
        )}
      >
        ❤️
      </div>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-6xl font-bold transition-opacity",
          dragX < -50 ? "opacity-100 text-red-500" : "opacity-0"
        )}
      >
        ❌
      </div>
    </div>
  );
};

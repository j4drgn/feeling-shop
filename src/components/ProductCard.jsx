import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ProductCard = ({ product, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 터치 이벤트 관련 상태 추가
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchModeRef = useRef("none"); // "none", "swipe", "scroll"
  const cardRef = useRef(null);

  // 터치 이벤트를 passive: false로 등록
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchMovePassive = (e) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartRef.current.x;
      const deltaY = touchY - touchStartRef.current.y;

      // 처음 움직임이 감지되면 스와이프인지 스크롤인지 결정
      if (touchModeRef.current === "none") {
        if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
          touchModeRef.current = "swipe";
          e.preventDefault(); // 스와이프로 판단되면 기본 동작 방지
        } else if (Math.abs(deltaY) > Math.abs(deltaX) + 10) {
          touchModeRef.current = "scroll";
          return; // 스크롤로 판단되면 여기서 종료
        }
      }

      if (touchModeRef.current === "swipe") {
        e.preventDefault();
        setDragX(deltaX);
      }
    };

    card.addEventListener('touchmove', handleTouchMovePassive, { passive: false });

    return () => {
      card.removeEventListener('touchmove', handleTouchMovePassive);
    };
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault(); // 기본 동작 방지
    setIsDragging(true);
    const startX = e.clientX;

    const handleMouseMove = (e) => {
      e.preventDefault(); // 기본 동작 방지
      if (isDragging) {
        const deltaX = e.clientX - startX;
        setDragX(deltaX);
      }
    };

    const handleMouseUp = (e) => {
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

  // 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchModeRef.current = "none";
    setDragX(0);
  };


  const handleTouchEnd = (e) => {
    if (touchModeRef.current === "swipe" && Math.abs(dragX) > 80) {
      const direction = dragX > 0 ? "right" : "left";
      setIsAnimating(true);
      onSwipe(direction, product.id);
    } else {
      setDragX(0);
    }

    touchModeRef.current = "none";
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "product-card w-[350px] h-[520px] rounded-3xl p-6 cursor-grab active:cursor-grabbing select-none relative overflow-hidden glassmorphism-card",
        isAnimating && dragX > 80 && "product-card-swipe-right",
        isAnimating && dragX < -80 && "product-card-swipe-left",
        isDragging && "shadow-2xl"
      )}
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX * 0.1}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

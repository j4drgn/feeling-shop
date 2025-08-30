import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, ExternalLink } from "lucide-react";

export const ProductCard = ({ product, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 터치 이벤트 관련 상태 추가
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchModeRef = useRef("none"); // "none", "swipe", "scroll", "vertical"
  const cardRef = useRef(null);
  const [showLikeButton, setShowLikeButton] = useState(false);
  const [showLinkButton, setShowLinkButton] = useState(false);

  // 마우스 이벤트 핸들러 - 수직 스크롤 방식으로 변경
  const handleMouseDown = (e) => {
    // 버튼 클릭 시 이벤트 전파 방지
    if (e.target.closest('.action-button')) {
      return;
    }
    
    e.preventDefault(); // 기본 동작 방지
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e) => {
      e.preventDefault(); // 기본 동작 방지
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // 수평 이동이 더 크면 좌우 스와이프 처리
        if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
          setDragX(deltaX);
          setDragY(0);
          
          // 좌우 스와이프에 따라 버튼 표시
          setShowLikeButton(deltaX > 50);
          setShowLinkButton(deltaX < -50);
        } 
        // 수직 이동이 더 크면 위아래 스크롤 처리
        else if (Math.abs(deltaY) > Math.abs(deltaX) + 10) {
          setDragY(deltaY);
          setDragX(0);
        }
      }
    };

    const handleMouseUp = (e) => {
      e.preventDefault(); // 기본 동작 방지
      setIsDragging(false);

      // 좌우 스와이프 처리
      if (Math.abs(dragX) > 100) {
        const direction = dragX > 0 ? "right" : "left";
        setIsAnimating(true);
        onSwipe(direction, product.id);
      } 
      // 위아래 스와이프 처리
      else if (Math.abs(dragY) > 100) {
        const direction = dragY > 0 ? "down" : "up";
        setIsAnimating(true);
        onSwipe(direction, product.id);
      } else {
        setDragX(0);
        setDragY(0);
      }

      // 버튼 숨기기
      setShowLikeButton(false);
      setShowLinkButton(false);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 터치 이벤트 핸들러 - 수직 스크롤 방식으로 변경
  const handleTouchStart = (e) => {
    // 버튼 클릭 시 이벤트 전파 방지
    if (e.target.closest('.action-button')) {
      return;
    }
    
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchModeRef.current = "none";
    setDragX(0);
    setDragY(0);
  };

  const handleTouchMove = (e) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartRef.current.x;
    const deltaY = touchY - touchStartRef.current.y;

    // 처음 움직임이 감지되면 모드 결정
    if (touchModeRef.current === "none") {
      // 수평 이동이 더 크면 좌우 스와이프 처리
      if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
        touchModeRef.current = "swipe";
        e.preventDefault(); // 스와이프로 판단되면 기본 동작 방지
      } 
      // 수직 이동이 더 크면 위아래 스크롤 처리
      else if (Math.abs(deltaY) > Math.abs(deltaX) + 10) {
        touchModeRef.current = "vertical";
        e.preventDefault(); // 유튜브 숏츠 방식은 기본 스크롤을 막고 직접 처리
      }
    }

    if (touchModeRef.current === "swipe") {
      e.preventDefault();
      setDragX(deltaX);
      
      // 좌우 스와이프에 따라 버튼 표시
      setShowLikeButton(deltaX > 50);
      setShowLinkButton(deltaX < -50);
    } 
    else if (touchModeRef.current === "vertical") {
      e.preventDefault();
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = (e) => {
    // 좌우 스와이프 처리
    if (touchModeRef.current === "swipe" && Math.abs(dragX) > 80) {
      const direction = dragX > 0 ? "right" : "left";
      setIsAnimating(true);
      onSwipe(direction, product.id);
    } 
    // 위아래 스와이프 처리
    else if (touchModeRef.current === "vertical" && Math.abs(dragY) > 80) {
      const direction = dragY > 0 ? "down" : "up";
      setIsAnimating(true);
      onSwipe(direction, product.id);
    } else {
      setDragX(0);
      setDragY(0);
    }

    // 버튼 숨기기
    setShowLikeButton(false);
    setShowLinkButton(false);
    
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
        transform: `
          translateX(${dragX}px) 
          translateY(${dragY}px) 
          rotate(${dragX * 0.05}deg)
        `,
        transition: isDragging ? "none" : "transform 0.3s ease",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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

      {/* 왼쪽 좋아요 버튼 */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSwipe("right", product.id);
        }}
        className={cn(
          "action-button absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all",
          showLikeButton ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
      >
        <Heart className="h-6 w-6 text-pink-500" fill="#ec4899" />
      </button>

      {/* 오른쪽 링크 버튼 */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSwipe("left", product.id);
        }}
        className={cn(
          "action-button absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all",
          showLinkButton ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
      >
        <ExternalLink className="h-6 w-6 text-blue-500" />
      </button>

      {/* Swipe Indicators - 반투명하게 변경 */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-6xl font-bold transition-opacity pointer-events-none",
          dragX > 50 ? "opacity-30 text-pink-500" : "opacity-0"
        )}
      >
        ❤️
      </div>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-6xl font-bold transition-opacity pointer-events-none",
          dragX < -50 ? "opacity-30 text-blue-500" : "opacity-0"
        )}
      >
        🔗
      </div>
    </div>
  );
};

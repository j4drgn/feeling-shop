import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, ExternalLink } from "lucide-react";

export const ProductCard = ({ product, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // 터치 이벤트 관련 상태 추가
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchModeRef = useRef("none"); // "none", "swipe", "scroll", "vertical"
  const cardRef = useRef(null);
  const detailsRef = useRef(null);
  const [showLikeButton, setShowLikeButton] = useState(false);
  const [showLinkButton, setShowLinkButton] = useState(false);

  // 컴포넌트 마운트 시 상세 정보 표시 설정
  useEffect(() => {
    // 초기에는 상세 정보 숨기기
    setShowDetails(false);
  }, [product.id]);

  // 스와이프 후 상세 정보 즉시 표시
  useEffect(() => {
    // 스와이프 시 즉시 상세 정보 표시
    if (isAnimating && (dragX > 80 || dragX < -80)) {
      // 딜레이 없이 즉시 표시
      setShowDetails(true);
    }
  }, [isAnimating, dragX]);

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
    // 버튼 클릭 시 이벤트 전파 방지
    if (e.target.closest(".action-button")) {
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
          setShowLikeButton(deltaX < -50); // 왼쪽 스와이프 - 좋아요
          setShowLinkButton(deltaX > 50); // 오른쪽 스와이프 - 링크
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

        // 즉시 상세 정보 표시
        setShowDetails(true);
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
    if (e.target.closest(".action-button")) {
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



  const handleTouchEnd = (e) => {
    // 좌우 스와이프 처리
    if (touchModeRef.current === "swipe" && Math.abs(dragX) > 80) {
      const direction = dragX > 0 ? "right" : "left";
      setIsAnimating(true);
      onSwipe(direction, product.id);

      // 즉시 상세 정보 표시
      setShowDetails(true);
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

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="relative">
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

        {/* 왼쪽에 표시되는 좋아요 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipe("left", product.id);
          }}
          className={cn(
            "action-button absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all",
            showLikeButton ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        >
          <Heart className="h-6 w-6 text-pink-500" fill="#ec4899" />
        </button>

        {/* 오른쪽에 표시되는 링크 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipe("right", product.id);
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
            dragX < -50 ? "opacity-30 text-pink-500" : "opacity-0"
          )}
        >
          ❤️
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-6xl font-bold transition-opacity pointer-events-none",
            dragX > 50 ? "opacity-30 text-blue-500" : "opacity-0"
          )}
        >
          🔗
        </div>
      </div>

      {/* 제품 상세 정보 - 좌우 스와이프 후 자동 표시 */}
      <div
        ref={detailsRef}
        className={cn(
          "mt-4 p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg",
          "transition-all duration-300 overflow-hidden", // 전환 속도 더 빠르게 수정
          showDetails
            ? "max-h-[500px] opacity-100 animate-slide-up"
            : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <button
            onClick={toggleDetails}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
          >
            {showDetails ? "−" : "+"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500">카테고리</p>
            <p className="text-sm font-medium">{product.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">가격</p>
            <p className="text-sm font-medium text-primary">{product.price}</p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">제품 설명</p>
          <p className="text-sm">{product.aiRecommendation}</p>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSwipe("left", product.id)}
            className="flex-1 py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
          >
            좋아요
          </button>
          <button
            onClick={() =>
              product.productUrl && window.open(product.productUrl, "_blank")
            }
            className="flex-1 py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-sm font-medium transition-colors"
            disabled={!product.productUrl}
          >
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
};

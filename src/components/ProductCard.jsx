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
          "product-card w-[280px] xs:w-[320px] sm:w-[360px] md:w-[400px] lg:w-[450px] xl:w-[500px] h-[420px] xs:h-[480px] sm:h-[520px] md:h-[560px] lg:h-[600px] bg-white rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 cursor-grab active:cursor-grabbing select-none relative overflow-hidden shadow-lg border-2 border-amber-200",
          isAnimating && dragX > 80 && "product-card-swipe-right",
          isAnimating && dragX < -80 && "product-card-swipe-left",
          isDragging && "shadow-2xl scale-105"
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
        <Badge className="absolute top-3 left-3 xs:top-4 xs:left-4 sm:top-5 sm:left-5 bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs sm:text-sm font-semibold border border-amber-300 rounded-full px-3 py-1">
          {product.category}
        </Badge>

        {/* Product Image */}
        <div className="w-full h-40 xs:h-48 sm:h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden mb-4 xs:mb-5 sm:mb-6 bg-amber-50 border-2 border-amber-100 shadow-inner">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2 xs:space-y-3">
          <h3 className="font-bold text-lg xs:text-xl sm:text-2xl md:text-3xl text-amber-900 leading-tight">
            {product.name}
          </h3>
          <p className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-amber-600">{product.price}</p>

          {/* AI 추천 이유 - 말풍선 스타일 */}
          {product.aiRecommendation && (
            <div className="relative mt-3 xs:mt-4">
              <div className="bg-amber-50 rounded-2xl p-3 xs:p-4 border-2 border-amber-200 shadow-md">
                <div className="flex items-start gap-2 xs:gap-3 mb-2">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border-2 border-amber-300 flex-shrink-0">
                    <img
                      src="/duck-character.png"
                      alt="AI Duck"
                      className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm xs:text-base sm:text-lg font-bold text-amber-800">
                        덕키의 추천
                      </span>
                    </div>
                    <p className="text-xs xs:text-sm sm:text-base text-amber-700 leading-relaxed">
                      {product.aiRecommendation}
                    </p>
                  </div>
                </div>
              </div>
              {/* 말풍선 꼴리 */}
              <div className="absolute -bottom-2 left-4 xs:left-6">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M0 0L8 8L16 0H0Z" fill="#FEF3C7" />
                  <path d="M1 0L8 7L15 0" stroke="#F59E0B" strokeWidth="2" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* 왼쪽에 표시되는 좋아요 버튼 - 귀여운 스타일 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipe("left", product.id);
          }}
          className={cn(
            "action-button absolute left-2 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-pink-100 shadow-lg flex items-center justify-center transition-all border-2 border-pink-300 hover:bg-pink-200 hover:scale-110",
            showLikeButton ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        >
          <Heart className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-pink-600" fill="#ec4899" />
        </button>

        {/* 오른쪽에 표시되는 링크 버튼 - 귀여운 스타일 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipe("right", product.id);
          }}
          className={cn(
            "action-button absolute right-2 xs:right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-blue-100 shadow-lg flex items-center justify-center transition-all border-2 border-blue-300 hover:bg-blue-200 hover:scale-110",
            showLinkButton ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        >
          <ExternalLink className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />
        </button>

        {/* Swipe Indicators - 반투명하게 변경 */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-6xl font-bold transition-opacity pointer-events-none",
            dragX < -50 ? "opacity-30 text-pink-500" : "opacity-0"
          )}
        >
          좋아요
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-6xl font-bold transition-opacity pointer-events-none",
            dragX > 50 ? "opacity-30 text-blue-500" : "opacity-0"
          )}
        >
          링크
        </div>
      </div>

      {/* 제품 상세 정보 - 귀여운 카드 스타일 */}
      <div
        ref={detailsRef}
        className={cn(
          "mt-4 p-4 sm:p-5 bg-white rounded-2xl border-2 border-amber-200 shadow-lg",
          "transition-all duration-300 overflow-hidden",
          showDetails
            ? "max-h-[500px] opacity-100 animate-slide-up"
            : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-amber-900">{product.name}</h3>
          <button
            onClick={toggleDetails}
            className="w-8 h-8 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold hover:bg-amber-200 transition-colors border border-amber-300"
          >
            {showDetails ? "−" : "+"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-xs font-semibold text-amber-600 mb-1">카테고리</p>
            <p className="text-sm font-bold text-amber-800">{product.category}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-xs font-semibold text-amber-600 mb-1">가격</p>
            <p className="text-sm font-bold text-amber-800">{product.price}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold text-amber-600 mb-2">제품 설명</p>
          <p className="text-sm text-amber-700 leading-relaxed bg-amber-50 rounded-xl p-3 border border-amber-200">{product.aiRecommendation}</p>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => onSwipe("left", product.id)}
            className="flex-1 py-3 px-4 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-2xl text-sm font-bold transition-all border-2 border-pink-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Heart className="h-4 w-4" fill="currentColor" />
            좋아요
          </button>
          <button
            onClick={() =>
              product.productUrl && window.open(product.productUrl, "_blank")
            }
            className="flex-1 py-3 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-2xl text-sm font-bold transition-all border-2 border-blue-300 hover:scale-105 flex items-center justify-center gap-2"
            disabled={!product.productUrl}
          >
            <ExternalLink className="h-4 w-4" />
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
};

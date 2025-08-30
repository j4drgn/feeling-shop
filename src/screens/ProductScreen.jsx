import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Heart, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

// 쇼츠 스타일 샘플 상품 데이터
const sampleProducts = [
  {
    id: "1",
    brand: "살림남 The Life",
    name: "놀더틈 강력 압축 휴지통 그레이 지름 30 x 높이 43...",
    price: "₩33,500",
    originalPrice: "₩45,000",
    discount: "26%",
    tags: ["쿠팡!"],
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=800&fit=crop",
    description: "한 번 더 압축 사용하면 놀더틈 강력 압축 휴지통 그레이 지름 30 x 높이 43cm",
    creator: "살림남",
    creatorAvatar: "👨‍🍳",
    hashtags: ["#쿠팡추천", "#휴지통", "#압축휴지통"]
  },
  {
    id: "2", 
    brand: "살림남 The Life",
    name: "놀더틈 압축 휴지통 20L 크림베이지 지름 30 x 높이...",
    price: "₩33,500",
    originalPrice: "₩42,000", 
    discount: "20%",
    tags: ["쿠팡!"],
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=800&fit=crop",
    description: "깔끔한 크림베이지 색상의 압축 휴지통으로 공간 활용도 극대화",
    creator: "살림남",
    creatorAvatar: "👨‍🍳",
    hashtags: ["#압축휴지통", "#크림베이지", "#20L"]
  },
  {
    id: "3",
    brand: "프로메이드",
    name: "프로메이드 폭쉬빈 중량제 봉투 압축휴지통 크림화이트...",
    price: "₩20,680",
    originalPrice: "₩28,000",
    discount: "26%", 
    tags: ["쿠팡!"],
    image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&h=800&fit=crop",
    description: "중량제 봉투 압축휴지통으로 더욱 효율적인 쓰레기 처리",
    creator: "살림남",
    creatorAvatar: "👨‍🍳",
    hashtags: ["#프로메이드", "#중량제봉투", "#압축휴지통"]
  },
  {
    id: "4",
    brand: "프로메이드", 
    name: "프로메이드 폭쉬빈 중량제 봉투 압축휴지통 라이트그레...",
    price: "₩20,680",
    originalPrice: "₩27,500",
    discount: "25%",
    tags: ["쿠팡!"],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=800&fit=crop", 
    description: "라이트그레이 색상으로 어떤 인테리어에도 잘 어울리는 압축휴지통",
    creator: "살림남",
    creatorAvatar: "👨‍🍳",
    hashtags: ["#라이트그레이", "#압축휴지통", "#인테리어"]
  },
  {
    id: "5",
    brand: "도그독",
    name: "도그독 퍼스트 프리미엄 듀얼 폴딩카트 캠핑웨건 샌드...",
    price: "₩165,570", 
    originalPrice: "₩220,000",
    discount: "25%",
    tags: ["쿠팡!"],
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=800&fit=crop",
    description: "캠핑과 이사에 완벽한 듀얼 폴딩카트 웨건",
    creator: "살림남", 
    creatorAvatar: "👨‍🍳",
    hashtags: ["#캠핑웨건", "#폴딩카트", "#듀얼"]
  }
];

export const ProductScreen = ({ onNavigateToMain, onProductLiked }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const currentProduct = sampleProducts[currentIndex];

  // 터치 스와이프 핸들러
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      handleNext();
    }
    if (isDownSwipe) {
      handlePrev();
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleProducts.length);
    setIsLiked(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sampleProducts.length) % sampleProducts.length);
    setIsLiked(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setLikedProducts(prev => [...prev, currentProduct]);
      onProductLiked?.(currentProduct);
    } else {
      setLikedProducts(prev => prev.filter(p => p.id !== currentProduct.id));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentProduct.name,
        text: currentProduct.description,
        url: window.location.href
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 상품 컨테이너 */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 배경 이미지 */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentProduct.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
        </div>

        {/* 상단 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-12 px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateToMain}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-white text-sm font-medium">제품</div>
            <div className="w-10 h-10"></div>
          </div>
        </div>

        {/* 우측 액션 버튼들 */}
        <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center space-y-6">
          {/* 크리에이터 아바타 */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl border-2 border-white">
              {currentProduct.creatorAvatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>

          {/* 좋아요 버튼 */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Heart 
                className={cn(
                  "w-7 h-7",
                  isLiked ? "text-red-500 fill-current" : "text-white"
                )}
              />
            </div>
            <span className="text-white text-xs font-medium">{isLiked ? likedProducts.length + 1 : likedProducts.length}</span>
          </button>

          {/* 자세히 보기 버튼 */}
          <button
            onClick={() => window.open('#', '_blank')}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">자세히 보기</span>
          </button>

          {/* 제품 보기 버튼 */}
          <button className="flex flex-col items-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-white"></div>
            </div>
            <span className="text-white text-xs font-medium">제품 보기</span>
          </button>
        </div>

        {/* 하단 상품 정보 */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8">
          <div className="space-y-3">
            {/* 크리에이터 정보 */}
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">@{currentProduct.creator}</span>
              <span className="text-gray-300 text-sm">구독</span>
            </div>

            {/* 상품 설명 */}
            <p className="text-white text-sm leading-relaxed">
              {currentProduct.description}
            </p>

            {/* 해시태그 */}
            <div className="flex flex-wrap gap-2">
              {currentProduct.hashtags.map((tag, index) => (
                <span key={index} className="text-blue-300 text-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* 상품 정보 카드 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {currentProduct.tags[0]}
                    </span>
                    {currentProduct.discount && (
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                        {currentProduct.discount} 할인
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {currentProduct.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {currentProduct.price}
                    </span>
                    {currentProduct.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {currentProduct.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 수직 스크롤 인디케이터 */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
          <div className="flex flex-col items-center space-y-2">
            <button onClick={handlePrev}>
              <ChevronUp className="w-6 h-6 text-white/60" />
            </button>
            
            {/* 진행 인디케이터 */}
            <div className="flex flex-col space-y-1">
              {sampleProducts.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1 h-6 rounded-full transition-all duration-300",
                    index === currentIndex ? "bg-white" : "bg-white/30"
                  )}
                />
              ))}
            </div>
            
            <button onClick={handleNext}>
              <ChevronDown className="w-6 h-6 text-white/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
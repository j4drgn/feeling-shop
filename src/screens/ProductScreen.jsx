import { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { DuckCharacter } from "@/components/DuckCharacter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

// 샘플 상품 데이터 확장
const sampleProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: "$199.99",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    aiRecommendation:
      "당신의 음악 취향과 높은 음질 선호도를 고려했을 때 이 헤드폰이 완벽한 선택입니다. 노이즈 캔슬링 기능과 30시간 배터리 수명이 특징입니다.",
  },
  {
    id: "2",
    name: "Classic Leather Watch",
    price: "$129.99",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&h=500&fit=crop",
    aiRecommendation:
      "클래식한 디자인을 선호하는 당신의 스타일에 맞춰 추천합니다. 어떤 옷에도 잘 어울리며 방수 기능도 갖추고 있습니다.",
  },
  {
    id: "3",
    name: "Rose Gold Smartphone",
    price: "$899.99",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=500&fit=crop",
    aiRecommendation:
      "사진 촬영과 소셜 미디어 활동을 즐기는 당신에게 최적화된 카메라와 성능을 갖춘 스마트폰입니다. 배터리 수명도 우수합니다.",
  },
  {
    id: "4",
    name: "Smart Fitness Tracker",
    price: "$89.99",
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&h=500&fit=crop",
    aiRecommendation:
      "당신의 건강 관리와 운동 습관을 고려해 추천드립니다. 심박수, 수면 패턴 분석과 다양한 운동 모드를 지원합니다.",
    productUrl: "https://example.com/fitness-tracker"
  },
  {
    id: "5",
    name: "Portable Bluetooth Speaker",
    price: "$129.99",
    category: "Audio",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    aiRecommendation:
      "아웃도어 활동을 즐기는 당신에게 완벽한 방수 블루투스 스피커입니다. 강력한 베이스와 15시간 배터리 수명이 특징입니다.",
    productUrl: "https://example.com/bluetooth-speaker"
  },
  {
    id: "6",
    name: "Minimalist Desk Lamp",
    price: "$59.99",
    category: "Home",
    image: "https://images.unsplash.com/photo-1534189020686-40213a72113c?w=500&h=500&fit=crop",
    aiRecommendation:
      "당신의 인테리어 스타일과 작업 공간에 어울리는 모던한 디자인의 램프입니다. 조절 가능한 밝기와 색온도를 제공합니다.",
    productUrl: "https://example.com/desk-lamp"
  }
];

export const ProductScreen = ({
  onNavigateToMain,
  onProductLiked,
}) => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [products, setProducts] = useState(sampleProducts);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);
  const containerRef = useRef(null);
  const { } = useThemeContext();

  const currentProduct = products[currentProductIndex];

  const handleSwipe = (direction, productId) => {
    setIsAnimating(true);

    if (direction === "left") {
      // 좋아요 기능 - 히스토리에 저장 (왼쪽 스와이프)
      if (!likedProducts.some(p => p.id === currentProduct.id)) {
        setLikedProducts(prev => [...prev, currentProduct]);
        onProductLiked(currentProduct);
      }
      // 애니메이션 유지 시간 단축
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    } else if (direction === "right") {
      // 링크로 이동 기능 (오른쪽 스와이프)
      if (currentProduct.productUrl) {
        window.open(currentProduct.productUrl, '_blank');
      }
      // 애니메이션 유지 시간 단축
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    } else if (direction === "up") {
      // 이전 상품으로 이동
      setTimeout(() => {
        setCurrentProductIndex((prev) =>
          prev > 0 ? prev - 1 : products.length - 1
        );
        setIsAnimating(false);
      }, 300);
      return;
    } else if (direction === "down") {
      // 다음 상품으로 이동
      setTimeout(() => {
        setCurrentProductIndex((prev) =>
          prev < products.length - 1 ? prev + 1 : 0
        );
        setIsAnimating(false);
      }, 300);
      return;
    }
  };
  
  // 스크롤 버튼 핸들러
  const handleScroll = (direction) => {
    setIsScrolling(true);
    
    if (direction === "up") {
      setCurrentProductIndex((prev) =>
        prev > 0 ? prev - 1 : products.length - 1
      );
    } else {
      setCurrentProductIndex((prev) =>
        prev < products.length - 1 ? prev + 1 : 0
      );
    }
    
    setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  };

  return (
    <div className="min-h-[100dvh]" style={{backgroundColor: 'rgb(255,228,161)'}}>
      <main className="relative flex flex-col min-h-[100dvh]">

        {/* Clean AppBar with pastel background */}
        <header className="sticky top-0 z-10 backdrop-blur mb-4 sm:mb-6" style={{backgroundColor: 'rgba(255,228,161,0.9)'}}>
          <div className="mx-auto max-w-[90%] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[800px] xl:max-w-[900px] px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onNavigateToMain}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-amber-800">🎆 추천 상품</h1>
              <div className="w-10 h-10 sm:w-12 sm:h-12"></div>
            </div>
          </div>
        </header>

        {/* Welcome Message in Speech Bubble Style */}
        <section className="mx-auto max-w-[90%] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[800px] xl:max-w-[900px] px-4 sm:px-6 py-4 sm:py-6">
          <div className="relative">
            <div className="bg-white rounded-2xl px-5 py-4 shadow-lg border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border-2 border-amber-300">
                  <img
                    src="/duck-character.png"
                    alt="AI Duck"
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-amber-800">덕키의 추천 상품이야! 🎆</h2>
                  <p className="text-sm text-amber-600">스와이프해서 마음에 드는 걸 골라봐!</p>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-xs sm:text-sm text-amber-700 text-center">
                  💖 좌쪽 스와이프: 좋아요   🔗 오른쪽 스와이프: 링크 열기
                </p>
              </div>
            </div>
            {/* Speech Bubble Tail */}
            <div className="flex justify-center">
              <div className="w-6 h-6 mt-[-1px] relative z-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M0 0L12 12L24 0H0Z" fill="white" />
                  <path d="1 0L12 11L23 0" stroke="#FDE68A" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Product card area - centered content */}
        <section className="flex-1 mx-auto w-full max-w-[90%] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[800px] xl:max-w-[900px] px-3 sm:px-4 md:px-6 py-2 flex flex-col items-center justify-center">
          <div ref={containerRef} className="relative w-full flex justify-center">
            {currentProduct ? (
              <ProductCard
                key={currentProduct.id}
                product={currentProduct}
                onSwipe={handleSwipe}
              />
            ) : (
              <div className="w-[280px] xs:w-[320px] sm:w-[360px] md:w-[400px] lg:w-[450px] xl:w-[500px] h-[420px] xs:h-[480px] sm:h-[520px] md:h-[560px] lg:h-[600px] bg-white rounded-2xl shadow-lg border-2 border-amber-200 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 border-2 border-amber-300">
                    <span className="text-2xl sm:text-3xl">😭</span>
                  </div>
                  <p className="text-amber-800 text-sm md:text-base font-semibold mb-2">상품이 없어요!</p>
                  <p className="text-amber-600 text-xs md:text-sm">다른 카테고리를 살펴보세요</p>
                </div>
              </div>
            )}

            {/* 스크롤 버튼 - 귀여운 스타일 */}
            <div className="absolute right-[-50px] sm:right-[-60px] md:right-[-80px] lg:right-[-100px] top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-20">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleScroll("up")}  
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-amber-200"
                disabled={isScrolling}
              >
                <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-amber-700" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleScroll("down")}  
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-amber-200"
                disabled={isScrolling}
              >
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-amber-700" />
              </Button>
            </div>

            {/* 상품 인디케이터 - 귀여운 스타일 */}
            <div className="absolute right-[-50px] sm:right-[-60px] md:right-[-80px] lg:right-[-100px] top-1/2 transform translate-y-20 sm:translate-y-24 md:translate-y-28 flex flex-col items-center gap-2">
              {products.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "rounded-full transition-all duration-300 border-2",
                    idx === currentProductIndex 
                      ? "w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 border-amber-600 shadow-md" 
                      : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white border-amber-300"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 좋아요 상품 표시 - 귀여운 스타일 */}
        {likedProducts.length > 0 && (
          <footer className="sticky bottom-0 z-10 backdrop-blur-sm" style={{backgroundColor: 'rgba(255,228,161,0.9)'}}>
            <div className="mx-auto max-w-[90%] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[800px] xl:max-w-[900px] px-4 sm:px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
              <div className="bg-white rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg border-2 border-amber-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">💖</span>
                  <p className="text-sm sm:text-base font-semibold text-amber-800">
                    {likedProducts.length}개의 상품을 좋아합니다!
                  </p>
                </div>
              </div>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

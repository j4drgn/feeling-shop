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
  const { colors } = useThemeContext();

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background with gradient overlay for glassmorphism effect */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: colors.background,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
      />

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNavigateToMain}
        className="absolute top-4 left-4 z-10 rounded-full glassmorphism-button"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header */}
      <div className="text-center mb-8 relative z-10 p-3 rounded-lg glassmorphism">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Scroll to Discover
        </h1>
        <p className="text-muted-foreground">
          스와이프 좌: 좋아요 / 우: 링크 열기
        </p>
      </div>

      {/* Product card area - 유튜브 숏츠 방식으로 변경 */}
      <div ref={containerRef} className="relative mb-8">
        {currentProduct ? (
          <ProductCard
            key={currentProduct.id}
            product={currentProduct}
            onSwipe={handleSwipe}
          />
        ) : (
          <div className="w-[350px] h-[520px] rounded-3xl bg-white/90 backdrop-blur-sm shadow-lg border border-white/40 flex items-center justify-center">
            <p className="text-muted-foreground">No more products</p>
          </div>
        )}

        {/* 스크롤 버튼 */}
        <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleScroll("up")}  
            className="w-10 h-10 rounded-full bg-white/80 shadow-md hover:bg-white"
            disabled={isScrolling}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleScroll("down")}  
            className="w-10 h-10 rounded-full bg-white/80 shadow-md hover:bg-white"
            disabled={isScrolling}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* 상품 인디케이터 */}
        <div className="absolute right-[-50px] top-1/2 transform translate-y-20 flex flex-col items-center gap-1">
          {products.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentProductIndex 
                  ? "bg-primary w-3 h-3" 
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* 좋아요 상품 표시 */}
      {likedProducts.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {likedProducts.length}개의 상품을 좋아합니다
          </p>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { DuckCharacter } from "@/components/DuckCharacter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";

// Import product images
import headphonesImg from "@/assets/product-headphones.jpg";
import watchImg from "@/assets/product-watch.jpg";
import phoneImg from "@/assets/product-phone.jpg";

const sampleProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: "$199.99",
    category: "Electronics",
    image: headphonesImg,
    aiRecommendation:
      "당신의 음악 취향과 높은 음질 선호도를 고려했을 때 이 헤드폰이 완벽한 선택입니다. 노이즈 캔슬링 기능과 30시간 배터리 수명이 특징입니다.",
  },
  {
    id: "2",
    name: "Classic Leather Watch",
    price: "$129.99",
    category: "Accessories",
    image: watchImg,
    aiRecommendation:
      "클래식한 디자인을 선호하는 당신의 스타일에 맞춰 추천합니다. 어떤 옷에도 잘 어울리며 방수 기능도 갖추고 있습니다.",
  },
  {
    id: "3",
    name: "Rose Gold Smartphone",
    price: "$899.99",
    category: "Electronics",
    image: phoneImg,
    aiRecommendation:
      "사진 촬영과 소셜 미디어 활동을 즐기는 당신에게 최적화된 카메라와 성능을 갖춘 스마트폰입니다. 배터리 수명도 우수합니다.",
  },
];

export const ProductScreen = ({
  onNavigateToMain,
  onProductLiked,
}) => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [products, setProducts] = useState(sampleProducts);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState("");
  const { colors } = useThemeContext();

  const currentProduct = products[currentProductIndex];

  const handleSwipe = (direction, productId) => {
    setIsAnimating(true);

    if (direction === "right") {
      onProductLiked(currentProduct);
    }

    // Move to next product after animation
    setTimeout(() => {
      setCurrentProductIndex((prev) =>
        prev < products.length - 1 ? prev + 1 : 0
      );
      setIsAnimating(false);
    }, 300);
  };

  const handleFeedback = () => {
    if (feedbackInput.trim()) {
      // Process feedback (could trigger new recommendations)
      setFeedbackInput("");
    }
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
          Swipe to Discover
        </h1>
        <p className="text-muted-foreground">
          Swipe right to like, left to skip
        </p>
      </div>

      {/* Product card area */}
      <div className="relative mb-8">
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

        {/* Next product preview (slightly behind) */}
        {products[currentProductIndex + 1] && (
          <div className="absolute inset-0 -z-10 transform scale-95 opacity-50">
            <ProductCard
              product={products[currentProductIndex + 1]}
              onSwipe={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

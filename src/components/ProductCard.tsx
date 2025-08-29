import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onSwipe: (direction: 'left' | 'right', productId: string) => void;
}

export const ProductCard = ({ product, onSwipe }: ProductCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        setDragX(deltaX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      if (Math.abs(dragX) > 100) {
        const direction = dragX > 0 ? 'right' : 'left';
        setIsAnimating(true);
        onSwipe(direction, product.id);
      } else {
        setDragX(0);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    
    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX;
      setDragX(deltaX);
    };

    const handleTouchEnd = () => {
      if (Math.abs(dragX) > 100) {
        const direction = dragX > 0 ? 'right' : 'left';
        setIsAnimating(true);
        onSwipe(direction, product.id);
      } else {
        setDragX(0);
      }
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div
      className={cn(
        "product-card w-80 h-96 rounded-3xl p-6 cursor-grab active:cursor-grabbing select-none relative overflow-hidden",
        isAnimating && dragX > 100 && "product-card-swipe-right",
        isAnimating && dragX < -100 && "product-card-swipe-left"
      )}
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX * 0.1}deg)`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Category Badge */}
      <Badge className="absolute top-4 left-4 bg-primary/10 text-primary hover:bg-primary/20">
        {product.category}
      </Badge>

      {/* Product Image */}
      <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-muted/30">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-xl text-card-foreground">{product.name}</h3>
        <p className="text-2xl font-bold text-primary">{product.price}</p>
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
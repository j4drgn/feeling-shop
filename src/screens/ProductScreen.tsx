import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { DuckCharacter } from '@/components/DuckCharacter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Import product images
import headphonesImg from '@/assets/product-headphones.jpg';
import watchImg from '@/assets/product-watch.jpg';
import phoneImg from '@/assets/product-phone.jpg';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
}

interface ProductScreenProps {
  onNavigateToMain: () => void;
  onProductLiked: (product: Product) => void;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: '$199.99',
    category: 'Electronics',
    image: headphonesImg
  },
  {
    id: '2',
    name: 'Classic Leather Watch',
    price: '$129.99',
    category: 'Accessories',
    image: watchImg
  },
  {
    id: '3',
    name: 'Rose Gold Smartphone',
    price: '$899.99',
    category: 'Electronics',
    image: phoneImg
  }
];

export const ProductScreen = ({ onNavigateToMain, onProductLiked }: ProductScreenProps) => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [products, setProducts] = useState(sampleProducts);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');

  const currentProduct = products[currentProductIndex];

  const handleSwipe = (direction: 'left' | 'right', productId: string) => {
    setIsAnimating(true);
    
    if (direction === 'right') {
      onProductLiked(currentProduct);
    }

    // Move to next product after animation
    setTimeout(() => {
      setCurrentProductIndex(prev => 
        prev < products.length - 1 ? prev + 1 : 0
      );
      setIsAnimating(false);
    }, 300);
  };

  const handleFeedback = () => {
    if (feedbackInput.trim()) {
      // Process feedback (could trigger new recommendations)
      setFeedbackInput('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
      
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNavigateToMain}
        className="absolute top-4 left-4 z-10 rounded-full hover:bg-primary/10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
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
          <div className="w-80 h-96 rounded-3xl bg-muted/50 flex items-center justify-center">
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

      {/* Bottom feedback area */}
      <div className="flex items-center gap-3 w-full max-w-sm relative z-10">
        <DuckCharacter size="sm" />
        <div className="flex-1 flex gap-2">
          <Input
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="Tell me what you're looking for..."
            className="rounded-full text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleFeedback()}
          />
        </div>
      </div>
    </div>
  );
};
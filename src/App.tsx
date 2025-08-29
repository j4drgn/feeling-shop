import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainScreen } from "@/screens/MainScreen";
import { ProductScreen } from "@/screens/ProductScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { useAppNavigation } from "@/hooks/useAppNavigation";

const queryClient = new QueryClient();

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
}

const App = () => {
  const {
    currentScreen,
    isChatActive,
    chatHistory,
    navigateToProducts,
    navigateToHistory,
    navigateToMain,
    startChat,
    addMessage,
    endChat
  } = useAppNavigation();

  const [likedProducts, setLikedProducts] = useState<Product[]>([]);

  const handleSendMessage = (message: string) => {
    addMessage('user', message);
    
    // Simulate assistant response after user message
    setTimeout(() => {
      const responses = [
        "Great choice! Let me find some perfect options for you.",
        "I understand exactly what you're looking for! Give me a moment.",
        "Perfect! I have some amazing recommendations coming up.",
        "Excellent taste! Let me show you what I found."
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage('assistant', response);
      
      // End chat after assistant response
      setTimeout(() => {
        endChat();
      }, 2000);
    }, 1500);
  };

  const handleProductLiked = (product: Product) => {
    setLikedProducts(prev => [...prev, product]);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'main':
        return (
          <MainScreen
            isChatActive={isChatActive}
            chatMessages={chatHistory}
            onStartChat={startChat}
            onSendMessage={(message) => {
              handleSendMessage(message);
            }}
            onEndChat={endChat}
            onNavigateToHistory={navigateToHistory}
          />
        );
      case 'products':
        return (
          <ProductScreen
            onNavigateToMain={navigateToMain}
            onProductLiked={handleProductLiked}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onNavigateToMain={navigateToMain}
            likedProducts={likedProducts}
            chatHistory={chatHistory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen">
          {renderCurrentScreen()}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

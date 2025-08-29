import { ArrowLeft, Heart, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
}

interface HistoryScreenProps {
  onNavigateToMain: () => void;
  likedProducts: Product[];
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string; id: string }>;
}

export const HistoryScreen = ({ onNavigateToMain, likedProducts, chatHistory }: HistoryScreenProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToMain}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Your Activity</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6">
        {/* Liked Products Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-red-500" />
              Liked Products
              <Badge variant="secondary" className="ml-auto">
                {likedProducts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {likedProducts.length > 0 ? (
              <div className="grid gap-3">
                {likedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {product.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm">{product.price}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No liked products yet. Start swiping to add favorites!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Chat History Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chatHistory.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Latest Chat Session</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {chatHistory.slice(-4).map((message, index) => (
                      <div key={message.id} className="text-sm">
                        <span className={`font-medium ${
                          message.role === 'user' ? 'text-primary' : 'text-foreground'
                        }`}>
                          {message.role === 'user' ? 'You: ' : 'Duck: '}
                        </span>
                        <span className="text-muted-foreground">
                          {message.content.length > 80 
                            ? `${message.content.substring(0, 80)}...` 
                            : message.content
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No conversations yet. Tap the duck to start chatting!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Purchases Section (Placeholder) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              Purchase History
              <Badge variant="secondary" className="ml-auto">
                0
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm text-center py-4">
              No purchases yet. Complete your first purchase to see it here!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
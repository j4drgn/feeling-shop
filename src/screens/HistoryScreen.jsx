import { ArrowLeft, Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeContext } from "@/context/ThemeContext";

export const HistoryScreen = ({
  onNavigateToMain,
  likedProducts,
  chatHistory,
}) => {
  const { colors } = useThemeContext();
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: colors.background,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
      />
      {/* Header with glassmorphism effect */}
      <header className="sticky top-0 z-10 w-full mt-4 mb-2 px-4">
        <div className="glassmorphism-card mx-auto rounded-full py-2 px-4 flex items-center shadow-lg border border-white/60 backdrop-blur-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToMain}
            className="rounded-full bg-white/40 hover:bg-white/60 text-foreground shadow-sm border border-white/40 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Your Activity
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6 relative z-10">
        {/* Liked Products Section */}
        <Card className="glassmorphism-card border border-white/60 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-red-500" />
              Liked Products
              <Badge
                variant="secondary"
                className="ml-auto bg-white/50 text-foreground"
              >
                {likedProducts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {likedProducts.length > 0 ? (
              <div className="grid gap-3">
                {likedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/40 shadow-sm"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {product.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm">
                        {product.price}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-sm">
                <p className="text-muted-foreground text-sm text-center">
                  No liked products yet. Start swiping to add favorites!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat History Section */}
        <Card className="glassmorphism-card border border-white/60 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chatHistory.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      Latest Chat Session
                    </span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {chatHistory.slice(-4).map((message, index) => (
                      <div key={message.id} className="text-sm">
                        <span
                          className={`font-medium ${
                            message.role === "user"
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {message.role === "user" ? "You: " : "Duck: "}
                        </span>
                        <span className="text-muted-foreground">
                          {message.content.length > 80
                            ? `${message.content.substring(0, 80)}...`
                            : message.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-sm">
                <p className="text-muted-foreground text-sm text-center">
                  No conversations yet. Tap the duck to start chatting!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchases Section (Placeholder) */}
        <Card className="glassmorphism-card border border-white/60 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              Purchase History
              <Badge
                variant="secondary"
                className="ml-auto bg-white/50 text-foreground"
              >
                0
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-sm">
              <p className="text-muted-foreground text-sm text-center">
                No purchases yet. Complete your first purchase to see it here!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

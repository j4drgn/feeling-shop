import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DuckCharacter } from '@/components/DuckCharacter';
import { ChatInterface } from '@/components/ChatInterface';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface MainScreenProps {
  isChatActive: boolean;
  chatMessages: Message[];
  onStartChat: () => void;
  onSendMessage: (message: string) => void;
  onEndChat: () => void;
  onNavigateToHistory: () => void;
}

export const MainScreen = ({
  isChatActive,
  chatMessages,
  onStartChat,
  onSendMessage,
  onEndChat,
  onNavigateToHistory
}: MainScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-background" />
      
      {/* Header with profile icon */}
      <header className="relative z-10 flex justify-end p-4 absolute top-0 right-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToHistory}
          className="rounded-full hover:bg-accent/20 text-muted-foreground hover:text-accent"
        >
          <User className="h-5 w-5" />
        </Button>
      </header>

      {/* Main content area - PERFECT CENTER LAYOUT */}
      <main className="h-screen flex flex-col items-center justify-center px-6 relative z-10">
        {/* Duck character - perfectly centered */}
        <div className="flex flex-col items-center justify-center">
          <DuckCharacter
            size="lg"
            onClick={!isChatActive ? onStartChat : undefined}
            className={cn(
              "transition-all duration-300 mb-6"
            )}
          />
          
          {!isChatActive && (
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                Meet Your Shopping Duck
              </h1>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                Tap the duck to start a conversation and get personalized product recommendations!
              </p>
            </div>
          )}
        </div>

        {/* Chat interface area - appears below duck when active, keeping duck centered */}
        {isChatActive && (
          <div className="w-full max-w-lg animate-fade-in -mt-4">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={(message) => {
                onSendMessage(message);
              }}
              onEndChat={onEndChat}
              isActive={isChatActive}
            />
          </div>
        )}
      </main>
    </div>
  );
};
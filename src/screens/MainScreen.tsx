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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Header with profile icon */}
      <header className="relative z-10 flex justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToHistory}
          className="rounded-full hover:bg-primary/10"
        >
          <User className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>

      {/* Main content area - STATIC LAYOUT */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Duck character area - always visible */}
        <div className="mb-8">
          <DuckCharacter
            size="lg"
            onClick={!isChatActive ? onStartChat : undefined}
            className={cn(
              "transition-all duration-300",
              isChatActive && "mb-4"
            )}
          />
          
          {!isChatActive && (
            <div className="text-center mt-6 space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Meet Your Shopping Duck
              </h1>
              <p className="text-muted-foreground max-w-sm">
                Tap the duck to start a conversation and get personalized product recommendations!
              </p>
            </div>
          )}
        </div>

        {/* Chat interface area - appears below duck when active */}
        {isChatActive && (
          <div className="w-full max-w-lg animate-fade-in">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={(message) => {
                // Add user message
                onSendMessage(message);
              }}
              onEndChat={onEndChat}
              isActive={isChatActive}
            />
          </div>
        )}
      </main>

      {/* Footer space */}
      <div className="h-16" />
    </div>
  );
};
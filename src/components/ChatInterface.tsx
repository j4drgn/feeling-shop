import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onEndChat: () => void;
  isActive: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, onEndChat, isActive }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isActive) return null;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto mb-4 space-y-3 px-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex chat-bubble-enter",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-4 py-2 rounded-2xl",
                message.role === 'user'
                  ? "chat-bubble-user rounded-br-md"
                  : "chat-bubble-assistant rounded-bl-md"
              )}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 rounded-full border-primary/20 focus:border-primary"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim()}
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
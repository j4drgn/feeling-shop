import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import chatApi from "@/api/chatApi";

const ChatHistoryButton = ({ onSelectSession }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleHistory = async () => {
    if (!isOpen) {
      setIsLoading(true);
      try {
        // 로컬 스토리지에서 토큰 가져오기 (없으면 null)
        const accessToken = localStorage.getItem("accessToken") || null;
        const response = await chatApi.getChatSessions(accessToken);

        if (response && response.data) {
          setSessions(response.data);
        }
      } catch (error) {
        console.error("채팅 세션 목록 가져오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    setIsOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleHistory}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-surface bg-layer-surface/80 hover:bg-layer-surface shadow-surface transition-colors"
        aria-label="대화 기록"
      >
        <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-layer-muted" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-layer-surface rounded-md shadow-lg z-50">
          <div className="flex justify-between items-center p-2 border-b border-layer-border">
            <h3 className="text-sm font-medium">대화 기록</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin h-4 w-4 border-2 border-layer-muted border-t-brand-primary rounded-full"></div>
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <Button
                  key={session.id}
                  variant="ghost"
                  className="w-full justify-start text-left text-xs py-2 px-3 h-auto"
                  onClick={() => handleSelectSession(session.id)}
                >
                  <div>
                    <div className="font-medium truncate w-full">
                      {session.title}
                    </div>
                    <div className="text-layer-muted text-[10px]">
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-layer-muted">
                대화 기록이 없습니다
              </div>
            )}
          </div>

          <div className="p-2 border-t border-layer-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                onSelectSession(null);
                setIsOpen(false);
              }}
            >
              새 대화 시작
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryButton;

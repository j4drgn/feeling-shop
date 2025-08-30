import {
  ArrowLeft,
  Heart,
  MessageCircle,
  ShoppingBag,
  User,
  ChevronRight,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeContext } from "@/context/ThemeContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const HistoryScreen = ({
  likedProducts = [],
  chatHistory = [],
}) => {
  const navigate = useNavigate();
  const { colors } = useThemeContext();
  const [showHistoryDetails, setShowHistoryDetails] = useState(false);
  const [selectedChatSession, setSelectedChatSession] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // 초기에 표시할 상품 개수
  const initialProductCount = 2;

  // 채팅 세션을 날짜별로 그룹화하는 함수
  const groupChatBySession = () => {
    if (!chatHistory || chatHistory.length === 0) return [];

    // 실제 앱에서는 메시지에 timestamp나 sessionId가 있을 것으로 가정
    // 여기서는 임의로 4개의 메시지를 하나의 세션으로 간주
    const sessions = [];
    let currentSession = [];

    for (let i = 0; i < chatHistory.length; i++) {
      currentSession.push(chatHistory[i]);

      if (currentSession.length === 4 || i === chatHistory.length - 1) {
        sessions.push({
          id: `session-${sessions.length}`,
          date: new Date().toLocaleDateString(), // 실제로는 메시지의 timestamp 사용
          messages: [...currentSession],
        });
        currentSession = [];
      }
    }

    return sessions;
  };

  const chatSessions = groupChatBySession();
  const latestSession =
    chatSessions.length > 0 ? chatSessions[chatSessions.length - 1] : null;

  // 채팅 세션 상세 보기 렌더링
  const renderChatSessionDetails = () => {
    if (!selectedChatSession) {
      // 선택된 세션이 없으면 전체 채팅 히스토리 표시
      return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <Card className="glassmorphism-card border border-white/60 shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistoryDetails(false)}
                  className="rounded-full bg-white/40 hover:bg-white/60 text-foreground shadow-sm border border-white/40 -ml-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-lg">대화 내역</CardTitle>
                <div className="w-8"></div> {/* 균형을 위한 빈 공간 */}
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {chatSessions.length > 0 ? (
                  <>
                    {/* 최신 대화 세션 표시 */}
                    {latestSession && (
                      <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-muted-foreground">
                              Latest Chat Session
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {latestSession.date}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {latestSession.messages.slice(0, 2).map((message) => (
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
                                {message.content && message.content.length > 80
                                  ? `${message.content.substring(0, 80)}...`
                                  : message.content || ''}
                              </span>
                            </div>
                          ))}
                          {latestSession.messages.length > 2 && (
                            <div
                              className="text-xs text-primary font-medium text-right cursor-pointer"
                              onClick={() =>
                                setSelectedChatSession(latestSession)
                              }
                            >
                              {latestSession.messages.length - 2}개 더보기...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 이전 대화 세션 목록 */}
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">이전 대화</h3>
                      <div className="space-y-2">
                        {chatSessions.slice(0, -1).map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-white/30 shadow-sm cursor-pointer hover:bg-white/40 transition-colors"
                            onClick={() => setSelectedChatSession(session)}
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {session.date}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {session.messages.length}개의 메시지
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-sm">
                    <p className="text-muted-foreground text-sm text-center">
                      No conversations yet. Tap the duck to start chatting!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center p-4">
        <Card className="glassmorphism-card border border-white/60 shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedChatSession(null)}
                className="rounded-full bg-white/40 hover:bg-white/60 text-foreground shadow-sm border border-white/40 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg">대화 내역</CardTitle>
              <div className="w-8"></div> {/* 균형을 위한 빈 공간 */}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {selectedChatSession.date}
            </p>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              {selectedChatSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary/20 text-primary-foreground"
                        : "bg-white/60 text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {showHistoryDetails && renderChatSessionDetails()}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: colors.background,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
      />
      {/* Header with glassmorphism effect */}
      <header className="sticky top-0 z-10 w-full mb-4 px-4 pt-3">
        <div className="glassmorphism-card mx-auto rounded-full py-2 px-4 flex items-center shadow-lg border border-white/60 backdrop-blur-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full bg-white/40 hover:bg-white/60 text-foreground shadow-sm border border-white/40 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Your Activity
          </h1>
        </div>
      </header>

      {/* Profile Section */}
      <div className="px-4 mb-6">
        <Card className="glassmorphism-card border border-white/60 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="w-16 h-16 rounded-full bg-white/70 border-2 border-white flex items-center justify-center shadow-md mr-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">덕키 사용자</h2>
                <p className="text-sm text-muted-foreground">
                  MBTI: {colors.type === "T" ? "사고형(T)" : "감정형(F)"}
                </p>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="mr-1 text-xs">
                    좋아요 {likedProducts.length}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    대화 {chatSessions.length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <main className="p-4 space-y-4 relative z-10">
        {/* Liked Products Section */}
        <Card className="glassmorphism-card border border-white/60 shadow-lg">
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => onNavigateToProducts && onNavigateToProducts()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">좋아요</h2>
                  <p className="text-sm text-muted-foreground">
                    {likedProducts.length}개의 상품
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Chat History Section - 간결하게 수정 */}
        <Card className="glassmorphism-card border border-white/60 shadow-lg">
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowHistoryDetails(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">ChatHistory</h2>
                  <p className="text-sm text-muted-foreground">
                    {chatSessions.length}개의 대화
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

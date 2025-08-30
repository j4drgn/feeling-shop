import { cn } from "@/lib/utils";

const SpeechBubble = ({ text, className, isListening, isThinking }) => {
  if (!text) {
    return null;
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        className={cn(
          "relative max-w-[540px] w-full rounded-2xl bg-white px-5 py-4 shadow-md",
          isListening && "ring-2 ring-blue-400 ring-opacity-75 animate-pulse",
          isThinking && "ring-2 ring-yellow-400 ring-opacity-75",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2">
          {/* 듣기 모드일 때 마이크 아이콘 */}
          {isListening && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* AI 생각 중일 때 로딩 점들 */}
          {isThinking && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          )}
        </div>
        
        <p className={cn(
          "text-title leading-[1.4] text-center font-pretendard pt-3 pb-2",
          isListening ? "text-blue-600" : "text-gray-800"
        )}>
          {text}
        </p>
      </div>

      {/* 말풍선 꼬리 - SVG 사용 */}
      <div className="w-6 h-6 mt-[-1px] relative z-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0L12 12L24 0H0Z" fill="white" />
          <path d="M1 0L12 11L23 0" stroke="#E5E7EB" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
};

export default SpeechBubble;

import { cn } from "@/lib/utils";

const SpeechBubble = ({ text, className }) => {
  if (!text) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        {/* Clean, minimal speech bubble */}
        <div className="relative bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200 max-w-md mx-auto">
          {/* Text content with typography hierarchy */}
          <p className="text-gray-800 text-lg font-semibold leading-relaxed text-center font-pretendard">
            {text}
          </p>
        </div>
        
        {/* Simple speech bubble tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default SpeechBubble;
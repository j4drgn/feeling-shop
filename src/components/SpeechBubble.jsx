import { cn } from "@/lib/utils";

const SpeechBubble = ({ text, className }) => {
  if (!text) {
    return null;
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        className={cn(
          "relative max-w-[540px] w-full rounded-2xl bg-white px-5 py-4 shadow-md",
          className
        )}
      >
        <p className="text-title text-gray-800 leading-[1.4] text-center font-pretendard pt-3 pb-2">
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

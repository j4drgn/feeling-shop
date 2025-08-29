import { cn } from "@/lib/utils";

const SpeechBubble = ({ text, className }) => {
  if (!text) {
    return null;
  }

  return (
    <div className={cn("relative max-w-[540px] rounded-surface bg-layer-surface px-5 py-4 shadow-surface", className)}>
      <p className="text-title text-layer-content leading-[1.4] text-center font-pretendard">
        {text}
      </p>
      <span className="absolute left-1/2 -bottom-3 h-4 w-4 -translate-x-1/2 rotate-45 bg-layer-surface shadow-surface"></span>
    </div>
  );
};

export default SpeechBubble;
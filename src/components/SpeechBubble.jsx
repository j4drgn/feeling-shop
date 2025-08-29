import React from 'react';

const SpeechBubble = ({ text }) => {
  if (!text) {
    return null;
  }

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl z-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg relative animate-in fade-in slide-in-from-bottom-4 duration-300">
        <p className="text-center text-gray-800 dark:text-gray-100 text-lg">{text}</p>
        {/* Speech bubble tail */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white dark:border-t-gray-800"></div>
      </div>
    </div>
  );
};

export default SpeechBubble;

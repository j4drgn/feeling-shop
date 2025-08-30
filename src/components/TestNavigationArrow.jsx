import React from "react";

/**
 * 테스트용 네비게이션 화살표 컴포넌트
 * 개발 중에 로그인 과정을 건너뛰고 메인 화면으로 이동할 수 있는 버튼을 제공합니다.
 *
 * @param {Object} props
 * @param {string} props.to - 이동할 경로
 * @param {string} props.position - 버튼 위치 (기본값: 'bottom-right')
 */
export const TestNavigationArrow = ({
  to = "/",
  position = "bottom-right",
  title = "테스트용: 메인화면으로 바로가기",
}) => {
  // 위치에 따른 클래스 결정
  const getPositionClasses = () => {
    switch (position) {
      case "bottom-right":
        return "bottom-6 right-6";
      case "bottom-left":
        return "bottom-6 left-6";
      case "top-right":
        return "top-6 right-6";
      case "top-left":
        return "top-6 left-6";
      default:
        return "bottom-6 right-6";
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-10`}>
      <button
        onClick={() => (window.location.href = to)}
        className="bg-gray-100/70 hover:bg-gray-200 text-gray-700 rounded-full p-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
        aria-label="테스트용 메인화면 바로가기"
        title={title}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>
    </div>
  );
};

export default TestNavigationArrow;

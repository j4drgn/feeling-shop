import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DuckCharacter from "@/components/DuckCharacter";
import TestNavigationArrow from "@/components/TestNavigationArrow";

export const LoginScreen = ({ onNavigateToMain }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      // 카카오 로그인 API 엔드포인트
      const apiUrl = "http://localhost:8080/api/auth/kakao";

      // 현재 창에서 카카오 로그인 페이지로 리다이렉트
      window.location.href = apiUrl;

      // 참고: 리다이렉트 방식이므로 아래 코드는 실행되지 않음
      // 인증 후 처리는 리다이렉트 URL에서 수행해야 함
    } catch (error) {
      console.error("카카오 로그인 오류:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-layer-background">
      <div className="w-full max-w-md space-y-8">
        {/* 로고와 덕 캐릭터 */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Duck Chat</h1>
          <p className="text-muted-foreground text-center mb-6">
            덕키와 함께 쇼핑을 더 즐겁게!
          </p>
          <div className="w-40 h-40 mb-4">
            <DuckCharacter animation="idle" />
          </div>
        </div>

        {/* 로그인 카드 */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-6">로그인</h2>

          <div className="space-y-4">
            <Button
              onClick={handleKakaoLogin}
              className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  로그인 중...
                </span>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9 0.473999C4.02943 0.473999 0 3.7464 0 7.7864C0 10.2744 1.55543 12.4684 3.93401 13.7644C3.75683 14.4144 3.31304 16.4734 3.23333 16.8854C3.13659 17.3764 3.42391 17.3734 3.65203 17.2264C3.83311 17.1124 6.41667 15.3614 7.40667 14.7114C7.92667 14.7824 8.45743 14.8194 9 14.8194C13.9706 14.8194 18 11.5464 18 7.5064C18 3.4664 13.9706 0.473999 9 0.473999Z"
                      fill="black"
                    />
                  </svg>
                  카카오로 시작하기
                </>
              )}
            </Button>

            {/* 개발용 임시 로그인 버튼 */}
            <Button
              variant="outline"
              onClick={onNavigateToMain}
              className="w-full"
            >
              개발용 임시 로그인
            </Button>
          </div>
        </Card>

        <p className="text-sm text-center text-muted-foreground mt-4">
          로그인하면 Duck Chat의{" "}
          <a href="#" className="text-brand-primary hover:underline">
            이용약관
          </a>
          과{" "}
          <a href="#" className="text-brand-primary hover:underline">
            개인정보처리방침
          </a>
          에 동의하게 됩니다.
        </p>

        {/* 테스트용 바로가기 화살표 */}
        <TestNavigationArrow to="/" title="테스트용: 로그인 건너뛰기" />
      </div>
    </div>
  );
};

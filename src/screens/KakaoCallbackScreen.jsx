import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DuckCharacter from "@/components/DuckCharacter";
import TestNavigationArrow from "@/components/TestNavigationArrow";

export const KakaoCallbackScreen = ({ onNavigateToMain }) => {
  const { handleKakaoCallback } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processKakaoCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("인증 코드가 없습니다.");
        }

        // 카카오 콜백 처리
        const success = await handleKakaoCallback(code);

        if (success) {
          setStatus("success");
          // 로그인 성공 후 메인 화면으로 이동
          setTimeout(() => {
            onNavigateToMain();
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("카카오 콜백 처리 오류:", error);
        setStatus("error");
        setErrorMessage(error.message || "로그인 처리 중 오류가 발생했습니다.");
      }
    };

    processKakaoCallback();
  }, [handleKakaoCallback, onNavigateToMain]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-layer-background">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="w-40 h-40 mx-auto mb-4">
              <DuckCharacter animation="idle" />
            </div>
            <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
            <p className="text-muted-foreground">잠시만 기다려 주세요.</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-40 h-40 mx-auto mb-4">
              <DuckCharacter animation="happy" />
            </div>
            <h2 className="text-xl font-semibold mb-2">로그인 성공!</h2>
            <p className="text-muted-foreground">메인 화면으로 이동합니다.</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-40 h-40 mx-auto mb-4">
              <DuckCharacter animation="sad" />
            </div>
            <h2 className="text-xl font-semibold mb-2">로그인 실패</h2>
            <p className="text-red-500">{errorMessage}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-4 px-4 py-2 bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90"
            >
              다시 시도하기
            </button>
          </>
        )}
      </div>

      {/* 테스트용 바로가기 화살표 */}
      <TestNavigationArrow to="/" title="테스트용: 콜백 처리 건너뛰기" />
    </div>
  );
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DuckCharacter from "@/components/DuckCharacter";
import { useToast } from "@/components/ui/use-toast";
import TestNavigationArrow from "@/components/TestNavigationArrow";
import authApi from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";

export const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('로그인 시도:', formData);

    try {
      console.log('API 호출 시작');
      // API를 통해 로그인
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
      console.log('API 응답:', response);

      // 로그인 성공
      console.log('로그인 함수 호출 전');
      await login(response.data);
      console.log('로그인 함수 호출 후');

      toast({
        title: "로그인 성공",
        description: `${response.data.user.nickname}님, 환영합니다!`,
      });

      // 메인 화면으로 이동
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.log('로그인 에러:', error);
      // 로그인 실패
      toast({
        title: "로그인 실패",
        description: error.message || "이메일 또는 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // 테스트 계정 생성 (개발용)
  const createTestAccounts = () => {
    // API를 통해 테스트 계정 생성 (필요시 백엔드에서 구현)
    toast({
      title: "테스트 계정 생성",
      description: "백엔드 API를 통해 테스트 계정을 생성하세요.",
    });
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일 주소를 입력하세요"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인하기"}
            </Button>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={createTestAccounts}
              >
                테스트 계정 생성
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </Button>
            </div>
          </form>
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

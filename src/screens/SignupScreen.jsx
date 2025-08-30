import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DuckCharacter from "@/components/DuckCharacter";
import { useToast } from "@/components/ui/use-toast";

export const SignupScreen = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // 로컬 스토리지에서 사용자 목록 가져오기
    const usersString = localStorage.getItem("users");
    let users = usersString ? JSON.parse(usersString) : [];

    // 이메일 중복 확인
    const existingUser = users.find((user) => user.email === formData.email);
    if (existingUser) {
      toast({
        title: "이메일 중복",
        description: "이미 사용 중인 이메일입니다.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // 새 사용자 추가
    const newUser = {
      id: Date.now(),
      email: formData.email,
      password: formData.password, // 실제로는 암호화해야 함
      nickname: formData.nickname,
      profileImageUrl: null,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    toast({
      title: "회원가입 성공",
      description: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
    });

    // 로그인 페이지로 이동
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 1500);
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

        {/* 회원가입 카드 */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-6">회원가입</h2>

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
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </Button>
          </form>
        </Card>

        <p className="text-sm text-center text-muted-foreground mt-4">
          이미 계정이 있으신가요?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-brand-primary"
            onClick={() => navigate("/login")}
          >
            로그인하기
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;

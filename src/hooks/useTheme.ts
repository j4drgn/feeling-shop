import { useState, useEffect } from "react";

export type MbtiTheme = "T" | "F";

interface ThemeColors {
  background: string;
  secondary: string;
  circle: string;
  thumbColor: string;
  borderColor: string;
  toggleBackground: string;
  trackColor: string;
}

export const useTheme = () => {
  // 로컬 스토리지에서 저장된 테마 불러오기 (기본값: F)
  const [theme, setTheme] = useState<MbtiTheme>(() => {
    const savedTheme = localStorage.getItem("mbtiTheme");
    return savedTheme === "T" || savedTheme === "F" ? savedTheme : "F";
  });

  // T/F 테마에 따른 색상 값 반환
  const getThemeColors = (): ThemeColors => {
    return theme === "T"
      ? {
          background: "#FFE4A1", // T(사고형) 배경
          secondary: "#FFCE55", // 보조색
          circle: "#5585FF", // T(사고형) 오리 캐릭터 원 - 파란색
          thumbColor: "#5585FF", // T(사고형) 토글 버튼 동그라미 색상 - 파란색
          borderColor: "#5585FF", // T(사고형) 테두리 색상 - 파란색
          toggleBackground: "#D6E4FF", // T(사고형) 토글 배경 - 연한 파란색
          trackColor: "#C0D6FF", // T(사고형) 토글 트랙 배경 - 더 진한 연한 파란색
        }
      : {
          background: "#FFE094", // F(감정형) 배경
          secondary: "#FFCE55", // 보조색
          circle: "#FFBB15", // F(감정형) 오리 캐릭터 원 - 노란색
          thumbColor: "#FFBB15", // F(감정형) 토글 버튼 동그라미 색상 - 노란색
          borderColor: "#FFBB15", // F(감정형) 테두리 색상 - 노란색
          toggleBackground: "#FFF2D1", // F(감정형) 토글 배경 - 연한 노란색
          trackColor: "#FFE6A8", // F(감정형) 토글 트랙 배경 - 더 진한 연한 노란색
        };
  };

  // 테마 변경 함수
  const toggleTheme = () => {
    const newTheme = theme === "T" ? "F" : "T";
    setTheme(newTheme);
    localStorage.setItem("mbtiTheme", newTheme);
  };

  // 테마 직접 설정 함수
  const setMbtiTheme = (newTheme: MbtiTheme) => {
    setTheme(newTheme);
    localStorage.setItem("mbtiTheme", newTheme);
  };

  // 테마 색상
  const colors = getThemeColors();

  return {
    theme,
    isThinking: theme === "T",
    colors,
    toggleTheme,
    setMbtiTheme,
  };
};

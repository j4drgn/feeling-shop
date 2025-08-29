import { createContext, useContext, ReactNode } from 'react';
import { useTheme, MbtiTheme } from '@/hooks/useTheme';

interface ThemeContextType {
  theme: MbtiTheme;
  isThinking: boolean;
  colors: {
    background: string;
    secondary: string;
    circle: string;
  };
  toggleTheme: () => void;
  setMbtiTheme: (theme: MbtiTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const themeValues = useTheme();

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

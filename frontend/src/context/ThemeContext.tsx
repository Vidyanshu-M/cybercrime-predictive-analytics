import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'night' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('cybertrace_theme');
    if (saved === 'night' || saved === 'light' || saved === 'dark') {
      return saved as ThemeMode;
    }
    return 'light';
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('cybertrace_theme', mode);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'night', 'light');
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

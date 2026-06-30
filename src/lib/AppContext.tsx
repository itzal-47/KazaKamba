import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type ThemeMode = 'branco' | 'preto' | 'kamba';

interface AppSettings {
  dataSaver: boolean;
  setDataSaver: (value: boolean) => void;
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  /** true se o sistema (ou o utilizador) está no modo escuro agora */
  isDark: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext<AppSettings | null>(null);

const STORAGE_KEY = 'kazakamba_settings';

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [dataSaver, setDataSaverState] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>('kamba');

  // Detecta preferência do sistema operativo (para o Modo Kamba)
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  );

  // Ouve mudanças do tema do sistema em tempo real
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Carrega preferências guardadas no localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.dataSaver !== undefined) setDataSaverState(parsed.dataSaver);
        if (parsed.theme) setThemeState(parsed.theme as ThemeMode);
      } catch {
        // Ignora JSON inválido
      }
    }
  }, []);

  // Calcula se deve estar escuro agora
  const isDark =
    theme === 'preto' ||
    (theme === 'kamba' && systemDark);

  // Aplica / remove a classe no <html> sempre que isDark mudar
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  // ─── Setters com persistência ──────────────────────────────────────────────
  const setDataSaver = (value: boolean) => {
    setDataSaverState(value);
    persist({ dataSaver: value });
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    persist({ theme: mode });
  };

  function persist(patch: Record<string, unknown>) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  }

  return (
    <AppContext.Provider value={{ dataSaver, setDataSaver, theme, setTheme, isDark }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAppSettings() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppProvider');
  }
  return context;
}

import { useEffect, useState } from 'react';

function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getThemePreference(): boolean {
  // SSR 時返回默認值（淺色模式）
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }
  
  const savedTheme = localStorage.getItem('theme');
  
  // 如果用戶明確選擇了主題，使用用戶選擇
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme === 'dark';
  }
  
  // 否則跟隨系統設定
  return getSystemPreference();
}

export function ThemeToggle() {
  // SSR 時使用 false（淺色模式），實際值會在 useEffect 中更新
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 只在瀏覽器環境中執行
    if (typeof window === 'undefined') return;

    // 初始化主題
    const shouldBeDark = getThemePreference();
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);

    // 監聽系統主題變化（僅在用戶沒有手動選擇時）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (typeof localStorage === 'undefined') return;
      const savedTheme = localStorage.getItem('theme');
      // 只有在用戶沒有手動選擇時才跟隨系統設定
      if (savedTheme !== 'dark' && savedTheme !== 'light') {
        const shouldBeDark = e.matches;
        setIsDark(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
      }
    };

    // 使用 addEventListener 而不是 addListener（更現代的方式）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 降級支持舊瀏覽器
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    // 保存用戶的明確選擇
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isDark ? '切換到淺色模式' : '切換到深色模式'}
      title={isDark ? '切換到淺色模式' : '切換到深色模式'}
    >
      {isDark ? (
        <span className="theme-icon">☀️</span>
      ) : (
        <span className="theme-icon">🌙</span>
      )}
    </button>
  );
}


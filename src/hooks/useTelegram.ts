import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const telegram = (window as any).Telegram?.WebApp;
    if (telegram) {
      setTg(telegram);
      telegram.ready();
      telegram.expand();
      
      // Attempt to load user info
      if (telegram.initDataUnsafe?.user) {
        setUser(telegram.initDataUnsafe.user);
      }
      
      // Adapt header color
      if (telegram.setHeaderColor) {
        telegram.setHeaderColor('secondary_bg_color');
      }

      // Add active class or apply custom style variables from Telegram themes
      const theme = telegram.themeParams;
      if (theme) {
        const root = document.documentElement;
        if (theme.bg_color) root.style.setProperty('--tg-bg-start', theme.bg_color);
        if (theme.secondary_bg_color) root.style.setProperty('--tg-bg-end', theme.secondary_bg_color);
        if (theme.bg_color) root.style.setProperty('--tg-card-bg', `rgba(${hexToRgb(theme.bg_color)}, 0.75)`);
        if (theme.text_color) root.style.setProperty('--tg-text', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--tg-hint', theme.hint_color);
        if (theme.button_color) root.style.setProperty('--tg-button', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--tg-button-text', theme.button_text_color);
      }
    }
  }, []);

  const hapticSuccess = () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  };

  const hapticError = () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('error');
    }
  };

  const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };

  const closeApp = () => {
    if (tg?.close) {
      tg.close();
    }
  };

  return {
    tg,
    user,
    hapticSuccess,
    hapticError,
    hapticImpact,
    closeApp,
  };
}

// Utility to convert HEX color to RGB (to support opacity in Tailwind custom variables)
function hexToRgb(hex: string): string {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '30, 41, 59';
}

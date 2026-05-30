/**
 * Telegram WebApp API Integration Utilities
 */

export interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp;
  }
  return null;
};

/**
 * Signals Telegram that the WebApp has fully loaded and can be rendered
 */
export const initTelegramWebApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      
      // Set theme integrations to pair with our midnight slate interface
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#020617'); // Tailwind bg-slate-950
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#020617');
      }
      
      console.log('Telegram WebApp successfully initialized');
    } catch (e) {
      console.warn('Failed to initialize Telegram WebApp style overrides', e);
    }
  }
};

/**
 * Returns current Telegram user data if running inside Telegram
 */
export const getTelegramUser = (): TelegramUser | null => {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }
  return null;
};

/**
 * Safe haptic feedback triggers
 */
export const triggerHaptic = {
  light: () => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  },
  medium: () => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  },
  heavy: () => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('heavy');
    }
  },
  success: () => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  },
  warning: () => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    }
  },
  error: () => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('error');
    }
  }
};

/**
 * Safe Telegram share/invite trigger
 */
export const shareTelegramInvite = (charName: string, level: number, charClass: string) => {
  const tg = getTelegramWebApp();
  const inviteText = `Я играю в Открытый мир Этерии! Мой персонаж: ${charName} (${level} уровень, ${charClass}). Присоединяйся к нам в приключении!`;
  const botUrl = `https://t.me/eteria_game_bot`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(inviteText)}`;
  
  if (tg) {
    tg.openTelegramLink(shareUrl);
  } else {
    // Fallback if open outside Telegram
    window.open(shareUrl, '_blank');
  }
};

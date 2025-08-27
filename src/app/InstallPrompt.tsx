'use client';
import { useEffect, useState } from 'react';

// Type for Chrome’s beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Extend Navigator for iOS Safari
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (alreadyInstalled) setVisible(false);

    const onBIP = (e: Event) => {
      const bip = e as BeforeInstallPromptEvent;
      bip.preventDefault();
      setDeferred(bip);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onBIP as EventListener);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      return;
    }
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      alert('On iPhone/iPad: Share (↑) → Add to Home Screen');
    } else {
      alert('In Chrome: click the “Install app” icon in the address bar, or ⋮ → Install app');
    }
  };

  return (
    <button className="rounded-2xl px-4 py-2 shadow" onClick={handleClick}>
      Install App
    </button>
  );
}

'use client';
import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide if already installed
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      // @ts-ignore
      window.navigator.standalone === true;
    if (alreadyInstalled) setVisible(false);

    const onBIP = (e: any) => {
      e.preventDefault();          // keep the event for our button
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible) return null;

  const handleClick = async () => {
    if (deferred) {
      const choice = await deferred.prompt();
      await choice.userChoice;     // 'accepted' | 'dismissed'
      setDeferred(null);
      return;
    }
    // Fallback instructions when BIP didn't fire
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      alert('On iPhone/iPad: Share (↑) → Add to Home Screen');
    } else {
      alert('In Chrome: click the “Install app” icon in the address bar, or ⋮ → Install app');
    }
  };

  return (
    <button
      className="rounded-2xl px-4 py-2 shadow"
      onClick={handleClick}
    >
      Install App
    </button>
  );
}

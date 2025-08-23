// src/app/InstallPrompt.tsx
'use client';
import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [evt, setEvt] = useState<any>(null);

  useEffect(() => {
    const onBIP = (e: any) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  if (!evt) return null;

  return (
    <button
      className="rounded-2xl px-4 py-2 shadow"
      onClick={async () => {
        const choice = await evt.prompt();
        await choice.userChoice;
        setEvt(null);
      }}
    >
      Install App
    </button>
  );
}

'use client';
import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      // Try common filenames
      for (const sw of ['/sw.js', '/service-worker.js']) {
        try {
          const res = await fetch(sw, { method: 'HEAD' });
          if (res.ok) {
            await navigator.serviceWorker.register(sw);
            break;
          }
        } catch {}
      }
    };

    // after page load
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}

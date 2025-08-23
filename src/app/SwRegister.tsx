'use client';
import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const candidates = ['/sw.js', '/service-worker.js'];
    const tryRegister = async () => {
      for (const sw of candidates) {
        try {
          const res = await fetch(sw, { method: 'HEAD' });
          if (res.ok) { await navigator.serviceWorker.register(sw); break; }
        } catch {}
      }
    };
    window.addEventListener('load', tryRegister);
    return () => window.removeEventListener('load', tryRegister);
  }, []);
  return null;
}

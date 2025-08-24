'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [msg, setMsg] = useState('Completing sign-in…');
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.get('code');
    if (!code) { setMsg('Missing code'); return; }
    supabase.auth.exchangeCodeForSession({ code })
      .then(({ error }) => {
        if (error) setMsg(`Error: ${error.message}`);
        else router.replace('/');
      });
  }, [params, router]);

  return (
    <main className="p-6">
      <p>{msg}</p>
    </main>
  );
}

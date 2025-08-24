'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendLink = async () => {
    setError(null);
    const redirect = `${window.location.origin}/auth/callback`; // works local & prod
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      {sent ? (
        <p>Check your email for a magic link.</p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="rounded px-4 py-2 shadow" onClick={sendLink}>
              Send link
            </button>
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          <p className="text-sm opacity-70 mt-3">
            Local dev tip: if you’re running Supabase locally, open <code>http://localhost:54324</code> to see the email (Inbucket).
          </p>
        </>
      )}
    </main>
  );
}

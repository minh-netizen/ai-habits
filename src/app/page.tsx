'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStreak, completeToday } from "@/lib/streak";
import InstallPrompt from "./InstallPrompt";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [streak, setStreak] = useState<{current:number,longest:number} | null>(null);

  useEffect(() => {
    // Load current user & streak
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        const s = await getStreak();
        if (s) setStreak({ current: s.current, longest: s.longest });
      }
    });
    // Keep in sync with auth changes
    const sub = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const s = await getStreak();
        if (s) setStreak({ current: s.current, longest: s.longest });
      } else {
        setStreak(null);
      }
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const markDone = async () => {
    const res = await completeToday();
    if (!res.ok) return alert(res.error);
    setStreak({ current: res.current, longest: res.longest });
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        {/* Header */}
        <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />

        {/* Auth + Streak widget */}
        <div className="w-full max-w-lg rounded-xl border p-4 flex flex-col gap-3">
          {!user ? (
            <div className="flex items-center justify-between">
              <div>Sign in to start your streak</div>
              <Link className="rounded px-4 py-2 shadow" href="/auth">Sign in</Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm opacity-70">Signed in as</div>
                <div className="font-medium">{user.email}</div>
                <div className="mt-1">Streak: <b>{streak?.current ?? 0}</b> (longest {streak?.longest ?? 0})</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded px-4 py-2 shadow" onClick={markDone}>Mark today done ✅</button>
                <button className="rounded px-3 py-2 border" onClick={() => supabase.auth.signOut()}>Sign out</button>
              </div>
            </div>
          )}
        </div>

        {/* Existing starter content */}
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
            <Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />
            Deploy now
          </a>
          <a className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
            Read our docs
          </a>

          {/* PWA Install Button */}
          <InstallPrompt />
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* ... your existing footer links ... */}
      </footer>
    </div>
  );
}

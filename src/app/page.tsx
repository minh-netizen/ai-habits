'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getStreak, completeToday } from "@/lib/streak";
import InstallPrompt from "./InstallPrompt";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState<{current:number,longest:number} | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        const s = await getStreak();
        if (s) setStreak({ current: s.current, longest: s.longest });
      }
    });
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
  if (!res.ok) { alert(res.error); return; }
  setStreak({ current: res.current, longest: res.longest });
};

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />
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

        {/* … rest of your existing starter UI … */}
        <InstallPrompt />
      </main>
    </div>
  );
}

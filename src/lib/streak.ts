// src/lib/streak.ts
import { supabase } from "@/lib/supabase";

function todayYYYYMMDD() {
  // Local "today" in YYYY-MM-DD
  return new Date().toLocaleDateString('en-CA');
}

export async function getStreak() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('streaks')
    .select('current,longest,last_active_date')
    .eq('user_id', user.id)
    .maybeSingle();
  return data ?? null;
}

export async function completeToday() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in' as const };

  const today = todayYYYYMMDD();
  const { data: s } = await supabase
    .from('streaks')
    .select('current,longest,last_active_date')
    .eq('user_id', user.id)
    .maybeSingle();

  let current = 1, longest = 1;
  if (s) {
    const last = s.last_active_date;
    if (last === today) {
      current = s.current; longest = s.longest; // already done today
    } else {
      // crude day diff using string compare; for strict diff, parse Dates
      const lastDate = last ? new Date(`${last}T00:00:00`) : null;
      const todayDate = new Date(`${today}T00:00:00`);
      const diffDays = lastDate ? Math.round((+todayDate - +lastDate) / 86400000) : Infinity;
      if (diffDays === 1) {
        current = s.current + 1;
        longest = Math.max(s.longest, current);
      } else {
        current = 1;
        longest = Math.max(s.longest ?? 0, 1);
      }
    }
  }
  const payload = { user_id: user.id, current, longest, last_active_date: today };
  const { error } = await supabase
    .from('streaks')
    .upsert(payload, { onConflict: 'user_id' });
  if (error) return { ok:false as const, error: error.message };
  return { ok:true as const, current, longest };
}

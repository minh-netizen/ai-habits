// at top (or above the function)
export type CompleteTodayResult =
  | { ok: true; current: number; longest: number }
  | { ok: false; error: string };

// …your helpers…

export async function completeToday(): Promise<CompleteTodayResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in' };

  const today = new Date().toLocaleDateString('en-CA');
  const { data: s } = await supabase
    .from('streaks')
    .select('current,longest,last_active_date')
    .eq('user_id', user.id)
    .maybeSingle();

  let current = 1, longest = 1;
  if (s) {
    const last = s.last_active_date;
    if (last === today) {
      current = s.current; longest = s.longest;
    } else {
      const lastDate = last ? new Date(`${last}T00:00:00`) : null;
      const todayDate = new Date(`${today}T00:00:00`);
      const diffDays = lastDate ? Math.round((+todayDate - +lastDate) / 86400000) : Infinity;
      if (diffDays === 1) { current = s.current + 1; longest = Math.max(s.longest, current); }
      else { current = 1; longest = Math.max(s.longest ?? 0, 1); }
    }
  }

  const payload = { user_id: user.id, current, longest, last_active_date: today };
  const { error } = await supabase.from('streaks').upsert(payload, { onConflict: 'user_id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true, current, longest };
}

// Sends push notifications from the inbox, following the house rules so they never get noisy:
//  - push only for comments (to everyone involved) and new jobs (to maintenance); "job finished" stays in the inbox
//  - at most one push per person every 10 minutes; anything in between is bundled ("3 updates")
//  - quiet hours 21:00–08:00 Malta time; what arrives overnight is bundled into one push after 08:00
//  - one 08:00 reminder for maintenance, only when something is due today or late
//  - each person can switch pushes off in Settings
// Called by a timer (pg_cron) with a shared secret; never by phones.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const TZ = "Europe/Malta";
const GAP_MS = 10 * 60 * 1000;          // bundling window per person
const MAX_AGE_MS = 14 * 60 * 60 * 1000; // older unsent items are only kept in the inbox

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
webpush.setVapidDetails(Deno.env.get("APP_URL") ?? "https://nadege88-commits.github.io/operations/",
  Deno.env.get("VAPID_PUBLIC_KEY")!, Deno.env.get("VAPID_PRIVATE_KEY")!);

const localHour = () => Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: TZ }).format(new Date()));
const localDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()); // YYYY-MM-DD
const shorten = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

type Member = { email: string; role: string; name: string | null; push_enabled: boolean; last_push_at: string | null };
const firstName = (members: Member[], email: string | null) => {
  const m = members.find((x) => x.email === email);
  return m?.name || (email ? email.split("@")[0] : "Someone");
};

async function sendTo(email: string, payload: Record<string, unknown>) {
  const { data: subs } = await sb.from("push_subscriptions").select("endpoint,p256dh,auth").eq("email", email);
  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 12 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await sb.from("push_subscriptions").delete().eq("endpoint", s.endpoint); // phone unsubscribed
    }
  }
  return sent;
}

// Test project only (ALLOW_TEST_FORCE=1): lets a test run ignore the clock. Never set on the live project.
const canForce = Deno.env.get("ALLOW_TEST_FORCE") === "1";

async function dispatch(force = false) {
  const hour = localHour();
  if ((hour >= 21 || hour < 8) && !(force && canForce)) return { quiet: true };

  const { data: members } = await sb.from("members").select("email,role,name,push_enabled,last_push_at");
  const { data: rows } = await sb.from("inbox").select("id,recipient,kind,job_id,note_id,actor,preview,created_at").is("pushed_at", null).order("id");
  const all = (members ?? []) as Member[];
  const now = Date.now();
  const skip: number[] = [];
  const byPerson = new Map<string, typeof rows>();
  for (const r of rows ?? []) {
    const m = all.find((x) => x.email === r.recipient);
    const pushable = m && m.push_enabled && now - Date.parse(r.created_at) < MAX_AGE_MS &&
      (r.kind === "comment" || (r.kind === "new_job" && m.role === "maintenance"));
    if (!pushable) skip.push(r.id);
    else byPerson.set(r.recipient, [...(byPerson.get(r.recipient) ?? []), r]);
  }
  if (skip.length) await sb.from("inbox").update({ pushed_at: new Date().toISOString() }).in("id", skip);

  const jobIds = [...new Set((rows ?? []).map((r) => r.job_id).filter(Boolean))];
  const noteIds = [...new Set((rows ?? []).map((r) => r.note_id).filter(Boolean))];
  const { data: jobs } = jobIds.length ? await sb.from("jobs").select("id,text").in("id", jobIds) : { data: [] };
  const { data: notes } = noteIds.length ? await sb.from("notes").select("id,text").in("id", noteIds) : { data: [] };
  const titleOf = (r: { job_id: string | null; note_id: string | null; preview: string | null }) =>
    (r.job_id ? jobs?.find((j) => j.id === r.job_id)?.text : notes?.find((n) => n.id === r.note_id)?.text) || r.preview || "";

  let pushed = 0;
  for (const [email, items] of byPerson) {
    const m = all.find((x) => x.email === email)!;
    if (m.last_push_at && now - Date.parse(m.last_push_at) < GAP_MS) continue; // wait and bundle
    let payload;
    if (items!.length === 1) {
      const r = items![0];
      payload = r.kind === "comment"
        ? { title: `${firstName(all, r.actor)} commented`, body: shorten(`${titleOf(r)}: “${r.preview ?? ""}”`, 140), url: r.job_id ? `#job-${r.job_id}` : `#note-${r.note_id}` }
        : { title: "New maintenance job", body: shorten(titleOf(r), 140), url: `#job-${r.job_id}` };
    } else {
      const c = items!.filter((r) => r.kind === "comment").length, j = items!.length - c;
      const parts = [c ? `${c} comment${c > 1 ? "s" : ""}` : "", j ? `${j} new job${j > 1 ? "s" : ""}` : ""].filter(Boolean);
      payload = { title: `${items!.length} updates`, body: parts.join(", "), url: "#inbox" };
    }
    await sendTo(email, { ...payload, tag: "ops" });
    await sb.from("inbox").update({ pushed_at: new Date().toISOString() }).in("id", items!.map((r) => r.id));
    await sb.from("members").update({ last_push_at: new Date().toISOString() }).eq("email", email);
    pushed++;
  }
  return { pushed, skipped: skip.length };
}

// 08:00 Malta: one reminder per maintenance person, only if jobs are due today or late.
async function morning(force = false) {
  if (localHour() !== 8 && !(force && canForce)) return { morning: "not 8:00 in Malta" };
  const today = localDate();
  const { data: due } = await sb.from("jobs").select("id,text,due").eq("done", false).eq("deleted", false).lte("due", today).order("due");
  if (!due?.length) return { morning: "nothing due" };
  const late = due.filter((j) => j.due < today).length, todayN = due.length - late;
  const title = [todayN ? `${todayN} due today` : "", late ? `${late} late` : ""].filter(Boolean).join(" · ");
  const body = shorten(due.slice(0, 3).map((j) => j.text).join(", "), 140);
  const { data: crew } = await sb.from("members").select("email").eq("role", "maintenance").eq("push_enabled", true);
  let sent = 0;
  for (const m of crew ?? []) sent += await sendTo(m.email, { title: `Jobs: ${title}`, body, url: "#", tag: "ops-morning" });
  return { morning: sent };
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) return new Response("Forbidden", { status: 403 });
  const { mode, force } = await req.json().catch(() => ({ mode: "dispatch", force: false }));
  const result = mode === "morning" ? await morning(!!force) : await dispatch(!!force);
  return Response.json(result);
});

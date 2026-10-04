/* Operations — venue notes for Mili, maintenance jobs for the team.
   Data lives in Supabase; who sees what is enforced there by row-level security (see supabase/schema.sql):
   owners see everything, maintenance accounts only venues (names) and jobs. */
const I = {
  back:'<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
  wrench:'<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
  edit:'<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  tick:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/></svg>',
  box:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/></svg>',
  camera:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
  link:'<svg viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4L12 18.4"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M9 4h6l-1 6 4 4H6l4-4zM12 14v7"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  bell:'<svg viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  send:'<svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-2-6z"/></svg>',
  attach:'<svg viewBox="0 0 24 24"><path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10 17.5a2 2 0 0 1-3-3l7.5-7.5"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
};
// Notes and jobs share High / Medium / Low.
const PRIO = {1:{label:'High',c:'var(--now)'},2:{label:'Medium',c:'var(--soon)'},3:{label:'Low',c:'var(--later)'}};
const JPRIO = PRIO;

const S = {sb:null, session:null, email:'', role:null, pushEnabled:true, venues:[], notes:[], jobs:[], essentials:[], members:[], team:[], comments:[], inbox:[],
  archiveTab:'done', archiveQ:'', jobTab:'open', online:navigator.onLine, ready:false, depth:0};
let shellKey = null;

function h(tag, attrs, ...kids){
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs||{})){
    if (v==null || v===false) continue;
    if (k==='html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k==='style') el.style.cssText = v;
    else el.setAttribute(k, v===true?'':v);
  }
  for (const k of kids.flat(Infinity)) if (k!=null && k!==false) el.append(k.nodeType?k:document.createTextNode(k));
  return el;
}
const newId = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const byOrder = (a,b) => (a.order??0)-(b.order??0) || (a.createdAt||0)-(b.createdAt||0);
const byPrio = (a,b) => (a.priority||2)-(b.priority||2) || (a.createdAt||0)-(b.createdAt||0);
const byJob = (a,b) => (a.priority||2)-(b.priority||2) || (a.due||'9999').localeCompare(b.due||'9999') || (a.createdAt||0)-(b.createdAt||0);
const age = t => { if(!t) return ''; const d = Math.floor((Date.now()-t)/864e5); return d<1?'today':d+'d'; };
const shortDate = t => t? new Date(t).toLocaleDateString(undefined,{day:'numeric',month:'short'}) : '';
const venueName = id => (S.venues.find(v=>v.id===id)||{}).name || 'Unknown area';
const vids = i => i.venueIds || [];
const liveVids = i => vids(i).filter(id=>S.venues.some(v=>v.id===id));
const venueTag = i => i.all ? 'All areas' : (liveVids(i).map(venueName).join(' · ') || 'No area');
const vColor = id => { const v = S.venues.find(x=>x.id===id); return v ? 'var(--v'+((((v.order||1)-1)%8+8)%8+1)+')' : 'var(--muted)'; };
const openNotes = vid => S.notes.filter(i=>!i.done && !i.deleted && (vid==null || vids(i).includes(vid)));
const openJobs = vid => S.jobs.filter(j=>!j.done && !j.deleted && (vid==null || vids(j).includes(vid)));
const isOwner = () => S.role==='owner';
const canClose = () => S.role==='owner' || S.role==='maintenance';      // managers and admins comment but do not finish or delete jobs
// Tasks: owners finish anything; a manager finishes tasks that are theirs; admins never finish.
const canFinishNote = i => S.role==='owner' || (S.role==='manager' && (i.assignee===S.email || i.createdBy===S.email));
const canAssign = () => S.role==='owner' || S.role==='admin';
const ROLE = {owner:{label:'Owner',c:'var(--v7)'}, admin:{label:'Admin',c:'var(--v5)'}, manager:{label:'Manager',c:'var(--v3)'}, maintenance:{label:'Maintenance',c:'var(--fix)'}};
const myAreas = () => (S.team.find(t=>t.email===S.email)?.venue_ids)||[];
const areasForMe = () => [...S.venues].sort(byOrder).filter(v=> S.role==='manager' ? myAreas().includes(v.id) : true);
// Managers of an area right now (the picker follows Settings → People automatically).
const managersOf = ids => S.team.filter(t=>t.role==='manager' && (t.venue_ids||[]).some(v=>ids.includes(v)));
const nameOf = email => { if (!email) return 'Someone'; const m = S.team.find(t=>t.email===email); return m?.name || email.split('@')[0]; };
const isVideo = p => /\.(mp4|mov|m4v|webm)$/i.test(p||'');
const when = t => { if (!t) return ''; const d = new Date(t);
  const sameDay = d.toDateString()===new Date().toDateString();
  return (sameDay? 'Today' : d.toLocaleDateString(undefined,{day:'numeric',month:'short'}))+' '+d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}); };
const commentsFor = (kind,id) => S.comments.filter(c=>(kind==='job'? c.job_id : c.note_id)===id).sort((a,b)=>a.created_at.localeCompare(b.created_at));
const unread = () => S.inbox.filter(n=>!n.read_at).length;

const ymd = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const todayStr = () => ymd(new Date());
const isLate = j => j.due && !j.done && j.due < todayStr();
function dueChip(j){
  if (!j.due) return null;
  const t = new Date(), today = ymd(t); t.setDate(t.getDate()+1); const tomorrow = ymd(t);
  const [y,m,d] = j.due.split('-').map(Number);
  const label = j.due===today ? 'Today' : j.due===tomorrow ? 'Tomorrow' : new Date(y,m-1,d).toLocaleDateString(undefined,{day:'numeric',month:'short'});
  const cls = isLate(j) ? ' late' : (j.due===today||j.due===tomorrow) ? ' soon' : '';
  return h('span',{class:'due'+cls,html:I.cal}, isLate(j)? 'Late · '+label : label);
}

function toast(msg, undo){
  document.querySelector('.toast')?.remove();
  const t = h('div',{class:'toast',role:'status'}, h('span',{},msg),
    undo? h('button',{class:'undo',onclick:()=>{ t.remove(); undo(); }},'Undo') : null);
  document.body.append(t);
  setTimeout(()=>t.remove(), undo? 5000 : 2600);
}

/* ---------- light / dark (per phone, dark by default) ---------- */
const THEME_KEY = 'ops-theme';
const getTheme = () => { try { return localStorage.getItem(THEME_KEY)==='light' ? 'light' : 'dark'; } catch { return 'dark'; } };
function setTheme(t){
  try { localStorage.setItem(THEME_KEY, t); } catch {}
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t==='light'? '#F3F4F8' : '#0D0F16');
  render(true);
}
const themeBtn = () => h('button',{class:'icon-btn','aria-label':getTheme()==='dark'? 'Switch to light mode' : 'Switch to dark mode',
  html:getTheme()==='dark'? I.sun : I.moon, onclick:()=>setTheme(getTheme()==='dark'? 'light' : 'dark')});

/* ---------- data: Supabase rows <-> app objects ---------- */
const COLS = {venueIds:'venue_ids', doneAt:'done_at', deletedAt:'deleted_at', createdAt:'created_at', all:'all_venues', order:'ord', createdBy:'created_by', doneBy:'done_by'};
const BACK = Object.fromEntries(Object.entries(COLS).map(([k,v])=>[v,k]));
const toRow = o => Object.fromEntries(Object.entries(o).map(([k,v])=>[COLS[k]||k, v]));
const fromRow = r => Object.fromEntries(Object.entries(r).map(([k,v])=>[BACK[k]||k, v]));
const TABLES = ['venues','notes','jobs','essentials','members','comments','inbox'];
const tablesForRole = () => isOwner() ? TABLES : S.role==='maintenance' ? ['venues','jobs','comments','inbox'] : ['venues','notes','jobs','comments','inbox'];
// comments and inbox keep their database field names (job_id, created_at …); the rest are mapped to camelCase.
const RAW = new Set(['comments','inbox','members']);

// One cached copy per database, so the preview and the live app never mix data on the same phone.
const CACHE = 'ops-cache-v2-' + ((window.OPS_CONFIG||{}).supabaseUrl||'').replace(/^https:\/\/|\..*$/g,'');
function saveCache(){
  try { localStorage.setItem(CACHE, JSON.stringify({email:S.email, role:S.role, team:S.team, venues:S.venues, notes:S.notes, jobs:S.jobs, essentials:S.essentials, comments:S.comments, inbox:S.inbox})); } catch {}
}
function loadCache(email){
  try {
    const c = JSON.parse(localStorage.getItem(CACHE)||'null');
    if (c && c.email===email){ const {email:_, ...rest} = c; Object.assign(S, rest); return true; }
  } catch {}
  return false;
}
function errText(error){
  if (!navigator.onLine) return 'No connection. Try again when you have signal.';
  if (error?.code==='42501' || /row-level security/i.test(error?.message||'')) return 'This account cannot change that.';
  return 'Could not save. Check the connection and try again.';
}
// Finished and deleted notes and jobs older than this stay in the database but are not loaded, so the app stays quick
// as the years add up. "Show older" in the Done lists brings them in for that session.
const KEEP_DAYS = 60;
async function load(table){
  const build = () => {
    let qry = S.sb.from(table).select('*');
    if (table==='inbox') return qry.order('created_at',{ascending:false}).limit(150);
    if ((table==='notes' || table==='jobs') && !S.older){
      const t = Date.now() - KEEP_DAYS*864e5;
      qry = qry.or('and(done.eq.false,deleted.eq.false),done_at.gte.'+t+',deleted_at.gte.'+t+',and(done.eq.true,done_at.is.null),and(deleted.eq.true,deleted_at.is.null)');
    }
    return qry.order(table==='members'? 'email' : 'id');
  };
  let data = [];
  for (let from = 0; ; from += 1000){                           // the database hands out at most 1000 rows per request
    const r = table==='inbox'? await build() : await build().range(from, from+999);
    if (r.error) return;
    data = data.concat(r.data);
    if (table==='inbox' || r.data.length < 1000) break;
  }
  S[table] = RAW.has(table) ? data : data.map(fromRow);
  saveCache(); render();
}
async function loadTeam(){
  const {data, error} = await S.sb.rpc('team');
  if (!error && data){ S.team = data; saveCache(); render(); }
}
let reloadTimers = {};
const reloadSoon = t => { clearTimeout(reloadTimers[t]); reloadTimers[t] = setTimeout(()=>load(t), 150); };

// Writes apply on screen straight away, then go to the server; on failure the table reloads.
async function insertRow(table, obj){
  S[table] = [...S[table], obj]; render();
  const {error} = await S.sb.from(table).insert(toRow(obj));
  if (error){ toast(errText(error)); reloadSoon(table); return false; }
  saveCache(); return true;
}
async function updateRow(table, id, patch){
  S[table] = S[table].map(x=>x.id===id? {...x, ...patch} : x); render();
  const {error} = await S.sb.from(table).update(toRow(patch)).eq('id', id);
  if (error){ toast(errText(error)); reloadSoon(table); return false; }
  saveCache(); return true;
}
async function deleteRow(table, id){
  S[table] = S[table].filter(x=>x.id!==id); render();
  const {error} = await S.sb.from(table).delete().eq('id', id);
  if (error){ toast(errText(error)); reloadSoon(table); return false; }
  saveCache(); return true;
}

/* ---------- note & job actions (done and delete hide; Archive / Done tab bring back) ---------- */
async function markDone(i){
  if (!canFinishNote(i)) return;
  if (await updateRow('notes', i.id, {done:true,doneAt:Date.now()})) toast('Marked done', ()=>updateRow('notes', i.id, {done:false,doneAt:null}));
}
async function softDelete(i){
  if (!canFinishNote(i)) return false;
  const ok = await updateRow('notes', i.id, {deleted:true,deletedAt:Date.now()});
  if (ok) toast('Deleted', ()=>updateRow('notes', i.id, {deleted:false,deletedAt:null}));
  return ok;
}
async function restore(i){
  if (!canFinishNote(i)) return;
  if (await updateRow('notes', i.id, i.deleted? {deleted:false,deletedAt:null} : {done:false,doneAt:null})) toast('Restored');
}
async function jobDone(j){
  if (!canClose()) return;
  if (await updateRow('jobs', j.id, {done:true,doneAt:Date.now()})) toast('Job done', ()=>updateRow('jobs', j.id, {done:false,doneAt:null}));
}
async function jobDelete(j){
  const ok = await updateRow('jobs', j.id, {deleted:true,deletedAt:Date.now()});
  if (ok) toast('Deleted', ()=>updateRow('jobs', j.id, {deleted:false,deletedAt:null}));
  return ok;
}
async function jobRestore(j){
  if (!canClose()) return;
  if (await updateRow('jobs', j.id, j.deleted? {deleted:false,deletedAt:null} : {done:false,doneAt:null})) toast('Restored');
}

/* ---------- routing ---------- */
function route(){
  const hsh = location.hash.slice(1);
  if (hsh.startsWith('job-')) return {name:'job', id:hsh.slice(4)};
  if (['settings','inbox'].includes(hsh)) return {name:hsh};
  if (S.role==='maintenance') return {name:'maintenance'};
  if (hsh.startsWith('note-')) return {name:'note', id:hsh.slice(5)};
  if (hsh==='maintenance') return {name:'maintenance'};
  if (hsh.startsWith('v-')) return {name:'venue', id:hsh.slice(2)};
  if (isOwner() && ['essentials','archive'].includes(hsh)) return {name:hsh};
  return {name:'home'};
}
const go = r => { S.depth++; location.hash = r; };
// Back returns to wherever she came from (a venue, Maintenance, the inbox), or home when opened directly.
const goBack = () => { if (S.depth>0){ S.depth--; history.back(); } else location.hash = ''; };
addEventListener('hashchange', ()=>{ render(true); scrollTo(0,0); });

/* ---------- views ---------- */
const app = document.getElementById('app');
const slots = {};

function render(force){
  if (!S.ready) return;
  const r = route();
  const key = r.name + (r.id||'') + S.role;
  if (force || key!==shellKey){ shellKey = key; buildShell(r); }
  fill(r);
}

function buildShell(r){
  app.replaceChildren();
  const append = (...els) => app.append(...els.filter(Boolean));
  const back = () => h('button',{class:'icon-btn','aria-label':'Back',onclick:goBack,html:I.back});
  const gear = () => h('button',{class:'icon-btn','aria-label':'Settings',onclick:()=>go('settings'),html:I.gear});
  const bell = () => (slots.bell = h('button',{class:'icon-btn bell','aria-label':'Inbox',onclick:()=>go('inbox')}));
  if (r.name==='home'){
    const today = new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    slots.maint = h('div',{});
    slots.now = h('div',{class:'group'}); slots.venues = h('div',{class:'grid'});
    slots.hero = isOwner()? h('div',{class:'hero'}) : null;
    slots.shortcuts = isOwner()? h('div',{class:'shortcuts'}) : null;
    append(
      h('div',{class:'top'}, h('div',{style:'flex:1;min-width:0'}, h('div',{class:'date'},today), h('h1',{},'Operations')), themeBtn(), bell(), gear()),
      (slots.ask = h('div',{})),
      slots.maint, isOwner()? h('div',{class:'mili-head'}, h('h2',{},'Mili')) : null, slots.hero, slots.now, slots.shortcuts,
      h('div',{class:'group'}, h('div',{class:'sec'}, h('h2',{}, S.role==='manager'? 'My areas' : 'Areas'), isOwner()? h('button',{onclick:()=>venueSheet(null)},'+ Add') : null), slots.venues));
  } else if (r.name==='venue'){
    slots.head = h('div',{class:'vhead'}); slots.open = h('div',{class:'items'}); slots.vjobs = h('div',{class:'group'});
    append(slots.head, noteForm(r.id), slots.open, slots.vjobs);
  } else if (r.name==='maintenance'){
    slots.tabs = h('div',{class:'seg',role:'tablist'});
    slots.list = h('div',{class:'group',style:'gap:26px'});
    const crew = S.role==='maintenance';   // for maintenance this is the home screen
    slots.ask = crew? h('div',{}) : null;
    append(h('div',{class:'top'}, crew? null : back(), h('h1',{},'Maintenance'), themeBtn(), crew? bell() : null, crew? gear() : null), slots.ask, jobForm(), slots.tabs, slots.list);
  } else if (r.name==='archive'){
    slots.tabs = h('div',{class:'seg',role:'tablist'});
    slots.list = h('div',{class:'list'});
    const q = h('input',{id:'archive-search',type:'search',class:'search',placeholder:'Search','aria-label':'Search done and deleted'});
    q.addEventListener('input',()=>{ S.archiveQ = q.value; render(); });
    q.value = S.archiveQ||'';
    append(h('div',{class:'top'}, back(), h('h1',{},'Archive')), slots.tabs, q, slots.list);
  } else if (r.name==='essentials'){
    slots.list = h('div',{class:'list'});
    append(h('div',{class:'top'}, back(), h('h1',{},'Essentials')), slots.list);
  } else if (r.name==='job' || r.name==='note'){
    slots.detail = h('div',{class:'group',style:'gap:14px'});
    slots.thread = h('div',{class:'thread'});
    append(h('div',{class:'top'}, back(), h('h1',{style:'font-size:22px'}, r.name==='job'?'Job':'Note'), slots.detailTools = h('div',{style:'display:flex;gap:6px'})),
      slots.detail, h('div',{class:'sec'}, h('h2',{},'Comments')), slots.thread, commentForm(r.name, r.id));
  } else if (r.name==='inbox'){
    slots.list = h('div',{class:'list'});
    append(h('div',{class:'top'}, back(), h('h1',{},'Inbox'),
      h('button',{class:'link',onclick:markAllRead},'Mark all read')), slots.list);
  } else if (r.name==='settings'){
    slots.people = h('div',{class:'group'});
    const myName = h('input',{id:'my-name',autocomplete:'name',placeholder:'Your name','aria-label':'Your name'});
    myName.value = S.team.find(t=>t.email===S.email)?.name || '';
    const saveName = async () => {
      const {error} = await S.sb.rpc('set_my_name',{new_name:myName.value});
      if (error) toast(errText(error)); else { toast('Name saved'); loadTeam(); if (isOwner()) load('members'); }
    };
    append(h('div',{class:'top'}, back(), h('h1',{},'Settings')),
      h('div',{class:'list'},
        h('div',{class:'add-member'}, h('label',{for:'my-name',class:'date'},'Your name'), h('div',{class:'add-bar',style:'flex-wrap:nowrap'}, myName, h('button',{class:'go',onclick:saveName},'Save'))),
        h('div',{class:'member'}, h('span',{class:'em'}, S.email), h('span',{class:'role',style:'--c:'+ROLE[S.role].c}, ROLE[S.role].label)),
        (slots.notif = h('div',{})),
        h('div',{class:'member'}, h('span',{class:'em'},'Appearance'), h('div',{class:'theme-pick'},
          ...[['dark','Dark'],['light','Light']].map(([t,l])=>h('button',{class:'pill',style:'--c:var(--accent)','aria-pressed':String(getTheme()===t),onclick:()=>setTheme(t)}, l))))),
      slots.people,
      h('div',{class:'list'},
        isOwner()? h('button',{class:'add-row',onclick:importSheet},'Import from the old board') : null,
        h('button',{class:'add-row',style:'color:var(--now)',onclick:signOut},'Sign out')));
  }
}

function venueTags(i){
  if (i.all) return h('div',{class:'chips-row'}, h('span',{class:'chip',style:'--c:var(--accent)'},h('i'),'All areas'));
  const ids = liveVids(i);
  if (!ids.length) return h('div',{class:'chips-row'}, h('span',{class:'chip',style:'--c:var(--muted)'},h('i'),'No area'));
  return h('div',{class:'chips-row'}, ids.map(id=>h('span',{class:'chip',style:'--c:'+vColor(id)},h('i'),venueName(id))));
}
const wrenchBadge = n => h('span',{class:'pw',html:I.wrench+n});
// Venue logos (white artwork, shown black in light mode), keyed by venue id so renaming a venue keeps its logo.
const LOGOS = new Set(['v1','v2','v3','v4','v5','v6','v7','v8','xmusti0bzrmndx','cleaning','design']);
const venueMark = v => LOGOS.has(v.id) ? h('img',{class:'vlogo',src:'logos/'+v.id+'.png',alt:v.name,decoding:'async'}) : h('b',{},v.name);

function fill(r){
  if (r.name==='home') fillHome();
  else if (r.name==='venue') fillVenue(r.id);
  else if (r.name==='maintenance') fillMaintenance();
  else if (r.name==='archive') fillArchive();
  else if (r.name==='essentials') fillEssentials();
  else if (r.name==='settings') fillSettings();
  else if (r.name==='job' || r.name==='note') fillDetail(r.name, r.id);
  else if (r.name==='inbox') fillInbox();
  if (slots.bell){ const n = unread(); slots.bell.innerHTML = I.bell + (n? '<span class="dot">'+(n>9?'9+':n)+'</span>' : ''); }
  setIconBadge(unread());
}

function fillHome(){
  fillPushAsk();
  const jo = openJobs(), late = jo.filter(isLate).length;
  const open = openNotes(), vs = areasForMe();
  const nowN = open.filter(i=>i.priority===1).length;
  if (slots.hero) slots.hero.replaceChildren(
    h('div',{class:'stats'},
      h('div',{class:'stat'}, h('b',{},String(nowN)), h('span',{},h('i',{style:'--c:var(--now)'}),'High')),
      h('div',{class:'stat'}, h('b',{},String(open.length)), h('span',{},h('i',{style:'--c:var(--soon)'}),'Open')),
      h('div',{class:'stat'}, h('b',{},String(jo.length)), h('span',{},h('i',{style:'--c:var(--fix)'}),'Jobs'))),
    open.length? h('div',{class:'spread','aria-label':'Open notes per area'},
      vs.map(v=>({v,n:openNotes(v.id).length})).filter(x=>x.n).map(x=>h('div',{style:'--c:'+vColor(x.v.id)+';flex:'+x.n,title:x.v.name}))) : null);

  slots.maint.replaceChildren(h('button',{class:'big',style:'--c:var(--fix)',onclick:()=>go('maintenance')},
    h('span',{class:'ic',html:I.wrench}),
    h('span',{class:'tx'}, h('b',{},'Maintenance'), h('small',{}, jo.length+' open', late? [' · ', h('em',{},late+' late')] : null)),
    h('span',{class:'chev',html:I.chev})));

  // Now = urgent notes plus anything pinned.
  const now = open.filter(i=>i.priority===1 || i.pinned).sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0) || byPrio(a,b));
  slots.now.replaceChildren();
  if (now.length) slots.now.append(h('div',{class:'sec'}, h('h2',{},'Now'), h('span',{class:'date'},String(now.length))),
    h('div',{class:'strip'}, now.map(nowCard)));

  if (slots.shortcuts) slots.shortcuts.replaceChildren(
    h('button',{class:'tile',style:'--c:var(--v7)',onclick:()=>go('essentials')}, h('span',{class:'ic',html:I.link}), h('span',{class:'tx'}, h('b',{},'Essentials'), h('small',{},String(S.essentials.length)))),
    h('button',{class:'tile only',style:'--c:var(--v3)','aria-label':'Archive',title:'Archive',onclick:()=>go('archive')}, h('span',{class:'ic',html:I.box})));

  slots.venues.replaceChildren();
  if (!vs.length) slots.venues.append(isOwner()
    ? h('button',{class:'add-venue',style:'grid-column:1/-1',onclick:()=>venueSheet(null),html:I.plus+'<span>Add your first area</span>'})
    : h('div',{class:'empty',style:'grid-column:1/-1'}, S.role==='manager'? 'No areas yet. Ask Mili to add you to your area in Settings.' : 'No areas yet.'));
  for (const v of vs){
    const vo = openNotes(v.id), vn = vo.filter(i=>i.priority===1).length, vf = openJobs(v.id).length;
    slots.venues.append(h('button',{class:'venue'+(vo.length||vf?'':' calm'),style:'--c:'+vColor(v.id),'aria-label':v.name,onclick:()=>go('v-'+v.id)},
      venueMark(v),
      h('span',{class:'n'}, vo.length||vf? [vn? h('span',{class:'pw red'},String(vn)) : null, vo.length? h('span',{class:'pw'},String(vo.length)) : null, vf? wrenchBadge(vf) : null]
                                         : h('span',{class:'clear'},'All clear'))));
  }
}

function fillVenue(id){
  const v = S.venues.find(x=>x.id===id);
  if (!v){ slots.head.replaceChildren(h('div',{class:'bar'}, h('button',{class:'round','aria-label':'Back',onclick:()=>go(''),html:I.back})), h('h1',{},'Area removed')); slots.open.replaceChildren(); slots.vjobs.replaceChildren(); return; }
  const vo = openNotes(id).sort(byPrio), vn = vo.filter(i=>i.priority===1).length, vj = openJobs(id).sort(byJob);
  slots.head.style.setProperty('--c', vColor(id));
  slots.head.replaceChildren(
    h('div',{class:'bar'},
      h('button',{class:'round','aria-label':'Back',onclick:goBack,html:I.back}),
      isOwner()? h('button',{class:'round','aria-label':'Rename area',onclick:()=>venueSheet(v),html:I.edit}) : h('span',{})),
    h('h1',{},v.name),
    h('div',{class:'n'}, vn? h('span',{class:'pw red'},vn+' high') : null, h('span',{class:'pw'},vo.length+' open'), vj.length? h('span',{class:'pw'},vj.length+(vj.length>1?' jobs':' job')) : null));
  slots.open.replaceChildren(...(vo.length? vo.map(i=>itemRow(i)) : [h('div',{class:'empty'},'Nothing open here.')]));
  slots.vjobs.replaceChildren(...(vj.length? [h('div',{class:'sub-h',html:I.wrench+'<span>Maintenance</span>'}), h('div',{class:'items'}, vj.map(j=>jobRow(j,false)))] : []));
}

function fillMaintenance(){
  fillPushAsk();
  const tab = S.jobTab;
  const closed = S.jobs.filter(j=>j.done||j.deleted);
  slots.tabs.replaceChildren(...[['open','Open · '+openJobs().length],['closed','Done · '+closed.length]].map(([t,label])=>
    h('button',{role:'tab','aria-selected':String(t===tab),onclick:()=>{S.jobTab=t; render();}},label)));
  slots.list.replaceChildren();
  if (tab==='closed'){
    const list = closed.sort((a,b)=>((b.deletedAt||b.doneAt||0)-(a.deletedAt||a.doneAt||0)));
    slots.list.append(h('div',{class:'list'}, ...(list.length? list.map(j=>closedJobRow(j)) : [h('div',{class:'empty'},'No finished jobs yet.')])), olderLink());
    return;
  }
  const all = openJobs().sort(byJob);
  if (!all.length){ slots.list.append(h('div',{class:'empty'},'No maintenance jobs open.')); return; }
  const section = (label, c, jobs, showVenue) => jobs.length && slots.list.append(h('div',{class:'group'},
    h('div',{class:'group-h',style:'--c:'+c}, h('i'), label, h('small',{}, jobs.length+(jobs.length>1?' jobs':' job'))),
    h('div',{class:'items'}, jobs.map(j=>jobRow(j,showVenue)))));
  section('All areas','var(--accent)', all.filter(j=>j.all), false);
  const rest = all.filter(j=>!j.all);
  for (const v of [...S.venues].sort(byOrder)) section(v.name, vColor(v.id), rest.filter(j=>{ const l=liveVids(j); return l.length===1 && l[0]===v.id; }), false);
  section('Several areas','var(--muted)', rest.filter(j=>liveVids(j).length>1), true);
  section('No area','var(--line)', rest.filter(j=>!liveVids(j).length), false);
}

const olderLink = () => { document.querySelector('.older')?.remove(); return S.older? '' : h('button',{class:'link older',style:'align-self:center;color:var(--muted);padding:12px;width:100%;text-align:center',
  onclick:()=>{ S.older = true; toast('Loading older items…'); load('notes'); load('jobs'); }},'Show items finished more than '+KEEP_DAYS+' days ago'); };
function fillArchive(){
  const tab = S.archiveTab;
  const pool = S.notes.filter(i=> tab==='deleted' ? i.deleted : (i.done && !i.deleted));
  const counts = {done:S.notes.filter(i=>i.done&&!i.deleted).length, deleted:S.notes.filter(i=>i.deleted).length};
  slots.tabs.replaceChildren(...['done','deleted'].map(t=>h('button',{role:'tab','aria-selected':String(t===tab),onclick:()=>{S.archiveTab=t; render();}},
    (t==='done'?'Done':'Deleted')+' · '+counts[t])));
  const q = (S.archiveQ||'').trim().toLowerCase();
  const at = i => tab==='deleted'? i.deletedAt : i.doneAt;
  const list = pool.filter(i=>!q || ((i.text||'')+' '+venueTag(i)).toLowerCase().includes(q)).sort((a,b)=>(at(b)||0)-(at(a)||0));
  const empty = q? 'Nothing matches.' : tab==='deleted'? 'Nothing deleted.' : 'Nothing marked done yet.';
  slots.list.replaceChildren(...(list.length? list.map(i=>archiveRow(i, at(i))) : [h('div',{class:'empty'},empty)]), olderLink());
}

function fillEssentials(){
  const rows = [...S.essentials].sort(byOrder).map(infoRow);
  slots.list.replaceChildren(...rows, h('button',{class:'add-row',onclick:()=>infoSheet(null),html:I.plus+'<span>Add</span>'}));
}

function rolePills(start, onChange){
  let role = start;
  const keys = ['maintenance','manager','admin','owner'];
  const pills = keys.map(r=>h('button',{type:'button',class:'pill',style:'--c:'+ROLE[r].c,'aria-pressed':String(r===role),
    onclick:()=>{ role=r; pills.forEach((b,k)=>b.setAttribute('aria-pressed',String(keys[k]===r))); onChange?.(r); }}, h('i'), ROLE[r].label));
  return {el:h('div',{class:'prio',style:'flex-wrap:wrap'},pills), value:()=>role};
}
function fillSettings(){
  if (!slots.notif._done){ slots.notif._done = true; fillNotifications(); }
  if (!isOwner()){ slots.people.replaceChildren(); return; }
  if (!slots.people._built){
    slots.people._built = true;
    slots.memberList = h('div',{class:'list'});
    const email = h('input',{id:'new-member',type:'email',autocomplete:'off',placeholder:'name@company.com','aria-label':'Email'});
    const name = h('input',{id:'new-member-name',autocomplete:'off',placeholder:'Name','aria-label':'Name'});
    const venues = venueChips([]); venues.hidden = true;
    const roles = rolePills('maintenance', r=>{ venues.hidden = r!=='manager'; });
    const add = h('button',{class:'go',style:'margin-left:auto',onclick:async()=>{
      const e = email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ toast('Enter an email address.'); return; }
      const row = {email:e, name:name.value.trim()||null, role:roles.value(), venue_ids: roles.value()==='manager'? venues.value() : []};
      if (await insertRow('members', row)){ email.value=''; name.value=''; venues.reset(); loadTeam(); toast('Added. They can now create their account.'); }
    }},'Add');
    slots.people.append(h('div',{class:'sec'}, h('h2',{},'People')), slots.memberList,
      h('div',{class:'list'}, h('div',{class:'add-member'}, email, name, roles.el, venues, add)),
      h('p',{class:'date',style:'margin:0'},'Maintenance: jobs, can finish them. Manager: their areas’ tasks (can finish those) and jobs (cannot finish jobs). Admin: adds jobs and assigns tasks, cannot finish anything, does not see Mili’s private notes. Owner: everything.'));
  }
  const ms = [...S.members].sort((a,b)=>a.role.localeCompare(b.role)||(a.name||a.email).localeCompare(b.name||b.email));
  slots.memberList.replaceChildren(...ms.map(m=>h('div',{class:'member',role:'button',tabindex:'0',style:'cursor:pointer',onclick:()=>memberSheet(m)},
    h('span',{class:'em'}, h('b',{},m.name||m.email.split('@')[0]), h('small',{class:'date',style:'display:block'}, m.email +
      (m.role==='manager' && m.venue_ids?.length? ' · '+m.venue_ids.map(venueName).join(', ') : ''))),
    h('span',{class:'role',style:'--c:'+ROLE[m.role].c}, ROLE[m.role].label))));
}
function memberSheet(m){
  const name = h('input',{id:'m-name',autocomplete:'off'}); name.value = m.name||'';
  const venues = venueChips(m.venue_ids||[]); venues.hidden = m.role!=='manager';
  const roles = rolePills(m.role, r=>{ venues.hidden = r!=='manager'; });
  const self = m.email===S.email;
  sheet(m.email, [field('Name',name), self? null : h('div',{class:'field'}, h('label',{},'Role'), roles.el), h('div',{class:'field'}, venues.hidden? null : h('label',{},'Areas'), venues)],
    async ()=>{
      const patch = {name:name.value.trim()||null, role: self? m.role : roles.value(), venue_ids: (self? m.role : roles.value())==='manager'? venues.value() : []};
      const {error} = await S.sb.from('members').update(patch).eq('email', m.email);
      if (error){ toast(errText(error)); return false; }
      load('members'); loadTeam(); return true;
    },
    self? null : async ()=>{
      const {error} = await S.sb.from('members').delete().eq('email', m.email);
      if (error){ toast(errText(error)); return false; }
      toast('Removed'); load('members'); loadTeam(); return true;
    });
}

/* ---------- details & comments ---------- */
function fillDetail(kind, id){
  const it = (kind==='job'? S.jobs : S.notes).find(x=>x.id===id);
  if (!it){
    slots.detailTools.replaceChildren(); slots.thread.replaceChildren();
    slots.detail.replaceChildren(h('div',{class:'empty'},'This item no longer exists.'));
    return;
  }
  const P = PRIO[it.priority||2];
  slots.detailTools.replaceChildren(h('button',{class:'icon-btn','aria-label':'Edit',html:I.edit,onclick:()=> kind==='job'? jobSheet(it) : itemSheet(it)}));
  const meta = [['Where', venueTags(it)], ['Priority', h('span',{class:'chip',style:'--c:'+P.c},h('i'),P.label)]];
  if (it.due) meta.push(['Due', dueChip(it)]);
  if (kind==='note' && it.assignee) meta.push(['For', nameOf(it.assignee)]);
  meta.push(['Added', (it.createdBy? nameOf(it.createdBy)+' · ' : '')+when(it.createdAt)]);
  if (it.done) meta.push(['Done', (it.doneBy? nameOf(it.doneBy)+' · ' : '')+when(it.doneAt)]);
  if (it.deleted) meta.push(['Deleted', when(it.deletedAt)]);
  const mayClose = kind==='note' ? canFinishNote(it) : canClose();
  let action = null;
  if (mayClose){
    if (it.done || it.deleted) action = h('button',{class:'btn',onclick:()=> kind==='job'? jobRestore(it) : restore(it)},'Restore');
    else action = h('button',{class:'btn primary',style:'margin-left:0',onclick:()=> kind==='job'? jobDone(it) : markDone(it),html:I.tick+'<span>Mark done</span>'});
  }
  slots.detail.replaceChildren(
    h('div',{class:'dcard',style:'--c:'+P.c},
      it.text? h('p',{class:'dtext'},linkify(it.text)) : null,
      thumbs(it.photos),
      h('dl',{class:'dmeta'}, meta.map(([k,v])=>[h('dt',{},k), h('dd',{},v)]))),
    action);
  const cs = commentsFor(kind,id);
  slots.thread.replaceChildren(...(cs.length? cs.map(commentRow) : [h('div',{class:'empty'},'No comments yet.')]));
  markReadFor(kind,id);
}
function commentRow(c){
  const mine = c.author===S.email;
  let armed = false;
  const del = (mine || isOwner()) ? h('button',{class:'link',style:'color:var(--muted);font-size:12px',onclick:async()=>{
    if (!armed){ armed = true; del.textContent = 'Delete?'; del.style.color = 'var(--now)'; return; }
    await deleteRow('comments', c.id);
  }},'Delete') : null;
  return h('div',{class:'cmt'+(mine?' mine':'')},
    h('div',{class:'cmeta'}, h('b',{},nameOf(c.author)), h('span',{},when(c.created_at)), del),
    c.body? h('p',{},linkify(c.body)) : null, thumbs(c.attachments));
}
function commentForm(kind, id){
  const c = composer('Write a comment…','cmt-'+id, kind==='job'? 'jobs' : 'notes');
  c.btn.textContent = 'Send';
  c.more.append(c.pics.strip, c.pics.input, h('div',{class:'add-bar'}, c.pics.button, c.btn));
  bindSubmit(c, async ()=>{
    const body = c.ta.value.trim(), attachments = c.pics.value();
    if (!body && !attachments.length) return;
    c.ta.value=''; c.grow();
    const row = {id:newId(), [kind==='job'?'job_id':'note_id']:id, body, attachments, author:S.email, created_at:new Date().toISOString()};
    if (!await insertRow('comments', row)){ c.ta.value=body; c.grow(); return; }
    c.pics.reset(); c.grow();
  });
  return c.form;
}
async function markReadFor(kind, id){
  const key = kind==='job'? 'job_id' : 'note_id';
  const ids = S.inbox.filter(n=>!n.read_at && n[key]===id).map(n=>n.id);
  if (!ids.length) return;
  const now = new Date().toISOString();
  S.inbox = S.inbox.map(n=>ids.includes(n.id)? {...n, read_at:now} : n);
  await S.sb.from('inbox').update({read_at:now}).in('id', ids);
  saveCache();
}
async function markAllRead(){
  const now = new Date().toISOString();
  S.inbox = S.inbox.map(n=>n.read_at? n : {...n, read_at:now}); render();
  await S.sb.from('inbox').update({read_at:now}).is('read_at', null);
  saveCache();
}
function fillInbox(){
  if (!S.inbox.length){ slots.list.replaceChildren(h('div',{class:'empty'},'Nothing yet. Comments and job updates for you show up here.')); return; }
  slots.list.replaceChildren(...S.inbox.map(n=>{
    const item = n.job_id? S.jobs.find(j=>j.id===n.job_id) : S.notes.find(x=>x.id===n.note_id);
    const what = {comment:nameOf(n.actor)+' commented', new_job:'New job from '+nameOf(n.actor), job_done:nameOf(n.actor)+' finished a job',
      task:'New task from '+nameOf(n.actor), task_done:nameOf(n.actor)+' finished a task'}[n.kind] || 'Update';
    const icon = n.kind==='comment'? I.chat : n.kind==='new_job'? I.wrench : n.kind==='task'? I.pin : I.tick;
    const title = item?.text || n.preview || '';
    return h('button',{class:'inrow'+(n.read_at?'':' unread'),onclick:()=>go((n.job_id?'job-'+n.job_id:'note-'+n.note_id))},
      h('span',{class:'ic',html:icon}),
      h('span',{class:'tx'}, h('b',{},what), title? h('span',{class:'pv'}, title) : null,
        n.kind==='comment' && n.preview && n.preview!==title? h('span',{class:'pv q'},'"'+n.preview+'"') : null),
      h('span',{class:'date'}, when(n.created_at)));
  }));
}

/* ---------- push notifications (opt-in per phone; rules live in the server sender) ---------- */
let lastBadge = -1;
function setIconBadge(n){
  if (n===lastBadge || !('setAppBadge' in navigator)) return;
  lastBadge = n;
  (n? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(()=>{});
}
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const keyBytes = b64 => { const s = atob((b64+'='.repeat((4-b64.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/')); return Uint8Array.from(s, c=>c.charCodeAt(0)); };
async function mySubscription(){
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}
async function pushStatus(){
  if (isIOS && !installed()) return 'install';
  if (!pushSupported() || !(window.OPS_CONFIG||{}).vapidPublicKey) return 'unsupported';
  if (Notification.permission==='denied') return 'blocked';
  const sub = await mySubscription();
  return sub && Notification.permission==='granted' && S.pushEnabled ? 'on' : 'off';
}
async function turnOnPush(){
  try {
    const perm = await Notification.requestPermission();
    if (perm!=='granted'){ toast('Notifications were not allowed.'); return; }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:keyBytes(window.OPS_CONFIG.vapidPublicKey)});
    const j = sub.toJSON();
    const {error} = await S.sb.rpc('save_push_subscription',{p_endpoint:j.endpoint, p_p256dh:j.keys.p256dh, p_auth:j.keys.auth, p_user_agent:navigator.userAgent});
    if (error) throw error;
    await S.sb.rpc('set_my_push',{enabled:true}); S.pushEnabled = true;
    toast('Notifications on');
  } catch { toast('Could not turn on notifications. Try again.'); }
  fillNotifications();
}
async function turnOffPush(){
  const {error} = await S.sb.rpc('set_my_push',{enabled:false});
  if (error){ toast(errText(error)); return; }
  S.pushEnabled = false; toast('Notifications off'); fillNotifications();
}
// Every open: if this phone already allowed notifications, make sure the server has its current address.
// (Phones occasionally renew it, and this also repairs a registration that was removed.)
async function refreshPushRegistration(){
  try {
    if (!pushSupported() || Notification.permission!=='granted' || !S.pushEnabled || !(window.OPS_CONFIG||{}).vapidPublicKey) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:keyBytes(window.OPS_CONFIG.vapidPublicKey)});
    const j = sub.toJSON();
    await S.sb.rpc('save_push_subscription',{p_endpoint:j.endpoint, p_p256dh:j.keys.p256dh, p_auth:j.keys.auth, p_user_agent:navigator.userAgent});
  } catch {}
}
// A one-time card asking to turn notifications on (phones require a tap to allow them; this makes it one tap).
const ASK_KEY = 'ops-push-asked';
async function fillPushAsk(){
  const box = slots.ask; if (!box || box._done) return; box._done = true;
  let asked = false; try { asked = !!localStorage.getItem(ASK_KEY); } catch {}
  if (asked || !pushSupported() || (isIOS && !installed()) || Notification.permission!=='default' || !(window.OPS_CONFIG||{}).vapidPublicKey) return;
  const dismiss = () => { try { localStorage.setItem(ASK_KEY,'1'); } catch {} box.replaceChildren(); };
  box.replaceChildren(h('div',{class:'ask'},
    h('span',{class:'ic',html:I.bell}),
    h('span',{class:'tx'}, h('b',{},'Turn on notifications?'), h('small',{}, isOwner()||S.role==='manager' ? 'Hear about new comments on your jobs.' : 'Hear about new jobs and comments.')),
    h('div',{class:'ask-actions'},
      h('button',{class:'go',onclick:async()=>{ dismiss(); await turnOnPush(); }},'Turn on'),
      h('button',{class:'link',style:'color:var(--muted)',onclick:dismiss},'Not now'))));
}
async function fillNotifications(){
  const box = slots.notif; if (!box) return;
  const st = await pushStatus();
  const text = {install:'To get notifications on iPhone, add Operations to your Home Screen (Share → Add to Home Screen) and open it from there.',
    unsupported:'This browser cannot show notifications.', blocked:'Notifications are blocked. Allow them for Operations in your phone settings.',
    on:'On. You get new comments and, for maintenance, new jobs.', off:'Off. Turn on to hear about new comments on your jobs.'}[st];
  box.replaceChildren(h('div',{class:'member'}, h('span',{class:'em'}, h('b',{},'Notifications'), h('small',{class:'date',style:'display:block'}, text)),
    st==='on'? h('button',{class:'pill',style:'--c:var(--accent)',onclick:turnOffPush},'Turn off')
    : st==='off'? h('button',{class:'pill',style:'--c:var(--accent)','aria-pressed':'true',onclick:turnOnPush},'Turn on') : null));
}

/* ---------- rows ---------- */
const commentBadge = (kind,id) => { const n = commentsFor(kind,id).length; return n? h('span',{class:'cbadge',html:I.chat+n}) : null; };
// "→ Sofia" on tasks given to someone else; "from Mili" on tasks someone gave me.
function forWhom(i){
  if (i.assignee && i.assignee!==S.email) return h('span',{class:'who'}, '→ '+nameOf(i.assignee));
  if (i.assignee===S.email && i.createdBy && i.createdBy!==S.email) return h('span',{class:'who'}, 'from '+nameOf(i.createdBy));
  return null;
}
function itemRow(i){
  const open = () => go('note-'+i.id);
  const tick = canFinishNote(i);
  return h('div',{class:'it'+(tick?'':' nocheck'),style:'--c:'+PRIO[i.priority||2].c},
    tick? h('button',{class:'check','aria-label':'Mark as done',html:I.tick,onclick:()=>markDone(i)}) : null,
    h('div',{class:'txt',role:'button',tabindex:'0',onclick:open,onkeydown:e=>{ if(e.key==='Enter') open(); }},
      forWhom(i), i.text? h('span',{},linkify(i.text)) : null, thumbs(i.photos)),
    h('span',{class:'meta'}, commentBadge('note',i.id), age(i.createdAt)));
}
function jobRow(j, showVenue){
  const open = () => go('job-'+j.id);
  return h('div',{class:'it'+(canClose()?'':' nocheck'),style:'--c:'+JPRIO[j.priority||2].c},
    canClose()? h('button',{class:'check','aria-label':'Mark job done',html:I.tick,onclick:()=>jobDone(j)}) : null,
    h('div',{class:'txt',role:'button',tabindex:'0',onclick:open,onkeydown:e=>{ if(e.key==='Enter') open(); }},
      showVenue? venueTags(j) : null, j.text? h('span',{},linkify(j.text)) : null, thumbs(j.photos)),
    h('span',{class:'meta'}, commentBadge('job',j.id), dueChip(j) || age(j.createdAt)));
}
function closedJobRow(j){
  return h('div',{class:'row-a'},
    h('div',{class:'txt',role:'button',tabindex:'0',style:'cursor:pointer',onclick:()=>go('job-'+j.id)}, h('span',{class:'date'}, venueTag(j)+' · '+shortDate(j.deletedAt||j.doneAt),
        j.deleted? [' · ', h('span',{class:'tag-del'},'Deleted')] : (isOwner() && j.doneBy? ' · Done by '+nameOf(j.doneBy) : null)),
      j.text? h('span',{},linkify(j.text)) : null, thumbs(j.photos)),
    canClose()? h('button',{class:'restore',onclick:()=>jobRestore(j)},'Restore') : null);
}
function nowCard(i){
  const first = liveVids(i)[0];
  return h('div',{class:'nowcard',role:'button',tabindex:'0',style:'--c:'+(first? vColor(first) : 'var(--muted)'),
      onclick:()=>go('note-'+i.id), onkeydown:e=>{ if(e.key==='Enter') go('note-'+i.id); }},
    venueTags(i),
    h('p',{}, i.text || 'Photo'),
    h('div',{class:'foot'}, h('span',{class:'meta'}, forWhom(i), age(i.createdAt)),
      canFinishNote(i)? h('button',{class:'check',style:'--c:'+PRIO[i.priority||2].c,'aria-label':'Mark as done',html:I.tick,onclick:e=>{ e.stopPropagation(); markDone(i); }}) : null));
}
function archiveRow(i, at){
  return h('div',{class:'row-a'},
    h('div',{class:'txt',role:'button',tabindex:'0',style:'cursor:pointer',onclick:()=>go('note-'+i.id)}, h('span',{class:'date'},venueTag(i)+' · '+shortDate(at)), i.text? h('span',{},linkify(i.text)) : null, thumbs(i.photos)),
    h('button',{class:'restore',onclick:()=>restore(i)},'Restore'));
}
function infoRow(n){
  return h('div',{class:'info'},
    h('div',{class:'body',role:'button',tabindex:'0',onclick:()=>infoSheet(n)},
      h('span',{class:'k'},n.label||'Untitled'),
      h('span',{class:'v'}, n.value? linkify(n.value) : '—')),
    h('button',{class:'icon-btn','aria-label':'Copy '+(n.label||''),html:I.copy,onclick:()=>{
      navigator.clipboard?.writeText(n.value||'').then(()=>toast('Copied'),()=>toast('Copy blocked. Tap the row to select it.'));
    }}));
}

/* ---------- pickers ---------- */
function prioPills(table, start, typeButton){
  let val = start;
  const pills = [1,2,3].map(p=>h('button',{type:typeButton?'button':null,class:'pill',style:'--c:'+table[p].c,'aria-pressed':String(p===val),
    onclick:()=>{ val=p; pills.forEach((b,k)=>b.setAttribute('aria-pressed',String(k+1===p))); }}, h('i'), table[p].label));
  return {el:h('div',{class:'prio'},pills), value:()=>val, reset:()=>{ val=start; pills.forEach((b,k)=>b.setAttribute('aria-pressed',String(k+1===start))); }};
}
function venueChips(selected){
  const chosen = new Set(selected);
  const el = h('div',{class:'chips'}, [...S.venues].sort(byOrder).map(v=>{
    const b = h('button',{type:'button',class:'pill v',style:'--c:'+vColor(v.id),'aria-pressed':String(chosen.has(v.id)),onclick:()=>{
      chosen.has(v.id)?chosen.delete(v.id):chosen.add(v.id); b.setAttribute('aria-pressed',String(chosen.has(v.id)));
    }}, h('i'), v.name);
    return b;
  }));
  el.value = () => S.venues.filter(v=>chosen.has(v.id)).map(v=>v.id);
  el.reset = () => { chosen.clear(); el.querySelectorAll('.pill').forEach(b=>b.setAttribute('aria-pressed','false')); };
  return el;
}
// "All venues" toggle plus individual venue ticks (none, one or several).
function venuePicker(selected, all){
  let isAll = !!all;
  const chips = venueChips(selected);
  const allBtn = h('button',{type:'button',class:'pill all','aria-pressed':String(isAll),onclick:()=>{ isAll=!isAll; sync(); }}, h('i'),'All areas');
  const sync = () => { allBtn.setAttribute('aria-pressed',String(isAll)); chips.classList.toggle('dim',isAll); };
  sync();
  chips.prepend(allBtn);
  return {el:chips, value:()=>({all:isAll, venueIds:isAll? [] : chips.value()}), reset:()=>{ isAll=false; chips.reset(); sync(); }};
}
// "Due" opens a small panel: a visible date field (native picker on tap) plus quick picks.
function duePicker(start){
  let val = start||'';
  const inp = h('input',{type:'date',class:'date-in','aria-label':'Due date'}); inp.value = val;
  const txt = h('span',{});
  const btn = h('button',{type:'button',class:'pill due-pick'}, h('span',{html:I.cal,style:'display:flex'}), txt);
  const set = v => { val = v||''; inp.value = val; sync(); };
  const quick = (label, days) => h('button',{type:'button',class:'pill',style:'--c:var(--soon)',onclick:()=>{ const d = new Date(); d.setDate(d.getDate()+days); set(ymd(d)); }}, label);
  const panel = h('div',{class:'due-panel',hidden:true}, inp, quick('Today',0), quick('Tomorrow',1), quick('Next week',7),
    h('button',{type:'button',class:'link',onclick:()=>set('')},'Clear'));
  const sync = () => {
    btn.setAttribute('aria-pressed',String(!!val));
    txt.textContent = val ? dueChip({due:val}).textContent.replace(/^Late · /,'') : 'Due';
  };
  btn.addEventListener('click',()=>{ panel.hidden = !panel.hidden; });
  inp.addEventListener('change',()=>set(inp.value));
  inp.addEventListener('input',()=>set(inp.value));
  sync();
  return {el:btn, panel, value:()=>val||null, reset:()=>{ set(''); panel.hidden = true; }};
}

// The add box shows only its text field until she starts typing; the options open with it.
document.addEventListener('pointerdown', e=>{
  document.querySelectorAll('.add.open').forEach(f=>{ if (!f.contains(e.target) && f._idle()) f.classList.remove('open'); });
});
function composer(placeholder, id, folder){
  const ta = h('textarea',{id,rows:'1',placeholder,'aria-label':placeholder});
  const btn = h('button',{class:'go',disabled:true},'Add');
  const pics = photoPicker([], folder);
  const more = h('div',{class:'more'});
  const form = h('div',{class:'add'}, ta, more);
  const grow = ()=>{ ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px'; btn.disabled=!ta.value.trim() && !pics.value().length; };
  pics.onchange = grow;
  form._idle = () => !ta.value.trim() && !pics.value().length && !pics.busy();
  ta.addEventListener('focus',()=>form.classList.add('open'));
  ta.addEventListener('input',()=>{ form.classList.add('open'); grow(); });
  return {form, ta, btn, pics, more, grow};
}
function bindSubmit(c, submit){
  c.ta.addEventListener('keydown',e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(); }});
  c.btn.addEventListener('click',submit);
}

// "Assign to": the current managers of the area(s), straight from Settings → People.
function assigneePicker(areaIds, start){
  let val = start || null;
  const el = h('div',{class:'assign'});
  const draw = () => {
    const ids = typeof areaIds==='function' ? areaIds() : areaIds;
    const mgrs = managersOf(ids);
    if (val && !mgrs.some(m=>m.email===val)){ const cur = S.team.find(t=>t.email===val); if (cur) mgrs.push(cur); }
    el.hidden = !mgrs.length && !val;
    const opts = [{email:null}, ...mgrs];
    el.replaceChildren(h('span',{class:'date'},'Assign to'), ...opts.map(m=>h('button',{type:'button',class:'pill',style:'--c:var(--v3)','aria-pressed':String(val===m.email),
      onclick:()=>{ val = m.email; draw(); }}, m.email? nameOf(m.email) : (isOwner()? 'Private' : 'Nobody'))));
  };
  draw();
  return {el, value:()=>val, reset:()=>{ val = null; draw(); }, redraw:draw};
}
// A note inside an area. Owners and admins can assign it to one of the area's managers; managers' notes are their own tasks.
// The wrench turns it into a maintenance job for this area instead.
function noteForm(venueId){
  let pick = null;
  const folder = () => (S.role!=='owner' || pick?.value()) ? 'tasks' : 'notes';
  const c = composer(S.role==='manager'? 'Add a task…' : 'Add a note…','add-'+venueId, folder);
  pick = canAssign()? assigneePicker([venueId], null) : null;
  const prio = prioPills(PRIO,2);
  let asJob = false;
  const tool = h('button',{class:'pill tool','aria-pressed':'false','aria-label':'Make it a maintenance job',title:'Maintenance job',html:I.wrench,
    onclick:()=>{ asJob=!asJob; tool.setAttribute('aria-pressed',String(asJob)); }});
  c.more.append(c.pics.strip, c.pics.input, pick? pick.el : null, h('div',{class:'add-bar'}, prio.el, tool, c.pics.button, c.btn));
  bindSubmit(c, async ()=>{
    const text = c.ta.value.trim(), photos = c.pics.value();
    if (!text && !photos.length) return;
    if (asJob && photos.length){ toast('Add job photos from the Maintenance page.'); return; }
    if (photos.length && folder()==='notes' && pick?.value()){ toast('Remove the photo or add it after assigning.'); return; }
    c.ta.value=''; c.grow();
    const ok = asJob
      ? await insertRow('jobs',{id:newId(),text,venueIds:[venueId],all:false,priority:prio.value(),due:null,photos:[],done:false,deleted:false,createdAt:Date.now()})
      : await insertRow('notes',{id:newId(),venueIds:[venueId],text,photos,priority:prio.value(),pinned:false,done:false,deleted:false,createdAt:Date.now(),
          createdBy:S.email, assignee: S.role==='manager'? S.email : (pick? pick.value() : null)});
    if (!ok){ c.ta.value=text; c.grow(); return; }
    if (asJob) toast('Added to Maintenance');
    dropPhotos(c.pics.removed); c.pics.reset(); c.grow(); pick?.reset();
    asJob=false; tool.setAttribute('aria-pressed','false');
  });
  return c.form;
}
function jobForm(){
  const c = composer('Add a maintenance job…','add-job','jobs');
  const prio = prioPills(JPRIO,2), where = venuePicker([],false), due = duePicker(null);
  c.more.append(c.pics.strip, c.pics.input, where.el, h('div',{class:'add-bar'}, prio.el, due.el, c.pics.button, c.btn), due.panel);
  bindSubmit(c, async ()=>{
    const text = c.ta.value.trim(), photos = c.pics.value();
    if (!text && !photos.length) return;
    c.ta.value=''; c.grow();
    const ok = await insertRow('jobs',{id:newId(),text,...where.value(),priority:prio.value(),due:due.value(),photos,done:false,deleted:false,createdAt:Date.now()});
    if (!ok){ c.ta.value=text; c.grow(); return; }
    dropPhotos(c.pics.removed); c.pics.reset(); where.reset(); due.reset(); prio.reset(); c.grow();
  });
  return c.form;
}

/* ---------- links & photos ----------
   Photos are shrunk on the phone and stored in the private "photos" bucket: notes/… (owners) or jobs/… (team).
   A note or job keeps the paths in its photos array; images load through short-lived signed links. */
const URL_RE = /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)\]'"])/gi;
function linkify(text){
  const out = []; let last = 0;
  for (const m of text.matchAll(URL_RE)){
    out.push(text.slice(last, m.index));
    const href = /^www\./i.test(m[0]) ? 'https://'+m[0] : m[0];
    out.push(h('a',{href,target:'_blank',rel:'noopener noreferrer',onclick:e=>e.stopPropagation()}, m[0]));
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}
const MAX_VIDEO = 50*1024*1024;   // Supabase free plan: 50 MB per file
const photoCache = new Map();
function photoSrc(path){
  if (!photoCache.has(path)) photoCache.set(path, S.sb.storage.from('photos').createSignedUrl(path, 60*60*24)
    .then(({data})=>data?.signedUrl || null).catch(()=>{ photoCache.delete(path); return null; }));
  return photoCache.get(path);
}
function photoImg(path){
  const img = h('img',{alt:'Photo',loading:'lazy'});
  photoSrc(path).then(src=>{ if (src) img.src = src; else img.classList.add('missing'); });
  return img;
}
// Video tiles show a still frame with a play button. New videos get a frame saved next to them (<video>.jpg);
// older ones without it fall back to the video's own first frame.
function videoThumb(p){
  const box = h('span',{class:'vid'}, h('span',{class:'play',html:I.play}));
  photoSrc(p+'.jpg').then(src=>{
    if (src){ box.prepend(h('img',{src,alt:''})); return; }
    photoSrc(p).then(vs=>{ if (vs) box.prepend(h('video',{src:vs+'#t=0.1',muted:true,playsinline:true,preload:'metadata','aria-hidden':'true'})); });
  });
  return box;
}
const mediaThumb = p => isVideo(p) ? videoThumb(p) : photoImg(p);
// Grab a still frame from a video on the phone (best effort; some formats cannot be read, then there is simply no poster).
function videoPoster(file){
  return new Promise(resolve=>{
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    let done = false;
    const finish = blob => { if (done) return; done = true; URL.revokeObjectURL(url); v.removeAttribute('src'); v.load(); resolve(blob); };
    setTimeout(()=>finish(null), 6000);
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.addEventListener('loadeddata', ()=>{ try { v.currentTime = Math.min(0.5, (v.duration||1)/3); } catch { finish(null); } });
    v.addEventListener('seeked', ()=>{
      try {
        const k = Math.min(1, 640/Math.max(v.videoWidth, v.videoHeight||1));
        const c = document.createElement('canvas'); c.width = Math.round(v.videoWidth*k); c.height = Math.round(v.videoHeight*k);
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(b=>finish(b), 'image/jpeg', 0.75);
      } catch { finish(null); }
    });
    v.addEventListener('error', ()=>finish(null));
    v.src = url; v.load();
  });
}
function thumbs(paths){
  if (!paths?.length) return null;
  return h('div',{class:'thumbs'}, paths.map(p=>h('button',{class:'thumb','aria-label':isVideo(p)?'Play video':'Open photo',onclick:e=>{ e.stopPropagation(); viewPhoto(p); }}, mediaThumb(p))));
}
function viewPhoto(path){
  let media;
  if (isVideo(path)){
    media = h('video',{controls:true,playsinline:true,autoplay:true});
    photoSrc(path).then(src=>{ if (src) media.src = src; });
  } else media = photoImg(path);
  const v = h('div',{class:'viewer',role:'dialog','aria-label':isVideo(path)?'Video':'Photo',onclick:e=>{ if (e.target===v) v.remove(); }}, media,
    h('button',{class:'icon-btn close','aria-label':'Close',onclick:()=>v.remove()},'×'));
  document.body.append(v);
}
async function shrink(file){
  let src;
  try { src = await createImageBitmap(file); }
  catch { src = await new Promise((res,rej)=>{ const im = new Image(); im.onload=()=>res(im); im.onerror=rej; im.src = URL.createObjectURL(file); }); }
  const k = Math.min(1, 1600/Math.max(src.width, src.height));
  const c = document.createElement('canvas'); c.width = Math.round(src.width*k); c.height = Math.round(src.height*k);
  c.getContext('2d').drawImage(src,0,0,c.width,c.height);
  return new Promise(res=>c.toBlob(res,'image/jpeg',0.82));
}
async function uploadPhoto(blob, folder, ext='jpg', type='image/jpeg'){
  const path = folder+'/'+newId()+'.'+ext;
  const {error} = await S.sb.storage.from('photos').upload(path, blob, {contentType:type});
  if (error) throw error;
  photoCache.set(path, Promise.resolve(URL.createObjectURL(blob)));   // show it straight away without downloading it again
  return path;
}
function dropPhotos(paths){ if (paths.length) S.sb.storage.from('photos').remove(paths.flatMap(p=>isVideo(p)? [p, p+'.jpg'] : [p])); }
function photoPicker(initial, folder){
  let paths = [...initial], pending = 0;
  const fold = typeof folder==='function' ? folder : () => folder;
  const picker = {removed:[], onchange:null, busy:()=>pending>0};
  const strip = h('div',{class:'thumbs'});
  const input = h('input',{type:'file',accept:'image/*,video/*',multiple:true,hidden:true});
  const draw = () => strip.replaceChildren(...paths.map(p=>h('div',{class:'thumb'}, mediaThumb(p),
    h('button',{type:'button',class:'x','aria-label':'Remove photo',onclick:()=>{ paths = paths.filter(x=>x!==p); picker.removed.push(p); draw(); picker.onchange?.(); }},'×'))));
  input.addEventListener('change', async ()=>{
    const files = [...input.files]; input.value = '';
    pending += files.length;
    for (const f of files){
      strip.append(h('div',{class:'thumb busy'}));
      try {
        if (f.type.startsWith('video/')){
          if (f.size > MAX_VIDEO){ toast('Video too long (max 50 MB, about 1 minute). Record a shorter clip.'); throw 0; }
          const ext = f.type==='video/quicktime'? 'mov' : f.type==='video/webm'? 'webm' : 'mp4';
          const path = await uploadPhoto(f, fold(), ext, f.type||'video/mp4');
          const poster = await videoPoster(f);
          if (poster){
            const {error} = await S.sb.storage.from('photos').upload(path+'.jpg', poster, {contentType:'image/jpeg'});
            if (!error) photoCache.set(path+'.jpg', Promise.resolve(URL.createObjectURL(poster)));
          }
          paths.push(path);
        } else paths.push(await uploadPhoto(await shrink(f), fold()));
      }
      catch (e) { if (e!==0) toast(navigator.onLine? 'That file could not be added.' : 'No connection. Add it when you have signal.'); }
      pending--; draw(); picker.onchange?.();
    }
  });
  draw();
  return Object.assign(picker, {strip, input,
    button: h('button',{type:'button',class:'pill tool','aria-label':'Add photo or video',title:'Photo or video',html:I.camera,onclick:()=>input.click()}),
    value: () => paths, reset: () => { paths = []; picker.removed = []; draw(); }});
}

/* ---------- sheets ---------- */
function sheet(title, fields, onSave, onDelete, saveLabel){
  const scrim = h('div',{class:'scrim'});
  const close = ()=>{ scrim.remove(); removeEventListener('keydown',esc); };
  const esc = e=>{ if(e.key==='Escape') close(); };
  addEventListener('keydown',esc);
  scrim.addEventListener('click',e=>{ if(e.target===scrim) close(); });
  let del = null;
  if (onDelete){
    let armed=false;
    del = h('button',{type:'button',class:'btn danger',onclick:async()=>{
      if(!armed){ armed=true; del.classList.add('armed'); del.textContent='Tap again to delete'; return; }
      if(await onDelete()) close();
    }},'Delete');
  }
  const form = h('form',{class:'sheet',role:'dialog','aria-label':title,onsubmit:async e=>{e.preventDefault(); if(await onSave()) close();}},
    h('h3',{},title), fields,
    h('div',{class:'sheet-actions'}, del, h('button',{type:'button',class:'btn',onclick:close},'Cancel'), h('button',{type:'submit',class:'btn primary'},saveLabel||'Save')));
  scrim.append(form); document.body.append(scrim);
  form.querySelector('input:not([type=file]):not([type=date]),textarea')?.focus();
}
const field = (label, input) => h('div',{class:'field'}, h('label',{for:input.id},label), input);

function itemSheet(i){
  let pinned = !!i.pinned;
  const ta = h('textarea',{id:'e-text'}); ta.value = i.text||'';
  const prio = prioPills(PRIO, i.priority||2, true);
  const pin = h('button',{type:'button',class:'pill pinned','aria-pressed':String(pinned),onclick:()=>{pinned=!pinned;pin.setAttribute('aria-pressed',String(pinned));}}, h('span',{html:I.pin,style:'display:flex'}),'Pin to Now');
  const chips = venueChips(vids(i));
  const pick = canAssign()? assigneePicker(()=>chips.value(), i.assignee) : null;
  if (pick) chips.addEventListener('click', ()=>setTimeout(pick.redraw));
  const pics = photoPicker(i.photos||[], ()=> (S.role!=='owner' || i.assignee || pick?.value()) ? 'tasks' : 'notes');
  sheet(i.assignee || S.role!=='owner' ? 'Edit task' : 'Edit note', [
    field('Note',ta),
    h('div',{class:'field'}, h('label',{},'Photos'), h('div',{class:'add-bar'}, pics.strip, pics.button), pics.input),
    h('div',{class:'add-bar'}, prio.el, pin),
    h('div',{class:'field'}, h('label',{},'Areas'), chips),
    pick? pick.el : null,
    i.createdAt? h('div',{class:'date'},'Added '+shortDate(i.createdAt)) : null
  ], async ()=>{
    const text = ta.value.trim(), photos = pics.value(), venueIds = chips.value();
    if (!text && !photos.length){ toast('Write something or add a photo.'); return false; }
    if (!venueIds.length){ toast('Tick at least one area.'); return false; }
    const patch = {text,photos,priority:prio.value(),pinned,venueIds};
    if (pick) patch.assignee = pick.value();
    if (pick && pick.value() && (i.photos||[]).some(p=>p.startsWith('notes/'))) toast('Note: photos added while it was private stay visible to owners only.');
    const ok = await updateRow('notes', i.id, patch);
    if (ok) dropPhotos(pics.removed);
    return ok;
  }, canFinishNote(i)? ()=>softDelete(i) : null);
}

function jobSheet(j){
  const ta = h('textarea',{id:'j-text'}); ta.value = j.text||'';
  const prio = prioPills(JPRIO, j.priority||2, true), where = venuePicker(vids(j), j.all), due = duePicker(j.due);
  const pics = photoPicker(j.photos||[], 'jobs');
  sheet('Maintenance job', [
    field('Job',ta),
    h('div',{class:'field'}, h('label',{},'Photos'), h('div',{class:'add-bar'}, pics.strip, pics.button), pics.input),
    h('div',{class:'add-bar'}, prio.el, due.el), due.panel,
    h('div',{class:'field'}, h('label',{},'Where'), where.el),
    j.createdAt? h('div',{class:'date'},'Added '+shortDate(j.createdAt)) : null
  ], async ()=>{
    const text = ta.value.trim(), photos = pics.value();
    if (!text && !photos.length){ toast('Write something or add a photo.'); return false; }
    const ok = await updateRow('jobs', j.id, {text,photos,priority:prio.value(),due:due.value(),...where.value()});
    if (ok) dropPhotos(pics.removed);
    return ok;
  }, canClose()? ()=>jobDelete(j) : null);
}

function venueSheet(v){
  const inp = h('input',{id:'v-name',autocomplete:'off'}); inp.value = v?.name||'';
  // Deleting a venue removes notes only it holds; shared notes and jobs just drop this venue.
  const own = v? S.notes.filter(i=>vids(i).length===1 && vids(i)[0]===v.id) : [];
  const n = own.length;
  sheet(v?'Area':'New area', [field('Name',inp), v&&n? h('div',{class:'date'},'Deleting also removes its '+n+' note'+(n>1?'s':'')+'.') : null],
    ()=>{
      const name = inp.value.trim(); if(!name){ toast('Give the area a name.'); return false; }
      if (v) return updateRow('venues', v.id, {name});
      const order = S.venues.reduce((m,x)=>Math.max(m,x.order||0),0)+1;
      return insertRow('venues',{id:newId(),name,order,createdAt:Date.now()});
    },
    v? async ()=>{
      for (const i of S.notes.filter(i=>vids(i).includes(v.id))){
        if (own.includes(i)){ dropPhotos(i.photos||[]); if (!await deleteRow('notes', i.id)) return false; }
        else if (!await updateRow('notes', i.id, {venueIds:vids(i).filter(x=>x!==v.id)})) return false;
      }
      for (const j of S.jobs.filter(j=>vids(j).includes(v.id)))
        if (!await updateRow('jobs', j.id, {venueIds:vids(j).filter(x=>x!==v.id)})) return false;
      const ok = await deleteRow('venues', v.id);
      if (ok) go('');
      return ok;
    } : null);
}

function infoSheet(n){
  const k = h('input',{id:'i-label',autocomplete:'off',placeholder:'e.g. Stock sheet'}); k.value = n?.label||'';
  const val = h('textarea',{id:'i-value',placeholder:'Text or a link'}); val.value = n?.value||'';
  sheet(n?'Edit':'Add to essentials', [field('Label',k), field('Value',val)],
    ()=>{
      const data = {label:k.value.trim(), value:val.value};
      if(!data.label){ toast('Add a label.'); return false; }
      if (n) return updateRow('essentials', n.id, data);
      const order = S.essentials.reduce((m,x)=>Math.max(m,x.order||0),0)+1;
      return insertRow('essentials',{id:newId(),...data,order});
    },
    n? ()=>deleteRow('essentials', n.id) : null);
}

/* ---------- one-off import from the old Claude board ----------
   The old board's Essentials page has an Export button that copies everything (already unlocked) as JSON. */
function importSheet(){
  const ta = h('textarea',{id:'import-json',placeholder:'Paste the export here','aria-label':'Export from the old board',style:'min-height:160px'});
  sheet('Import from the old board', [h('p',{class:'date',style:'margin:0'},'On the old board, open Mili → Essentials → Export, then paste here.'), field('Export',ta)], async ()=>{
    let d; try { d = JSON.parse(ta.value); } catch { toast('That does not look like an export.'); return false; }
    toast('Importing…');
    const up = async (table, rows) => { if (!rows?.length) return true; const {error} = await S.sb.from(table).upsert(rows.map(toRow)); if (error){ toast(errText(error)); return false; } return true; };
    const photos = async (list, folder) => {
      const out = [];
      for (const dataUrl of list||[]){ try { const blob = await (await fetch(dataUrl)).blob(); out.push(await uploadPhoto(blob, folder)); } catch {} }
      return out;
    };
    const venues = (d.venues||[]).map(v=>({id:v.id, name:v.name, order:v.order??0, createdAt:v.createdAt||null}));
    const notes = [], jobs = [];
    for (const n of d.notes||[]) notes.push({id:n.id, venueIds:n.venueIds||[], text:n.text||'', priority:n.priority||2, pinned:!!n.pinned,
      photos:await photos(n.photoData,'notes'), done:!!n.done, doneAt:n.doneAt||null, deleted:!!n.deleted, deletedAt:n.deletedAt||null, createdAt:n.createdAt||Date.now()});
    for (const j of d.jobs||[]) jobs.push({id:j.id, venueIds:j.venueIds||[], all:!!j.all, text:j.text||'', priority:j.priority||2, due:j.due||null,
      photos:await photos(j.photoData,'jobs'), done:!!j.done, doneAt:j.doneAt||null, deleted:!!j.deleted, deletedAt:j.deletedAt||null, createdAt:j.createdAt||Date.now()});
    const essentials = (d.essentials||[]).map((e,k)=>({id:e.id, label:e.label||'', value:e.value||'', order:e.order??k}));
    const ok = await up('venues',venues) && await up('notes',notes) && await up('jobs',jobs) && await up('essentials',essentials);
    if (ok){ for (const t of ['venues','notes','jobs','essentials']) await load(t); toast('Imported '+notes.length+' notes and '+jobs.length+' jobs'); }
    return ok;
  }, null, 'Import');
}

/* ---------- sign-in ---------- */
function authScreen(mode, note){
  S.ready = false; shellKey = null;
  const email = h('input',{id:'email',type:'email',autocomplete:'email',placeholder:'Email','aria-label':'Email'});
  const pass = h('input',{id:'password',type:'password',autocomplete:mode==='signup'?'new-password':'current-password',placeholder:'Password','aria-label':'Password'});
  const msg = h('p',{class:'date',style:'min-height:1.4em'}, note||'');
  const busy = on => { submit.disabled = on; submit.textContent = on? 'One moment…' : label; };
  const label = mode==='signup' ? 'Create account' : mode==='reset' ? 'Send reset link' : 'Sign in';
  const submit = h('button',{type:'submit',class:'btn primary'},label);
  const form = h('form',{class:'auth',onsubmit:async e=>{
    e.preventDefault(); busy(true);
    const em = email.value.trim().toLowerCase();
    let error;
    if (mode==='signin') ({error} = await S.sb.auth.signInWithPassword({email:em, password:pass.value}));
    else if (mode==='signup'){
      const r = await S.sb.auth.signUp({email:em, password:pass.value, options:{emailRedirectTo:location.origin+location.pathname}});
      error = r.error;
      if (!error && !r.data.session){ busy(false); msg.textContent = 'Check your email to confirm, then sign in here.'; return; }
    } else {
      ({error} = await S.sb.auth.resetPasswordForEmail(em, {redirectTo:location.origin+location.pathname}));
      if (!error){ busy(false); msg.textContent = 'Reset link sent. Open it on this phone.'; return; }
    }
    busy(false);
    if (error) msg.textContent = /invalid login/i.test(error.message) ? 'Wrong email or password.' : error.message;
  }},
    h('img',{class:'logo',src:'icons/icon-192.png',alt:''}),
    h('h1',{},'Operations'),
    email, mode==='reset'? null : pass, submit, msg,
    h('div',{class:'row-links'},
      mode!=='signin'? h('button',{type:'button',class:'link',onclick:()=>authScreen('signin')},'Sign in') : h('button',{type:'button',class:'link',onclick:()=>authScreen('signup')},'Create account'),
      mode!=='reset'? h('button',{type:'button',class:'link',style:'color:var(--muted)',onclick:()=>authScreen('reset')},'Forgot password') : null));
  app.replaceChildren(form);
}
function newPasswordScreen(){
  S.ready = false; shellKey = null;
  const pass = h('input',{id:'new-password',type:'password',autocomplete:'new-password',placeholder:'New password','aria-label':'New password'});
  const msg = h('p',{class:'date'});
  app.replaceChildren(h('form',{class:'auth',onsubmit:async e=>{
    e.preventDefault();
    const {error} = await S.sb.auth.updateUser({password:pass.value});
    if (error) msg.textContent = error.message; else { toast('Password changed'); start(); }
  }}, h('h1',{},'New password'), pass, h('button',{type:'submit',class:'btn primary'},'Save'), msg));
}
function notMemberScreen(){
  S.ready = false; shellKey = null;
  app.replaceChildren(h('div',{class:'auth'}, h('h1',{},'Almost there'),
    h('p',{}, 'This account ('+S.email+') is not on the team yet. Ask Mili to add it in Settings, then reopen the app.'),
    h('button',{class:'btn',onclick:()=>start()},'Try again'),
    h('button',{class:'link',onclick:signOut},'Sign out')));
}
async function signOut(){
  try { const sub = await mySubscription(); if (sub) await S.sb.rpc('remove_push_subscription',{p_endpoint:sub.endpoint}); } catch {}
  await S.sb.auth.signOut();
  try { localStorage.removeItem(CACHE); } catch {}
  location.hash = ''; authScreen('signin');
}

/* ---------- start ---------- */
let channel = null;
async function start(){
  const {data:{session}} = await S.sb.auth.getSession();
  if (!session){ authScreen('signin'); return; }
  S.email = (session.user.email||'').toLowerCase();
  if (loadCache(S.email) && S.role){ S.ready = true; render(true); }      // instant open from the last copy
  const {data, error} = await S.sb.from('members').select('role,push_enabled').eq('email', S.email).maybeSingle();
  if (error){ if (!S.ready) app.replaceChildren(h('p',{class:'status'},'No connection. Open again when you have signal.')); return; }
  if (!data){ notMemberScreen(); return; }
  if (S.role && S.role!==data.role) shellKey = null;
  S.pushEnabled = data.push_enabled !== false;
  S.role = data.role; S.ready = true;
  await Promise.all([...tablesForRole().map(load), loadTeam()]);
  render(true);
  channel?.unsubscribe();
  channel = S.sb.channel('ops');
  for (const t of tablesForRole()) channel.on('postgres_changes',{event:'*',schema:'public',table:t},()=>{ reloadSoon(t); if (t==='members') loadTeam(); });
  channel.subscribe();
  refreshPushRegistration();
}
function offlineBadge(){
  document.querySelector('.offline')?.remove();
  if (!navigator.onLine) document.body.append(h('div',{class:'offline'},'Offline'));
}
addEventListener('online',()=>{ offlineBadge(); if (S.ready){ tablesForRole().forEach(load); loadTeam(); } });
addEventListener('offline',offlineBadge);
document.addEventListener('visibilitychange',()=>{ if (!document.hidden && S.ready && navigator.onLine) tablesForRole().forEach(load); });

(function boot(){
  document.documentElement.dataset.theme = getTheme();
  const cfg = window.OPS_CONFIG||{};
  if (!window.supabase || !cfg.supabaseUrl || cfg.supabaseUrl==='SUPABASE_URL'){
    app.replaceChildren(h('p',{class:'status'},'Setup not finished: the database link is missing.'));
    return;
  }
  S.sb = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}});
  S.sb.auth.onAuthStateChange((event)=>{
    // Defer: awaiting Supabase calls inside this callback can stall the client.
    if (event==='PASSWORD_RECOVERY') setTimeout(newPasswordScreen,0);
    else if (event==='SIGNED_IN' && !S.ready) setTimeout(start,0);
  });
  offlineBadge();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  start();
})();

// A visible marker on the test copy so it is never mistaken for the real app.
if ((window.OPS_CONFIG||{}).label) document.body.append(h('div',{class:'testbadge'}, window.OPS_CONFIG.label));

import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const participants = Array.from({ length: 12 }, (_, i) => ({
  name: `Teilnehmer ${i + 1}`,
  pin: String(1001 + i)
}));

function deadlineFor(n, kickoff) {
  // Default based on user rules. Knockout deadlines are group-level and editable by admin.
  if (n >= 1 && n <= 24) return '2026-06-11T19:00:00+02:00';
  if (n >= 25 && n <= 48) return '2026-06-17T17:00:00+02:00';
  if (n >= 49 && n <= 72) return '2026-06-24T17:00:00+02:00';
  if (kickoff) {
    const d = new Date(kickoff);
    d.setHours(d.getHours() - 2);
    return d.toISOString();
  }
  return null;
}
function phaseFor(n) {
  if (n <= 72) return 'Gruppenphase';
  if (n <= 104 && n >= 73) {
    if (n <= 88) return 'Sechzehntelfinale';
    if (n <= 96) return 'Achtelfinale';
    if (n <= 100) return 'Viertelfinale';
    if (n <= 102) return 'Halbfinale';
    if (n === 103) return 'Spiel um Platz 3';
    if (n === 104) return 'Finale';
  }
  return 'Sonstiges';
}
function defaultKickoff(n) {
  const start = new Date('2026-06-11T21:00:00+02:00');
  const d = new Date(start.getTime() + (n - 1) * 3 * 60 * 60 * 1000);
  return d.toISOString();
}
async function q(text, params=[]) { return pool.query(text, params); }

async function init() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL fehlt. Bitte in Render/Supabase setzen.');
  await q(`CREATE TABLE IF NOT EXISTS participants(id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, pin TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE);`);
  await q(`CREATE TABLE IF NOT EXISTS games(id INTEGER PRIMARY KEY, phase TEXT, home TEXT, away TEXT, kickoff TIMESTAMPTZ, deadline TIMESTAMPTZ, home_score INTEGER, away_score INTEGER, updated_at TIMESTAMPTZ DEFAULT NOW());`);
  await q(`CREATE TABLE IF NOT EXISTS tips(id SERIAL PRIMARY KEY, game_id INTEGER REFERENCES games(id), participant_id INTEGER REFERENCES participants(id), home_score INTEGER NOT NULL, away_score INTEGER NOT NULL, updated_by TEXT, updated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(game_id, participant_id));`);
  await q(`CREATE TABLE IF NOT EXISTS special_tips(id SERIAL PRIMARY KEY, participant_id INTEGER REFERENCES participants(id), champion TEXT, top_scorer TEXT, updated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(participant_id));`);
  await q(`CREATE TABLE IF NOT EXISTS audit(id SERIAL PRIMARY KEY, actor TEXT, action TEXT, details TEXT, created_at TIMESTAMPTZ DEFAULT NOW());`);
  const pc = await q('SELECT COUNT(*)::int c FROM participants');
  if (pc.rows[0].c === 0) for (const p of participants) await q('INSERT INTO participants(name,pin) VALUES($1,$2)', [p.name, p.pin]);
  const gc = await q('SELECT COUNT(*)::int c FROM games');
  if (gc.rows[0].c === 0) {
    for (let i=1;i<=104;i++) {
      const ko = defaultKickoff(i);
      await q('INSERT INTO games(id,phase,home,away,kickoff,deadline) VALUES($1,$2,$3,$4,$5,$6)', [i, phaseFor(i), i<=72 ? `Team ${i}A` : '', i<=72 ? `Team ${i}B` : '', ko, deadlineFor(i, ko)]);
    }
  }
}
function requireAdmin(req,res,next){ if(req.headers['x-admin-password']===ADMIN_PASSWORD) next(); else res.status(401).json({error:'Admin-Passwort falsch'}); }
async function participantFromReq(req,res,next){ const { name, pin } = req.body; const r=await q('SELECT * FROM participants WHERE name=$1 AND pin=$2 AND is_active=true',[name,pin]); if(!r.rows[0]) return res.status(401).json({error:'Name/PIN falsch'}); req.participant=r.rows[0]; next(); }

app.get('/api/state', async (req,res)=>{
  const [games, parts, tips, specials] = await Promise.all([q('SELECT * FROM games ORDER BY id'), q('SELECT id,name FROM participants WHERE is_active=true ORDER BY id'), q('SELECT t.*, p.name participant FROM tips t JOIN participants p ON p.id=t.participant_id ORDER BY t.game_id,p.id'), q('SELECT s.*, p.name participant FROM special_tips s JOIN participants p ON p.id=s.participant_id')]);
  const now = new Date();
  const visibleTips = tips.rows.map(t=>{
    const g = games.rows.find(x=>x.id===t.game_id);
    const visible = g?.deadline ? now >= new Date(g.deadline) : false;
    return visible ? t : { game_id:t.game_id, participant_id:t.participant_id, participant:t.participant, hidden:true };
  });
  res.json({ games: games.rows, participants: parts.rows, tips: visibleTips, specials: specials.rows, pot: calcPot(games.rows, tips.rows) });
});
app.post('/api/login', participantFromReq, (req,res)=>res.json({ok:true, participant:{id:req.participant.id,name:req.participant.name}}));
app.post('/api/mytips', participantFromReq, async(req,res)=>{ const tips=await q('SELECT * FROM tips WHERE participant_id=$1',[req.participant.id]); const sp=await q('SELECT * FROM special_tips WHERE participant_id=$1',[req.participant.id]); res.json({tips:tips.rows, special:sp.rows[0]||null}); });
app.post('/api/tip', participantFromReq, async(req,res)=>{
  const { game_id, home_score, away_score }=req.body;
  const g=(await q('SELECT * FROM games WHERE id=$1',[game_id])).rows[0];
  if(!g) return res.status(404).json({error:'Spiel nicht gefunden'});
  if(g.deadline && new Date() > new Date(g.deadline)) return res.status(403).json({error:'Tippfrist abgelaufen'});
  await q(`INSERT INTO tips(game_id,participant_id,home_score,away_score,updated_by) VALUES($1,$2,$3,$4,$5)
    ON CONFLICT(game_id,participant_id) DO UPDATE SET home_score=$3, away_score=$4, updated_by=$5, updated_at=NOW()`, [game_id, req.participant.id, home_score, away_score, req.participant.name]);
  await q('INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)',[req.participant.name,'Tipp gespeichert',`Spiel ${game_id}: ${home_score}:${away_score}`]);
  res.json({ok:true});
});
app.post('/api/special', participantFromReq, async(req,res)=>{
  await q(`INSERT INTO special_tips(participant_id,champion,top_scorer) VALUES($1,$2,$3) ON CONFLICT(participant_id) DO UPDATE SET champion=$2, top_scorer=$3, updated_at=NOW()`, [req.participant.id, req.body.champion||'', req.body.top_scorer||'']);
  res.json({ok:true});
});
app.get('/api/admin', requireAdmin, async(req,res)=>{
  const [games, parts, tips, audit] = await Promise.all([q('SELECT * FROM games ORDER BY id'),q('SELECT * FROM participants ORDER BY id'),q('SELECT t.*,p.name participant FROM tips t JOIN participants p ON p.id=t.participant_id ORDER BY game_id,participant_id'),q('SELECT * FROM audit ORDER BY created_at DESC LIMIT 300')]);
  res.json({games:games.rows, participants:parts.rows, tips:tips.rows, audit:audit.rows, pot:calcPot(games.rows,tips.rows)});
});
app.post('/api/admin/game', requireAdmin, async(req,res)=>{
  const {id,home,away,kickoff,deadline,home_score,away_score}=req.body;
  await q('UPDATE games SET home=$2,away=$3,kickoff=$4,deadline=$5,home_score=$6,away_score=$7,updated_at=NOW() WHERE id=$1',[id,home||'',away||'',kickoff||null,deadline||null,home_score===''?null:home_score,away_score===''?null:away_score]);
  await q('INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)',['Admin','Spiel aktualisiert',`Spiel ${id}`]);
  res.json({ok:true});
});
app.post('/api/admin/participant', requireAdmin, async(req,res)=>{
  const {id,name,pin}=req.body; await q('UPDATE participants SET name=$2,pin=$3 WHERE id=$1',[id,name,pin]); res.json({ok:true});
});
app.post('/api/admin/tip', requireAdmin, async(req,res)=>{
  const {game_id,participant_id,home_score,away_score}=req.body;
  await q(`INSERT INTO tips(game_id,participant_id,home_score,away_score,updated_by) VALUES($1,$2,$3,$4,'Admin') ON CONFLICT(game_id,participant_id) DO UPDATE SET home_score=$3, away_score=$4, updated_by='Admin', updated_at=NOW()`,[game_id,participant_id,home_score,away_score]);
  await q('INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)',['Admin','Tipp nachgetragen/geändert',`Spiel ${game_id}, Teilnehmer ${participant_id}: ${home_score}:${away_score}`]);
  res.json({ok:true});
});

function calcPot(games,tips){
  const byGame = Object.groupBy ? Object.groupBy(tips, t=>t.game_id) : tips.reduce((a,t)=>((a[t.game_id]??=[]).push(t),a),{});
  let carry=0, rows=[];
  for(const g of games.sort((a,b)=>a.id-b.id)){
    const pot = 18 + carry;
    let winners=[];
    if(g.home_score!==null && g.away_score!==null){ winners=(byGame[g.id]||[]).filter(t=>t.home_score===g.home_score && t.away_score===g.away_score); }
    const payout = winners.length ? +(pot / winners.length).toFixed(2) : 0;
    rows.push({game_id:g.id,pot,winners:winners.map(w=>w.participant||w.participant_id),payout_per_winner:payout});
    if(g.home_score!==null && g.away_score!==null) carry = winners.length ? 0 : pot;
  }
  return rows;
}

init().then(()=>app.listen(port,()=>console.log(`WM Tippspiel laeuft auf Port ${port}`))).catch(err=>{ console.error(err); process.exit(1); });

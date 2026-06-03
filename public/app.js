let state=null, me=null, adminPass='';
const $=id=>document.getElementById(id);
function dt(x){return x?new Date(x).toLocaleString('de-AT',{dateStyle:'short',timeStyle:'short'}):'-'}
async function api(url,opt={}){const r=await fetch(url,{headers:{'Content-Type':'application/json',...(opt.headers||{})},...opt}); const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.error||'Fehler'); return j;}
async function load(){state=await api('/api/state'); renderLogin(); if(me) renderAll();}
function renderLogin(){ $('loginName').innerHTML=(state?.participants||[]).map(p=>`<option>${p.name}</option>`).join(''); }
$('loginBtn').onclick=async()=>{try{const r=await api('/api/login',{method:'POST',body:JSON.stringify({name:$('loginName').value,pin:$('loginPin').value})}); me=r.participant; $('app').hidden=false; $('loginMsg').textContent=' eingeloggt'; await loadMy(); renderAll();}catch(e){$('loginMsg').textContent=e.message;}};
let mytips=[], myspecial=null;
async function loadMy(){const r=await api('/api/mytips',{method:'POST',body:JSON.stringify({name:me.name,pin:$('loginPin').value})}); mytips=r.tips; myspecial=r.special;}
function myTip(gameId){return mytips.find(t=>t.game_id==gameId)}
function renderAll(){renderTips(); renderRank(); renderView(); renderSpecial();}
function locked(g){return g.deadline && new Date()>new Date(g.deadline)}
function renderTips(){ $('tips').innerHTML='<h2>Tipps abgeben</h2>'+state.games.map(g=>{const t=myTip(g.id)||{}; return `<div class="game"><div class="grid"><div><b>Spiel ${g.id}</b> <span class="pill">${g.phase}</span><br>${g.home||'offen'} - ${g.away||'offen'}<br><span class="muted">Anpfiff: ${dt(g.kickoff)} | Frist: ${dt(g.deadline)}</span></div><div><input class="score" id="h${g.id}" type="number" min="0" value="${t.home_score??''}" ${locked(g)?'disabled':''}> : <input class="score" id="a${g.id}" type="number" min="0" value="${t.away_score??''}" ${locked(g)?'disabled':''}></div><div>${locked(g)?'<span class="bad">Frist abgelaufen</span>':'<span class="ok">offen</span>'}</div><div><button onclick="saveTip(${g.id})" ${locked(g)?'disabled':''}>Speichern</button></div></div></div>`}).join('');}
window.saveTip=async(id)=>{try{await api('/api/tip',{method:'POST',body:JSON.stringify({name:me.name,pin:$('loginPin').value,game_id:id,home_score:Number($('h'+id).value),away_score:Number($('a'+id).value)})}); await loadMy(); await load(); alert('Tipp gespeichert');}catch(e){alert(e.message)}};
function renderRank(){
 const money={}; state.participants.forEach(p=>money[p.name]=0); (state.pot||[]).forEach(p=>p.winners?.forEach(w=>money[w]=(money[w]||0)+p.payout_per_winner));
 const rows=Object.entries(money).sort((a,b)=>b[1]-a[1]).map(([n,m],i)=>`<tr><td>${i+1}</td><td>${n}</td><td>${m.toFixed(2)} €</td></tr>`).join('');
 $('rank').innerHTML=`<h2>Rangliste</h2><table class="table"><tr><th>Platz</th><th>Name</th><th>Gewinn</th></tr>${rows}</table>`;
}
function renderView(){
 const tipsByGame={}; state.tips.forEach(t=>{(tipsByGame[t.game_id]??=[]).push(t)});
 $('view').innerHTML='<h2>Tipps & Auszahlungen</h2>'+state.games.map(g=>{const pot=state.pot.find(p=>p.game_id===g.id)||{}; const ts=tipsByGame[g.id]||[]; const rows=ts.map(t=>`<tr><td>${t.participant}</td><td>${t.hidden?'verdeckt bis Fristablauf':`${t.home_score}:${t.away_score}`}</td></tr>`).join(''); return `<div class="game"><b>Spiel ${g.id}: ${g.home||'offen'} - ${g.away||'offen'}</b><br><span class="muted">Ergebnis: ${g.home_score??'-'}:${g.away_score??'-'} | Pot: ${pot.pot||18} € | Auszahlung je Gewinner: ${pot.payout_per_winner||0} €</span><table class="table"><tr><th>Teilnehmer</th><th>Tipp</th></tr>${rows}</table></div>`}).join('');
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.hidden=true); $(b.dataset.tab).hidden=false;});
function renderSpecial(){ if(myspecial){$('champion').value=myspecial.champion||'';$('topScorer').value=myspecial.top_scorer||'';} }
$('saveSpecial').onclick=async()=>{await api('/api/special',{method:'POST',body:JSON.stringify({name:me.name,pin:$('loginPin').value,champion:$('champion').value,top_scorer:$('topScorer').value})}); alert('Gespeichert')};
$('adminBtn').onclick=async()=>{adminPass=$('adminPass').value; try{const data=await api('/api/admin',{headers:{'x-admin-password':adminPass}}); renderAdmin(data); $('admin').hidden=false;}catch(e){alert(e.message)}};
async function reloadAdmin(){const data=await api('/api/admin',{headers:{'x-admin-password':adminPass}}); renderAdmin(data);}
function renderAdmin(data){
 const counts={}; data.tips.forEach(t=>counts[t.game_id]=(counts[t.game_id]||0)+1);
 const parts=data.participants.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
 $('admin').innerHTML='<h2>Admin-Kontrolle</h2><p class="muted">Hier kontrollierst du x/12 Tipps, trägst Ergebnisse ein und kannst Tipps nachtragen.</p><div class="adminrow"><b>Spielplan</b><br><button onclick="adminImportSchedule()">WM-Spielplan 2026 importieren / Platzhalter überschreiben</button><p class="muted">Überschreibt Spielnamen, Phasen, Anpfiffzeiten und Tippfristen. Tipps, Teilnehmer und Ergebnisse bleiben erhalten.</p></div>'+data.games.map(g=>`<div class="adminrow"><b>Spiel ${g.id}</b> <span class="pill">${counts[g.id]||0}/12 Tipps gespeichert</span><br><input id="gh${g.id}" value="${g.home||''}" placeholder="Heim"><input id="ga${g.id}" value="${g.away||''}" placeholder="Auswärts"><input id="gko${g.id}" value="${g.kickoff||''}" placeholder="Anpfiff ISO"><input id="gdl${g.id}" value="${g.deadline||''}" placeholder="Frist ISO"><br>Ergebnis <input class="score" id="grh${g.id}" type="number" value="${g.home_score??''}"> : <input class="score" id="gra${g.id}" type="number" value="${g.away_score??''}"><button onclick="adminSaveGame(${g.id})">Spiel speichern</button><br>Nachtrag Tipp: <select id="ap${g.id}">${parts}</select> <input class="score" id="ath${g.id}" type="number"> : <input class="score" id="ata${g.id}" type="number"><button onclick="adminSaveTip(${g.id})">Tipp nachtragen</button></div>`).join('')+'<h2>Teilnehmer/PINs</h2>'+data.participants.map(p=>`<div><input id="pn${p.id}" value="${p.name}"><input id="pp${p.id}" value="${p.pin}"><button onclick="adminPart(${p.id})">speichern</button></div>`).join('')+'<h2>Audit-Log</h2><table class="table">'+data.audit.map(a=>`<tr><td>${dt(a.created_at)}</td><td>${a.actor}</td><td>${a.action}</td><td>${a.details}</td></tr>`).join('')+'</table>';
}
window.adminImportSchedule=async()=>{if(!confirm('WM-Spielplan importieren und Platzhalter überschreiben? Teilnehmer, Tipps und Ergebnisse bleiben erhalten.')) return; try{const r=await api('/api/admin/import-schedule',{method:'POST',headers:{'x-admin-password':adminPass}}); alert(`Spielplan importiert: ${r.count} Spiele`); await load(); await reloadAdmin();}catch(e){alert(e.message)}};
window.adminSaveGame=async(id)=>{
 try{
  const result=await api('/api/admin/game',{method:'POST',headers:{'x-admin-password':adminPass},body:JSON.stringify({id,home:$('gh'+id).value,away:$('ga'+id).value,kickoff:$('gko'+id).value,deadline:$('gdl'+id).value,home_score:$('grh'+id).value,away_score:$('gra'+id).value})});
  await load();
  await reloadAdmin();
  const g=result.game||{};
  alert(`Spiel gespeichert. Ergebnis: ${g.home_score ?? '-'}:${g.away_score ?? '-'}`);
 }catch(e){
  alert(e.message);
 }
};
window.adminSaveTip=async(id)=>{await api('/api/admin/tip',{method:'POST',headers:{'x-admin-password':adminPass},body:JSON.stringify({game_id:id,participant_id:$('ap'+id).value,home_score:$('ath'+id).value,away_score:$('ata'+id).value})}); alert('Tipp gespeichert')};
window.adminPart=async(id)=>{await api('/api/admin/participant',{method:'POST',headers:{'x-admin-password':adminPass},body:JSON.stringify({id,name:$('pn'+id).value,pin:$('pp'+id).value})}); alert('Teilnehmer gespeichert'); await load(); await reloadAdmin();};
load(); setInterval(load,30000);

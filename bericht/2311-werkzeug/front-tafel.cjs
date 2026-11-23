// node front-tafel.cjs <akten-dir> [alle] [breite] — die FRONT der Meisterkarte 2: je Leiter die nächste ungebuchte Sprosse, ihre jüngste Akte
// (GTX oder Radeon) und WAS sie hält, gruppiert nach der fehlenden Fähigkeit. Punkte gibt allein die Front; jeder Brief zielt auf Zeilen dieser Tafel.
// Vorher: git archive origin/koordination vision/richter vision/meisterkarte-2.json | tar -x -C <akten-dir>   (Bash, nicht PowerShell-Röhre)
// Gruppen: GRUEN+PREIS (bucht) · GRUEN, Preis nicht gruen (Preis-Arbeit) · NAH/TEIL/FERN (Wert rot) · PROBE … (Apparat, kein Urteil der Welt) ·
// BUEHNE … / SPIEL Leser fehlt (die Fähigkeit ist nicht gebaut) · KEINE STATION · SONST (Text lesen). „tiefe+“ = grüne Sprossen HINTER der Front.
const fs=require('fs'),path=require('path');
const dir=process.argv[2];
const mk=JSON.parse(fs.readFileSync(path.join(dir,'vision/meisterkarte-2.json'),'utf8'));
const rd=path.join(dir,'vision/richter');
const je={};
for(const f of fs.readdirSync(rd)){
  const m=f.match(/^(.+)\.(\d+)\.([0-9a-f]{8})-(gtx|radeon)\.json$/); if(!m)continue;
  let a; try{a=JSON.parse(fs.readFileSync(path.join(rd,f),'utf8'));}catch(e){continue;}
  for(const g of a.geraete||[]){
    const p=g.preis||{}; const zeit=(p.fenster&&p.fenster.bis)||a.datum||'';
    const r=g.richter||{};
    const e={key:m[1]+'#'+m[2],kopf:m[3],ger:m[4],zeit:String(zeit),datum:String(a.datum||''),richter:r.urteil,preis:p.urteil,wert:String(r.wert||''),station:a.station,heap:(p.posten&&p.posten.heap_mb)||p.heap_mb};
    (je[e.key]=je[e.key]||[]).push(e);
  }
}
for(const k in je) je[k].sort((a,b)=>(a.datum+a.zeit).localeCompare(b.datum+b.zeit));
const art=(t)=>{
  if(/Umfang nicht erzeugbar/.test(t)){ if(/Saat/.test(t))return 'BUEHNE Saaten'; if(/Spieler/.test(t))return 'BUEHNE Spieler'; if(/Galaxi|Stern|System|Planet/.test(t))return 'BUEHNE Kosmos'; if(/Siedlung|Bewohner/.test(t))return 'BUEHNE Menge'; return 'BUEHNE Umfang sonst';}
  if(/Leser fehlt/.test(t))return 'SPIEL Leser fehlt';
  if(/PANEL/.test(t))return 'PANEL';
  const ok=(t.match(/✓/g)||[]).length, no=(t.match(/✗/g)||[]).length, um=(t.match(/ungemessen gegen Soll/g)||[]).length;
  if(/Frist|riss |SCHLOSS|Navigation timeout/.test(t)&&ok+no===0)return 'PROBE ohne Urteil (Frist/Schloss)';
  if(no>0&&um>=no)return 'PROBE misst nichts (alle ✗ ungemessen)';
  if(no===1&&ok>=1)return 'NAH: 1 ✗ bei ≥1 ✓';
  if(no>=1&&ok>=1)return 'TEIL: mehrere ✗, einige ✓';
  if(no>=1)return 'FERN: nur ✗ gemessen';
  return 'SONST';
};
const rows=[];
for(const g of mk.gruppen||[])for(const k of g.kriterien||[]){
  const sp=k.sprossen||[]; const nr=(k.heute||0)+1; if(nr>sp.length)continue;
  const key=k.id+'#'+nr; const l=je[key]; const s=sp[nr-1]||{};
  // tiefe: wie viele Sprossen hinter der Front tragen schon GRÜN (jüngste Akte)
  let tiefe=0; for(let i=nr+1;i<=sp.length;i++){const x=je[k.id+'#'+i]; if(x&&x[x.length-1].richter==='GRÜN')tiefe++;}
  if(!l){rows.push({l:k.id,nr,n:sp.length,klasse:s.klasse,st:'KEINE STATION',tiefe});continue;}
  const e=l[l.length-1];
  let st; if(e.richter==='GRÜN') st=(e.preis==='GRÜN')?'GRUEN+PREIS':'GRUEN, Preis nicht gruen'; else st=art(e.wert);
  rows.push({l:k.id,nr,n:sp.length,klasse:s.klasse,st,kopf:e.kopf,tag:(e.datum||e.zeit).slice(5,10),wert:e.wert,station:e.station,heap:e.heap,preis:e.preis,tiefe});
}
const grp={}; for(const r of rows)(grp[r.st]=grp[r.st]||[]).push(r);
for(const [a,l] of Object.entries(grp).sort((x,y)=>y[1].length-x[1].length)){
  const kap={}; l.forEach(r=>kap[r.l.split('.')[0]]=(kap[r.l.split('.')[0]]||0)+1);
  console.log('\n'+String(l.length).padStart(4),a,JSON.stringify(kap),'tiefe+',l.reduce((s,r)=>s+r.tiefe,0));
  const show=process.argv[3]==='alle'?l:l.slice(0,3);
  for(const r of show) console.log('     ',r.l+'#'+r.nr,'/'+r.n,r.klasse||'',r.kopf||'',r.tag||'',r.station?('['+r.station+']'):'', (r.wert||'').replace(/\s+/g,' ').slice(0,+(process.argv[4]||170)));
}
fs.writeFileSync(path.join(path.dirname(process.argv[1]),'front.json'),JSON.stringify(rows));

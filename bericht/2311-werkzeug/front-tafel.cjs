// node front-tafel.cjs <akten-dir> [alle] [breite] — die FRONT der Meisterkarte 2: je Leiter die nächste ungebuchte Sprosse, ihre jüngste Akte
// (GTX oder Radeon) und WAS sie hält, gruppiert nach der fehlenden Fähigkeit. Punkte gibt allein die Front; jeder Brief zielt auf Zeilen dieser Tafel.
// Vorher: git archive origin/koordination vision/richter vision/meisterkarte-2.json | tar -x -C <akten-dir>   (Bash, nicht PowerShell-Röhre)
// Gruppen: GRUEN+PREIS (bucht) · GRUEN, Preis nicht gruen (Preis-Arbeit) · NAH/TEIL/FERN (Wert rot) · PROBE … (Apparat, kein Urteil der Welt) ·
// BUEHNE … / SPIEL Leser fehlt (die Fähigkeit ist nicht gebaut) · KEINE STATION · SONST (Text lesen). „tiefe+“ = grüne Sprossen HINTER der Front.
const fs=require('fs'),path=require('path');
const dir=process.argv[2];
const mk=JSON.parse(fs.readFileSync(path.join(dir,'vision/meisterkarte-2.json'),'utf8'));
const rd=path.join(dir,'vision/richter');
// DIE ANSPRUECHE (zug/anspruch.txt, optional): eine Front-Sprosse, die ein gelandeter Zweig beansprucht, ist GEBAUT und wartet auf die Messung —
// die Tafel nennt den Zweig, sonst bestellt der Leser einen zweiten Macher (24.11.: Klang, Stoffstrom, Fisch-Pegel standen rot mit alter Akte).
const anspr={};try{for(const z of fs.readFileSync(path.join(dir,'zug/anspruch.txt'),'utf8').split(/\r?\n/)){if(!z||z[0]==='#')continue;const m=z.match(/^(\S+)\s+(\S+)/);if(!m)continue;for(const k of m[2].split(',')){const s=k.replace(/^karte2\./,'');(anspr[s]=anspr[s]||[]).push(m[1]);}}}catch(e){}
const je={};
for(const f of fs.readdirSync(rd)){
  const m=f.match(/^(.+)\.(\d+)\.([0-9a-f]{8})-(gtx|radeon)\.json$/); if(!m)continue;
  let inhalt; try{inhalt=JSON.parse(fs.readFileSync(path.join(rd,f),'utf8'));}catch(e){continue;}
  // EINE Fahrt (Objekt) ODER eine Folge von Fahrten (Array) — dieselbe Form wie vision/buche-2.cjs (Kopf, DIE AKTE). Die Tafel las bis
  // 24.11. nur das Objekt: 199 von 2 976 Akten (je Gerät und Kopf die zweite Fahrt) fielen still weg, die zehn Fronten mit dem
  // Neulauf am 31ea3847 (21.11.) standen mit ihrer alten Akte „Start: spawn ENAMETOOLONG“ (f68dbf09) am Apparat statt an der Welt
  for(const a of [].concat(inhalt)) for(const g of a.geraete||[]){
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
// DIE FRONT wie zug/dienst/runde.cjs `front` (und buche-2): je Leiter die Sprosse am Index heute, bei „glieder“ JEDE nicht in heuteSprossen
const fronten=(k)=>{const sp=k.sprossen||[]; if(k.zaehlung==='glieder'){const da=new Set(k.heuteSprossen||[]); return sp.map((x,i)=>x.nr!=null?x.nr:i+1).filter((nr)=>!da.has(nr));} const nr=(k.heute||0)+1; return nr>sp.length?[]:[nr];};
for(const g of mk.gruppen||[])for(const k of g.kriterien||[])for(const nr of fronten(k)){
  const sp=k.sprossen||[];
  const key=k.id+'#'+nr; const l=je[key]; const s=sp.find((x)=>x.nr===nr)||sp[nr-1]||{};
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
  for(const r of show) console.log('     ',r.l+'#'+r.nr,'/'+r.n,r.klasse||'',r.kopf||'',r.tag||'',r.station?('['+r.station+']'):'', anspr[r.l+'#'+r.nr]?('⟵ BEANSPRUCHT '+anspr[r.l+'#'+r.nr].slice(-2).join(' · ')+' ⟶'):'', (r.wert||'').replace(/\s+/g,' ').slice(0,+(process.argv[4]||170)));
}
fs.writeFileSync(path.join(path.dirname(process.argv[1]),'front.json'),JSON.stringify(rows));

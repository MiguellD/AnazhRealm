// node preis-hebel.cjs <verzeichnis> — der Hebel der Karte 2 aus den Akten: je Sprosse die jüngste GTX-Akte (nach preis.fenster.bis), Richter GRÜN und Preis
// nicht GRÜN, sortiert nach dem GEHALTENEN Heap (preis.posten.heap_mb), mit Klasse der Sprosse und Front-Marke.
// Vorher: git archive origin/koordination vision/richter vision/meisterkarte-2.json | tar -x -C <verzeichnis>
const fs=require('fs'),path=require('path');
const dir=process.argv[2];
const mk=JSON.parse(fs.readFileSync(path.join(dir,'vision/meisterkarte-2.json'),'utf8'));
console.log('karte keys',Object.keys(mk).join(','));
if(mk.preisTreppe)console.log('treppe',JSON.stringify(mk.preisTreppe).slice(0,1200));
const stand={};
for(const g of mk.gruppen||[])for(const k of g.kriterien||[]){stand[k.id]={heute:k.heute,kern:k.kern,sp:k.sprossen||[]};}
const rd=path.join(dir,'vision/richter');
const je={};
for(const f of fs.readdirSync(rd)){
  const m=f.match(/^(.+)\.(\d+)\.([0-9a-f]{8})-gtx\.json$/); if(!m)continue;
  let a; try{a=JSON.parse(fs.readFileSync(path.join(rd,f),'utf8'));}catch(e){continue;}
  const g=(a.geraete||[])[0]; if(!g||!g.preis)continue;
  const p=g.preis; const zeit=(p.fenster&&p.fenster.bis)||a.datum||'';
  const hh=(p.posten&&typeof p.posten.heap_mb==='number')?p.posten.heap_mb:p.heap_mb;
  const vv=(p.posten&&typeof p.posten.vram_mb==='number')?p.posten.vram_mb:p.vram_mb;
  const e={key:m[1]+'#'+m[2],leiter:m[1],nr:+m[2],kopf:m[3],zeit:String(zeit),richter:g.richter&&g.richter.urteil,preis:p.urteil,heap:hh,p95:p.bild_p95_ms,max:p.bild_max_ms,vram:vv};
  (je[e.key]=je[e.key]||[]).push(e);
}
const out=[];
for(const k in je){const l=je[k]; l.sort((a,b)=>a.zeit.localeCompare(b.zeit)); out.push(l[l.length-1]);}
const gr=out.filter(e=>e.richter==='GRÜN');
const pr=gr.filter(e=>e.preis!=='GRÜN');
console.log('gtx-sprossen',out.length,'| richter gruen',gr.length,'| preis nicht gruen',pr.length);
pr.sort((a,b)=>(a.heap||0)-(b.heap||0));
for(const e of pr){const s=stand[e.leiter]||{sp:[]};const sp=s.sp[e.nr-1]||{};const front=(e.nr===(s.heute||0)+1);console.log([e.key,e.kopf,e.zeit.slice(5,16),'gehalten',e.heap,'p95',e.p95,'max',e.max,'vram',e.vram,'preis',e.preis,'klasse',sp.klasse||'?','heute',s.heute,'kern',s.kern,front?'FRONT':'-'].join(' '));}

// diag-sab.cjs — Aufschlüsselung S-b (wer steht im Podest) und S-a (freie Balken-Enden) an Lauf E, gierig
const GP=require("./grundriss-a.cjs"),R1=require("./gesetz-proto-r1.cjs"),LI=require("./linse-v2.cjs"),fs=require("fs");
process.env.KAP="1";
const HS=JSON.parse(fs.readFileSync(__dirname+"/stadt-v2-haeuser-m03.json","utf8"));
const ORT={mitteleuropa:"eiche",alpin:"nadel",nordisch:"nadel",fernost:"nadel",mediterran:"eiche",antik:"eiche"};
const halb=x=>Math.round(x*2)/2;
const art={},modus={},frei={},freiBsp=[];let n=0;
for(const h of HS){ const c=h.H,W=h.los.b<=12?halb(h.los.b):halb(h.los.b-3.5),dr=0.5+0.5*(1-h.t),Dg=11*(1-(dr-0.5));
 const H={gewerbe:c.gewerbe,klasse:c.klasse,wohl:c.wohl,kern:c.kern,gesinde:c.gesinde,koepfe:c.koepfe};
 if(c.inwohner>0){const key=c.gewerbe+"+miete"+c.inwohner;if(!R1.GEWERBE[key])R1.GEWERBE[key]=Object.assign({},R1.GEWERBE[c.gewerbe],{raeume:R1.GEWERBE[c.gewerbe].raeume.concat(Array.from({length:c.inwohner},()=>["miete",27.3,"og"]))});H.gewerbe=key;}
 const R=GP.grundrissVon(H,h.bau,{B:W,T:Dg+4},GP.STOFF[ORT[h.region]]); if(!R.ok)continue; n++;
 const t=R.treppe,pod=t.laengs?[{u0:t.u0,u1:t.u1,s0:t.s0-0.9,s1:t.s0},{u0:t.u0,u1:t.u1,s0:t.s1,s1:t.s1+0.9}]:[{u0:t.u0-0.9,u1:t.u0,s0:t.s0,s1:t.s1},{u0:t.u1,u1:t.u1+0.9,s0:t.s0,s1:t.s1}];
 let hit=false; for(const G of R.geschosse)for(const p of G.staender){ if(pod.some(a=>p.u+0.08>a.u0+1e-3&&p.u-0.08<a.u1-1e-3&&p.s+0.08>a.s0+1e-3&&p.s-0.08<a.s1-1e-3)){art[p.art]=(art[p.art]||0)+1;hit=true;} }
 if(hit){const k=R.s+"·"+t.modus+(t.spar?"-spar":"");modus[k]=(modus[k]||0)+1;}
 const Lm=GP.ortTragwerk(GP.STOFF[ORT[h.region]]).Lmax;
 for(const d of LI.ausGrundriss(R)){ for(const j of d.joists){ const pts=d.supports.filter(L=>j.u>=L.u0-1e-3&&j.u<=L.u1+1e-3&&L.s>=j.a-0.25&&L.s<=j.b+0.25).map(L=>L.s); if(j.wa)pts.push(j.a); if(j.wb)pts.push(j.b); pts.sort((a,b)=>a-b);
   if(!pts.length||pts[0]>j.a+0.25||pts[pts.length-1]<j.b-0.25){ const G=R.geschosse[d.k]; const wo=(G.raeume.find(r=>j.u>r.u0&&j.u<r.u1&&(j.a+j.b)/2>r.s0&&(j.a+j.b)/2<r.s1)||{id:"querzone"}).id; const key="k"+(d.k===R.st-1?"oben":d.k)+"·"+R.s+"·"+wo; frei[key]=(frei[key]||0)+1; if(freiBsp.length<4)freiBsp.push({adr:h.adr,k:d.k,st:R.st,j,Lu:R.Lu,qa:R.qa,wf:R.wf,sb:R.sb,sup:d.supports.filter(L=>Math.abs(L.s-j.a)<0.3||Math.abs(L.s-j.b)<0.3)}); } } } }
console.log("gültig",n); console.log("S-b Podest-Treffer je Ständer-Art",JSON.stringify(art)); console.log("S-b Häuser je Typ",JSON.stringify(modus));
console.log("S-a freie Enden je Decke·s·Raum",JSON.stringify(Object.entries(frei).sort((a,b)=>b[1]-a[1]).slice(0,14)));
for(const b of freiBsp)console.log(JSON.stringify(b).slice(0,700));

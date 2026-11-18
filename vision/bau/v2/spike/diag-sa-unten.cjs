// diag-sa-unten.cjs — S-a in Decken MIT Treppenloch (Lauf E, gierig): wo liegt der Balken über L_max relativ zu Loch und Querzone?
const GP=require("./grundriss-a.cjs"),R1=require("./gesetz-proto-r1.cjs"),LI=require("./linse-v2.cjs"),fs=require("fs");
process.env.KAP="1";
const HS=JSON.parse(fs.readFileSync(__dirname+"/stadt-v2-haeuser-m03.json","utf8"));
const ORT={mitteleuropa:"eiche",alpin:"nadel",nordisch:"nadel",fernost:"nadel",mediterran:"eiche",antik:"eiche"};
const halb=x=>Math.round(x*2)/2; const art={}; let n=0, bsp=[];
for(const h of HS){ const c=h.H,W=h.los.b<=12?halb(h.los.b):halb(h.los.b-3.5),dr=Math.round((0.5+0.5*(1-h.t))*1000)/1000,Dg=11*(1-(dr-0.5));
 const H={gewerbe:c.gewerbe,klasse:c.klasse,wohl:c.wohl,kern:c.kern,gesinde:c.gesinde,koepfe:c.koepfe};
 if(c.inwohner>0){const key=c.gewerbe+"+miete"+c.inwohner;if(!R1.GEWERBE[key])R1.GEWERBE[key]=Object.assign({},R1.GEWERBE[c.gewerbe],{raeume:R1.GEWERBE[c.gewerbe].raeume.concat(Array.from({length:c.inwohner},()=>["miete",27.3,"og"]))});H.gewerbe=key;}
 const R=GP.grundrissVon(H,h.bau,{B:W,T:Dg+4},GP.STOFF[ORT[h.region]]); if(!R.ok)continue;
 const Lm=GP.ortTragwerk(GP.STOFF[ORT[h.region]]).Lmax, t=R.treppe, qb=R.qa+R.wf;
 for(const d of LI.ausGrundriss(R)){ if(d.oben)continue; for(const j of d.joists){ const s=LI.spannweiten([j],d.supports,Lm); if(s.ueber){ const wo=j.u<t.u0?"vor dem Loch (u<u0)":j.u>t.u1?"hinter dem Loch (u>u1)":"im Loch-u"; const k=wo+" · "+t.modus+" · qb−u1 "+(qb-t.u1<=0.18+1e-9?"≤ POST+0,02 (kein 2. UZ-Stück, GP:386)":"> POST+0,02"); art[k]=(art[k]||0)+1; if(bsp.length<2)bsp.push({adr:h.adr,u:j.u,a:j.a,b:j.b,t:[t.u0,t.u1,t.s0,t.s1],qa:R.qa,qb,sb:R.sb,span:s.maxSpann,Lm}); } } } }
console.log(JSON.stringify(art,null,1)); for(const b of bsp)console.log(JSON.stringify(b));

const cp=require("child_process");const REPO="C:/Users/micha/AnazhRealm-profiband";
const zeig=(ref,p)=>cp.execSync(`git -C "${REPO}" show "${ref}:${p}"`,{maxBuffer:1<<28,stdio:["ignore","pipe","ignore"]}).toString();
const karte=JSON.parse(zeig("origin/koordination","vision/meisterkarte-2.json"));
const tafel=JSON.parse(zeig("origin/punkte-maschine","vision/richter-tafel.json")).zeilen;
const leitern=karte.gruppen.flatMap(g=>g.kriterien);
const S=new Map(),front=new Set();
for(const L of leitern){for(const s of L.sprossen)S.set(L.id+"#"+s.nr,{L,s});
 if(L.zaehlung==="glieder"){const da=new Set(L.heuteSprossen||[]);for(const s of L.sprossen)if(!da.has(s.nr))front.add(L.id+"#"+s.nr);}
 else{const h=L.heute||0;if(h<L.sprossen.length)front.add(L.id+"#"+L.sprossen[h].nr);}}
const PANEL=/blindpaar|panel|jury|2afc|klassifikator|ortskundig|foto|blind|menschen|betrachter|urteil(en|t)? .*mensch|prüfer-satz|R11|hörer|proband|ununterscheid/i;
const felder=o=>Object.keys(o).filter(k=>typeof o[k]==="string");
let n=0,mit=0,ohne=0,fMit=0,fOhne=0;const kap={},bsp=[],liste=[];
let feldname=null;
for(const z of tafel){if(z.richter!=="fehlt")continue;const k=z.leiter+"#"+z.sprosse;const e=S.get(k);if(!e){continue;}
 n++;if(!feldname)feldname=felder(e.s).join(",");
 const text=[e.s.richter,e.s.soll,e.s.text,e.s.satz,e.L.richter].filter(Boolean).join(" | ");
 const p=PANEL.test(text);const c=z.leiter.split(".")[0];kap[c]=kap[c]||{mit:0,ohne:0,fOhne:0};
 if(p){mit++;kap[c].mit++;if(front.has(k))fMit++;}else{ohne++;kap[c].ohne++;if(front.has(k)){fOhne++;kap[c].fOhne++;liste.push(k);}if(bsp.length<4)bsp.push(k+": "+text.slice(0,230));}}
console.log("Felder der Sprosse:",feldname);
console.log(`richter fehlt ${n} · Panel im Wortlaut ${mit} (Front ${fMit}) · KEIN Panel im Wortlaut ${ohne} (Front ${fOhne})`);
console.log(JSON.stringify(kap));
console.log(bsp.join("\n"));
require("fs").writeFileSync("auge-ohne-panel-front.txt",liste.join("\n")+"\n");

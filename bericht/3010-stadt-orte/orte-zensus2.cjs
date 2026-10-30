// Zensus der Orte mit Rolle über die Städte der Welt (Rang-Gesetz, Saat anazh-realm-seed): je Zelle mit Stufe ≥ 1 im Fenster
const path=require("path"); const root=process.argv[2]; const W=Number(process.argv[3]||24);
const { studioKern } = require(path.join(root, "scripts/lib/welt-boot.cjs"));
const FC = studioKern("fachwerk-core.js", "__fachwerkCore");
require(path.join(root, "gelaende-core.js")); const GN = globalThis.__gelaendeCore;
const WS="anazh-realm-seed"; const L=GN.lageGrund(WS, require(path.join(root, "vendor/simplex-noise.js")));
const fnv=(s)=>{let h=2166136261>>>0; for(let i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619)>>>0; return h;};
const M=new Map(); if (process.argv[4]) FC.ORTE_GESETZ.wahl.stufen=Number(process.argv[4]); const st={staedte:0, rundkurs:0, gehege:0, zfR:0, zfG:0, fehlen:[], hubs:[], ms:0};
for (let i=-W/2;i<W/2;i++) for (let j=-W/2;j<W/2;j++) {
  const q=FC.siedlungsZelle(FC.SIEDLUNG,i,j,(x,z)=>fnv(`${WS}:dorf:${x},${z}`),M);
  if (!q || q.stufe<1) continue;
  const t0=Date.now();
  const P=FC.exportSettlement({seed:q.seed,nH:q.nH,epoche:FC.siedlungsEpoche(q.seed),hoehe:GN.hoehenRaster(L,q.x,q.z,FC.trasseRahmen(q.nH))});
  st.ms+=Date.now()-t0;
  if (!FC.ORTE_GESETZ.klassen.includes(P.groesse)) continue;
  st.staedte++;
  const rk=(P.orte||[]).find(o=>o.rolle==="rundkurs"), gh=(P.orte||[]).find(o=>o.rolle==="gehege");
  if (rk) { st.rundkurs++; st.hubs.push(rk.hub); st.lage=(st.lage||[]); st.lage.push(i+","+j+":"+Math.round(Math.hypot((rk.achse.ax+rk.achse.bx)/2,(rk.achse.az+rk.achse.bz)/2))); } if (gh) st.gehege++;
  if ((P.feldwege||[]).some(f=>f.ort==="rundkurs")) st.zfR++; if ((P.feldwege||[]).some(f=>f.ort==="gehege")) st.zfG++;
  if (P.orteFehlen) st.fehlen.push(`${i},${j} ${P.groesse} ${P.slots.length}: `+P.orteFehlen.map(f=>f.rolle).join("+"));
}
st.hubs.sort((a,b)=>a-b);
console.log(JSON.stringify({staedte:st.staedte, rundkurs:st.rundkurs, gehege:st.gehege, zufahrtRundkurs:st.zfR, zufahrtGehege:st.zfG, hubMedian:st.hubs[st.hubs.length>>1], hubMax:st.hubs[st.hubs.length-1], fehlen:st.fehlen, sek:Math.round(st.ms/1000), lage:st.lage}));

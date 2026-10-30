// Zufahrt der Orte je Grenze zufahrtM: an den Mess-Städten und den Städten der Welt (Zellen −12..11 und die Gipfel-Metropole)
const path=require("path"); const root=process.argv[2];
const { studioKern } = require(path.join(root, "scripts/lib/welt-boot.cjs"));
const FC = studioKern("fachwerk-core.js", "__fachwerkCore");
require(path.join(root, "gelaende-core.js")); const GN = globalThis.__gelaendeCore;
const WS="anazh-realm-seed"; const L=GN.lageGrund(WS, require(path.join(root, "vendor/simplex-noise.js")));
const fnv=(s)=>{let h=2166136261>>>0; for(let i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619)>>>0; return h;};
const M=new Map(); const staedte=[{id:"stadt",dp:{seed:7,nH:120},ort:{x:663,z:423}},{id:"stadt-voll",dp:{seed:7,nH:300},ort:{x:836.2,z:438.5}},{id:"moderne",dp:{seed:7,nH:300,epoche:"moderne"},ort:{x:836.2,z:438.5}}];
for (let i=-12;i<12;i++) for (let j=-14;j<12;j++) { const q=FC.siedlungsZelle(FC.SIEDLUNG,i,j,(x,z)=>fnv(`${WS}:dorf:${x},${z}`),M); if(!q||q.stufe<1) continue;
  if (!["stadt","grossstadt","metropole"].includes(FC.EPOCHEN&&q.groesse||q.groesse) && q.nH<28) continue; staedte.push({id:i+","+j,dp:{seed:q.seed,nH:q.nH,epoche:FC.siedlungsEpoche(q.seed)},ort:{x:q.x,z:q.z}}); }
for (const lim of [180, 300, 500]) {
  FC.ORTE_GESETZ.wahl.zufahrtM = lim; const zeile=[]; let n=0, ok=0, ms=0;
  for (const S of staedte) { const t0=Date.now(); const P=FC.exportSettlement(Object.assign({}, S.dp, {hoehe:GN.hoehenRaster(L,S.ort.x,S.ort.z,FC.trasseRahmen(S.dp.nH))})); ms+=Date.now()-t0;
    if (!FC.ORTE_GESETZ.klassen.includes(P.groesse)) continue;
    for (const o of P.orte||[]) { n++; const z=(P.feldwege||[]).find(f=>f.ort===o.rolle); if (z) ok++; else zeile.push(S.id+":"+o.rolle); } }
  console.log(lim, "zufahrt", ok+"/"+n, "ohne:", zeile.join(" "), "ms", ms);
}

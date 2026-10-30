// Zensus der Quartiere: je Stadt der Welt die Hallen (slot.rolle "halle") je Quartier — trägt irgendein Viertel das Gewerbe?
const path=require("path"); const root=process.argv[2]; const W=Number(process.argv[3]||24);
const { studioKern } = require(path.join(root, "scripts/lib/welt-boot.cjs"));
const FC = studioKern("fachwerk-core.js", "__fachwerkCore");
require(path.join(root, "gelaende-core.js")); const GN = globalThis.__gelaendeCore;
const WS="anazh-realm-seed"; const L=GN.lageGrund(WS, require(path.join(root, "vendor/simplex-noise.js")));
const fnv=(s)=>{let h=2166136261>>>0; for(let i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619)>>>0; return h;};
const M=new Map(); const rollen={}; const zeilen=[];
for (let i=-W/2;i<W/2;i++) for (let j=-W/2;j<W/2;j++) {
  const q=FC.siedlungsZelle(FC.SIEDLUNG,i,j,(x,z)=>fnv(`${WS}:dorf:${x},${z}`),M);
  if (!q || q.stufe<1) continue;
  const P=FC.exportSettlement({seed:q.seed,nH:q.nH,epoche:FC.siedlungsEpoche(q.seed),hoehe:GN.hoehenRaster(L,q.x,q.z,FC.trasseRahmen(q.nH))});
  if (!FC.ORTE_GESETZ.klassen.includes(P.groesse)) continue;
  const Q=P.quartiere||[]; const hallen=Q.map(()=>0);
  let hallenGesamt=0; for (const s of P.slots) if (s.rolle==="halle") { hallenGesamt++; if (s.quartier!=null) hallen[s.quartier]++; }
  for (const x of Q) rollen[x.rolle]=(rollen[x.rolle]||0)+1;
  zeilen.push(`${i},${j} ${P.groesse} slots ${P.slots.length} hallen ${hallenGesamt} · `+Q.filter(x=>x.slots).map((x,k)=>`${x.rolle}:${x.slots}/${hallen[Q.indexOf(x)]}`).join(" "));
}
console.log(JSON.stringify(rollen)); console.log(zeilen.join("\n"));

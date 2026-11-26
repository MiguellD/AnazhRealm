"use strict";
// Das Netz des Kerns von oben: Relief (Schummerung + Höhen-Tönung, Meer blau) und die Läufe der Ebenen 0/1 nach
// Strahler-Ordnung (Farbe und Breite), Quellen als Punkte. node netz-bild.cjs <root> <out.png> <W> <saat...>
// Mehrere Saaten → eine Zeile Kacheln.
const path = require("path"), fs = require("fs");
const [root, out, Ws, ...saaten] = process.argv.slice(2);
process.env.HN_ROOT = path.resolve(root);
process.env.HN_W = Ws;
const W = +Ws;
const { mass, G } = require("./horton-netz.cjs");
const PX = 700, R = 4 * W / PX; // Raster-Schritt (m) je 1/4 Pixel… wir nehmen 175 Proben je Seite
const NR = 175, ST = (2 * W) / NR;
const kacheln = [];
for (const saat of saaten) {
  const m = mass(saat);
  const L = m.L;
  const H = new Float32Array(NR * NR);
  for (let j = 0; j < NR; j++) for (let i = 0; i < NR; i++) H[i + j * NR] = G.hoehe(L, -W + (i + 0.5) * ST, -W + (j + 0.5) * ST, true);
  const linien = [];
  for (const n of m.GL.values()) {
    const b = n.gl.bahn;
    for (const [s0, s1, o, bek] of n.stk) {
      const pts = [];
      const at = (s) => {
        for (let i = 0; i + 1 < b.length; i++) if (b[i + 1].s >= s) { const t = (s - b[i].s) / Math.max(1e-9, b[i + 1].s - b[i].s); return [b[i].x + (b[i + 1].x - b[i].x) * t, b[i].z + (b[i + 1].z - b[i].z) * t]; }
        return [b[b.length - 1].x, b[b.length - 1].z];
      };
      pts.push(at(s0));
      for (const p of b) if (p.s > s0 && p.s < s1) pts.push([p.x, p.z]);
      pts.push(at(s1));
      linien.push({ o, bek, k: n.k, q: !n.prev.size && !!n.quelle && s0 === 0, pts: pts.map(([x, z]) => [+x.toFixed(1), +z.toFixed(1)]) });
    }
  }
  const sterne = [];
  for (const n of m.GL.values()) if (n.prev.size >= 3) sterne.push([+n.gl.ax.toFixed(1), +n.gl.az.toFixed(1), n.prev.size]);
  kacheln.push({ saat, H: Array.from(H, (v) => +v.toFixed(1)), wl: L.waterLevel, linien, N: m.N, sterne });
}
if (process.env.NB_JSON) { fs.writeFileSync(process.env.NB_JSON, JSON.stringify(kacheln)); process.exit(0); }
const html = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#111;font:14px sans-serif;color:#eee">
<div id=r style="display:flex;gap:8px;padding:8px"></div><script>
const K=${JSON.stringify(kacheln)}, W=${W}, NR=${NR}, PX=${PX};
const FARBE=["#000","#7fd4ff","#2fa0ff","#1c5cff","#7a2cff","#ff2cc8","#ff3030"];
for (const k of K){
  const d=document.createElement("div"); d.innerHTML="<div style='padding:2px 0'>"+k.saat+" · N "+JSON.stringify(k.N)+"</div>";
  const c=document.createElement("canvas"); c.width=PX; c.height=PX; d.appendChild(c); document.getElementById("r").appendChild(d);
  const g=c.getContext("2d"); const img=g.createImageData(NR,NR);
  let lo=1e9,hi=-1e9; for(const v of k.H){ if(v>k.wl){lo=Math.min(lo,v);hi=Math.max(hi,v);} }
  const ST=2*W/NR;
  for(let j=0;j<NR;j++)for(let i=0;i<NR;i++){const h=k.H[i+j*NR]; const hx=k.H[Math.min(NR-1,i+1)+j*NR]-k.H[Math.max(0,i-1)+j*NR], hz=k.H[i+Math.min(NR-1,j+1)*NR]-k.H[i+Math.max(0,j-1)*NR];
    const nx=-hx/(2*ST), nz=-hz/(2*ST); const sh=Math.max(0,Math.min(1,0.55+0.9*(nx*-0.6+nz*-0.6)/Math.hypot(nx,nz,1)));
    let r,gg,b; if(h<=k.wl){r=30;gg=60;b=110;} else {const t=(h-lo)/Math.max(1,hi-lo); r=110+120*t; gg=130+80*t; b=90+110*t;}
    const o=4*(i+j*NR); img.data[o]=r*sh; img.data[o+1]=gg*sh; img.data[o+2]=b*sh; img.data[o+3]=255;}
  const t=document.createElement("canvas"); t.width=NR; t.height=NR; t.getContext("2d").putImageData(img,0,0);
  g.imageSmoothingEnabled=true; g.drawImage(t,0,0,PX,PX);
  const X=(x)=>(x+W)/(2*W)*PX, Z=(z)=>(z+W)/(2*W)*PX;
  k.linien.sort((a,b)=>a.o-b.o);
  for(const l of k.linien){ g.strokeStyle=FARBE[Math.min(6,l.o)]; g.globalAlpha=l.bek?1:0.45; g.lineWidth=0.6+0.9*l.o; g.lineCap="round"; g.beginPath(); l.pts.forEach(([x,z],i)=>i?g.lineTo(X(x),Z(z)):g.moveTo(X(x),Z(z))); g.stroke();
    if(l.q){g.fillStyle=l.k?"#ffe14d":"#ff6a00"; g.beginPath(); g.arc(X(l.pts[0][0]),Z(l.pts[0][1]),l.k?1.6:3.2,0,7); g.fill();} }
  g.globalAlpha=1;
}
</script>`;
fs.writeFileSync(out.replace(/\.png$/, ".html"), html);
(async () => {
  const { chromium } = require("playwright");
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: saaten.length * (PX + 8) + 8, height: PX + 40 }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out });
  await b.close();
  console.log("bild", out);
})();

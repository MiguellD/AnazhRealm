"use strict";
// node bild-paar.cjs <out.png> <W> <titel> <a.json> <b.json> [labelA] [labelB]: zwei Zeilen Kacheln (vorher / nachher)
const fs = require("fs");
const [out, Ws, titel, ja, jb, la = "vorher", lb = "nachher"] = process.argv.slice(2);
const W = +Ws, PX = 520, NR = 175;
const reihen = [[la, JSON.parse(fs.readFileSync(ja, "utf8"))], [lb, JSON.parse(fs.readFileSync(jb, "utf8"))]];
const html = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#111;font:13px sans-serif;color:#eee">
<div style="padding:8px 8px 0;font-size:15px">${titel}</div><div id=r style="padding:4px 8px"></div><script>
const R=${JSON.stringify(reihen)}, W=${W}, NR=${NR}, PX=${PX};
const FARBE=["#000","#8fdcff","#2fa0ff","#1c5cff","#7a2cff","#ff2cc8","#ff3030"];
for (const [lab,K] of R){ const zeile=document.createElement("div"); zeile.style.cssText="display:flex;gap:8px;margin:4px 0;align-items:flex-start";
 const l=document.createElement("div"); l.textContent=lab; l.style.cssText="writing-mode:vertical-rl;transform:rotate(180deg);font-size:15px;padding:4px"; zeile.appendChild(l);
 for (const k of K){
  const d=document.createElement("div"); d.innerHTML="<div style='padding:2px 0'>"+k.saat+" · Sterne "+k.sterne.length+" · N "+Object.values(k.N).join("/")+"</div>";
  const c=document.createElement("canvas"); c.width=PX; c.height=PX; d.appendChild(c); zeile.appendChild(d);
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
  for(const l of k.linien){ g.strokeStyle=FARBE[Math.min(6,l.o)]; g.globalAlpha=l.bek?1:0.5; g.lineWidth=0.5+0.8*l.o; g.lineCap="round"; g.lineJoin="round"; g.beginPath(); l.pts.forEach(([x,z],i)=>i?g.lineTo(X(x),Z(z)):g.moveTo(X(x),Z(z))); g.stroke(); }
  g.globalAlpha=1;
  for(const [x,z,n] of k.sterne){ if (X(x)<0||X(x)>PX||Z(z)<0||Z(z)>PX) continue; g.strokeStyle="#ff2020"; g.lineWidth=2; g.beginPath(); g.arc(X(x),Z(z),5+1.5*n,0,7); g.stroke(); }
 }
 document.getElementById("r").appendChild(zeile);
}
</script>`;
fs.writeFileSync(out.replace(/\.png$/, ".html"), html);
(async () => {
  const { chromium } = require("playwright");
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 4 * (PX + 8) + 40, height: 2 * (PX + 30) + 50 }, deviceScaleFactor: 2 });
  await p.setContent(html);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
  console.log("bild", out);
})();

// V13.11 — Deckel-Dicke über Wasserblasen messen: dünner Überhang-Spalt
// (Artefakt) vs. echte Höhle (dicker Deckel, behaltenswert).
const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4335,root=path.resolve(__dirname,"..");
const mime={".html":"text/html",".js":"application/javascript",".wasm":"application/wasm",".json":"application/json",".woff2":"font/woff2",".css":"text/css",".png":"image/png"};
const server=http.createServer((req,res)=>{let p=req.url.split("?")[0];if(p==="/")p="/index.html";const fp=path.join(root,p);if(!fp.startsWith(root)){res.statusCode=403;return res.end();}fs.readFile(fp,(e,d)=>{if(e){res.statusCode=404;return res.end();}res.setHeader("Content-Type",mime[path.extname(fp)]||"application/octet-stream");res.end(d);});});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const browser=await puppeteer.launch({headless:true,args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--disable-setuid-sandbox"]});
const page=await browser.newPage();
page.on("pageerror",e=>console.log("[PAGE-ERROR]",(e.stack||e.message).split("\n")[0]));
await page.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"domcontentloaded",timeout:30000});
await page.evaluate(async()=>{const s=performance.now();while(performance.now()-s<25000){const r=window.anazhRealm;if(r&&r._gameLoopTick){try{r._gameLoopTick(performance.now());}catch(_){}if(r.state&&r.state.playerMesh&&r.state.voxelChunks&&r.state.voxelChunks.size>8)break;}await new Promise(x=>setTimeout(x,16));}});
const o=await page.evaluate(()=>{
  const r=window.anazhRealm,s=r.state,STATE=r.constructor.CELL_STATE;
  const cfg=r._voxelChunkConfig(0);const{dim,dimY,step}=cfg;const dimSq=dim*dim;
  const lidHist={"1 (1.8m, Spalt)":0,"2 (3.6m)":0,"3-4":0,"5+ (echte Höhle drüber)":0};
  // Für jede Wasser-Zelle mit SOLID direkt drüber: zähle SOLID-Dicke nach oben.
  for(const[key,entry]of s.voxelChunks){
    if(!entry||!entry.waterCells)continue;const cells=entry.waterCells;
    for(let k=0;k<dim;k++)for(let i=0;i<dim;i++){
      for(let j=0;j<dimY-1;j++){
        if(cells[i+k*dim+j*dimSq]===STATE.WATER && cells[i+k*dim+(j+1)*dimSq]===STATE.SOLID){
          // miss SOLID-Dicke ab j+1 aufwärts
          let lid=0;for(let jj=j+1;jj<dimY;jj++){if(cells[i+k*dim+jj*dimSq]===STATE.SOLID)lid++;else break;}
          if(lid<=1)lidHist["1 (1.8m, Spalt)"]++;
          else if(lid===2)lidHist["2 (3.6m)"]++;
          else if(lid<=4)lidHist["3-4"]++;
          else lidHist["5+ (echte Höhle drüber)"]++;
          break; // nur das oberste Wasser-unter-Solid pro Spalte
        }
      }
    }
  }
  return {lidHist};
});
console.log("\n=== DECKEL-DICKE über Wasserblasen ===\n");
console.log("Wie viele SOLID-Voxel liegen über der subterranen Wasser-Oberfläche?");
for(const k in o.lidHist)console.log(`  ${k.padEnd(28)} ${o.lidHist[k]}`);
console.log("\nDeutung: viele '1 (Spalt)' = dünne Überhang-Artefakte (Wasser quillt");
console.log("knapp unter der Oberfläche) -> entfernen. Viele '5+' = echte Höhlen -> behalten.");
await browser.close();server.close();})();

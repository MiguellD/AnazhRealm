// V13.10 — echtes Wand-Klettern messen (climb-Artefakt vs. Bluten trennen).
// Für jede Ufer-Rim-Spalte (Atlas-Land, Wasser im 3x3): wie hoch steht das
// Wasser über dem Terrain-Boden DIESER Spalte? climb = rim - surfY.
// Ein legitimes flaches Ufer hat kleinen climb; ein Wand-Bluten großen.
// Histogramm zeigt die Verteilung -> daraus den ehrlichen Schwellwert lesen.
const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4333,root=path.resolve(__dirname,"..");
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
  const h=s.hydrosphere;const wK=h.water.waterKind,hdim=h.dim,hcell=h.cell;
  const kindAt=(x,z)=>{const ci=Math.floor((x-h.originX)/hcell),cj=Math.floor((z-h.originZ)/hcell);if(ci<0||cj<0||ci>=hdim||cj>=hdim)return -1;return wK[ci+cj*hdim];};
  const hist={"<=1.8":0,"1.8-3.6":0,"3.6-7":0,"7-12":0,">12":0};
  let rimCols=0,sumClimb=0,maxClimb=0;
  for(const[key,entry]of s.voxelChunks){
    if(!entry||!entry.waterCells)continue;const cells=entry.waterCells;
    const pr=key.split(","),cx=parseInt(pr[0],10),cz=parseInt(pr[1],10);
    const span=dim*step,ox=cx*span,oz=cz*span;
    for(let k=0;k<dim;k++)for(let i=0;i<dim;i++){
      // höchste WATER-Zelle dieser Spalte
      let topWaterJ=-1;for(let j=dimY-1;j>=0;j--)if(cells[i+k*dim+j*dimSq]===STATE.WATER){topWaterJ=j;break;}
      if(topWaterJ<0)continue;
      const wx=ox+(i+0.5)*step,wz=oz+(k+0.5)*step;
      if(kindAt(wx,wz)===1||kindAt(wx,wz)===2)continue; // echtes Atlas-Wasser, kein Rim
      // Ufer-Rim-Spalte: climb = WasserOberkante - TerrainBoden
      const surfY=r._voxelSurfaceY(wx,wz);
      const base=s.terrainBaseHeight||0,floorDrop=cfg.floorDrop,oy=base-floorDrop;
      const waterTopY=oy+(topWaterJ+1)*step;
      if(!Number.isFinite(surfY))continue;
      const climb=waterTopY-surfY;
      rimCols++;sumClimb+=Math.max(0,climb);if(climb>maxClimb)maxClimb=climb;
      if(climb<=1.8)hist["<=1.8"]++;else if(climb<=3.6)hist["1.8-3.6"]++;else if(climb<=7)hist["3.6-7"]++;else if(climb<=12)hist["7-12"]++;else hist[">12"]++;
    }
  }
  return {rimCols,avgClimb:rimCols?sumClimb/rimCols:0,maxClimb,hist};
});
console.log("\n=== WAND-KLETTERN V13.10 (Ufer-Rim-Spalten: Wasser über eigenem Terrain) ===\n");
console.log(`Ufer-Rim-Spalten: ${o.rimCols}, avg climb=${o.avgClimb.toFixed(2)}m, max=${o.maxClimb.toFixed(2)}m`);
console.log(`Histogramm (climb = WasserOberkante - TerrainBoden):`);
console.log(`  <=1.8m (1 Voxel, legitimes Ufer): ${o.hist["<=1.8"]}`);
console.log(`  1.8-3.6m (2 Voxel, Grenzfall):    ${o.hist["1.8-3.6"]}`);
console.log(`  3.6-7m  (sichtbares Klettern):    ${o.hist["3.6-7"]}`);
console.log(`  7-12m   (klares Wand-Bluten):     ${o.hist["7-12"]}`);
console.log(`  >12m    (extremes Bluten):        ${o.hist[">12"]}`);
await browser.close();server.close();})();

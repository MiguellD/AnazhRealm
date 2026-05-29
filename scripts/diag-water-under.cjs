// V13.11 — Schöpfer-Hypothese testen: "Wasserblasen an der UNTERSEITE des
// Terrains, die in Strukturen hochdrücken, besonders in Seenähe". Headless
// messbar als Zell-Topologie (keine Pixel): eine WATER-Zelle mit SOLID direkt
// DARÜBER = Wasser unter einem Terrain-Deckel (subterran). Plus: WATER-Zellen
// die in eine Architektur-AABB (gestempelte SOLID) hineinragen / direkt drunter.
const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4334,root=path.resolve(__dirname,"..");
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
  let totalWater=0, waterUnderSolid=0, waterUnderSolidCols=0, deepestUnderStack=0;
  // Pro Spalte: gibt es ein WATER-Segment mit SOLID darüber UND (Luft/Wasser darüber-darüber)?
  // = eine Wasserblase unter einem Terrain-Deckel.
  for(const[key,entry]of s.voxelChunks){
    if(!entry||!entry.waterCells)continue;const cells=entry.waterCells;
    for(let k=0;k<dim;k++)for(let i=0;i<dim;i++){
      let colHasUnder=false;
      for(let j=0;j<dimY;j++){
        const c=cells[i+k*dim+j*dimSq];
        if(c===STATE.WATER){
          totalWater++;
          // SOLID direkt darüber?
          if(j+1<dimY && cells[i+k*dim+(j+1)*dimSq]===STATE.SOLID){
            waterUnderSolid++; colHasUnder=true;
          }
        }
      }
      if(colHasUnder)waterUnderSolidCols++;
    }
  }
  // Architektur-Footprint: WATER-Zellen innerhalb einer blockerAABB (xz+y).
  let waterInArchFootprint=0, archCount=0;
  const cfg0=r._voxelChunkConfig(0);
  for(const e of (s.architectures||[])){
    if(!e||!e.blockerAABBs)continue;archCount++;
    for(const a of e.blockerAABBs){
      // grobe Welt-Raum-Zählung der WATER-Zellen in der AABB-Säule (xz) unter topY
      for(const[key,entry]of s.voxelChunks){
        if(!entry||!entry.waterCells)continue;
        const pr=key.split(","),cx=parseInt(pr[0],10),cz=parseInt(pr[1],10);
        const span=dim*step,ox=cx*span,oz=cz*span;
        if(a.maxX<ox||a.minX>ox+span||a.maxZ<oz||a.minZ>oz+span)continue;
        const base=s.terrainBaseHeight||0,oy=base-cfg0.floorDrop;
        const cells=entry.waterCells;
        for(let k=0;k<dim;k++)for(let i=0;i<dim;i++){
          const wx=ox+(i+0.5)*step,wz=oz+(k+0.5)*step;
          if(wx<a.minX||wx>a.maxX||wz<a.minZ||wz>a.maxZ)continue;
          for(let j=0;j<dimY;j++){
            const wy=oy+(j+0.5)*step;
            if(wy<a.botY-step||wy>a.topY+step)continue;
            if(cells[i+k*dim+j*dimSq]===STATE.WATER)waterInArchFootprint++;
          }
        }
      }
    }
  }
  return {totalWater,waterUnderSolid,waterUnderSolidCols,pctUnder:totalWater?100*waterUnderSolid/totalWater:0,archCount,waterInArchFootprint};
});
console.log("\n=== WASSER UNTER TERRAIN / IN STRUKTUREN (Schöpfer-Hypothese) ===\n");
console.log(`WATER-Zellen gesamt:                 ${o.totalWater}`);
console.log(`WATER mit SOLID direkt darüber:      ${o.waterUnderSolid}  (${o.pctUnder.toFixed(1)}%)  <-- "unter Terrain-Deckel"`);
console.log(`Spalten mit solcher Wasserblase:     ${o.waterUnderSolidCols}`);
console.log(`Architekturen geprüft:               ${o.archCount}`);
console.log(`WATER-Zellen in Architektur-Footprint: ${o.waterInArchFootprint}  <-- "Wasser in Struktur"`);
console.log("");
console.log("Deutung: hoher %-Anteil 'unter Deckel' = der Flood füllt Luft-Hohlräume");
console.log("UNTER der Terrain-Oberfläche (Density-Höhlen/Überhänge), die lateral mit");
console.log("dem See verbunden sind -> sichtbar als Wasser, das aus dem Boden/in Strukturen drückt.");
await browser.close();server.close();})();

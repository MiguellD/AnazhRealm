// V13.12 — Perf-Regression jagen: timing pro Wasser-Iso-Build + Cell-Build.
const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4341,root=path.resolve(__dirname,"..");
const mime={".html":"text/html",".js":"application/javascript",".wasm":"application/wasm",".json":"application/json",".woff2":"font/woff2",".css":"text/css",".png":"image/png"};
const server=http.createServer((req,res)=>{let p=req.url.split("?")[0];if(p==="/")p="/index.html";const fp=path.join(root,p);if(!fp.startsWith(root)){res.statusCode=403;return res.end();}fs.readFile(fp,(e,d)=>{if(e){res.statusCode=404;return res.end();}res.setHeader("Content-Type",mime[path.extname(fp)]||"application/octet-stream");res.end(d);});});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const browser=await puppeteer.launch({headless:true,args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--disable-setuid-sandbox"]});
const page=await browser.newPage();
page.on("pageerror",e=>console.log("[PAGE-ERROR]",(e.stack||e.message).split("\n")[0]));
await page.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"domcontentloaded",timeout:30000});
await page.evaluate(async()=>{const s=performance.now();while(performance.now()-s<25000){const r=window.anazhRealm;if(r&&r._gameLoopTick){try{r._gameLoopTick(performance.now());}catch(_){}if(r.state&&r.state.playerMesh&&r.state.voxelChunks&&r.state.voxelChunks.size>8)break;}await new Promise(x=>setTimeout(x,16));}});
const o=await page.evaluate(()=>{
  const r=window.anazhRealm,s=r.state;
  const keys=[...s.voxelChunks.keys()].filter(k=>{const e=s.voxelChunks.get(k);return e&&e.waterCells;}).slice(0,8);
  const time=(fn,n)=>{const t0=performance.now();for(let i=0;i<n;i++)fn();return (performance.now()-t0)/n;};
  let isoMs=0,n=0;
  for(const key of keys){const ci=key.indexOf(",");const cx=+key.slice(0,ci),cz=+key.slice(ci+1);
    isoMs+=time(()=>r._buildVoxelChunkWaterIsoSurface(cx,cz),3);n++;}
  return {waterChunks:keys.length, avgIsoMs: n?isoMs/n:0};
});
console.log("\n=== PERF: Wasser-Iso-Build pro Chunk ===\n");
console.log(`Wasser-Chunks: ${o.waterChunks}`);
console.log(`Ø Iso-Build/Chunk: ${o.avgIsoMs.toFixed(1)} ms  ${o.avgIsoMs>50?"<-- ZU TEUER (Regression!)":o.avgIsoMs>15?"<-- spürbar":"(ok)"}`);
console.log("\n(Bei mehreren Chunks/Frame × >50ms => FPS-Kollaps. Headless-swiftshader ist langsamer als echte GPU, aber die RELATIVE Kostengröße zählt.)");
await browser.close();server.close();})();

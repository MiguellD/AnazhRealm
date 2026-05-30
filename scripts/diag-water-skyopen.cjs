// V13.11 — wie viel subterranes Wasser tritt aus? Pro WATER-Zelle: hat sie
// AIR DIREKT DARÜBER (= echte horizontale Oberfläche, oben-offen lokal) vs.
// SOLID darüber (= unter Deckel, verdeckt)? Und: erreicht ein vertikaler Strahl
// nach oben den Himmel (über Band) ohne SOLID = global oben-offen?
const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4336,root=path.resolve(__dirname,"..");
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
  const cfg=r._voxelChunkConfig(0);const{dim,dimY,step}=cfg;const dimSq=dim*dimSq2(dim);function dimSq2(d){return d*d;}
  const dq=dim*dim;
  let surfaceCells=0;       // WATER mit AIR direkt drüber (echte Oberfläche)
  let surfaceUnderLid=0;    // davon: aber irgendwo höher in der Spalte SOLID (subterran-offen lokal, aber Deckel drüber = Höhlenkammer-Decke)
  let surfaceSkyOpen=0;     // davon: vertikaler Strahl nach oben = kein SOLID (= echter See/offene Oberfläche)
  for(const[key,entry]of s.voxelChunks){
    if(!entry||!entry.waterCells)continue;const cells=entry.waterCells;
    for(let k=0;k<dim;k++)for(let i=0;i<dim;i++){
      for(let j=0;j<dimY-1;j++){
        if(cells[i+k*dim+j*dq]!==STATE.WATER)continue;
        if(cells[i+k*dim+(j+1)*dq]!==STATE.AIR)continue;
        // echte horizontale Oberfläche an (i,k,j): WATER unten, AIR drüber
        surfaceCells++;
        // ist über dieser AIR-Zelle irgendwo SOLID (= in einer Kammer)?
        let solidAbove=false;
        for(let jj=j+1;jj<dimY;jj++){if(cells[i+k*dim+jj*dq]===STATE.SOLID){solidAbove=true;break;}}
        if(solidAbove)surfaceUnderLid++; else surfaceSkyOpen++;
      }
    }
  }
  return {surfaceCells,surfaceUnderLid,surfaceSkyOpen};
});
console.log("\n=== WASSER-OBERFLÄCHEN: offen vs. unter Deckel ===\n");
console.log(`Oberflächen-Zellen gesamt (WATER mit AIR drüber): ${o.surfaceCells}`);
console.log(`  himmel-offen (kein SOLID drüber, echter See):   ${o.surfaceSkyOpen}`);
console.log(`  UNTER DECKEL (SOLID höher → Höhlenkammer/Austritt): ${o.surfaceUnderLid}  <-- die Artefakt-Oberflächen`);
console.log("");
console.log("Deutung: 'unter Deckel'-Oberflächen sind Wasser-Spiegel INNERHALB von");
console.log("Höhlenkammern. Wenn die seitlich an einen Hang stoßen → sichtbarer Austritt.");
console.log("Fix: nur himmel-offene Oberflächen rendern → Höhle bleibt geflutet (tauchbar),");
console.log("zeigt aber keinen Spiegel der aus dem Hang quillt.");
await browser.close();server.close();})();

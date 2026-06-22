// diag-idle-freeze.cjs — JAGT den periodischen Idle-Freeze (Schöpfer: „im Stehen, ohne Eingabe,
// 2s Bild dann 10s Freeze"). Bootet, settled, FIXIERT den Spieler (kein Streaming), pumpt den Loop
// idle für viele Ticks und misst PRO TICK: Wall-Zeit + welche schwere Methode dominierte + Heap +
// Szene-Kinder + Kreaturen/Architekturen + ArrayBuffers. Findet: einen periodischen Sync-Block
// (Skin-Bake-Fallback? Hydro? Nexus-Spawn?) ODER ein Leck (Heap/Szene wächst → GC-Freeze).
const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4381,root=path.resolve(__dirname,"..");
const mime={".html":"text/html",".js":"application/javascript",".wasm":"application/wasm",".json":"application/json",".woff2":"font/woff2",".css":"text/css",".png":"image/png"};
const server=http.createServer((req,res)=>{let p=req.url.split("?")[0];if(p==="/")p="/index.html";const fp=path.join(root,p);if(!fp.startsWith(root)){res.statusCode=403;return res.end();}fs.readFile(fp,(e,d)=>{if(e){res.statusCode=404;return res.end();}res.setHeader("Content-Type",mime[path.extname(fp)]||"application/octet-stream");res.end(d);});});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const browser=await puppeteer.launch({headless:true,protocolTimeout:300000,args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox","--disable-setuid-sandbox","--js-flags=--expose-gc"]});
const page=await browser.newPage();
page.on("pageerror",(e)=>console.log("[PAGE-ERROR]",(e.stack||e.message).split("\n")[0]));
page.on("console",(m)=>{const t=m.text();if(/error|fehler|crash|fallback|sync|freeze/i.test(t))console.log("[CONSOLE]",t.slice(0,140));});
await page.evaluateOnNewDocument(()=>{window.__anazhHeadlessNullRenderer=true;});
await page.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"domcontentloaded",timeout:30000});
await page.evaluate(async()=>{const dl=performance.now()+90000;while((!window.anazhRealm||!window.anazhRealm.state||typeof window.anazhRealm._gameLoopTick!=="function"||!window.anazhRealm.state.blueprints)&&performance.now()<dl)await new Promise(r=>setTimeout(r,100));
  // settle: ~2s pumpen
  const r=window.anazhRealm;for(let i=0;i<200;i++){try{r._gameLoopTick(performance.now());}catch(e){}await new Promise(x=>setTimeout(x,4));}
});
const out=await page.evaluate(async()=>{
  const r=window.anazhRealm,s=r.state;
  // Spieler FIXIEREN (kein Streaming/Bewegung)
  const pm=s.playerMesh; const fx=pm?pm.position.x:0, fz=pm?pm.position.z:0, fy=pm?pm.position.y:0;
  // schwere Methoden wrappen
  const heavy=["_buildCreatureSkinGeometry","_buildCreatureGroup","_buildHumanGroup","spawnArchitecture","_buildArchMeshMerged","spawnCreatureAt","_computeHydrosphere","tickFaunaLifecycle","_loopNexusUpdate","_loopWeatherAndGrowth","updateCreatures","dslRun","_rebuildVoxelChunk","_ensureVoxelChunkAt","_buildVoxelChunkData","_assembleSkinGeometry"];
  const acc={}; let curTick={};
  for(const m of heavy){ if(typeof r[m]==="function"){ const orig=r[m].bind(r); r[m]=function(...a){const t0=performance.now();const v=orig(...a);const dt=performance.now()-t0;acc[m]=(acc[m]||0)+dt;curTick[m]=(curTick[m]||0)+dt;return v;};}}
  const heapNow=()=>performance.memory?performance.memory.usedJSHeapSize/1048576:0;
  const sceneN=()=>s.scene?s.scene.children.length:0;
  const samples=[]; const worst=[]; const N=4000;
  const h0=heapNow(), sc0=sceneN(), cr0=(s.creatures||[]).length, ar0=(s.architectures||[]).length;
  for(let i=0;i<N;i++){
    if(pm){pm.position.set(fx,fy,fz);} // Spieler fix halten
    curTick={};
    const t0=performance.now();
    try{r._gameLoopTick(performance.now());}catch(e){}
    const dt=performance.now()-t0;
    // dominante Methode dieses Ticks
    let dom=null,domMs=0; for(const k in curTick){if(curTick[k]>domMs){domMs=curTick[k];dom=k;}}
    if(dt>40||domMs>30){ worst.push({i,dt:+dt.toFixed(1),dom,domMs:+domMs.toFixed(1),heap:+heapNow().toFixed(0),scene:sceneN(),cr:(s.creatures||[]).length,ar:(s.architectures||[]).length}); }
    if(i%500===0) samples.push({i,heap:+heapNow().toFixed(0),scene:sceneN(),cr:(s.creatures||[]).length,ar:(s.architectures||[]).length,ab:(typeof performance!=="undefined")?0:0});
    if(i%50===0) await new Promise(x=>setTimeout(x,1)); // dem Event-Loop/Worker Luft
  }
  return {h0:+h0.toFixed(0),sc0,cr0,ar0,hEnd:+heapNow().toFixed(0),scEnd:sceneN(),crEnd:(s.creatures||[]).length,arEnd:(s.architectures||[]).length,acc,worst:worst.slice(0,30),worstCount:worst.length,samples,fixed:{fx,fy,fz}};
});
await browser.close();server.close();
console.log("===== IDLE-FREEZE-JÄGER (Spieler FIX, "+"4000 Ticks) =====\n");
console.log(`  Heap: ${out.h0} → ${out.hEnd} MB (${out.hEnd-out.h0>5?"⚠ +"+(out.hEnd-out.h0)+" MB WÄCHST":"stabil"})`);
console.log(`  Szene-Kinder: ${out.sc0} → ${out.scEnd} · Kreaturen: ${out.cr0} → ${out.crEnd} · Architekturen: ${out.ar0} → ${out.arEnd}`);
console.log(`  Ticks mit Spike (>40ms): ${out.worstCount} von 4000`);
console.log("\n  Kumulierte Methoden-Zeit (Top, ms über 4000 Ticks):");
Object.entries(out.acc).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([k,v])=>console.log(`    ${k.padEnd(28)} ${v.toFixed(0).padStart(8)} ms`));
console.log("\n  Schlimmste Ticks (i · dt · dominante Methode · heap · scene/cr/ar):");
out.worst.slice(0,18).forEach(w=>console.log(`    #${String(w.i).padStart(4)}  ${String(w.dt).padStart(7)}ms  ${(w.dom||"?").padEnd(26)} ${String(w.domMs).padStart(6)}ms  heap${w.heap} sc${w.scene}/cr${w.cr}/ar${w.ar}`));
process.exit(0);
})().catch(e=>{console.error("Crash:",e);process.exit(1);});

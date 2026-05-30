// V13.13.x — Scale-Stempel-Hypothese direkt verifizieren: spawnt felsturm mit
// scale=2 und vergleicht (a) die sichtbare Mesh-bbox vs (b) die blockerAABB-
// Ausdehnung (der Wasser-Stempel). Wenn der Stempel KLEINER als das Mesh ist,
// flutet Wasser den sichtbaren-aber-ungestempelten Ring = der "Schatten".
const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4349,root=path.resolve(__dirname,"..");
const mime={".html":"text/html",".js":"application/javascript",".wasm":"application/wasm",".json":"application/json",".woff2":"font/woff2",".css":"text/css",".png":"image/png"};
const server=http.createServer((req,res)=>{let p=req.url.split("?")[0];if(p==="/")p="/index.html";const fp=path.join(root,p);if(!fp.startsWith(root)){res.statusCode=403;return res.end();}fs.readFile(fp,(e,d)=>{if(e){res.statusCode=404;return res.end();}res.setHeader("Content-Type",mime[path.extname(fp)]||"application/octet-stream");res.end(d);});});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const browser=await puppeteer.launch({headless:true,args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--disable-setuid-sandbox"]});
const page=await browser.newPage();
page.on("pageerror",e=>console.log("[PAGE-ERROR]",(e.stack||e.message).split("\n")[0]));
await page.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"domcontentloaded",timeout:30000});
await page.evaluate(async()=>{const s=performance.now();while(performance.now()-s<25000){const r=window.anazhRealm;if(r&&r._gameLoopTick){try{r._gameLoopTick(performance.now());}catch(_){}if(r.state&&r.state.playerMesh&&r.state.voxelChunks&&r.state.voxelChunks.size>8)break;}await new Promise(x=>setTimeout(x,16));}});
const o=await page.evaluate(()=>{
  const r=window.anazhRealm,s=r.state;const THREE=window.THREE;
  const pm=s.playerMesh.position;
  const test=(scale)=>{
    const gy=r.getTerrainHeightAt(pm.x+5,pm.z);
    const e=r.spawnArchitecture("felsturm",{x:pm.x+5,y:gy+0.5,z:pm.z},{scale,seed:7});
    for(let f=0;f<20;f++){try{r._gameLoopTick(performance.now());}catch(_){}}
    if(typeof r._archEnsureCollision==="function")try{r._archEnsureCollision(e);}catch(_){}
    let meshBox=null;if(e.mesh){meshBox=new THREE.Box3().setFromObject(e.mesh);}
    // blockerAABB-Hüllbox
    let sx=Infinity,sX=-Infinity,sy=Infinity,sY=-Infinity,sz=Infinity,sZ=-Infinity;
    for(const a of (e.blockerAABBs||[])){sx=Math.min(sx,a.minX);sX=Math.max(sX,a.maxX);sz=Math.min(sz,a.minZ);sZ=Math.max(sZ,a.maxZ);sy=Math.min(sy,a.botY);sY=Math.max(sY,a.topY);}
    const out={scale,blockerN:(e.blockerAABBs||[]).length,
      mesh: meshBox?{dx:+(meshBox.max.x-meshBox.min.x).toFixed(1),dy:+(meshBox.max.y-meshBox.min.y).toFixed(1),cy:+((meshBox.max.y+meshBox.min.y)/2).toFixed(1)}:null,
      stamp: isFinite(sx)?{dx:+(sX-sx).toFixed(1),dy:+(sY-sy).toFixed(1),cy:+((sY+sy)/2).toFixed(1)}:null};
    const idx=s.architectures.indexOf(e);if(idx>=0)s.architectures.splice(idx,1);
    if(r._disposeArchitectureCollision)try{r._disposeArchitectureCollision(e);}catch(_){}
    if(e.mesh&&s.scene)s.scene.remove(e.mesh);
    return out;
  };
  return {s1:test(1.0),s2:test(2.0)};
});
console.log("\n=== SCALE-STEMPEL-HYPOTHESE (felsturm) ===\n");
for(const k of ["s1","s2"]){const t=o[k];
  console.log(`scale=${t.scale}: blockerAABBs=${t.blockerN}`);
  console.log(`   Mesh (sichtbar):  Breite=${t.mesh?t.mesh.dx:"?"}  Höhe=${t.mesh?t.mesh.dy:"?"}  Mitte-Y=${t.mesh?t.mesh.cy:"?"}`);
  console.log(`   Stempel (Wasser): Breite=${t.stamp?t.stamp.dx:"?"}  Höhe=${t.stamp?t.stamp.dy:"?"}  Mitte-Y=${t.stamp?t.stamp.cy:"?"}`);
}
const t=o.s2;
if(t.mesh&&t.stamp){
  const wRatio=(t.mesh.dx/t.stamp.dx).toFixed(2), hRatio=(t.mesh.dy/t.stamp.dy).toFixed(2);
  console.log(`\nscale=2 Verhältnis Mesh/Stempel: Breite ×${wRatio}, Höhe ×${hRatio}`);
  if(wRatio>1.3||hRatio>1.3||Math.abs(t.mesh.cy-t.stamp.cy)>2)
    console.log("✅ SCALE-STEMPEL-BUG bestätigt: das Mesh ist größer/woanders als der Stempel → Wasser flutet den ungestempelten sichtbaren Bereich = der Schatten.");
  else console.log("⚠️ Stempel deckt das Mesh — Scale ist NICHT die Wurzel.");
}
await browser.close();server.close();})();

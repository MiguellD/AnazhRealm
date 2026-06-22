const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4385,root=path.resolve(__dirname,"..");
const mime={".html":"text/html",".js":"application/javascript",".wasm":"application/wasm",".json":"application/json",".woff2":"font/woff2",".css":"text/css",".png":"image/png"};
const server=http.createServer((req,res)=>{let p=req.url.split("?")[0];if(p==="/")p="/index.html";const fp=path.join(root,p);if(!fp.startsWith(root)){res.statusCode=403;return res.end();}fs.readFile(fp,(e,d)=>{if(e){res.statusCode=404;return res.end();}res.setHeader("Content-Type",mime[path.extname(fp)]||"application/octet-stream");res.end(d);});});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const browser=await puppeteer.launch({headless:true,protocolTimeout:200000,args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox","--disable-setuid-sandbox"]});
const page=await browser.newPage();
await page.evaluateOnNewDocument(()=>{window.__anazhHeadlessNullRenderer=true;});
await page.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"domcontentloaded",timeout:30000});
await page.evaluate(async()=>{const dl=performance.now()+90000;while((!window.anazhRealm||!window.anazhRealm.state||typeof window.anazhRealm._gameLoopTick!=="function"||!window.anazhRealm.state.blueprints)&&performance.now()<dl)await new Promise(r=>setTimeout(r,100));});
const out=await page.evaluate(async()=>{
  const r=window.anazhRealm,s=r.state,pm=s.playerMesh;
  const fx=pm?pm.position.x:0,fy=pm?pm.position.y:0,fz=pm?pm.position.z:0;
  // _ensureSkyEnvironment wrappen: zähle REGENERATE (Rückgabe true NACH dem teuren Pfad) vs early-return
  let regen=0, calls=0; const todAt=[];
  const orig=r._ensureSkyEnvironment.bind(r);
  r._ensureSkyEnvironment=function(force){ calls++; const before=s._skyEnvLastColor?{...s._skyEnvLastColor}:null; const v=orig(force); const after=s._skyEnvLastColor; if(after&&(!before||before.r!==after.r||before.g!==after.g||before.b!==after.b)){regen++; todAt.push(+(s.timeOfDay||0).toFixed(4));} return v; };
  const N=6000; let tick=0;
  for(let i=0;i<N;i++){ if(pm)pm.position.set(fx,fy,fz); try{r._gameLoopTick(performance.now());}catch(e){} tick++; if(i%50===0)await new Promise(x=>setTimeout(x,1)); }
  return {N, calls, regen, dayLen:s.dayLengthSec||s.dayLength||null, tod0:todAt[0],todEnd:+(s.timeOfDay||0).toFixed(4), todAt:todAt.slice(0,12)};
});
await browser.close();server.close();
console.log("===== SKY-ENV PMREM-NEUGENERIERUNGS-FREQUENZ (Idle, "+out.N+" Ticks) =====\n");
console.log(`  _ensureSkyEnvironment aufgerufen: ${out.calls} ×`);
console.log(`  PMREM NEU generiert (Farb-Drift >0.04): ${out.regen} ×  → alle ~${out.regen>0?Math.round(out.N/out.regen):"∞"} Ticks (~${out.regen>0?(out.N/out.regen/60).toFixed(1):"∞"} s bei 60fps)`);
console.log(`  timeOfDay: ${out.tod0} → ${out.todEnd}`);
console.log(`  Regenerierungs-Zeitpunkte (timeOfDay): ${out.todAt.join(", ")}`);
console.log("\n  → JEDE dieser Neugenerierungen ist auf der echten GPU ein PMREM-fromEquirectangular-Stall (headless übersprungen). Periodisch im Stehen = der Freeze.");
process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

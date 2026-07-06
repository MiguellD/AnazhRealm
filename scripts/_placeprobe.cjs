const puppeteer=require("puppeteer"),http=require("http"),fs=require("fs"),path=require("path");
const PORT=4559,root=path.resolve(__dirname,"..");
const mime={".html":"text/html",".js":"application/javascript",".wasm":"application/wasm",".json":"application/json",".css":"text/css",".png":"image/png"};
const server=http.createServer((req,res)=>{let p=req.url.split("?")[0];if(p==="/")p="/index.html";const fp=path.join(root,p);if(!fp.startsWith(root)){res.statusCode=403;return res.end();}fs.readFile(fp,(e,d)=>{if(e){res.statusCode=404;return res.end();}res.setHeader("Content-Type",mime[path.extname(fp)]||"application/octet-stream");res.end(d);});});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const b=await puppeteer.launch({headless:true,protocolTimeout:200000,args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--disable-setuid-sandbox"]});
const page=await b.newPage();page.on("pageerror",e=>console.log("[ERR]",(e.stack||e.message).split("\n")[0]));
await page.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"domcontentloaded",timeout:30000});
const out=await page.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));let stub=false;const s0=performance.now();
while(performance.now()-s0<60000){const r=window.anazhRealm;if(r&&!stub&&r.state&&r.state.renderer&&!r.state.renderer._isHeadlessNull){r.state.renderer.render=function(){};if(r.state.renderer.renderAsync)r.state.renderer.renderAsync=()=>Promise.resolve();r.state.postProcessingFailed=true;r._bootWarmDone=true;stub=true;}if(r&&typeof r._gameLoopTick==="function"){try{r._gameLoopTick(performance.now());}catch(_e){}if(r.state.voxelChunks&&r.state.voxelChunks.size>=12)break;}await sl(4);}
const r=window.anazhRealm,s=r.state;const f=r._ensureAssetFoundry();const t0=performance.now();while(f&&!f.ready&&performance.now()-t0<30000)await sl(100);
// Foundry-Konvergenz erzwingen (wie der Vergleich): Budget gesund + Rewarm.
for(let i=0;i<60;i++){s._frameOverBudget=false;try{r._foundryRewarmColdTrees();r._gameLoopTick(performance.now());}catch(_e){}if(i%20===0)await sl(25);}
let total=0,placed=0,cold=0,l0=0,l1=0,l2=0;
for(const e of s.architectures||[]){const sp=((e._lodSpecies||e.type||"")+"").toLowerCase();if(!/baum/.test(sp))continue;total++;if(e.instanced||e.mesh||e.instFoundry){placed++;if(e._lodLevel===0)l0++;else if(e._lodLevel===1)l1++;else if(e._lodLevel===2)l2++;}else cold++;}
return{chunks:s.voxelChunks?s.voxelChunks.size:0,total,placed,cold,lod:{l0,l1,l2}};});
console.log(JSON.stringify(out));console.log("LESART: placed >> 9 (viele als L2-Billboard) => der ferne Wald fuellt sich.");
await b.close();server.close();process.exit(0);})();

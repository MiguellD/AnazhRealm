const ROOT="C:/Users/micha/AnazhRealm-profiband";
const fs=require("fs"), path=require("path");
const W = require(ROOT+"/scripts/lib/welt-boot.cjs"); const vm=W.vm;
const absorber=()=>{const a=new Proxy(function(){}, {get:(_t,k)=>(k===Symbol.toPrimitive?()=>0:a), apply:()=>a, construct:()=>a}); return a;};
const sb = { console:{log(){},warn(){},error(){}}, Math, performance:{now:()=>Date.now()}, setTimeout, clearTimeout };
sb.self=sb.globalThis=sb.window=sb; sb.THREE=W.ENGINE_THREE();
sb.OffscreenCanvas=function(w,h){this.width=w;this.height=h;this.getContext=()=>new Proxy({}, {get:(t,k)=>{ if(k==="createImageData"||k==="getImageData") return (a,b,c,d)=>({data:new Uint8ClampedArray((c||a)*(d||b)*4)}); if(k in t) return t[k]; return ()=>absorber(); }, set:(t,k,v)=>{t[k]=v;return true;}});};
vm.createContext(sb);
for (const f of ["phyto-core.js","foundry-core.js","foundry-bruecke.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT,f),"utf8"), sb, {filename:f});
vm.runInContext("self.__K = {PRESETS, buildInstance, skelettDerGestalt, PRC: PORTAL_RENDER_CONFIG}", sb);
const K=sb.__K, THREE=sb.THREE;
let err=null; sb.console.warn=(...a)=>{err=a.map(String).join(" ").slice(0,300)};
try{K.buildInstance("eiche",1,0);}catch(e){}
console.log("warm err", err); err=null;
const tris=g=>{let n=0; g.traverse(o=>{if(o.isMesh) n+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;}); return n;};
for (const id of ["eiche","fichte","strauch"]) for (const lod of [0,1,2]) { const t=Date.now(); const g=K.buildInstance(id,1,lod); console.log(id,lod,"tris",tris(g),"ms",Date.now()-t, err||""); err=null; }
try{K.buildInstance("eiche",1,0);}catch(e){}
for (const lod of [1,0,1,0]) for (const id of ["eiche","birke","fichte","strauch"]) { const t=Date.now(); const g=K.buildInstance(id,3,lod); console.log(lod,id,tris(g),Date.now()-t); }
let t=Date.now(); for (let s=1;s<=10;s++) K.skelettDerGestalt("eiche",s,0); console.log("10 skel L0", Date.now()-t);
t=Date.now(); for (let s=1;s<=10;s++) K.skelettDerGestalt("eiche",s,1); console.log("10 skel L1", Date.now()-t);

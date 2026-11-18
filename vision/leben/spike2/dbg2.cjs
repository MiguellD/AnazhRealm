const { KA, KB, setzeSkala } = require("./wuchsformen.cjs");
function zeig(K,id,lod){ const g=K.buildInstance(id,1,lod);
g.traverse(o=>{ if(!o.isMesh) return; const ge=o.geometry; const T=ge.attributes.aType.array; const h={}; for(const t of T) h[t]=(h[t]||0)+1; console.log(id,"lod",lod,"tris",(ge.index?ge.index.count:ge.attributes.position.count)/3,"types",JSON.stringify(h)); }); }
const w=KA.welt("strauch");
for (const r of [0, 0.004, 0.016, 0.04]) { KB.PRESETS.ts={kind:"shrub",panel:"plant",s:Object.assign({},KB.PRESETS.strauch.s),ph:{maxDepth:10}}; if(r) KB.PRESETS.ts.ph.gesetz={speicher:{rReq:r/w,fBlatt:Math.exp(-r/0.01)}}; KB.PRC.placement.scale.ts=KB.PRC.placement.scale.strauch; zeig(KB,"ts",0); }
const P = KB.PC.treeParams(KB.PRESETS.strauch.s, 1, 0, KB.PRESETS.strauch, 0); console.log("strauch P.maxDepth", P.maxDepth, "height", P.height.toFixed(2));

const { KA, KB, setzeSkala } = require("./wuchsformen.cjs");
function zeig(K,id,lod=0){ const g=K.buildInstance(id,1,lod);
g.traverse(o=>{ if(!o.isMesh) return; const ge=o.geometry; const T=ge.attributes.aType.array; const h={}; for(const t of T) h[t]=(h[t]||0)+1; let y0=1e9,y1=-1e9; const P=ge.attributes.position.array; for(let i=1;i<P.length;i+=3){y0=Math.min(y0,P[i]);y1=Math.max(y1,P[i]);} console.log(id,"mesh verts",P.length/3,"tris",(ge.index?ge.index.count:P.length/3)/3,"types",JSON.stringify(h),"y",y0.toFixed(2),y1.toFixed(2)); }); }
KB.PRESETS.t1={kind:"tree",panel:"plant",s:{api:0.75,delta:2.3,slim:0.5,trop:-0.3,leaf:0.5},ph:{height:1.2,maxDepth:2,roots:0,flare:0,crownBase:0,barkA:0x4e7a3a,barkB:0x6a9a4a,gesetz:{trunkR:0.04,stammAnteil:0.55,speicher:{form:"saeule",rReq:0.04,taper:0.995,fBlatt:0.02,rippen:8}}}};
setzeSkala(KB,"t1",1); zeig(KB,"t1");
KB.PRESETS.t2=JSON.parse(JSON.stringify(KB.PRESETS.t1)); KB.PRESETS.t2.ph.gesetz.speicher.fBlatt=0; setzeSkala(KB,"t2",1); zeig(KB,"t2");
zeig(KA,"blume");

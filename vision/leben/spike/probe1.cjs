const P=require("C:/Users/micha/AnazhRealm-profiband/planet-core.js");
let t=Date.now(); const plan=P.planetPlan("anazh", P.PLANET_ERDE); const S=P.planetScheibe(plan,0); console.log("plan+scheibe ms",Date.now()-t);
t=Date.now(); const found={};
for (let b=-70;b<=70;b+=5) for (let l=-180;l<180;l+=10){ const K=P.planetKlima(S,b,l,-1,{}); if(!(K.hoeheKm>0)) continue; const B=P.planetBiom(K,K.hoeheKm*1000,{}); const name=Object.keys(P.WHITTAKER).find(k=>P.WHITTAKER[k]===B.biom); (found[name]=found[name]||[]).push([b,l,K.tJahrC.toFixed(1),K.tWinterC.toFixed(1),K.tSommerC.toFixed(1),K.niederschlagMm.toFixed(0)]);}
console.log("scan ms",Date.now()-t);
for (const [k,v] of Object.entries(found)) console.log(k, v.length, JSON.stringify(v.slice(0,3)));

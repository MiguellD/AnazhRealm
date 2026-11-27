const fs=require("fs");const z=fs.readFileSync(process.argv[2],"utf8").split(/\r?\n/).filter(Boolean);
console.log(z[0]); let i=0; const ab=+(process.argv[3]||0);
for(const l of z.slice(1+ab)){const m=l.match(/^(\d\d:\d\d:\d\d) BLICK (\{.*\}) · AUS: (\d+) Zeilen, zuletzt: (.*)$/);if(!m){ if(i++%8==0||/ENDE/.test(l)) console.log(l.slice(0,160));continue;}
let j;try{j=JSON.parse(m[2]);}catch(e){console.log(m[1],"unlesbar",m[2].slice(0,300));continue;}
const o=Object.entries(j.offen||{}).filter(([,v])=>v).map(([k,v])=>k+":"+v).join(",");
console.log(m[1],"t",j.t,"fehler",j.fehler,"takt",j.takt,"bruchN",j.bruchN,"ruht",j.ruht,"ger",j.ger,"aus",j.aus,"versuch",j.versuch,"offen",o,"gehalten",(j.gehalten||[]).join("+"),"imSchuss",j.imSchuss,"planetOffen",j.planetOffen,"bildZeit",(+j.bildZeit).toFixed(1),"spielZeit",j.spielZeit,"wetter",j.wetter,"halt",j.halt,"heap",j.heapMB,"| tief",JSON.stringify(j.tief).slice(0,300),"| AUS",m[3]);
if(j.bruch&&j.bruch.length) for(const b of j.bruch) console.log("      BRUCH n="+b[0]+": "+String(b[1]).slice(0,420));}

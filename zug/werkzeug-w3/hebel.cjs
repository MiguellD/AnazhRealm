const fs=require("fs"),path=require("path");
const dir="messung";const files=fs.readdirSync(dir).filter(f=>f.endsWith(".json"));
const last={};
for(const f of files){let j;try{j=JSON.parse(fs.readFileSync(path.join(dir,f)))}catch{continue}
 const t=Date.parse(j.zeit||0)||fs.statSync(path.join(dir,f)).mtimeMs;const g=j.geraet||f.split("-")[1].replace(".json","");
 for(const [id,v] of Object.entries(j.je||{})){const k=id+" "+g;if(!last[k]||last[k].t<t)last[k]={t,sha:(j.sha||f).slice(0,8),gruen:v.gruen,zahl:String(v.zahl||v.fehler||v.grund||JSON.stringify(v)).replace(/\s+/g," ")}}}
const want=process.argv.slice(2);
for(const k of Object.keys(last).sort()){if(want.length&&!want.some(w=>k.startsWith(w)))continue;const x=last[k];console.log((x.gruen?"G ":"R ")+k.padEnd(26)+x.sha+" "+new Date(x.t).toISOString().slice(5,13)+" "+x.zahl.slice(0,170))}

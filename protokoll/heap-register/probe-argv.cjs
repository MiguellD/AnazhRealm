const path=require("path"),fs=require("fs");
const D="C:/Users/micha/AppData/Local/Temp/claude/w3/pm/meisterkarte-quelle/punkte/stationen";
const ziel=process.argv.slice(2);
const alle=[];
for(const f of fs.readdirSync(D).filter(f=>/^(g\d|k2-.*)\.js$/.test(f))){let m;try{m=require(path.join(D,f))}catch(e){console.error(f,e.message);continue}
 const l=Array.isArray(m)?m:(m.stationen||m.default||[]);for(const s of (Array.isArray(l)?l:[]))alle.push([f,s]);}
for(const z of ziel){const [k,st]=z.split("#");const t=alle.filter(([f,s])=>s.kriterium===k&&String(s.staffel)===st);
 for(const [f,s] of t){const b=s.probe&&s.probe.befehl||s.befehl;console.error(z,f,"probe:",!!s.probe,"sek",s.probe&&s.probe.sek,"geraet",s.geraet,"zwilling",s.zwilling||"");
  fs.writeFileSync(z.replace(/[#.]/g,"_")+".argv.json",JSON.stringify(b));}
 if(!t.length)console.error(z,"NICHT GEFUNDEN");}

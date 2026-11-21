#!/bin/bash
# Bildpaar am Messort dorf: <baum> <tag> — Welt --echt am Ort dorf, warten bis das Dorf um −841/−861 steht; die Pose aus pose.txt
# (geschrieben vom ersten Lauf aus seinem Dorf, gelesen vom zweiten: gleiche Kamera an main und Kopf)
BAUM="$1"; TAG="$2"
cd "$BAUM" || exit 2
SCR=/c/Users/micha/AppData/Local/Temp/claude/a2d6fda3d89c432f/fbfd5778-401f-4a17-bf73-0367303d8996/scratchpad
O=$SCR/bild
export WERKBANK_PORT=4497
WB="node scripts/werkbank.cjs"
PORT=4337 node save-server.js > $O/server-$TAG.log 2>&1 &
SP=$!
aufraeumen() { $WB stop > /dev/null 2>&1; kill $WP $SP 2>/dev/null; }
trap aufraeumen EXIT
for i in $(seq 1 60); do curl -s -o /dev/null http://localhost:4337/ && break; sleep 1; done
$WB start --echt --ort dorf --seite http://localhost:4337 > $O/start-$TAG.log 2>&1 &
WP=$!
for i in $(seq 1 300); do grep -q "WERKBANK bereit" $O/start-$TAG.log && break; kill -0 $WP 2>/dev/null || { echo "WERKBANK ENDETE"; tail -20 $O/start-$TAG.log; exit 3; }; sleep 2; done
$WB eval "$(cat $SCR/dorf-info.js)" > $O/dorf-$TAG.json 2>&1
node -e '
const fs=require("fs"); const t=fs.readFileSync(process.argv[1],"utf8"); let j=null;
const such=(v)=>{ if(j) return; if(typeof v==="string"&&v.startsWith("{\"orte\"")) j=JSON.parse(v); else if(v&&typeof v==="object") Object.values(v).forEach(such); };
try{ such(JSON.parse(t.slice(t.indexOf("{")))); }catch(e){}
if(!j){ console.error("KEINE ORTE "+t.slice(0,400)); process.exit(3); }
for(const o of j.orte) console.log("ORT",o.k,o.ox,o.oz,o.y,o.region,o.jahr,JSON.stringify(o.kulturen),o.erde?o.erde.form+"/"+o.erde.epoche:"-");
const P=process.argv[2];
if(!fs.existsSync(P)){ const o=j.orte.sort((a,b)=>b.haeuser-a.haeuser)[0]; if(!o){ console.error("KEIN DORF"); process.exit(4); }
  fs.writeFileSync(P,[o.ox,o.y+75,o.oz+150,o.ox,o.y,o.oz-20].map(v=>v.toFixed(1)).join(" ")+"\n"); }
console.log("POSE "+fs.readFileSync(P,"utf8").trim());' $O/dorf-$TAG.json $O/pose.txt || exit 4
read px py pz lx ly lz < $O/pose.txt
$WB bild $px $py $pz $lx $ly $lz --datei $O/dorf-$TAG.png --w 1280 --h 720 --uhr 0.42 2>&1 | tail -1
echo BILD-ENDE $TAG

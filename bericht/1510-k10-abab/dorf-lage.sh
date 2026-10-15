#!/bin/bash
# 1510-k10-abab GEGENPROBE, Beleg der Achse: je Seite ein Boot, umstellen --ort dorf, Stand 25 s (der Dorf-Zug baut), dann die
# Häuser aus state.architectures (Lage, Richtung und Abstand vom Spieler, Mitte). Unter dem GPU-Schloss. ./dorf-lage.sh
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k10abab; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; INS=$R/abab-p0bb; D=$H/lage; L=$H/fortschritt.log
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-abab k10 lage"; trap 'schloss_loesen "omen-abab k10 lage"' EXIT
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
for S in A B; do
  WT=$R/abab-pbd3; [ $S = B ] && WT=$R/abab-p0bb
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2
  mkdir -p $D/stand/$S; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$S/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$S-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort dorf > $D/$S-umstellen.txt 2>&1
  $W lauf 25 --ein 10 --regler voll --tiere frei > $D/$S-steht.txt 2>&1
  $W eval "const pm = r.state.playerMesh.position; const a = (r.state.architectures || []).filter((x) => x && x.type && x.position && Math.hypot(x.position.x - pm.x, x.position.z - pm.z) < 200); const h = a.filter((x) => /haus|house|hof|huette|markt/i.test(x.type)); const m = h.length ? { x: h.reduce((s, x) => s + x.position.x, 0) / h.length, z: h.reduce((s, x) => s + x.position.z, 0) / h.length } : null; const l = m ? Math.hypot(m.x - pm.x, m.z - pm.z) : 0; return { spieler: [+pm.x.toFixed(1), +pm.z.toFixed(1)], bauten: a.length, haeuser: h.length, typen: [...new Set(a.map((x) => x.type))].slice(0, 20), mitte: m && [+m.x.toFixed(1), +m.z.toFixed(1)], achse: m && [+((m.x - pm.x) / l).toFixed(3), +((m.z - pm.z) / l).toFixed(3)], abstand: +l.toFixed(1), je: h.map((x) => [Math.round(x.position.x - pm.x), Math.round(x.position.z - pm.z)]) };" > $D/$S-lage.txt 2>&1
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
done
echo "$(date +%T) LAGE FERTIG" >> $L

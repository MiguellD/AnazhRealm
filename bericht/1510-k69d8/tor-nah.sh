#!/bin/bash
# 1510-k69d8: DIE POSE „TOR NAH" (D8 Tor als Fenster) — am Genesis-Ring (Ego, einschwingen wie die Zerlegung) sucht die Probe die
# nächste Portal-Membran (`r._portalMembranes`, Welt-Lage aus der Matrix), setzt den Spieler per Takt-Haken 4 m vor ihre Fläche
# (auf der Seite der Ring-Mitte) mit dem Blick auf die Tor-Mitte (yaw = atan2(dx, dz), Pitch 0), lässt 10 s laufen und misst
# gpu-bank 60 Frames × 6 Runden; ein Schirm belegt die Pose. Folge A B B A, je Sitzung ein Boot. ./tor-nah.sh
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510k69d8; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; D=$H/tor-nah; L=$H/fortschritt.log
INS=$R/abab-p015; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
POSE='const P = Object.getPrototypeOf(r); const pm = r.state.playerMesh.position; const recs = r._portalMembranes ? [...r._portalMembranes.values()] : []; let best = null; for (const rec of recs) { if (!rec || !rec.mesh) continue; rec.mesh.updateMatrixWorld(true); const p = new T.Vector3().setFromMatrixPosition(rec.mesh.matrixWorld); const d = Math.hypot(p.x - pm.x, p.z - pm.z); if (!best || d < best.d) best = { rec, p, d }; } if (!best) return { fehler: "keine Portal-Membran", n: recs.length }; const n = new T.Vector3(0, 0, 1).transformDirection(best.rec.mesh.matrixWorld); n.y = 0; n.normalize(); if (n.x * (pm.x - best.p.x) + n.z * (pm.z - best.p.z) < 0) n.negate(); const x = best.p.x + n.x * 4, z = best.p.z + n.z * 4; window.__torNah = { x, z }; r.tickAffordances = function (dt) { pm.x = x; pm.z = z; return P.tickAffordances.call(this, dt); }; pm.x = x; pm.z = z; r.state.yaw = Math.atan2(best.p.x - x, best.p.z - z); r.state.pitch = 0; return { membranen: recs.length, tor: best.rec.entry && (best.rec.entry.type || best.rec.entry.id), torLage: [+best.p.x.toFixed(2), +best.p.y.toFixed(2), +best.p.z.toFixed(2)], abstandVorher: +best.d.toFixed(2), spieler: [+x.toFixed(2), +z.toFixed(2)], yaw: +r.state.yaw.toFixed(3) };'
for N in A1 B1 B2 A2; do
  WT=$(cat $H/a-baum.txt); [ ${N:0:1} = B ] && WT=$R/abab-p015
  [ -f $D/$N-bank.txt ] && continue
  echo "$(date +%T) tor-nah $N start" >> $L; stopp
  mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $D/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht ego > $D/$N-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$N-ein.txt 2>&1
  $W eval "$POSE" > $D/$N-pose.txt 2>&1
  $W lauf 10 --ein 2 --regler voll --tiere frei > $D/$N-lauf.txt 2>&1
  $W schirm --datei $D/$N-schirm.png > /dev/null 2>&1
  $W gpu-bank 60 --runden 6 > $D/$N-bank.txt 2>&1
  stopp; echo "$(date +%T) tor-nah $N ende" >> $L; sleep 30
done
echo "$(date +%T) TOR-NAH FERTIG" >> $L

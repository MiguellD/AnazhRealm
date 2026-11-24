#!/bin/bash
# bash anleger-bild.sh — EIN Bildpaar des Anlegers (vor / nach +1 m Spiegel) aus dem Baum AnazhRealm-acker, eigener Port 4690
# (nie der Port der Runde), Schirm 1920x1080, Deckel je Schritt, am Ende fällt der ganze Prozess-Baum (kein verwaister Browser).
# Wartet zuerst (höchstens 12 min), bis kein CI-Läufer die Karte hält — eine GPU-Probe der Batterie hat keine Referenzfahrt.
cd /c/Users/micha/AnazhRealm-acker || exit 2
export WERKBANK_PORT=4690 MSYS_NO_PATHCONV=1
Z="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad/bild/anleger"
mkdir -p "$Z"; rm -f "$Z"/anleger-*.png
for i in $(seq 1 72); do tail -1 /tmp/claude/dienst/radeon.puls | grep -q 'Karte belegt (ci-runner' || break; sleep 10; done
echo "Karte: $(tail -1 /tmp/claude/dienst/radeon.puls | cut -c12-110)"
T0=$(date +%s); seit() { echo $(( $(date +%s) - T0 )); }
node scripts/werkbank.cjs start --ort dorf > "$Z/start.log" 2>&1 &
PID=$!
ok=0
while [ "$(seit)" -lt 60 ]; do
    sleep 3
    kill -0 $PID 2>/dev/null || { echo "START TOT nach $(seit) s"; break; }
    if timeout 6 node scripts/werkbank.cjs status > "$Z/status.txt" 2>&1; then ok=1; break; fi
done
echo "bereit=$ok nach $(seit) s"
if [ $ok = 1 ]; then
    timeout 45 node scripts/werkbank.cjs umstellen 15012 -9561 2>&1 | tail -1 | cut -c1-160; echo "umgestellt $(seit) s"
    timeout 10 node scripts/werkbank.cjs eval 'try { const l = r._anlegerLegen(15016.5, -9557.2, "auge"); const e = l || [...r._anleger.values()][0]; const a = e.a; return "POS " + [a.steg.x, a.steg.z, a.boot.x, a.boot.z, r.state.waterLevel].map((v) => Number(v).toFixed(2)).join(" "); } catch (e) { return "FEHLER " + e.message; }' > "$Z/pos.txt" 2>&1
    POS=$(grep -o -E '(POS|FEHLER) [^"]*' "$Z/pos.txt" | head -1); echo "$POS"
    CAM=$(node -e 'const p=process.argv[1].split(" ").slice(1).map(Number);if(p.length<5||p.some(isNaN)){process.exit(1)}const[sx,sz,bx,bz,w]=p;const mx=(sx+bx)/2,mz=(sz+bz)/2;const dx=mx-15012.3,dz=mz+9561.4;const d=Math.hypot(dx,dz)||1;const k=Math.max(0,d-8);console.log([15012.3,(2).toFixed(2),-9561.4,mx,(w+0.2).toFixed(2),mz].map(v=>typeof v==="number"?v.toFixed(2):v).join(" "))' "$POS") || CAM="15012.3 2 -9561.4 15024.3 -2.5 -9549.4"
    echo "Kamera: $CAM"
    timeout 50 node scripts/werkbank.cjs bild $CAM --fov 26 --wahl 42 --datei "$Z/anleger-vor.png" 2>&1 | tail -4 | tr "
" " " | cut -c1-300; echo "bild 1 $(seit) s"
    timeout 8 node scripts/werkbank.cjs eval 'r.state.waterLevel += 1; r._anlegerTakt(); return r.state.waterLevel' > /dev/null 2>&1
    timeout 45 node scripts/werkbank.cjs bild $CAM --fov 26 --wahl 42 --datei "$Z/anleger-nach.png" 2>&1 | tail -1 | cut -c1-200; echo "bild 2 $(seit) s"
fi
WP=$(cat /proc/$PID/winpid 2>/dev/null)
[ -n "$WP" ] && taskkill //PID $WP //T //F > /dev/null 2>&1
kill $PID 2>/dev/null
echo "ENDE $(seit) s · $(date '+%H:%M:%S')"; ls -la "$Z" | grep png | awk '{print $5, $9}'; grep -c -i -E 'fehler|error' "$Z/start.log"

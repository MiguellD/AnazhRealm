#!/bin/bash
# paar.sh <ausgabe> — EINE Welt (echt, Radeon) aus dem Probe-Baum: Kopf, dann main per Methoden-Tausch; je Seite Mess-Zeilen, Bilder, Lauf
SP=/c/Users/micha/AppData/Local/Temp/claude/a2d6fda3d89c432f/fbfd5778-401f-4a17-bf73-0367303d8996/scratchpad
OUT="$1"; mkdir -p "$OUT"
BAUM=/c/Users/micha/AnazhRealm-probe
MAINF="$SP/stern/main-bild-himmel.js"
UHREN="${UHREN:-0 0.7604 0.7708 0.7917 0.5}"
cd "$BAUM" || exit 2
WB() { node scripts/werkbank.cjs "$@" --port 4495; }
PORT=4371 node save-server.js >"$OUT/server.log" 2>&1 &
SPID=$!
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:4371/ && break; sleep 1; done
node scripts/werkbank.cjs start --echt --seite http://localhost:4371 --port 4495 --ort genesis >"$OUT/werkbank.log" 2>&1 &
WPID=$!
ende() { WB stop >/dev/null 2>&1; sleep 3; kill $WPID $SPID 2>/dev/null; }
trap ende EXIT
for i in $(seq 1 300); do WB status >/dev/null 2>&1 && break; sleep 2; done
WB umstellen --ort genesis --sicht ego >"$OUT/umstellen.log" 2>&1
echo "UMSTELLEN: $(tail -1 "$OUT/umstellen.log" | cut -c1-160)"
RUMPF=$(cat "$SP/stern-mess.js")
# die Mond-Nacht: die Uhr der Nacht (Sonne < −18°) mit dem höchsten Mond, der Blick zu ihm (15° unter ihm)
WB eval "const c=r.state.camera; window.__sternP0=window.__sternP0||c.position.clone(); __buehne({uhr:0}); const m=r.state.moonMesh; const d=m.userData.skyOffset.clone().normalize(); return JSON.stringify({u:0, y:d.y, x:d.x, z:d.z, sicht:m.visible});" >"$OUT/mond.txt" 2>&1
MOND=$(node $SP/stern/erg.cjs "$OUT/mond.txt")
echo "MOND: $MOND"
seite() { # <name>
    local S="$1"
    for u in $UHREN mond; do
        local uu="$u" DIR="null"
        if [ "$u" = mond ]; then
            [ -z "$MOND" ] && continue
            uu=$(node -e "const m=$MOND; console.log(m.u)")
            DIR=$(node -e "const m=$MOND; const h=Math.hypot(m.x,m.z); const el=Math.asin(m.y)-15*Math.PI/180; console.log(JSON.stringify([100*m.x/h, 100*Math.tan(el), 100*m.z/h]))")
        fi
        WB eval "window.__sternUhr = $uu; window.__sternDir = $DIR; $RUMPF" >"$OUT/$S-mess-$u.txt" 2>&1
        echo "$S UHR $u: $(node $SP/stern/erg.cjs "$OUT/$S-mess-$u.txt")"
        WB eval "const p=window.__sternP0; const d=window.__sternDir||[0,100*Math.tan(40*Math.PI/180),-100]; return JSON.stringify([p.x,p.y,p.z,p.x+d[0],p.y+d[1],p.z+d[2]]);" >"$OUT/pose.txt" 2>&1
        P=$(node $SP/stern/erg.cjs "$OUT/pose.txt" | tr -d '[]' | tr ',' ' ')
        WB bild $P --uhr "$uu" --w 1920 --h 1080 --wahl 0 --datei "$OUT/$S-u$u.png" >"$OUT/$S-bild-$u.log" 2>&1
        echo "$S BILD $u: $(grep -c . "$OUT/$S-bild-$u.log") Zeilen, $(ls "$OUT"/$S-u$u*.png 2>/dev/null | head -1)"
    done
    # der echte Lauf in der Nacht am selben Blick (ms je Bild, Befehle)
    WB eval "window.__sternUhr = 0; window.__sternDir = null; r._uhrSetzen(0, 'regler'); const c=r.state.camera; const p=window.__sternP0; c.position.copy(p); c.lookAt(p.x, p.y+100*Math.tan(40*Math.PI/180), p.z-100); return 1;" >/dev/null 2>&1
    WB lauf 8 --tiere halten --json "$OUT/$S-lauf.json" >"$OUT/$S-lauf.log" 2>&1
    echo "$S LAUF: $(grep -iE 'p50|p95|calls|befehle' "$OUT/$S-lauf.log" | head -4 | tr '\n' ' ' | cut -c1-400)"
}
seite kopf
WB methode _buildStarField --quelle "$MAINF" >"$OUT/tausch1.log" 2>&1
WB methode _dayNightApplyStarField --quelle "$MAINF" >"$OUT/tausch2.log" 2>&1
WB eval "r._buildStarField(); r._applyDayNightToScene(); return JSON.stringify(Object.keys(r.state.starFieldUniforms));" >"$OUT/tausch3.log" 2>&1
echo "TAUSCH main: $(tail -1 "$OUT/tausch1.log" | cut -c1-100) | $(grep -o '\[.*\]' "$OUT/tausch3.log" | tail -1)"
seite main

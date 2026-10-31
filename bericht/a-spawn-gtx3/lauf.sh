#!/bin/bash
# Station (prio 3) für den Messplatz: DIE ZELLEN AM SPAWN (Pflicht A) am Baum $BAUM — Sicht (Ego, Third) × Abstand (nah, fern) ×
# Uhr (Mittag 0,5 · tiefe Sonne 0,3 · Nacht 0) am Genesis-Ort, je Klasse der Soll-Tafel das Urteil K5 (zug/a-spawn.cjs, dort die
# Definition der Zelle). Je Sicht EIN Lauf unter dem GPU-Schloss der OMEN: ein eigener save-server (:4573) und die Werkbank --echt
# (:4575) am Genesis-Ort, die Zellen nach $OUT/zellen, beide Prozesse am Ende beim eigenen PID beendet. Vorher der Selbsttest des
# Urteils (ROT = nichts gemessen). Ergebnis: $OUT/urteil.txt (je Klasse grün in n von m Zellen im Bild, die roten Zellen mit Maß,
# Täter und Bild, nicht im Bild mit Grund; letzte Zeile A AM SPAWN), $OUT/zellen/tafel.json (Klasse × Zelle), je Zelle die Bilder.
# Lokal (Radeon, eine Zelle, je Aufruf ≤ 2 min): GL=<gpu-lauf.sh> SICHTEN=ego A_SPAWN_ABSTAND=nah A_SPAWN_UHR=0.5 A_SPAWN_BLICKE=1
# A_SPAWN_MAX_S=120 A_SPAWN_NUR='^laub' — die Zelle wächst je Teil (`--nur`).
set -u
# die Namen tragen den Vorsatz A_SPAWN_: gpu-lauf.sh setzt sein eigenes S (das Schloss) — ein exportiertes S erbte das Kind als Schloss-Ordner
A_SPAWN_CJS=$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)/a-spawn.cjs
# Der Dienst kopiert nur lauf.sh nach $OUT: a-spawn.cjs kommt aus dem Dienst-Baum der Koordination ($H/koord, $H = $OUT/../..).
# 31.10. a-spawn-gtx: der Griff in $H (kein git-Baum) schrieb eine LEERE a-spawn.cjs, node lief leer, jede Stufe meldete Exit 0 und die
# Tafel blieb leer — eine leere Datei bricht jetzt laut ab, nie still.
[ -f "$A_SPAWN_CJS" ] || { A_SPAWN_CJS=$OUT/a-spawn.cjs; git -C "$(dirname "$(dirname "$OUT")")/koord" show origin/koordination:zug/a-spawn.cjs > "$A_SPAWN_CJS"; }
[ -s "$A_SPAWN_CJS" ] || { echo "ROT: a-spawn.cjs fehlt oder ist leer ($A_SPAWN_CJS) — nichts gemessen" | tee -a "$OUT/urteil.txt"; exit 5; }
cd "$BAUM" || exit 2
GL=${GL:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-lauf.sh}
A_SPAWN_BAUM=$(cygpath -w "$BAUM")
A_SPAWN_ZELLEN=$(cygpath -w "$OUT/zellen")
export A_SPAWN_CJS A_SPAWN_BAUM A_SPAWN_ZELLEN OUT A_SPAWN_ABSTAND="${A_SPAWN_ABSTAND:-nah,fern}" A_SPAWN_UHR="${A_SPAWN_UHR:-0.5,0.3,0}" A_SPAWN_BLICKE="${A_SPAWN_BLICKE:-8}" A_SPAWN_NUR="${A_SPAWN_NUR:-.}"
if ! node "$A_SPAWN_CJS" selbsttest --baum "$A_SPAWN_BAUM" > "$OUT/selbsttest.out" 2>&1; then
    cat "$OUT/selbsttest.out" >> "$OUT/urteil.txt"
    exit 3
fi
for SICHT in ${SICHTEN:-ego third}; do
    export A_SPAWN_SICHT=$SICHT
    GPU_LAUF_MAX_S=${A_SPAWN_MAX_S:-2400} bash "$GL" "a-spawn-$SICHT" bash -c '
        bereit() { node -e "require(\"http\").get(\"http://localhost:4573/\", (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on(\"error\", () => process.exit(1))"; }
        PORT=4573 node save-server.js > "$OUT/server-$A_SPAWN_SICHT.out" 2>&1 &
        SV=$!
        for i in $(seq 1 60); do bereit && break; sleep 1; done
        WERKBANK_PORT=4575 node scripts/werkbank.cjs start --echt --seite http://localhost:4573 --ort genesis > "$OUT/werkbank-$A_SPAWN_SICHT.out" 2>&1 &
        WB=$!
        until grep -q "WERKBANK bereit" "$OUT/werkbank-$A_SPAWN_SICHT.out"; do kill -0 $WB 2> /dev/null || { kill $SV; exit 4; }; sleep 2; done
        node "$A_SPAWN_CJS" messen --baum "$A_SPAWN_BAUM" --port 4575 --ordner "$A_SPAWN_ZELLEN" --sicht $A_SPAWN_SICHT --abstand $A_SPAWN_ABSTAND --uhr $A_SPAWN_UHR --blicke $A_SPAWN_BLICKE --nur "$A_SPAWN_NUR"
        E=$?
        WERKBANK_PORT=4575 node scripts/werkbank.cjs stop > /dev/null 2>&1
        kill $WB $SV 2> /dev/null
        exit $E' > "$OUT/messen-$SICHT.out" 2>&1
    echo "messen $SICHT exit $?" >> "$OUT/urteil.txt"
done
node "$A_SPAWN_CJS" urteil --baum "$A_SPAWN_BAUM" --ordner "$A_SPAWN_ZELLEN" >> "$OUT/urteil.txt" 2>&1
echo "urteil exit $?" >> "$OUT/urteil.txt"

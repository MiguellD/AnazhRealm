#!/bin/bash
# Station (prio 3) für den Messplatz: das GPU-Urteil der Karte spike-pixel-statt-welt (f653389d) an der GTX — Genesis Third,
# 8 Paare gpu-bank (120 Frames, 1 Runde) bei Last-Skala 0,75 und 0,6 im Wechsel, dann der Schirm bei 0,6 und gpu-fehler.
# Ja, wenn das Mittel gpuJeFrameMs(0,6)/(0,75) = 0,69 ± 0,07, gpu-fehler 0 und der Schirm deckt. Ergebnis $OUT/urteil.txt.
set -u
cd "$BAUM" || exit 2
GL=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-lauf.sh
export OUT
GPU_LAUF_MAX_S=1800 bash "$GL" spike-pixel bash -c '
    W="node scripts/werkbank.cjs"
    $W start --echt --gpu-fehler --ort genesis || exit 3
    $W umstellen --ort genesis --sicht third
    for i in 1 2 3 4 5 6 7 8; do for s in 0.75 0.6; do
        $W eval "r.state.szeneSkalaLast = $s; return r._szeneSkalaLast()" > /dev/null
        echo "SKALA $s $($W gpu-bank 120 --runden 1 | tr -d "\n")"
    done; done
    $W eval "r.state.szeneSkalaLast = 0.6" > /dev/null && $W schirm --datei "$OUT/s060.png"
    echo "GPU-FEHLER $($W gpu-fehler | tr -d "\n")"
    $W stop
' > "$OUT/lauf.out" 2>&1
echo "lauf exit $?" >> "$OUT/urteil.txt"
node -e '
const t = require("fs").readFileSync(process.argv[1], "utf8"), v = {};
for (const m of t.matchAll(/SKALA (\S+) .*?gpuJeFrameMs"?\s*:\s*([\d.]+)/g)) (v[m[1]] = v[m[1]] || []).push(+m[2]);
const mw = (a) => a.reduce((x, y) => x + y, 0) / a.length, a = v["0.6"] || [], b = v["0.75"] || [];
console.log("gpuJeFrameMs 0,75:", b.join(" "), "| 0,6:", a.join(" "));
if (a.length && b.length) { const q = mw(a) / mw(b); console.log("QUOTIENT", q.toFixed(3), Math.abs(q - 0.69) <= 0.07 ? "JA" : "NEIN"); }
else console.log("QUOTIENT keine Zahl");
' "$OUT/lauf.out" >> "$OUT/urteil.txt"
grep -E "^GPU-FEHLER" "$OUT/lauf.out" >> "$OUT/urteil.txt"

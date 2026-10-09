#!/bin/bash
# Wasser-Blicke nahe der Mess-Wiese (Ufer, See) aus dem Ausgabe-Pfad, Uhren fest, Tiere aus: ./wasser.sh <ordner> [port]
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
OUT=$(cd "$(dirname "$1")" 2>/dev/null && pwd -W)/$(basename "$1"); mkdir -p "$1"
export WERKBANK_PORT=${2:-7900}
W="node $WT/scripts/werkbank.cjs"
$W eval "for (const c of r.state.creatures || []) c.visible = false; const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
b() { $W bild $2 --w 1920 --h 1080 --datei "$OUT/$1.png" | tr -d '\n' | sed 's/  */ /g'; echo; }
b ufer-nord "-865 +1.7 -752 -862 25.91 -722"
b see-west  "-950 +1.7 -775 -982 22.93 -748"
b see-blick "-985 +1.7 -812 -995 22.93 -770"

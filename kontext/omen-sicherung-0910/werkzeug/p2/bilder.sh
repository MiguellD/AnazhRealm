#!/bin/bash
# Bild-Satz an der Mess-Wiese (Spieler -900/-850) aus dem Ausgabe-Pfad: ./bilder.sh <ordner> [port]
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
OUT=$(cd "$(dirname "$1")" 2>/dev/null && pwd -W)/$(basename "$1"); mkdir -p "$1"
export WERKBANK_PORT=${2:-7900}
W="node $WT/scripts/werkbank.cjs"
b() { $W bild $2 --w 1920 --h 1080 --datei "$OUT/$1.png" | tr -d '\n' | sed 's/  */ /g'; echo; }
$W eval "for (const c of r.state.creatures || []) c.visible = false; return (r.state.creatures || []).length" | tr -d "
"; echo " Tiere ausgeblendet"
$W eval "const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" | tr -d "
"; echo " Wind- und Knoten-Uhr fest (1000)"
b nord   "-900 +1.7 -850 -900 +0 -880"
b ost    "-900 +1.7 -850 -870 +0 -850"
b sued   "-900 +1.7 -850 -900 +0 -820"
b west   "-900 +1.7 -850 -930 +0 -850"
b nah    "-900 +1.7 -850 -897 +0 -856"
b naht   "-900 +6 -850 -900 +0 -960"

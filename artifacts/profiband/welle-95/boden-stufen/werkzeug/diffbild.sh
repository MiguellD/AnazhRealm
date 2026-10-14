#!/bin/bash
# diffbild.sh A B datei — rot = |dLuma| x 4 ueber dem Bild (gruen, gedimmt)
cd /c/Users/micha/AnazhRealm-profiband/.claude/worktrees/boden-stufen
WERKBANK_PORT=${WERKBANK_PORT:-8900} node scripts/werkbank.cjs eval "window.__da='$1'; window.__db='$2'; $(cat /c/Users/micha/AppData/Local/Temp/claude/boden-stufen/diffbild.js)" > /c/Users/micha/AppData/Local/Temp/claude/boden-stufen/diff.json
node -e 'const j=require("/c/Users/micha/AppData/Local/Temp/claude/boden-stufen/diff.json".replace(/^\/c\//,"C:/")); const d=j.ergebnis.split(",")[1]; require("fs").writeFileSync(process.argv[1], Buffer.from(d,"base64")); console.log("ok", process.argv[1])' "$3"

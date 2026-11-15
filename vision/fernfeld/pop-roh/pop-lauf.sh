#!/bin/bash
# EIN Lauf: Welt ab Boot 1920x1080 an der Mess-Wiese (Stand w28-probe-schirm 68df6ac0 = main 11d8de3d + _weltSteht), Pop-Gang mit Namen
set -u
B=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/lese-pop
S=/c/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/ba8543ef-321d-4cbc-a751-10d7d9cf31c5/scratchpad
P=4793
cd "$B" || exit 2
echo "START $(date +%T)"
WERKBANK_FENSTER=1920x1080 node scripts/werkbank.cjs start --ort wiese --port $P > "$S/welt.out" 2>&1 &
WP=$!
ok=0
for i in $(seq 1 120); do
  sleep 3
  if node scripts/werkbank.cjs status --port $P > "$S/status.out" 2>&1; then ok=1; break; fi
  kill -0 $WP 2>/dev/null || break
done
echo "WELT ok=$ok $(date +%T)"; tail -n 3 "$S/status.out"
if [ $ok = 1 ]; then
  node scripts/werkbank.cjs fenster 1920 1080 --port $P > "$S/fenster.out" 2>&1; cat "$S/fenster.out" | head -c 300; echo
  node scripts/werkbank.cjs umstellen --ort wiese --sicht ego --port $P > "$S/umstellen.out" 2>&1; head -c 600 "$S/umstellen.out"; echo
  node scripts/werkbank.cjs eval 'return { zeilen: r._schirm().hoehe, breite: r._schirm().breite, laub: r._laubRand(), R: r.state.architectureCullingRadius, arch: r.state.architectures.length }' --port $P
  node scripts/werkbank.cjs eval "$(cat "$S/pop-namen.js")" --port $P > "$S/pop-namen.out" 2>&1
  echo "EVAL exit $? $(date +%T)"
fi
node scripts/werkbank.cjs stop --port $P > /dev/null 2>&1
sleep 3
kill $WP 2>/dev/null
echo "ENDE $(date +%T)"

cd C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-2110b
export WERKBANK_PORT=7962
for o in wiese genesis dorf; do for s in ego third; do
  node scripts/werkbank.cjs umstellen --ort $o --sicht $s > C:/Users/micha/AppData/Local/Temp/claude/C--Users-micha-AnazhRealm-profiband/bf30ee29-0ba1-482e-ac38-fc10c609d0c3/scratchpad/roh/m13-umstellen-$o-$s.log 2>&1
  node scripts/werkbank.cjs band --ort $o --datei C:/Users/micha/AppData/Local/Temp/claude/C--Users-micha-AnazhRealm-profiband/bf30ee29-0ba1-482e-ac38-fc10c609d0c3/scratchpad/roh/m13-band-$o-$s.json > C:/Users/micha/AppData/Local/Temp/claude/C--Users-micha-AnazhRealm-profiband/bf30ee29-0ba1-482e-ac38-fc10c609d0c3/scratchpad/roh/m13-band-$o-$s.log 2>&1
  echo "$o $s EXIT=$?"
done; done

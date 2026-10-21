#!/bin/sh
# ankunft K5: 4 Kalt-Boots an der Radeon (diag-boot-stage --kalt --echt), je Boot unter dem Schloss
R=/c/Users/micha/AppData/Local/Temp/claude/mk-2110
cd /c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mk-2110
S=$R/schloss.sh
for i in 1 2 3 4; do
  $S nimm >> $R/kette2.log
  BOOT_STAGE_PORT=7937 node scripts/diag-boot-stage.cjs --kalt --echt --sek 60 --json $R/kalt-$i.json > $R/kalt-$i.log 2>&1; echo "kalt $i EXIT=$?" >> $R/kette2.log
  $S gib >> $R/kette2.log
  sleep 2
done
echo "KETTE2 ENDE $(date +%H:%M:%S)" >> $R/kette2.log

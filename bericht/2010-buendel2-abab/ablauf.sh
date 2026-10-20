#!/bin/bash
# 2010 Bündel-2-ABAB als EIN Hintergrund-Ablauf: npm ci beider Bäume (cpu_ruhe) → KALT 4+4 (kalt.sh, Stations-Patch an) → Patch zurück
# (git checkout, Status leer) → Lauf-Zellen Genesis Third steht+Profil+geht, Wiese Ego geht 4+4 (lauf.sh) → Blick Uhr 0,27/0,5 (blick-uhr.sh).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; F=$BASE/p3/n2010/buendel2; LOG=$F/ablauf.log
say() { echo "$(date +%T) $*" | tee -a $LOG; }
. $BASE/p3/gpu-schloss.sh
say "ABLAUF START"
for w in n2010-b2a n2010-b2b; do
  [ -d $BASE/$w/node_modules ] && continue
  cpu_ruhe; (cd $BASE/$w && npm ci --no-audit --no-fund > $F/npmci-$w.log 2>&1); say "npm ci $w EXIT=$?"
done
bash $F/kalt.sh > $F/kalt.out 2>&1; say "KALT fertig (exit $?)"
for w in n2010-b2a n2010-b2b; do git -C $BASE/$w -c core.autocrlf=false checkout -- scripts/diag-boot-stage.cjs; say "Patch zurück $w: status[$(git -C $BASE/$w status --porcelain | wc -l)]"; done
bash $F/lauf.sh > $F/lauf.out 2>&1; say "LAUF fertig (exit $?)"
bash $F/blick-uhr.sh > $F/blick.out 2>&1; say "BLICK fertig (exit $?)"
say "ABLAUF ENDE"

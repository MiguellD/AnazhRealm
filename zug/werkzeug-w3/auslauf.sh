#!/bin/bash
# auslauf.sh — Notbremse 07.11. 16:05 (Woche 98 %): misst und bucht OHNE Koordinator zu Ende, dann räumt es auf und legt den Stand
# nach koordination zug/auslauf-0711.txt. Kein LLM: nur Werkzeuge (buche.sh, aufraeumen.ps1). Die nächste Sitzung liest die Datei.
W=/tmp/claude/w3; R=/c/Users/micha/AnazhRealm-profiband; O=$W/auslauf.out; KO=$R/.claude/worktrees/koordination
say() { echo "$(date '+%d.%m %H:%M:%S') $*" >> $O; }
say "Auslauf beginnt"
until grep -q "RADEON-OFFEN ENDE 95ba6fd6" $W/radeon-offen-95ba6fd6.out 2>/dev/null; do sleep 30; done
say "Radeon-Ernte 95ba6fd6: $(grep -c ' GRÜN ' $W/radeon-offen-95ba6fd6.out) GRÜN · $(grep -c ' ROT ' $W/radeon-offen-95ba6fd6.out) ROT · $(grep -c ' OFFEN ' $W/radeon-offen-95ba6fd6.out) OFFEN"
(cd $R && BUCHE_KOPF=95ba6fd6d21acb5f2721cf7b3d6f4a3648833f9d bash artifacts/profiband/werkzeug/buche.sh 2>&1 | grep -E "buchen:|GEBUCHT|abgewiesen|FEHLER|fällt" | cut -c1-220 >> $O)
until grep -qE "\[z295w\] (GELANDET|FAHRT ROT)" /tmp/claude/fahre-z295w.log 2>/dev/null; do sleep 30; done
say "z295: $(grep -E '\[z295w\] (GELANDET|FAHRT ROT)' /tmp/claude/fahre-z295w.log | tail -1 | cut -c1-260)"
if grep -qE "\[z295w\] GELANDET" /tmp/claude/fahre-z295w.log; then
  K=$(grep -oE "Kandidat [0-9a-f]{40}" /tmp/claude/fahre-z295.log | tail -1 | cut -d' ' -f2)
  until grep -q "MESSUNG FERTIG GESCHRIEBEN ${K:0:8}" $W/mess-z295.out 2>/dev/null; do sleep 30; done
  grep -E "^\s+(GRÜN|ROT|OFFEN)" $W/mess-z295.out | cut -c1-160 >> $O
  (cd $R && BUCHE_KOPF=$K bash artifacts/profiband/werkzeug/buche.sh 2>&1 | grep -E "buchen:|GEBUCHT|abgewiesen|FEHLER|fällt" | cut -c1-220 >> $O)
fi
powershell -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w $R/artifacts/profiband/werkzeug/aufraeumen.ps1)" 2>&1 | tail -4 >> $O
say "AUSLAUF ENDE — Artifact meisterkarte.html veröffentlicht die nächste Sitzung"
cp $O $KO/zug/auslauf-0711.txt; cd $KO && git add zug/auslauf-0711.txt && git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit -q -m "Auslauf 07.11.: Radeon-Ernte, z295 und Buchung ohne Koordinator" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"; git pull -q --rebase origin koordination; git push -q origin HEAD:koordination

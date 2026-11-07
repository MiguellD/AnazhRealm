#!/bin/bash
# radeon-offen.sh <sha> — nach der Kandidaten-Messung: jede Radeon-Station ohne frische Messung am SHA (--offen), ohne die Hänger-Proben
S="$1"; P=/tmp/claude/w3/pm/meisterkarte-quelle/punkte; O=/tmp/claude/w3/radeon-offen-${S:0:8}.out
until grep -q "MESSUNG FERTIG GESCHRIEBEN ${S:0:8}" /tmp/claude/w3/mess-z288.out 2>/dev/null; do sleep 15; done
cd "$P" && node punkte.cjs run --sha "$S" --geraet radeon --offen 2>&1 | grep -E "^\s+(GRÜN|ROT|OFFEN)|PUNKTE|SITZUNG Fahrt" | cut -c1-220 > "$O"
cd /tmp/claude/w3/pm && git add meisterkarte-quelle/punkte/messung/${S:0:8}-radeon.json meisterkarte-quelle/punkte/messung/roh/${S:0:8}-radeon 2>/dev/null
git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit -q -m "Messung Radeon ${S:0:8} --offen (Voll-Ernte)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git pull -q --rebase origin punkte-maschine && git push -q origin HEAD:punkte-maschine
echo "RADEON-OFFEN FERTIG ${S:0:8}" >> "$O"

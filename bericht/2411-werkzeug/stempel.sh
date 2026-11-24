#!/bin/bash
# bash stempel.sh <zweig> <kopf40> <msg-datei> [stempel-name] — stempelt NUR bei: Remote-Kopf = kopf, Code-Check completed/success, kein ROT,
# merge-tree gegen origin/main sauber, Siegel-Wörter 0. Der Stempel trägt den Baum des Kopfs und hat EINEN Elter: den Kopf.
# GESETZ (24.11., mein Fehler am 628bc789): ein Stempel mit ZWEI Eltern ist ein Merge, und ein Merge erbt keine Batterie (check.yml „ein Merge
# und jeder Commit mit Inhalt erben nichts“, ci-kopf.cjs kopfKette) — die 22 Jobs laufen am Stempel neu. Liegt am Namen w28-<zweig> ein Kopf, der
# kein Vorfahr des neuen Kopfs ist (ein Halt), dann bekommt die Abgabe einen NEUEN Namen (4. Argument, z. B. w28-<zweig>2) — nie ein Vorwärts-Schritt.
set -u; cd /c/Users/micha/AnazhRealm-profiband; export MSYS_NO_PATHCONV=1
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
Z=$1; H=$2; MSG=$3; N=${4:-w28-$Z}
[ "$(git ls-remote origin refs/heads/$Z | cut -c1-40)" = "$H" ] || { echo "HALT: der Kopf von $Z hat sich bewegt"; exit 1; }
CI=$(node "$S/ci/ci-rot.cjs" $H 2>&1); echo "$CI" | grep -E 'Code-Check|GPU-Probe' | cut -c1-150
echo "$CI" | grep -q 'Code-Check completed/success' || { echo "HALT: Code-Check nicht grün"; exit 1; }
echo "$CI" | grep -q -E 'rot [1-9]|failure' && { echo "HALT: Röte"; exit 1; }
M=$(git ls-remote origin refs/heads/main | cut -c1-40); git fetch -q origin $M $H
[ "$(git merge-tree --write-tree $M $H | wc -l)" = "1" ] || { echo "HALT: Konflikt gegen main ${M:0:8}"; exit 1; }
[ "$(grep -c -E 'fertig|RUND|vollendet|vollzogen|Schluss|SCOPE ZU' "$MSG")" = "0" ] || { echo "HALT: Siegel-Wort"; exit 1; }
head -1 "$MSG" | grep -q "^Abgabe $N:" || { echo "HALT: der Betreff beginnt nicht mit „Abgabe $N:“"; exit 1; }
W=$(git ls-remote origin refs/heads/$N | cut -c1-40)
if [ -n "$W" ]; then git fetch -q origin $W; git merge-base --is-ancestor $W $H || { echo "HALT: $N steht auf ${W:0:8}, kein Vorfahr des Kopfs — neuer Stempel-Name als 4. Argument (ein Stempel hat EINEN Elter)"; exit 1; }; fi
C=$(git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit-tree "$H^{tree}" -p $H -F "$MSG")
git push origin $C:refs/heads/$N 2>&1 | tail -1; echo "GESTEMPELT $N $C · main ${M:0:8} · $(date '+%H:%M:%S')"

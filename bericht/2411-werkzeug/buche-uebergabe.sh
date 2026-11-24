#!/bin/bash
# bash buche-uebergabe.sh — EIN Commit in koordination (Plumbing, eigener Index): das Übergabe-Blatt und das Werkzeug des Koordinators.
# Bucht nichts, wenn eine Datei ein wörtliches Geheimnis trägt.
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
cd /c/Users/micha/AnazhRealm-profiband || exit 2
export MSYS_NO_PATHCONV=1
DATEIEN="stempel.sh stempel-msg.sh nach-landung.sh pm-merge.sh pm-pruef.sh lage-block.cjs lage-flick.cjs ko-datei.cjs runde-jetzt.cjs anleger-bild.sh job-log.cjs buche-uebergabe.sh ci/ci-rot.cjs ci/ci-warte2.cjs ci/abbruch.cjs ci/lauf-jobs.cjs ci/schlange.cjs ci/vorfahrt-waechter.sh ci/gruen-warte.sh ci/main-veraltet.sh neulauf.cjs satz-auge-der-art.txt satz-probe-deckel-einlass.txt satz-haus-gestalt.txt satz-ort-ausstattung.txt satz-sport-regeln.txt buendel.sh familie-fahrzeug.sh halt-fahrzeug-garage-labor.diff satz-spiegel-eis.txt satz-haus-stoff.txt satz-anatomie-r4-heil.txt satz-ort-ausstattung.txt satz-sport-regeln.txt"
LIT=""
for f in $DATEIEN UEBERGABE-2411.md; do
    grep -q -E "ghp_[A-Za-z0-9]{20}|github_pat_[A-Za-z0-9_]{20}|@gm[a]il" "$S/$f" && LIT="$LIT $f"
done
if [ -n "$LIT" ]; then echo "NICHT gebucht, wörtliches Geheimnis in:$LIT"; exit 1; fi
K=$(git ls-remote origin refs/heads/koordination | cut -c1-40)
git fetch -q origin "$K"
export GIT_INDEX_FILE="$S/idx-werkzeug"
rm -f "$GIT_INDEX_FILE"
git read-tree "$K"
B=$(git hash-object -w "$S/UEBERGABE-2411.md")
git update-index --add --cacheinfo "100644,$B,UEBERGABE-2026-11-24.md"
n=0
for f in $DATEIEN; do
    B=$(git hash-object -w "$S/$f")
    git update-index --add --cacheinfo "100644,$B,bericht/2411-werkzeug/$f"
    n=$((n + 1))
done
T=$(git write-tree)
unset GIT_INDEX_FILE
C=$(git commit-tree "$T" -p "$K" -F "$S/betreff-uebergabe.txt")
git push -q origin "$C:refs/heads/koordination" 2>&1 | tail -1
echo "GEBUCHT ${C:0:8} auf ${K:0:8} · $n Werkzeug-Dateien + Blatt · Kopf jetzt $(git ls-remote origin refs/heads/koordination | cut -c1-8) · $(date '+%H:%M')"

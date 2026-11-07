#!/bin/bash
# mess-kandidat.sh <zid> "<stationen, Komma>" — misst den Kandidaten eines Zugs WÄHREND seine CI läuft: der Kandidat wird per
# Fast-Forward der neue main, seine Messung gilt am Kopf (Schöpfer 07.11.: „die Zukunft zur Gegenwart“). Je Gerät filtert die
# Maschine selbst (--trocken nennt „keine Station auf <gerät>“). headless fährt über die Farm, radeon lokal; die Mess-Dateien
# gehen nach punkte-maschine. Danach bucht buche.sh am gelandeten Kopf in Minuten.
Z="$1"; LISTE="$2"; L=/tmp/claude/fahre-$Z.log; P=/tmp/claude/w3/pm/meisterkarte-quelle/punkte; O=/tmp/claude/w3/mess-$Z.out
until grep -qE "Kandidat [0-9a-f]{40}" "$L" 2>/dev/null; do sleep 15; done
K=$(grep -oE "Kandidat [0-9a-f]{40}" "$L" | tail -1 | cut -d' ' -f2)
echo "$(date +%H:%M:%S) [$Z] Kandidat $K — messe $LISTE" >> "$O"
cd "$P" || exit 1
for g in headless radeon; do
    ok=""
    for k in ${LISTE//,/ }; do
        node punkte.cjs run --sha "$K" --geraet $g --nur "$k" --trocken 2>&1 | grep -q "keine Station auf" || ok="$ok,$k"
    done
    ok=${ok#,}
    [ -z "$ok" ] && continue
    echo "$(date +%H:%M:%S) [$Z] $g: $ok" >> "$O"
    node punkte.cjs run --sha "$K" --geraet $g --nur "$ok" 2>&1 | grep -E "^\s+(GRÜN|ROT|OFFEN)|PUNKTE ROT" | cut -c1-260 >> "$O"
done
cd /tmp/claude/w3/pm || exit 1
G="git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com"
git add meisterkarte-quelle/punkte/messung/${K:0:8}-radeon.json meisterkarte-quelle/punkte/messung/roh/${K:0:8}-radeon 2>/dev/null
$G commit -q -m "Messung Radeon ${K:0:8} (Kandidat $Z, während der CI)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" 2>/dev/null
for f in $(git status -s meisterkarte-quelle/punkte/messung | awk '$1=="??"{print $2}' | grep -E "${K:0:8}-headless"); do rm -rf "$f"; done
git pull -q --rebase origin punkte-maschine && git push -q origin HEAD:punkte-maschine 2>&1 | grep -v "^remote"
echo "$(date +%H:%M:%S) [$Z] MESSUNG FERTIG GESCHRIEBEN ${K:0:8}" >> "$O"

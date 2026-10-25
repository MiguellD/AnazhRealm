#!/bin/bash
# buche.sh [--warte <auftrag-id>] — bucht die Meisterkarte am aktuellen main-Kopf aus allen Mess-Dateien (Punkte-Maschine).
# Mit --warte wartet es, bis <auftrag-id> in koordination zug/erledigt.txt steht (z. B. die GTX-Punkte eines Mess-Takts).
# Schritte: Baum koordination holen · punkte.cjs buchen --kopf <main> · meta.js (kopf, version, integ, titel) · gen build ·
# ansicht · commit · push koordination UND punkte-maschine (die OMEN misst aus punkte-maschine). Das Artifact veröffentlicht
# der Koordinator (gleicher Pfad meisterkarte.html). Lehre 24.10.: 8 h 53 min ohne Buchung, die 80 lief 32 s hinter Zug 24.
set -u
KO=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination
CO="Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
say() { echo "$(date +%H:%M:%S) [buche] $*"; }
if [ "${1:-}" = "--warte" ]; then
    ID=$2
    for i in $(seq 1 360); do
        git -C "$KO" fetch -q origin koordination 2>/dev/null
        git -C "$KO" show FETCH_HEAD:zug/erledigt.txt 2>/dev/null | grep -q "^$ID " && break
        sleep 60
    done
    say "erledigt: $(git -C "$KO" show FETCH_HEAD:zug/erledigt.txt | grep "^$ID " | tail -1 | cut -c1-160)"
fi
git -C "$KO" fetch -q origin +refs/heads/koordination:refs/remotes/origin/koordination +refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine &&
    git -C "$KO" merge -q --no-edit origin/koordination origin/punkte-maschine || { say "Baum koordination merget nicht"; exit 1; }
KOPF=$(git -C "$KO" ls-remote origin refs/heads/main | cut -c1-40)
V=$(git -C "$KO" show "$KOPF:package.json" | sed -n 's/.*"version": *"\([0-9.]*\)".*/\1/p' | head -1)
b=$(cd "$KO" && node meisterkarte-quelle/punkte/punkte.cjs buchen --kopf "$KOPF" 2>&1 | tail -1)
say "buchen: $b"
(cd "$KO/meisterkarte-quelle" && node -e '
const fs=require("fs");const f="src/meta.js";let t=fs.readFileSync(f,"utf8");const [k,v]=process.argv.slice(1);
t=t.replace(/kopf: "[0-9a-f]{8}",\n  version: "V[0-9.]+",\n  integ: "[0-9a-f]{8}",/,`kopf: "${k}",\n  version: "V${v}",\n  integ: "${k}",`);
t=t.replace(/Kopf main [0-9a-f]{8} \(V[0-9.]+\)/,`Kopf main ${k} (V${v})`);
const h=new Date(),iso=h.toISOString().slice(0,10),de=iso.slice(8,10)+"."+iso.slice(5,7)+"."+iso.slice(0,4);
t=t.replace(/stand: "[0-9]{4}-[0-9]{2}-[0-9]{2}"/,`stand: "${iso}"`).replace(/Stand [0-9]{2}[.][0-9]{2}[.][0-9]{4}, Kopf main/,`Stand ${de}, Kopf main`);fs.writeFileSync(f,t);' "${KOPF:0:8}" "$V")
# gen.cjs endet ROT bei Inhalts-Mängeln (z. B. Hebel-Tafel über der Staffel) und schreibt die Dateien trotzdem: die Ansicht baut immer
# (25.10.: `gen build && ansicht` liess die Seite seit 24.10. 23:51 auf 76 stehen, gebucht waren 86 und 92)
(cd "$KO/meisterkarte-quelle" && { node gen.cjs build > "$TEMP/claude/buche-gen.log" 2>&1 || say "gen ROT: $(grep -c '^ - ' "$TEMP/claude/buche-gen.log") Inhalts-Mängel (buche-gen.log)"; } && node ansicht.cjs 2>&1 | tail -1)
S=$(cd "$KO/meisterkarte-quelle" && node gen.cjs check 2>&1 | grep -m1 '^Summe' | cut -d' ' -f2)
# die Wand: die Seite trägt die gebuchte Summe, sonst wird nichts veröffentlicht
grep -q "Summe ${S%%/*}/330\|>${S%%/*}<\|${S%%/*}/330" "$KO/meisterkarte.html" || { say "ROT: meisterkarte.html trägt die Summe $S nicht"; exit 1; }
git -C "$KO" add -A meisterkarte-quelle MEISTERKARTE.md meisterkarte.json meisterkarte.html 2>/dev/null
git -C "$KO" commit -q -m "Meisterkarte $S am Kopf ${KOPF:0:8} (V$V): Buchung aus allen Mess-Dateien (buche.sh)" -m "$CO" || say "nichts zu committen"
for i in 1 2 3; do
    git -C "$KO" fetch -q origin koordination && git -C "$KO" merge -q --no-edit FETCH_HEAD &&
        git -C "$KO" push -q origin HEAD:koordination && git -C "$KO" push -q origin HEAD:refs/heads/punkte-maschine && break
    sleep 10
done
say "GEBUCHT $S am Kopf ${KOPF:0:8} — Artifact: meisterkarte.html veröffentlichen"

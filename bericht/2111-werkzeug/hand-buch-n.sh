#!/bin/bash
# hand-buch-n.sh <name> <sha40> <sprosse,sprosse,…> — Buchungs-Lauf MEHRERER Sprossen an der Radeon in EINER Sitzung (EIN Halt des
# Spiel-Baums: die Runde weicht einer wartenden Hand nur einmal je 600 s). Wie hand-buch.sh: Baum pm-kand per Pfad-Liste an die
# pm-Spitze, Stationen = Spitze, Lauf, Zeilen ins Log wao/hand.log; je Sprosse wird die Akte NUR bei Richter GRÜN UND Preis GRÜN
# geschoben (alle grünen Akten in EINEM Commit).
export MSYS_NO_PATHCONV=1
S="C:/Users/micha/AppData/Local/Temp/claude/3c7f7ef9549389d2/9198e0cd-302f-42e2-be9b-9e3a035ce699/scratchpad"
K=C:/Users/micha/AnazhRealm-pm-kand; L="$S/wao/hand.log"; N=$1; H=$2; SP=$3
cd "$K" || exit 9
T=$(git ls-remote origin refs/heads/punkte-maschine | cut -f1); [ -n "$T" ] && git fetch -q origin "$T" || { echo "$N PM-SPITZE nicht geholt" >> "$L"; exit 7; }
git checkout -q "$T" -- meisterkarte-quelle/src meisterkarte-quelle/punkte/punkte.cjs meisterkarte-quelle/punkte/hilfe.cjs meisterkarte-quelle/punkte/gpu-zeuge.cjs meisterkarte-quelle/punkte/konsum-zeuge.cjs meisterkarte-quelle/punkte/deckel.json meisterkarte-quelle/punkte/stand.json meisterkarte-quelle/punkte/weg.json meisterkarte-quelle/punkte/stationen meisterkarte-quelle/punkte/werkzeug meisterkarte-quelle/punkte/gegenlauf ':(glob)meisterkarte-quelle/punkte/messung/*.json' ':(glob)vision/*' vision/richter vision/vorrat/klasse-offen.json || { echo "$N HEBEN gescheitert" >> "$L"; exit 8; }
git diff --quiet "$T" -- meisterkarte-quelle/punkte/stationen/ || { echo "$N STATIONEN ≠ Spitze ${T:0:8}" >> "$L"; exit 6; }
cd meisterkarte-quelle/punkte || exit 5
mkdir -p "$S/vr"
echo "$N START $(date +%H:%M:%S) ${H:0:8} $SP (pm ${T:0:8})" >> "$L"
PUNKTE_WER=koordinator node punkte.cjs run --sha "$H" --geraet radeon --nur "$SP" > "$S/vr/$N.out" 2>&1
echo "$N EXIT $? $(date +%H:%M:%S)" >> "$L"
grep "^  ROT \|^  GRÜN \|^  OFFEN \|^  UNGEMESSEN \|KARTE2 Akte\|KARTE2 keine Akte" "$S/vr/$N.out" | cut -c1-1500 >> "$L"
cd "$K" || exit 4
GRUEN=""; NAMEN=""
for sp in $(echo "$SP" | tr ',' ' '); do
    a=$(echo "$sp" | sed 's/^karte2\.//; s/#/./'); A="vision/richter/$a.${H:0:8}-radeon.json"
    if [ -f "$A" ] && node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const g=(j.geraete||[]).find(x=>/Radeon/.test(x.geraet||x.name||""))||{};const u=x=>x&&(x.urteil||x);process.exit(u(g.richter)==="GRÜN"&&u(g.preis)==="GRÜN"?0:1)' "$K/$A"; then
        GRUEN="$GRUEN $A"; NAMEN="$NAMEN $sp"
    else
        echo "$N AKTE NICHT geschoben (nicht GRÜN/GRÜN oder fehlt): $A" >> "$L"
    fi
done
if [ -n "$GRUEN" ]; then
    printf 'Akten Hand-Lauf Radeon 890M am main %s:%s — Richter GRÜN · Preis GRÜN [skip ci]\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n' "${H:0:8}" "$NAMEN" > "$S/vr/$N.msg"
    ok=0
    for v in 1 2 3 4 5 6; do
        T2=$(git ls-remote origin refs/heads/punkte-maschine | cut -f1); git fetch -q origin "$T2"
        C=$(bash "$S/plumb-kand.sh" "$T2" "$S/vr/$N.msg" $GRUEN 2>/dev/null)
        if [ -n "$C" ] && git push -q origin "$C:refs/heads/punkte-maschine"; then echo "$N AKTE GESCHOBEN ${C:0:10} auf ${T2:0:8} ·$GRUEN" >> "$L"; ok=1; break; fi
    done
    [ $ok = 1 ] || echo "$N AKTE-SCHUB dreimal abgelehnt:$GRUEN" >> "$L"
fi
echo "$N ENDE $(date +%H:%M:%S)" >> "$L"

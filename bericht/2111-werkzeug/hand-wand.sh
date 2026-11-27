#!/bin/bash
# hand-wand.sh <name> <sha40> <sprosse> <stations-datei unter stationen/> <kandidat-blob40> [<datei2> <blob2> …] — Wand (d) EINES
# Stations-Kandidaten an der Radeon: Baum pm-kand an die pm-Spitze heben, Kandidat (ein oder mehrere Dateien) NUR lokal einlegen, Lauf am
# genannten Code-Kopf, Akte beiseite (kein Schub), Stationen zurück auf die Spitze. Zeilen ins Log wao/hand.log.
# WAND_AE=1 fährt davor die Wände (a) `liste` und (e) `selbsttest --nur befehl-traegt` MIT dem Kandidaten (ohne GPU), je die Schlusszeile ins Log.
# EIN Lauf je Baum (Sperre wao/hand-wand.sperre): zwei Kandidaten im selben pm-kand überschrieben einander die Stationen.
export MSYS_NO_PATHCONV=1
S="C:/Users/micha/AppData/Local/Temp/claude/3c7f7ef9549389d2/9198e0cd-302f-42e2-be9b-9e3a035ce699/scratchpad"
K=C:/Users/micha/AnazhRealm-pm-kand; L="$S/wao/hand.log"; N=$1; H=$2; SP=$3; shift 3
[ $# -ge 2 ] && [ $(( $# % 2 )) -eq 0 ] || { echo "$N AUFRUF: es fehlen Paare <datei> <blob40>" >> "$L"; exit 4; }
PAARE=("$@")
SPERRE="$S/wao/hand-wand.sperre"; n=0
until mkdir "$SPERRE" 2>/dev/null; do
    n=$((n + 1)); [ $n -gt 240 ] && { echo "$N SPERRE hält seit 20 min: $(cat "$SPERRE/wer" 2>/dev/null)" >> "$L"; exit 3; }
    sleep 5
done
echo "$N $$ $(date +%H:%M:%S)" > "$SPERRE/wer"; trap 'rm -rf "$SPERRE"' EXIT
cd "$K" || exit 9
T=$(git ls-remote origin refs/heads/punkte-maschine | cut -f1); [ -n "$T" ] && git fetch -q origin "$T" || { echo "$N PM-SPITZE nicht geholt" >> "$L"; exit 7; }
git checkout -q "$T" -- meisterkarte-quelle/src meisterkarte-quelle/punkte/punkte.cjs meisterkarte-quelle/punkte/hilfe.cjs meisterkarte-quelle/punkte/gpu-zeuge.cjs meisterkarte-quelle/punkte/konsum-zeuge.cjs meisterkarte-quelle/punkte/deckel.json meisterkarte-quelle/punkte/stand.json meisterkarte-quelle/punkte/weg.json meisterkarte-quelle/punkte/stationen meisterkarte-quelle/punkte/werkzeug meisterkarte-quelle/punkte/gegenlauf ':(glob)meisterkarte-quelle/punkte/messung/*.json' ':(glob)vision/*' vision/richter vision/vorrat/klasse-offen.json || { echo "$N HEBEN gescheitert" >> "$L"; exit 8; }
i=0; KURZ=""
while [ $i -lt ${#PAARE[@]} ]; do
    D=${PAARE[$i]}; B=${PAARE[$((i + 1))]}
    git cat-file blob "$B" > "meisterkarte-quelle/punkte/stationen/$D" || { echo "$N KANDIDAT-BLOB fehlt: $D $B" >> "$L"; exit 6; }
    KURZ="$KURZ $D=${B:0:8}"; i=$((i + 2))
done
node "$S/wz/ber-holen.cjs" "$K" "$T" >> "$L" 2>&1 || { echo "$N BERICHT-Skripte nicht geholt" >> "$L"; exit 5; }
cd meisterkarte-quelle/punkte || exit 5
mkdir -p "$S/vr"
if [ "${WAND_AE:-0}" = 1 ]; then
    node punkte.cjs liste > "$S/vr/$N.liste.out" 2>&1; echo "$N WAND (a) liste Exit $? · $(grep -E "Stationen · .*Fehler" "$S/vr/$N.liste.out" | tail -1 | cut -c1-200) · ROT-Zeilen: $(grep -c "^ROT \|^  ROT " "$S/vr/$N.liste.out")" >> "$L"
    grep "^ROT \|^  ROT " "$S/vr/$N.liste.out" | cut -c1-260 | head -6 >> "$L"
    node punkte.cjs selbsttest --nur befehl-traegt > "$S/vr/$N.selbst.out" 2>&1; echo "$N WAND (e) befehl-traegt Exit $? · $(tail -1 "$S/vr/$N.selbst.out" | cut -c1-200)" >> "$L"
fi
echo "$N START $(date +%H:%M:%S) ${H:0:8} $SP mit Kandidat$KURZ (pm ${T:0:8})" >> "$L"
PUNKTE_WER=koordinator node punkte.cjs run --sha "$H" --geraet radeon --nur "$SP" > "$S/vr/$N.out" 2>&1
echo "$N EXIT $? $(date +%H:%M:%S)" >> "$L"
grep "^  ROT \|^  GRÜN \|^  OFFEN \|^  UNGEMESSEN \|KARTE2 Akte\|KARTE2 keine Akte" "$S/vr/$N.out" | cut -c1-1500 >> "$L"
a=${AKTE:-$(echo "$SP" | sed 's/^karte2\.//; s/#/./')}; mkdir -p "$S/vr/akte-$N"; mv "../../vision/richter/$a.${H:0:8}-radeon.json" "$S/vr/akte-$N/" 2>/dev/null
i=0
while [ $i -lt ${#PAARE[@]} ]; do git -C "$K" checkout -q "$T" -- "meisterkarte-quelle/punkte/stationen/${PAARE[$i]}"; i=$((i + 2)); done
echo "$N ENDE $(date +%H:%M:%S)" >> "$L"

#!/bin/bash
# bash pm-pruef.sh <commit40> [main40] — der Stations-Katalog am Baum eines punkte-maschine-Commits: die Urteils-Zeilen von `punkte.cjs liste`.
# Erwartet am Kopf vom 24.11.: genau zwei ROT-Zeilen (gelaende.K2#1/#2, Wand HAKEN) und „… · Fehler 2“. Jede NEUE ROT-Zeile ist ein Befund des Commits.
# Der Commit muss im Objekt-Speicher des Haupt-Klons liegen (alle Arbeitsbäume teilen ihn). Kein checkout, nur 60 Dateien im Scratch.
set -u; export MSYS_NO_PATHCONV=1
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
K="C:/Users/micha/AnazhRealm-profiband"
C=$1; M=${2:-$(git -C "$K" ls-remote origin refs/heads/main | cut -c1-40)}
git -C "$K" fetch -q origin "$M" 2>/dev/null
d="$S/pmp-$$"; rm -rf "$d"; mkdir -p "$d"
git -C "$K" archive --format=tar -o "$d.tar" "$C" meisterkarte-quelle/src meisterkarte-quelle/punkte/punkte.cjs meisterkarte-quelle/punkte/hilfe.cjs meisterkarte-quelle/punkte/gpu-zeuge.cjs meisterkarte-quelle/punkte/konsum-zeuge.cjs meisterkarte-quelle/punkte/deckel.json meisterkarte-quelle/punkte/stand.json meisterkarte-quelle/punkte/weg.json meisterkarte-quelle/punkte/stationen meisterkarte-quelle/punkte/werkzeug vision/meisterkarte-2.json vision/richter-tafel.json || { echo "HALT: archive"; exit 2; }
tar --force-local -xf "$d.tar" -C "$d"
( cd "$d/meisterkarte-quelle/punkte" && GIT_DIR="$K/.git" timeout 200 node punkte.cjs liste --kopf "$M" 2>&1 | grep -E '^  ROT |Stationen · .*Kriterien|PUNKTE ROT' | cut -c1-280 )
rm -rf "$d" "$d.tar"

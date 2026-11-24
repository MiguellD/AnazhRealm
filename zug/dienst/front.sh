#!/bin/bash
# front.sh — DIE FRONT DER RUNDE, EINE Quelle für beide Mess-Dienste (wird gesourct: landung-dienst.sh der OMEN, radeon-dienst.sh des
# Laptops; Koordinator 24.11.). Befund: nach den neun Runden-Sprüngen des 24.11. begann die Radeon 23 · 10 · 6 · 23 · 48 · 13 · 22 · 37 ·
# 59 min später zu messen — 241 min Leerlauf des schnellen Mess-Geräts (≈ 390 Stationen zu 37 s), weil sie „nach dem Gesetz“ auf die
# Liste der GTX wartete. Die Liste der GTX ist aber eine FUNKTION von Stand, den beide Geräte haben: die Tafel der Karte 2 im Baum von
# punkte-maschine, die Karte und die Ansprüche am koordination-Stand der Runde, die Mess-Dateien beider Geräte. Hier steht sie EINMAL:
#   front_bauen <geraet> <messung-dir> <kopf> → FRONT = "<vorn K1–K3>|<Schwanz K4–K6>" (runde.cjs reihe), FRONT_TEXT = die Zahl je
#   Schritt (Quelle → ohne /band → Reihe) mit Exit; Rückgabe ≠ 0, wenn ein Schritt scheiterte oder die Reihe keine Station trägt.
# Die OMEN friert damit ihre eigene Liste ein; die Radeon baut damit die Front der GTX SELBST, solange die GTX am Kopf noch keine trägt.
# Erwartet vom Rufer: PM (Baum von punkte-maschine mit vision/richter-tafel.json), RUNDE_REPO (der Klon, dessen refs/runde/koord
# `runde.cjs lies` eben holte), S (Zustand: listen/), L (Log) und die Funktion runde (node runde.cjs mit dem Log des Dienstes).
zahl() { echo "$1" | tr ',|' '\n\n' | grep -c .; }
# DIE LISTE REIST ALS DATEI (Koordinator 19.11. 05:54; Fund beim Live-Gang: „node: Argument list too long“ — 1 428 Stationen ≈ 50 000
# Zeichen als EIN Argument über der Windows-Grenze 32 767; die Kette lief leer weiter bis `laeuft 0/0 … liste |`). liste_datei <name>
# <liste> schreibt die Liste nach $S/listen/<name>.txt (printf ist eingebaut: kein exec) und nennt „@<datei>“ — so heißt jedes
# Listen-Argument an node (runde.cjs offen · reihe · teile · stand --liste · faelle · kappe) und an kandidat.sh. Unbegrenzt lang reist
# eine Liste nie in argv oder Umgebung; ein Teil (runde.cjs teile/kappe: ≤ 8 000 Zeichen) darf es.
liste_datei() { mkdir -p "${S:?}/listen" && printf '%s\n' "$2" >"$S/listen/$1.txt" && echo "@$S/listen/$1.txt"; }
# DIE KARTE 2 (15.11.): die Stationen der Tafel Station → Sprosse (vision/richter-tafel.json im Baum von punkte-maschine) mit einer
# Zeile „gleich“ — nur sie schreiben eine Akte —, je einmal, mit Komma; leer, wenn der Baum keine Tafel trägt.
karte2_nur() {
    [ -f "$PM/vision/richter-tafel.json" ] || return 0
    node -e 'const t=require(process.argv[1]);const z=Object.values(t).find((v)=>v&&typeof v==="object"&&Object.values(v).some((e)=>e&&e.station));console.log([...new Set(Object.values(z||{}).filter((e)=>e&&e.richter==="gleich").map((e)=>e.station).filter(Boolean))].join(","))' "$(cygpath -m "$PM/vision/richter-tafel.json")" 2>/dev/null | tr -d '\r'
}
liste_quelle() { # <kopf> → die Stationen der Runde (vor /band und Reihe); setzt QUELLE (ohne Tafel: gtx-nutzen der Punkte-Maschine)
    local a
    a=$(karte2_nur)
    if [ -n "$a" ]; then QUELLE="der Tafel der Karte 2 (Zeilen gleich)"; echo "$a"; return; fi
    QUELLE=gtx-nutzen
    (cd "$PM/meisterkarte-quelle/punkte" && timeout 900 node punkte.cjs gtx-nutzen --kopf "$1" 2>>"$L" | sed -n 's/^nur=//p' | tr -d '\r')
}
# ohne_band <liste> — Koordinator K10, 10.11. 13:25: nur die Stationen, die /band brauchen (profiband.*), ruhen; die übrigen mit Komma auf
# stdout, die ruhenden nach $L (bis 24.11. das Werkzeug n0611/stufe/ohne-band.cjs der OMEN — die Radeon hatte es nicht)
ohne_band() {
    printf '%s\n' "$1" | tr ', \t\r' '\n\n\n\n' | awk -v lf="$L" 'NF { if (/^profiband\./) r = r (r == "" ? "" : ", ") $0; else print } END { print "ruhen (brauchen /band): " (r == "" ? "keine" : r) >>lf }' | paste -sd, -
}
# anspruch_datei — zug/anspruch.txt (K1 der Reihe: die Stationen, die ein Zweig beim Stempel beansprucht; Schreiber ist der Koordinator)
# am eben geholten koordination-Stand (runde lies holt ihn nach refs/runde/koord); fehlt sie: leer → der Pfad
anspruch_datei() { mkdir -p "${S:?}/listen" && { git -C "$RUNDE_REPO" show refs/runde/koord:zug/anspruch.txt >"$S/listen/anspruch.txt" 2>/dev/null || : >"$S/listen/anspruch.txt"; } && echo "$S/listen/anspruch.txt"; }
# karte_datei — vision/meisterkarte-2.json am koordination-Stand der Runde (die Front: runde.cjs reihe --karte); fehlt sie, bleibt die
# Datei leer und die Reihe bricht mit Exit 6 beim Namen (LISTE ROT beim Rufer) — nie still die ganze Tafel
karte_datei() { mkdir -p "${S:?}/listen" && { git -C "$RUNDE_REPO" show refs/runde/koord:vision/meisterkarte-2.json >"$S/listen/karte.json" 2>/dev/null || : >"$S/listen/karte.json"; } && echo "$S/listen/karte.json"; }
# front_bauen <geraet> <messung-dir> <kopf> — die Kette Quelle → ohne /band → runde.cjs reihe (die Front der Karte 2, die Klassen K1–K6
# aus den Mess-Dateien beider Geräte in <messung-dir>); setzt FRONT, FRONT_TEXT, FRONT_QUELLE_N, FRONT_BAND_N (ohne Unter-Shell rufen)
front_bauen() {
    local ra rb rr a b kd
    mkdir -p "${S:?}/listen"
    liste_quelle "$3" >"$S/listen/quelle.txt" # ohne Unter-Shell: QUELLE bleibt gesetzt
    ra=$?
    a=$(<"$S/listen/quelle.txt")
    b=$(ohne_band "$a")
    rb=$?
    kd=$(karte_datei)
    FRONT=$(runde reihe "$2" "$1" "$(liste_datei reihe "$b")" ${kd:+--karte "$kd"} --anspruch "$(anspruch_datei)")
    rr=$?
    FRONT_QUELLE_N=$(zahl "$a") FRONT_BAND_N=$(zahl "$b")
    FRONT_TEXT="Quelle ${QUELLE:-?} $FRONT_QUELLE_N (Exit $ra), ohne /band $FRONT_BAND_N (Exit $rb), Reihe $(zahl "$FRONT") (Exit $rr)"
    [ $ra = 0 ] && [ $rb = 0 ] && [ $rr = 0 ] && [ "$(zahl "$FRONT")" != 0 ]
}

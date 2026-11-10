#!/bin/bash
# gemein.sh — was jede Schleife des Dienstes teilt (wird gesourct): Orte, das Schloss gegen den Zwilling, der Puls.
# Der Zustand des Dienstes lebt in /tmp/claude/dienst (PID, Puls, Zug-Nummer, Zug in Fahrt); die Logs bleiben dort, wo der
# Messplatz-Blick sie liest (/tmp/claude/fahre-z*.log, w3/kette-z*.out, w4/zug-nie-leer.log · .wartet · .refs, w4/zug-gefahren.txt).
R=/c/Users/micha/AnazhRealm-profiband
WZ=$R/artifacts/profiband/werkzeug
T=/tmp/claude
W=$T/w4
S=$T/dienst
mkdir -p "$S" "$T/w3" "$W"

# schloss <name> — EINE Instanz je Schleife (Lehre „Schlange einmal“ 05.11., zwei z370 am 10.11.): die PID-Datei trägt die
# Windows-PID; lebt deren bash noch, endet der Zweite beim Namen. Eine tote PID wird übernommen.
schloss() {
    local f=$S/$1.pid w alt
    w=$(cat /proc/$$/winpid 2>/dev/null)
    alt=$(cat "$f" 2>/dev/null)
    if [ -n "$alt" ] && [ "$alt" != "$w" ] && tasklist //FI "PID eq $alt" 2>/dev/null | grep -qi "bash"; then
        echo "$(date +%H:%M:%S) $1: läuft schon (PID $alt) — kein Zwilling"
        return 1
    fi
    echo "$w" >"$f"
    echo "$$" >"$S/$1.mpid" # die MSYS-PID: start.sh --stopp beendet über sie den ganzen Baum (Kinder zuerst)
}
# puls <name> <text> — EINE Zeile je Schleife: Zeit + was sie gerade tut. Der Blick liest sie; ein Puls, der stillsteht, ist ein Alarm.
puls() {
    local n=$1
    shift
    echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >"$S/$n.puls"
}

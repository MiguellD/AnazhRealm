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

# halter_lebt <marke-datei> [bild] — DER HALTER IST pid + START, NIE DIE pid ALLEIN (11.11.): Windows vergibt eine freie Nummer neu.
# Die Baum-Sperre der Punkte-Maschine hing 12:01–12:30 an pid 24876 — ihr Mess-Lauf fiel 12:07 am CI-Abbruch, ab 12:21 trug ein
# fremdes bash.exe die Nummer, die Radeon wartete „belegt“ statt zu messen (punkte.cjs prozessStart/halterLebt trägt dieselbe Regel).
# Die Marke (PID-Datei: ihr Inhalt die Windows-PID) schrieb der Halter NACH seinem Start: trägt die Nummer heute ein Prozess, der
# erst nach der Marke begann, ist der Halter tot. [bild]: sein Prozess-Name muss es enthalten („sh.exe" trifft bash.exe UND sh.exe — die Schleifen laufen seit 13.11. unter sh.exe). Antwortet die Prozess-Tafel
# nicht, gilt er als lebend — eine lebende Schleife bekommt nie einen Zwilling, weil eine Frage ohne Antwort blieb.
START_SPIEL_S=2
halter_lebt() {
    local m=$1 bild=$2 p z s
    [ -f "$m" ] || return 1
    p=$(tr -dc 0-9 <"$m")
    [ -n "$p" ] || return 1
    z=$(tasklist //FI "PID eq $p" //NH 2>/dev/null | grep -w "$p") || return 1
    if [ -n "$bild" ]; then echo "$z" | grep -qi "$bild" || return 1; fi
    s=$(powershell -NoProfile -NonInteractive -Command "\$p = Get-CimInstance -ClassName Win32_Process -Filter 'ProcessId=$p' -Property CreationDate; if (\$p -and \$p.CreationDate) { ([DateTimeOffset]\$p.CreationDate).ToUnixTimeSeconds() }" 2>/dev/null | tr -dc 0-9)
    [ -n "$s" ] || return 0
    [ "$s" -le $(($(stat -c %Y "$m") + START_SPIEL_S)) ]
}

# schloss <name> — EINE Instanz je Schleife (Lehre „Schlange einmal“ 05.11., zwei z370 am 10.11.): die PID-Datei trägt die
# Windows-PID; lebt deren bash noch (halter_lebt), endet der Zweite beim Namen. Eine tote PID wird übernommen.
schloss() {
    local f=$S/$1.pid w alt
    w=$(cat /proc/$$/winpid 2>/dev/null)
    alt=$(cat "$f" 2>/dev/null)
    if [ -n "$alt" ] && [ "$alt" != "$w" ] && halter_lebt "$f" sh.exe; then
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

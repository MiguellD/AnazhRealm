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
# erst nach der Marke begann, ist der Halter tot. [bilder]: sein Abbild muss GENAU eines davon sein (Liste mit Leerzeichen, ohne
# Groß/klein) — bis 14.11. war es ein Teilwort („sh.exe“ traf auch pwsh.exe und ssh.exe). Antwortet die Prozess-Tafel
# nicht, gilt er als lebend — eine lebende Schleife bekommt nie einen Zwilling, weil eine Frage ohne Antwort blieb.
START_SPIEL_S=2
halter_lebt() {
    local m=$1 bild=$2 p z s i
    [ -f "$m" ] || return 1
    p=$(tr -dc 0-9 <"$m")
    [ -n "$p" ] || return 1
    z=$(tasklist //FI "PID eq $p" //NH 2>/dev/null | grep -w "$p") || return 1
    if [ -n "$bild" ]; then
        i=$(echo "$z" | awk 'NR==1 { print tolower($1) }')
        case " $(echo "$bild" | tr 'A-Z' 'a-z') " in *" $i "*) ;; *) return 1 ;; esac
    fi
    s=$(powershell -NoProfile -NonInteractive -Command "\$p = Get-CimInstance -ClassName Win32_Process -Filter 'ProcessId=$p' -Property CreationDate; if (\$p -and \$p.CreationDate) { ([DateTimeOffset]\$p.CreationDate).ToUnixTimeSeconds() }" 2>/dev/null | tr -dc 0-9)
    [ -n "$s" ] || return 0
    [ "$s" -le $(($(stat -c %Y "$m") + START_SPIEL_S)) ]
}

# schleife_lebt <pid-datei> — DIE EINE REGEL, ob eine Schleife des Dienstes lebt (Laptop UND OMEN; gelesen von schloss, start.sh,
# --blick, --stopp): ihr Halter lebt (pid + Start) und sein Abbild ist sh.exe ODER bash.exe. 14.11. 15:31: die OMEN las in start.sh
# ihr eigenes `tasklist | grep bash` — die puls-Schleife lief als sh.exe, start meldete „ROT: puls lebt nach 15 s nicht“, --blick
# „puls STEHT“, und ein zweiter Start hätte allein am PID-Schloss gehangen. Beweis: `start.sh --selbsttest` (beide Dienst-Ordner).
SCHLEIFE_BILDER="sh.exe bash.exe"
schleife_lebt() { halter_lebt "$1" "$SCHLEIFE_BILDER"; }

# schloss_wartende <gerät> [eigen-präfix] — wer am GPU-Schloss WARTET, aus der EINEN Quelle schloss-puls.cjs (gpu-lauf.sh vor dem
# Schloss, Vorrang-Marken, der CI-Job im Start-Hook; `wartende` nach „welten“) — Namen mit Leerzeichen getrennt, leer = keiner.
# Läufe mit dem eigen-Präfix (die eigene Mess-Sitzung) zählen nie. Dasselbe Lese-Format wie radeon-dienst.sh warter().
schloss_wartende() {
    node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/schloss-puls.cjs" --geraet "$1" --einmal 2>/dev/null | grep -A8 '"wartende"' | tail -n +2 |
        grep -oE '^ +"[^"]+"' | tr -d ' "' | { if [ -n "$2" ]; then grep -v "^$2"; else cat; fi; } | tr '\n' ' ' | sed 's/ $//'
}

# selbsttest_lebt — (a) für start.sh --selbsttest beider Dienst-Ordner: eine sh.exe- und eine bash.exe-Schleife leben, ein fremdes
# Abbild (sleep.exe, eine Kopie als pwsh.exe — das alte Teilwort „sh.exe“ traf sie) und eine tote PID nicht. Mutanten: das alte
# `grep bash` der OMEN und das alte Teilwort „sh.exe“ — beide müssen ROT werden. Druckt „OK …“/„ROT …“, Exit 0 = GRÜN.
selbsttest_lebt() {
    local X q m rot=0 soll n u tot
    X=$(mktemp -d)
    cp /usr/bin/sleep.exe "$X/pwsh.exe"
    /usr/bin/sh -c 'sleep 40; :' &
    q="sh:$!"
    /usr/bin/bash -c 'sleep 40; :' &
    q="$q bash:$!"
    sleep 40 &
    q="$q sleep:$!"
    "$X/pwsh.exe" 40 &
    q="$q pwsh:$!"
    /usr/bin/sh -c 'sleep 1; :' &
    m=$!
    command sleep 0.3
    tot=$(cat /proc/$m/winpid 2>/dev/null)
    wait $m
    command sleep 1
    for n in $q; do cat "/proc/${n#*:}/winpid" >"$X/${n%%:*}.pid"; done
    echo "$tot" >"$X/tot.pid"
    command sleep 1
    # je Regel: sh bash sleep pwsh tot → Soll L L S S S (L = lebt, S = steht)
    urteil() { local f o=""; for f in sh bash sleep pwsh tot; do if "$@" "$X/$f.pid"; then o="${o}L"; else o="${o}S"; fi; done; echo "$o"; }
    alt_omen() { local p; p=$(cat "$1" 2>/dev/null); [ -n "$p" ] && tasklist //FI "PID eq $p" 2>/dev/null | grep -qi bash; }
    alt_teilwort() { halter_lebt_teilwort "$1"; }
    halter_lebt_teilwort() { local p z; p=$(tr -dc 0-9 <"$1"); [ -n "$p" ] || return 1; z=$(tasklist //FI "PID eq $p" //NH 2>/dev/null | grep -w "$p") || return 1; echo "$z" | grep -qi sh.exe; }
    soll=LLSSS
    u=$(urteil schleife_lebt)
    if [ "$u" = $soll ]; then echo "OK a  schleife_lebt: sh.exe lebt · bash.exe lebt · sleep.exe steht · pwsh.exe steht · tote PID steht ($u)"
    else echo "ROT a  schleife_lebt urteilt $u (Soll $soll: sh bash sleep pwsh tot)"; rot=1; fi
    u=$(urteil alt_omen)
    if [ "$u" != $soll ]; then echo "OK a  Mutante „grep bash“ (die alte OMEN-Regel) ROT: $u"; else echo "ROT a  Mutante „grep bash“ bleibt GRÜN"; rot=1; fi
    u=$(urteil alt_teilwort)
    if [ "$u" != $soll ]; then echo "OK a  Mutante „Teilwort sh.exe“ ROT: $u"; else echo "ROT a  Mutante „Teilwort sh.exe“ bleibt GRÜN"; rot=1; fi
    for n in $q; do kill "${n#*:}" 2>/dev/null; taskkill //F //PID "$(cat "$X/${n%%:*}.pid")" >/dev/null 2>&1; done
    wait 2>/dev/null
    rm -rf "$X"
    return $rot
}

# schloss_pid <besitzer.txt> — DIE pid des GPU-Schloss-Halters, gleich in welcher Zeile sie steht (14.11.): gpu-lauf.sh schreibt
# „<name> <zeit> pid=<Windows-PID>“ in Zeile 1, gpu-schloss.sh und die Punkte-Sitzung „pid=<n>“ in Zeile 2. radeon-dienst.sh las nur
# „^pid=“, fand an jedem gpu-lauf-Schloss KEINE pid und löste es nach der 2-min-Regel „ohne Halter“ — 11.11. 23:09 bis 14.11. 00:47
# 29 gpu-lauf-Schlösser, ohne je ihre pid zu fragen (Sandkasten: der Halter lebt 170 s, tasklist · gpu-lauf · schloss-puls sagen lebt, der Dienst ab 120 s
# „verwaist“). Dieselbe Regel (pid= irgendwo) lesen gpu-lauf.sh, der Start-Hook des Läufers und schloss-puls.cjs.
schloss_pid() { tr -d '\r\n' 2>/dev/null <"$1" | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p'; }

# schloss <name> — EINE Instanz je Schleife (Lehre „Schlange einmal“ 05.11., zwei z370 am 10.11.): die PID-Datei trägt die
# Windows-PID; lebt deren bash noch (halter_lebt), endet der Zweite beim Namen. Eine tote PID wird übernommen.
schloss() {
    local f=$S/$1.pid w alt
    w=$(cat /proc/$$/winpid 2>/dev/null)
    alt=$(cat "$f" 2>/dev/null)
    if [ -n "$alt" ] && [ "$alt" != "$w" ] && schleife_lebt "$f"; then
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

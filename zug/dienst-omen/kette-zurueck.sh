#!/bin/bash
# kette-zurueck.sh <liste.txt> — eine eigene Kette ZURÜCKZIEHEN, ohne eine Welt zurückzulassen (14.11.: wer nur die Schalen der Kette
# beendet, lässt die Werkbank ihres Bild-Schritts leben — sie lief 4 h 18 min neben dem Schloss). Schritte, alle an der PID:
# (1) die Schalen von kette-liste.sh DIESER Liste samt Kindern; (2) das Tor dieser Liste, das gerade dran ist: WARTET es am Schloss,
# fallen seine gpu-lauf-Schalen; HÄLT es die Karte (Schloss „omen-sg-<name>"), fällt der node-Baum seines npm-Befehls — der Lauf endet,
# gpu-lauf gibt das Schloss selbst frei (ein Befehl, der kein `npm run -s <skript>` ist, bleibt stehen und wird genannt);
# (3) der Wächter (welt-wache.sh): lebt danach eine Welt, steht sie mit Port und pid in sg/kette.log und auf stdout.
# (4) das Schloss: hängt es an einer toten pid, löst es `schloss_verwaist`. Beendet KEINE Welt und nichts Fremdes — sie nennt nur.
O=/c/Users/micha/Desktop/AnazhRealm-OMEN
S=$O/p3/n1211/sg
L=$1
[ -f "$L" ] || { echo "kette-zurueck: $L fehlt"; exit 8; }
B=$(basename "$L")
HALTER=$(head -n 1 /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss/besitzer.txt 2>/dev/null | tr -d '\r')
pids() { powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.Name -ne 'powershell.exe' -and \$_.CommandLine -and \$_.CommandLine -notmatch 'kette-zurueck' -and \$_.CommandLine -match '$1' } | ForEach-Object { \$_.ProcessId }" 2>/dev/null | tr -d '\r' | tr '\n' ' '; }
weg() { for p in $1; do taskkill //PID $p //T //F > /dev/null 2>&1; done; }
K=$(pids "kette-liste\.sh .*$B")
echo "Schalen der Kette $B: ${K:-keine}"; weg "$K"
LIEF=
while IFS='|' read -r n max baum befehl; do
    G=$(pids "gpu-lauf\.sh sg-$n ")
    [ -z "$G" ] && continue
    if [ "$HALTER" = "omen-sg-$n" ]; then
        LIEF="$LIEF $n(hielt die Karte)"
        case "$befehl" in
            "npm run -s "*)
                s=${befehl#npm run -s }; s=${s%% *}
                N=$(pids "npm-cli\.js\"? run -s $s\$")
                echo "Tor $n hält die Karte — node-Baum von »npm run -s $s«: ${N:-keiner}"; weg "$N" ;;
            "node "*)
                # (14.11.: ein `node scripts/…`-Tor lief nach dem Zurückziehen weiter und hielt die Karte — sein node-Baum an der PID)
                N=$(powershell -NoProfile -Command "\$b = '${befehl#node }'; Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -and \$_.CommandLine.TrimEnd().EndsWith(\$b) } | ForEach-Object { \$_.ProcessId }" 2>/dev/null | tr -d '\r' | tr '\n' ' ')
                echo "Tor $n hält die Karte — node-Baum von »$befehl«: ${N:-keiner}"; weg "$N" ;;
            *) echo "Tor $n hält die Karte mit »$befehl« — weder npm-Skript noch node: es läuft zu Ende oder wird von Hand an der PID beendet (gpu-lauf: $G)" ;;
        esac
    else
        LIEF="$LIEF $n(wartete)"
        echo "Tor $n wartet am Schloss (${HALTER:-frei}) — seine gpu-lauf-Schalen: $G"; weg "$G"
    fi
done < <(grep -v '^#' "$L" | grep '|')
[ -n "$LIEF" ] && sleep 6
# (4) DAS SCHLOSS: fiel die gpu-lauf-Schale des Tors mit den Schalen der Kette (14.11.: taskkill /T nahm sie mit, das Schloss
# hing an einer toten pid), löst es der EINE Weg — `schloss_verwaist` (gpu-schloss.sh) löst nur, wenn der Halter nicht lebt
V=$(. $O/p3/gpu-schloss.sh; schloss_verwaist 2>&1)
[ -n "$V" ] && echo "$V"
W=$(bash $S/welt-wache.sh "nach dem Zurückziehen von $B")
if [ -n "$W" ]; then
    echo "$W" | while IFS= read -r z; do echo "$(date +%T) $z" >> $S/kette.log; done
    echo "$W"
    echo "→ die EIGENE Welt beenden: node scripts/werkbank.cjs stop --port <Port> (aus einem Baum); eine fremde dem Koordinator melden"
else
    echo "keine Welt lebt"
fi
echo "$(date +%T) ZURÜCK $B (Schalen: ${K:-keine}; dran:${LIEF:- nichts})" >> $S/kette.log

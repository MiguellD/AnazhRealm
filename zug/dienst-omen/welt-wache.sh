#!/bin/bash
# welt-wache.sh [wort] — DER WÄCHTER DER WERKBANK-WELTEN (14.11.: eine verwaiste `werkbank start --port 4793 --ort dorf`, pid 13140,
# lebte 10:58:33–15:16 NEBEN dem GPU-Schloss — übrig, als nur die Ketten-Schalen zurückgezogen wurden; jede Millisekunde der Karte
# in dem Fenster zählt als ungemessen). Nennt jede lebende Welt einer Werkbank (node … werkbank.cjs start): pid, Port, Ort, Startzeit,
# dazu, wer das Schloss hält. Beendet NICHTS — sie nennt nur. Exit 0 = keine Welt lebt, 1 = mindestens eine (die Zeilen auf stdout).
# Aufrufer: kette-liste.sh (beim Start und am Ende), kette-zurueck.sh (nach dem Zurückziehen). Von Hand: `bash p3/n1211/sg/welt-wache.sh`.
# Eine Welt, die lebt, während das Schloss frei ist oder ein ANDERER es hält, ist verwaist: `node scripts/werkbank.cjs stop --port <P>`
# aus einem Baum beendet sie sauber (nur die eigene — eine fremde meldet man dem Koordinator).
WORT=${1:-blick}
HALTER=$(head -n 1 /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss/besitzer.txt 2>/dev/null | tr -d '\r')
Z=$(powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'werkbank\.cjs\"?\s+start' } | ForEach-Object { \$p = if (\$_.CommandLine -match '--port\s+(\d+)') { \$Matches[1] } else { '4791' }; \$o = if (\$_.CommandLine -match '--ort\s+(\S+)') { \$Matches[1] } else { '-' }; 'pid ' + \$_.ProcessId + ', Port ' + \$p + ', Ort ' + \$o + ', seit ' + \$_.CreationDate.ToString('HH:mm:ss') }" 2>/dev/null | tr -d '\r')
[ -z "$Z" ] && exit 0
while IFS= read -r z; do
    echo "‼ WELT LEBT ($WORT; Schloss: ${HALTER:-frei}): $z"
done <<< "$Z"
exit 1

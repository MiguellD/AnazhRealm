#!/bin/bash
# kette-liste.sh <liste.txt> [warte-flagge] — die Tore einer Liste nacheinander, je Tor EIN Lauf unter dem Karten-Schloss (p3/gpu-lauf.sh,
# die CI hat Vorfahrt), mit Uhr je Zeile; der Exit aus dem Lauf selbst (pipefail), das Urteil aus den ❌-Zeilen des Logs. Über WMI gestartet
# (absolute Pfade). Die Liste: je Zeile `name|deckel-s|baum|befehl …` (baum = Ordner unter AnazhRealm-OMEN, # = Kommentar); die Logs
# liegen neben der Liste in <liste>/<name>.log, die Zeilen in sg/kette.log, die Flagge <liste>.fertig. Mit warte-flagge: erst, wenn sie steht.
# Die Liste wird beim Start GELESEN (eine laufende Kette ändert sich nicht mehr). Beim START und am ENDE ruft sie den Wächter der
# Werkbank-Welten (welt-wache.sh, 14.11.): lebt eine Welt, die nicht ihre ist, steht sie mit Port und pid in sg/kette.log — sie beendet
# nichts. Zurückziehen NUR über kette-zurueck.sh <liste> (Schalen, laufendes Tor, Wächter).
O=/c/Users/micha/Desktop/AnazhRealm-OMEN
S=$O/p3/n1211/sg
L=$1
A=${L%.txt}
cd $O || exit 9
[ -f "$L" ] || { echo "$(date +%T) kette-liste: $L fehlt" >> $S/kette.log; exit 8; }
mkdir -p $A
rm -f $A.fertig
mapfile -t ZEILEN < <(grep -v '^#' "$L" | grep '|')
[ -n "$2" ] && { echo "$(date +%T) $(basename $A) wartet auf $(basename $2)" >> $S/kette.log; until [ -e "$2" ]; do sleep 20; done; }
export GPU_LAUF_WARTE_S=14400
export GPU_LAUF_WEICH_S=${GPU_LAUF_WEICH_S:-600} # 12.11.: wie die Mess-Liste — ein CI-Job im Start-Hook wartet, der Lauf misst bis zu 600 s zu Ende
uhr() { while IFS= read -r l; do printf '%s %s\n' "$(date +%T.%N | cut -c1-10)" "$l"; done; }
echo "$(date +%T) START $(basename $A) (${#ZEILEN[@]} Tore)" >> $S/kette.log
wache() { bash $S/welt-wache.sh "$1" | while IFS= read -r w; do echo "$(date +%T) $w" >> $S/kette.log; done; }
wache "Start $(basename $A)"
for z in "${ZEILEN[@]}"; do
    IFS='|' read -r n max baum befehl <<< "$z"
    B=$O/$baum
    K=$(git -C $B rev-parse --short=8 HEAD 2>/dev/null)
    t0=$(date +%s)
    (set -o pipefail; cd $B && GPU_LAUF_MAX_S=$max bash $O/p3/gpu-lauf.sh sg-$n $befehl 2>&1 | uhr > $A/$n.log)
    x=$?
    echo "$(date +%T) $n ($baum $K) EXIT=$x $(( $(date +%s) - t0 )) s mit Warten · $(grep -a '❌' $A/$n.log | grep -av 'Täter' | cut -c12-230 | head -n 4 | tr '\n' '|')" >> $S/kette.log
done
wache "Ende $(basename $A)"
echo "$(date +%T) ENDE $(basename $A)" >> $S/kette.log
touch $A.fertig

#!/bin/bash
# zug/omen-gpu-lauf.sh — Station (30.10.): setzt die gpu-lauf.sh der OMEN (p3/gpu-lauf.sh, PUNKTE_GPU_LAUF der Punkte-Jobs) auf koordination
# bericht/2310-omen-runner/gpu-lauf.sh: nach dem Nehmen meldet sie „gpu-lauf: Schloss <name> nach <s> s“ (das Protokoll der kanonischen
# gpu-lauf.sh, auf das punkte.cjs wartet), beim Exit 75 „SCHLOSS BLOCKIERT …“. Ohne die Meldung starb der stille Warter der Mess-Sitzung
# nach 600 s, obwohl das Schloss stand (takt25b · takt25p · takt25h je 0 gemessen). Getauscht wird nur, wenn die OMEN-Kopie dem alten
# Stand 4636f1af0faa9a123c75fd23a4eb309ccfe40fbc gleicht — sonst ABWEICHUNG mit Diff, nichts überschrieben. Die Datei wird je Lauf neu gelesen: der Tausch zwischen zwei
# Aufträgen ist sicher. Ein Schloss mit totem Halter räumt die nächste gpu-lauf.sh selbst (schloss_verwaist).
H=$(dirname "$(dirname "$OUT")"); Z="$(dirname "$H")/gpu-lauf.sh"; NEU="$H/koord/bericht/2310-omen-runner/gpu-lauf.sh"; ALT=4636f1af0faa9a123c75fd23a4eb309ccfe40fbc
ist=$(tr -d '\r' < "$Z" | git hash-object --stdin); neu=$(tr -d '\r' < "$NEU" | git hash-object --stdin)
echo "OMEN-Kopie $Z $ist · alter Stand $ALT · neuer Stand $neu"; cp "$Z" "$OUT/gpu-lauf.sh.alt"
[ "$ist" = "$neu" ] && { echo "schon neu"; exit 0; }
if [ "$ist" != "$ALT" ]; then echo "ABWEICHUNG: die OMEN-Kopie ist weder alt noch neu — nichts überschrieben"; diff <(git -C "$H/koord" show HEAD~0:bericht/2310-omen-runner/gpu-lauf.sh | tr -d '\r') <(tr -d '\r' < "$Z") | head -n 40; exit 3; fi
cp "$NEU" "$Z" && bash -n "$Z" && grep -cF 'gpu-lauf: Schloss $NAME nach' "$Z" && echo "getauscht: die OMEN-gpu-lauf.sh meldet das Schloss"
echo "-- Schloss jetzt:"; ls -la /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss 2>&1 | tail -n 2; cat /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss/besitzer.txt 2>&1

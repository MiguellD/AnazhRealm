#!/bin/bash
# p3/messplatz.sh — der Starter des GTX-Messplatz-Dienstes (koordination zug/messplatz.md; die Schleife: p3/messplatz/messplatz.sh).
# Ein Wächter: nur EINE Instanz arbeitet (mkdir-Sperre mit pid). Läuft schon eine, WARTET dieser Starter als Bereitschaft und übernimmt,
# sobald sie endet (die geplante Aufgabe „OMEN messplatz“ bei Anmeldung, 23.10. vom Nutzer freigegeben, startet ihn so neben einer von
# Hand gestarteten Instanz). Endet die Schleife, steht `MELDEN` in p3/messplatz/dienst.log und sie läuft nach 60 s neu an. Ein Lauf, der
# beim Neustart mitten in einem Auftrag stand, setzt ihn fort (die Serie überspringt fertige Boots).
#   bash p3/messplatz.sh &
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz; S=$H/waechter.lock
# NACH EINEM NEUSTART (24.10.): eine Sperre, älter als der Systemstart, ist verwaist — ihre PID kann neu vergeben sein und
# „lebte“ sonst. Das gilt für die Wächter-Sperre und für das GPU-Schloss (der Runner-Hook und gpu-schloss.sh prüfen dasselbe).
BOOT=$(( $(date +%s) - $(cut -d. -f1 /proc/uptime) ))
for d in "$S" /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss; do
  if [ -d "$d" ] && [ "$(stat -c %Y "$d/$( [ "$d" = "$S" ] && echo pid || echo besitzer.txt)" 2>/dev/null || stat -c %Y "$d")" -lt "$BOOT" ]; then
    echo "$(date '+%F %T') Sperre $d älter als der Systemstart - gelöst" >> $H/dienst.log; rm -rf "$d"
  fi
done
# eine innere Schleife lebt (auch als Waise eines gestorbenen Wächters): jeder Prozess mit p3/messplatz/messplatz.sh in der Zeile
schleife_lebt() { [ "$(powershell -NoProfile -Command "@(Get-CimInstance Win32_Process | Where-Object { [string]$_.CommandLine -match 'messplatz[\\/]messplatz\.sh' }).Count" 2>/dev/null | tr -dc 0-9)" != "0" ]; }
while schleife_lebt || ! mkdir "$S" 2>/dev/null; do
  p=$(cat "$S/pid" 2>/dev/null)
  if schleife_lebt || { [ -n "$p" ] && kill -0 "$p" 2>/dev/null; }; then
    [ -n "$gemeldet" ] || { echo "$(date '+%F %T') Bereitschaft: Messplatz läuft schon (Wächter pid $p oder eine Schleife lebt), warte" >> $H/dienst.log; gemeldet=1; }
    sleep 60
  else
    rm -rf "$S"
  fi
  [ -d "$S" ] && [ ! -f "$S/pid" ] && rm -rf "$S"
done
echo $$ > "$S/pid"
trap 'rm -rf "$S"' EXIT
while :; do
  bash $H/messplatz.sh
  echo "$(date '+%F %T') MELDEN Dienst endete mit Exit $? — Neustart in 60 s" >> $H/dienst.log
  sleep 60
done

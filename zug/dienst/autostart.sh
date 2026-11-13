#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# autostart.sh — startet die Schleifen des Laptops nach dem ANMELDEN (Schöpfer 10.11. 23:50: „Ja, Autostart“). Ein Geräte-Neustart
# beendet jede Schleife; ohne Autostart stünde die Maschine, bis ein Koordinator es merkt.
# Gerufen von AnazhRealm-Dienste.cmd aus dem Autostart-Ordner des Benutzers — als KOPIE unter /tmp (die Installation, die dieser
# Lauf auslöst, darf die Datei unter ihm nicht tauschen). An- und Abschalten: die zwei Klicks auf dem Desktop
# (AnazhRealm-Autostart-an.cmd · -aus.cmd); die Sitzung schaltet nichts selbst.
# Ablauf: bis zu 5 min auf das Netz warten → start.sh frisch aus origin/koordination holen und fahren (installieren + starten).
# Ohne Netz: der INSTALLIERTE Stand startet mit `start.sh --lokal` (nichts wird installiert). Log: /tmp/claude/dienst/autostart.log
R=/c/Users/micha/AnazhRealm-profiband
S=/tmp/claude/dienst
L=$S/autostart.log
mkdir -p "$S"
echo "$(date '+%Y-%m-%d %H:%M:%S') AUTOSTART (angemeldet als $(whoami))" >>"$L"
for i in $(seq 1 15); do
    if git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" 2>/dev/null; then
        if git -C $R show origin/koordination:zug/dienst/start.sh >"$S/start-lauf.sh" 2>/dev/null && [ -s "$S/start-lauf.sh" ]; then
            sh "$S/start-lauf.sh" >>"$L" 2>&1
            echo "$(date '+%H:%M:%S') AUTOSTART Ende (frischer Stand, Exit $?)" >>"$L"
            exit 0
        fi
        break
    fi
    sleep 20
done
echo "$(date '+%H:%M:%S') kein Netz nach 5 min oder start.sh nicht lesbar — der installierte Stand startet (--lokal)" >>"$L"
cp "$R/artifacts/profiband/dienst/start.sh" "$S/start-lauf.sh" && sh "$S/start-lauf.sh" --lokal >>"$L" 2>&1
echo "$(date '+%H:%M:%S') AUTOSTART Ende (lokal, Exit $?)" >>"$L"

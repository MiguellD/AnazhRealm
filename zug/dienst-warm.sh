#!/bin/bash
# zug/dienst-warm.sh — Station (messplatz.sh fahre_station, 30.10.): setzt DAS WARME ABAB auf die OMEN — p3/messplatz/serie.sh,
# p3/messplatz/urteil.cjs und p3/messplatz/werkzeug/schlaf.cjs aus koordination bericht/2310-omen-runner/messplatz/ (je Zelle bootet
# jede Seite EINMAL, die Mess-Fenster wechseln in Thue-Morse-Folge in den warmen Welten, die ruhende Seite schläft eingefroren).
# Getauscht wird nur, wenn JEDE OMEN-Kopie einem bekannten alten Stand gleicht oder schon neu ist — sonst ABWEICHUNG mit dem ganzen
# Diff gegen den Referenz-Stand, die OMEN-Kopie liegt in $OUT (*.alt), NICHTS überschrieben. Serie und Urteil liest der Dienst je
# Zelle neu (`bash $H/serie.sh`, `node $H/urteil.cjs`): der Tausch zwischen zwei Aufträgen ist sicher, messplatz.sh bleibt unberührt.
# Der Rückweg: die *.alt aus bericht/<id>/ zurückkopieren (die alte serie.sh läuft mit dem neuen urteil.cjs unverändert).
# Bekannte alte Stände (git hash-object ohne CR): urteil.cjs e6ea7c17 (koordination d72acc958, KLAR NACH 2+2, seit dienst-urteil-1 auf
# der OMEN); serie.sh b98302e6 (koordination 526ce5bcc, 27.10.). Trägt die OMEN-serie.sh die Hänger-Frist vom 29.10. (fortschritt
# 07:11, nie nach koordination), meldet die Station ABWEICHUNG mit ihrem Hash und Diff: die warme Serie trägt an JEDEM Werkbank-Befehl
# eine Frist mit HÄNGER-Zeile — nach Sichtung des Diffs hängt der Koordinator den Hash an ALT_SERIE und fährt die Station neu.
H=$(dirname "$(dirname "$OUT")"); Q="$H/koord/bericht/2310-omen-runner/messplatz"
ALT_SERIE="b98302e6176479e32e893112fd96b05d569d626d"
ALT_URTEIL="e6ea7c174cf4e86584e1af42ec4bdcf7f9aaab03"
hash() { tr -d '\r' < "$1" | git hash-object --stdin; }
fehl=0
pruefe() { # $1 Ziel auf der OMEN, $2 neue Quelle, $3 alte Hashes ("-" = neue Datei), $4 Referenz-Commit des Diffs ("-" = keiner)
  local ist neu; neu=$(hash "$2") || { echo "ABWEICHUNG: Quelle $2 fehlt"; fehl=1; return; }
  if [ ! -e "$1" ]; then [ "$3" = "-" ] && { echo "NEU $1 ($neu)"; return 0; }; echo "ABWEICHUNG: $1 fehlt"; fehl=1; return; fi
  ist=$(hash "$1"); cp "$1" "$OUT/$(basename "$1").alt"
  [ "$ist" = "$neu" ] && { echo "SCHON NEU $1 ($neu)"; return 0; }
  case " $3 " in *" $ist "*) echo "ALT $1 ($ist) -> $neu"; return 0;; esac
  echo "ABWEICHUNG: $1 ist $ist — weder ein alter Stand ($3) noch der neue ($neu)"; fehl=1
  [ "$4" != "-" ] && diff <(git -C "$H/koord" show "$4:bericht/2310-omen-runner/messplatz/$(basename "$1")" | tr -d '\r') <(tr -d '\r' < "$1")
  return 0
}
pruefe "$H/werkzeug/schlaf.cjs" "$Q/werkzeug/schlaf.cjs" - -
pruefe "$H/urteil.cjs" "$Q/urteil.cjs" "$ALT_URTEIL" d72acc958
pruefe "$H/serie.sh" "$Q/serie.sh" "$ALT_SERIE" 526ce5bcc
[ $fehl = 0 ] || { echo "nichts überschrieben"; exit 3; }
cp "$Q/werkzeug/schlaf.cjs" "$H/werkzeug/schlaf.cjs" && node --check "$H/werkzeug/schlaf.cjs" || exit 4
cp "$Q/urteil.cjs" "$H/urteil.cjs" && node --check "$H/urteil.cjs" || exit 4
cp "$Q/serie.sh" "$H/serie.sh" && bash -n "$H/serie.sh" || exit 4
echo "getauscht: das warme ABAB ist aktiv — serie.sh $(hash "$H/serie.sh") · urteil.cjs $(hash "$H/urteil.cjs") · schlaf.cjs $(hash "$H/werkzeug/schlaf.cjs")"

#!/bin/bash
# Worktree-Aufraeumen (1710-n Schritt 0) nach inventur.tsv. aufraeumen.sh [--trocken]
# sauber + (GEMERGT | REMOTE) -> Rohdaten (ungetrackt + ignoriert, ohne node_modules) nach <Haupt-Klon>/artifacts/profiband/wt-archiv/<name>/
#                                 verschieben, node_modules-Verbindung per rmdir loesen, git worktree remove
# sauber + LOKAL mit Zweig     -> git push origin <zweig>, dann wie oben
# sauber + LOKAL losgeloest    -> Ref refs/archiv/wt/<name> im Haupt-Klon (der Kopf bleibt erreichbar), dann wie oben
# schmutzig                    -> bleibt, Grund (geaenderte Dateien) in bleibt.tsv
# Nie git stash. koordination und n1710-* stehen nicht in der Inventur.
TR=0; [ "$1" = "--trocken" ] && TR=1
K=/c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess
D=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710
INV=$D/inventur.tsv; LOG=$D/aufraeumen.log; BL=$D/bleibt.tsv
ARCH=$K/artifacts/profiband/wt-archiv
[ $TR = 0 ] && : > "$BL"
tue() { if [ $TR = 1 ]; then echo "  TROCKEN: $*"; else "$@"; fi; }
while IFS=$'\t' read -r name pfad kopf zweig klasse geaendert ungetrackt nm; do
  [ "$name" = koordination ] && continue
  case "$name" in n1710-*) continue;; esac
  if [ "$klasse" = FEHLT ]; then echo "$name FEHLT (prune)" | tee -a "$LOG"; continue; fi
  if [ "$geaendert" -gt 0 ]; then
    dat=$(git -C "$pfad" status --porcelain | grep -v '^??' | cut -c4- | head -5 | tr '\n' ' ')
    echo "$name BLEIBT schmutzig: $dat" | tee -a "$LOG"
    [ $TR = 0 ] && printf '%s\t%s\t%s\t%s\n' "$name" "$kopf" "$klasse" "$dat" >> "$BL"
    continue
  fi
  z=${zweig#refs/heads/}
  if [ "$klasse" = LOKAL ]; then
    if [ "$zweig" != "-" ]; then echo "$name LOKAL Zweig $z -> push" | tee -a "$LOG"; tue git -C "$K" push -q origin "$z" 2>&1 | tail -2 | tee -a "$LOG"
    else echo "$name LOKAL losgeloest -> refs/archiv/wt/$name" | tee -a "$LOG"; tue git -C "$K" update-ref "refs/archiv/wt/$name" "$kopf"; fi
  fi
  # Rohdaten: ungetrackt + ignoriert, ohne node_modules
  roh=$( (git -C "$pfad" ls-files --others --exclude-standard --directory; git -C "$pfad" ls-files --others --ignored --exclude-standard --directory) | grep -v '^node_modules/\?$' | sort -u)
  if [ -n "$roh" ]; then
    n=$(printf '%s\n' "$roh" | wc -l)
    echo "$name Rohdaten $n Eintraege -> wt-archiv/$name" | tee -a "$LOG"
    if [ $TR = 0 ]; then
      mkdir -p "$ARCH/$name"
      printf '%s\n' "$roh" | while IFS= read -r e; do e=${e%/}; mkdir -p "$ARCH/$name/$(dirname "$e")"; mv "$pfad/$e" "$ARCH/$name/$e"; done
    fi
  fi
  if [ "$nm" = Junction ] || [ "$nm" = SymbolicLink ]; then
    w=$(cygpath -w "$pfad/node_modules"); tue cmd //c rmdir "$w"
  fi
  echo "$name ENTFERNT ($klasse, Kopf $kopf)" | tee -a "$LOG"
  tue git -C "$K" worktree remove "$pfad" 2>&1 | tee -a "$LOG"
done < "$INV"
[ $TR = 0 ] && git -C "$K" worktree prune && echo "prune ok" | tee -a "$LOG"

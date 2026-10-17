#!/bin/bash
# Inventur aller Worktrees des Mess-Klons (1710-n Schritt 0). Nur lesen. Ausgabe: TSV je Worktree
# name  pfad  kopf  zweig  klasse  getrackt_geaendert  ungetrackt  nm_art
# klasse: GEMERGT (Kopf in origin/integ-probe oder origin/main) · REMOTE (Kopf in einem anderen origin-Zweig)
#         LOKAL (Kopf auf keinem origin-Ref) · FEHLT (Pfad weg)
K=/c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess
OUT=${1:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710/inventur.tsv}
cd "$K" || exit 2
git rev-list --remotes > /tmp/n1710-remote.txt
git rev-list origin/integ-probe origin/main > /tmp/n1710-gemergt.txt
sort -u /tmp/n1710-remote.txt -o /tmp/n1710-remote.txt
sort -u /tmp/n1710-gemergt.txt -o /tmp/n1710-gemergt.txt
: > "$OUT"
git worktree list --porcelain | awk '/^worktree /{p=substr($0,10)} /^HEAD /{h=$2} /^branch /{b=$2} /^detached/{b="-"} /^$/{print p"\t"h"\t"b; p="";h="";b=""} END{if(p!="")print p"\t"h"\t"b}' |
while IFS=$'\t' read -r pfad kopf zweig; do
  name=$(basename "$pfad")
  [ "$pfad" = "C:/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess" ] && continue
  if [ ! -d "$pfad" ]; then printf '%s\t%s\t%s\t%s\tFEHLT\t0\t0\t-\n' "$name" "$pfad" "$kopf" "$zweig" >> "$OUT"; continue; fi
  if grep -qx "$kopf" /tmp/n1710-gemergt.txt; then kl=GEMERGT; elif grep -qx "$kopf" /tmp/n1710-remote.txt; then kl=REMOTE; else kl=LOKAL; fi
  st=$(git -C "$pfad" status --porcelain 2>/dev/null)
  g=$(printf '%s\n' "$st" | grep -v '^??' | grep -c . )
  u=$(printf '%s\n' "$st" | grep -c '^??')
  nm=-
  if [ -e "$pfad/node_modules" ]; then
    a=$(powershell -NoProfile -c "(Get-Item -Force '$pfad/node_modules').LinkType" 2>/dev/null | tr -d '\r')
    [ -n "$a" ] && nm="$a" || nm=echt
  fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$name" "$pfad" "$kopf" "$zweig" "$kl" "$g" "$u" "$nm" >> "$OUT"
done
echo "INVENTUR $(wc -l < "$OUT") Worktrees -> $OUT"

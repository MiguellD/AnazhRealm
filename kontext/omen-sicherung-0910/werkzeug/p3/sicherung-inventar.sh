#!/bin/bash
# 0910-S: Bestand jedes Worktrees des Mess-Klons — Pfad · Branch · Kopf · Änderungen · ungepushte Commits · Kopf auf origin
# (nur per ls-remote; für einen detached Kopf: gleich einer Remote-Spitze oder Vorfahre einer)
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess
git fetch -q origin 2>/dev/null
git ls-remote origin > /tmp/omen-lsremote.txt 2>/dev/null || git ls-remote origin > ../p3/lsremote.txt
LS=/tmp/omen-lsremote.txt; [ -s $LS ] || LS=../p3/lsremote.txt
git worktree list --porcelain | awk '/^worktree /{print substr($0,10)}' | while read -r WT; do
  [ -d "$WT" ] || { echo "FEHLT|$WT"; continue; }
  BR=$(git -C "$WT" branch --show-current 2>/dev/null)
  SHA=$(git -C "$WT" rev-parse HEAD 2>/dev/null)
  AEND=$(git -C "$WT" status --short 2>/dev/null | wc -l)
  if [ -n "$BR" ]; then
    RS=$(awk -F'\t' -v r="refs/heads/$BR" '$2==r{print $1}' $LS)
    if [ -z "$RS" ]; then ORIGIN="nein (kein Branch auf origin)"; UNG="alle"
    elif [ "$RS" = "$SHA" ]; then ORIGIN="ja"; UNG=0
    else
      if git -C "$WT" merge-base --is-ancestor "$SHA" "$RS" 2>/dev/null; then ORIGIN="ja (Vorfahre der Remote-Spitze ${RS:0:8})"; UNG=0
      else UNG=$(git -C "$WT" rev-list --count "$RS..$SHA" 2>/dev/null || echo "?"); ORIGIN="nein (Remote ${RS:0:8}, $UNG ungepusht)"; fi
    fi
  else
    BR="(detached)"
    if grep -q "^$SHA" $LS; then ORIGIN="ja ($(grep "^$SHA" $LS | head -1 | cut -f2))"
    else
      ORIGIN="nein"
      for RS in $(cut -f1 $LS | sort -u); do
        if git -C "$WT" merge-base --is-ancestor "$SHA" "$RS" 2>/dev/null; then ORIGIN="ja (Vorfahre von ${RS:0:8} $(grep "^$RS" $LS | head -1 | cut -f2))"; break; fi
      done
    fi
  fi
  echo "$(basename "$WT")|$BR|${SHA:0:8}|$AEND|$ORIGIN"
done

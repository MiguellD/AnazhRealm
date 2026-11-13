#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# hebend-messen.sh <sha40> [gtx|radeon] [jobs] — misst NUR, was einen Punkt heben kann (Schöpfer 02.11.: „eine Messung der höheren Stufe
# ersetzt sie bereits“; die Ratsche hält Gebuchtes bis zu frischem ROT, ein Neu-Messen gehaltener Kriterien kann nur kosten): je Kriterium
# mit Wert v < 2 die Station #(v+1), sofern am SHA ungemessen; in Scheiben < 30 min (FAHRT_MAX) als Zeilen in die OMEN-Schlange (gtx)
# bzw. nacheinander lokal (radeon, nur ohne Fremdlast). Iststand nach einer Landung: ~70 statt ~120 min, 35 statt 107 Stationen (02.11.).
S="$1"; G="${2:-gtx}"; J="${3:-3}"; P=/tmp/claude/w3/pm/meisterkarte-quelle/punkte; T=$(mktemp -d)
cd /tmp/claude/w3/pm && git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" && git checkout -q -B punkte-maschine origin/punkte-maschine || exit 2
cd "$P" && node punkte.cjs buchen --kopf "$S" --trocken > "$T/tr.txt" 2>&1
node punkte.cjs scheiben --sha "$S" --geraet "$G" --offen --jobs 1 2>/dev/null > "$T/alle.json"
W=$(cygpath -w "$T" 2>/dev/null || echo "$T"); export W
N=$(node -e 'const fs=require("fs"),p=require("path"),W=process.env.W;const w={};for(const l of fs.readFileSync(p.join(W,"tr.txt"),"utf8").split("\n")){const m=l.match(/^\s+([a-z]+\.K\d) (\d) /);if(m)w[m[1]]=+m[2]}
const o=JSON.parse(fs.readFileSync(p.join(W,"alle.json"),"utf8").trim().split("\n").pop()).scheiben.flatMap(s=>s.nur.split(","));
console.log(o.filter(id=>{const[k,n]=id.split("#");return w[k]!=null&&w[k]<2&&+n===w[k]+1}).join(","))')
[ -n "$N" ] || { echo "nichts zu heben am ${S:0:8} ($G)"; exit 0; }
node punkte.cjs scheiben --sha "$S" --geraet "$G" --nur "$N" --jobs "$J" 2>&1 >"$T/sch.json" | head -1
node -e 'const fs=require("fs"),p=require("path");const j=JSON.parse(fs.readFileSync(p.join(process.env.W,"sch.json"),"utf8").trim().split("\n").pop());
for(const s of j.scheiben)console.log("hebend-"+j.sha8+"-s"+s.nr+"-'"$G"' 1 punkte sha='"$S"' geraet='"$G"' nur="+s.nur)' > "$T/zeilen.txt"
if [ "$G" = gtx ]; then while read -r Z; do bash /tmp/claude/w3/zeile.sh "$Z" | tail -1 | cut -c1-80; done < "$T/zeilen.txt"
else while read -r Z; do nur=${Z##*nur=}; node punkte.cjs run --sha "$S" --geraet "$G" --nur "$nur" | tail -2; done < "$T/zeilen.txt"; fi

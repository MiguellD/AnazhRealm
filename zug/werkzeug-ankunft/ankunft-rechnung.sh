#!/bin/bash
# Aufruf: bash <ort>/ankunft-rechnung.sh [runden=3]      — im Spiel-Baum (Wurzel des Klons), am Stand, der gemessen wird
#
# DIE RECHNUNG DER ANKUNFT auf einem Gerät: je Runde EIN frisches Chrome-Profil, sechs Boots am echten Renderer darin —
#   k  kalt                      (Foundry-Platte leer, Pipeline-Cache kalt)
#   g  Platte VOLL, Pipelines KALT (--disable-gpu-shader-disk-cache)
#   h  Platte LEER (gefegt), Pipelines WARM
#   z  beides warm               (die Wiederkehr = der BODEN)
#   p  Wiederkehr mit V8-CPU-Profil aus Chromes Start-Spur (das Profil des Bodens)
#   c  Wiederkehr mit Zensus und Pixel-Abfrage (entstanden gegen im Schirm)
# Am Ende drucken die Leser: die 2 × 2-Rechnung (rechnung-lesen.cjs), das Profil nach Domäne und die 25 größten Funktionen
# (spur-profil.cjs), die Pixel je Programm (zensus-lesen.cjs). Ergebnis: <ort>/lauf-<MMTT-HHMM>/ (JSON, Spuren, erstbild.jpg).
#
# Das GPU-Schloss: GPU_LAUF=<pfad zu zug/dienst/werkzeug/gpu-lauf.sh> hält es je Boot (Deckel 240 s: nie NEBEN dem echt-Job,
# ein Zeit-Lauf neben der CI ist keine Zahl); ohne GPU_LAUF läuft der Treiber ohne Schloss — dann darf nichts anderes die Karte
# oder die Kerne belegen. Die Profile bleiben liegen (rund 0,4 GB je Runde): der Treiber löscht nichts.
set -u
S="$(cd "$(dirname "$0")" && (pwd -W 2> /dev/null || pwd))"
N=${1:-3}
[ -f scripts/lib/welt-boot.cjs ] || { echo "Nicht im Spiel-Baum: scripts/lib/welt-boot.cjs fehlt (aus der Wurzel des Klons rufen)"; exit 2; }
OUT="$S/lauf-$(date +%m%d-%H%M)"; mkdir -p "$OUT"
boot() { # <datei> <platte> <eingriff> [chrome-flags]
  export FREI_PROFIL FREI_ZERLEGE=1 FREI_PLATTE="$2" FREI_EINGRIFF="$S/eingriff/$3.js" FREI_JSON="$OUT/$1.json" FREI_CHROME="${4:-}" CI_KLASSE=gpu LINSE_GPU=karte
  sleep "${RUHE:-10}"
  if [ -n "${GPU_LAUF:-}" ]; then GPU_LAUF_MAX_S=240 bash "$GPU_LAUF" "ankunft-$1" node "$S/frei-sonde.cjs" > "$OUT/$1.log" 2>&1
  else node "$S/frei-sonde.cjs" > "$OUT/$1.log" 2>&1; fi
  echo "$1 EXIT=$? · $(grep -m1 'WELTBILD@' "$OUT/$1.log" | cut -c1-150)"
}
echo "ANKUNFT-RECHNUNG an $(git rev-parse --short=8 HEAD) ($(git status --short | wc -l) offen), $N Runden, $(date +%T) → $OUT"
for r in $(seq 1 "$N"); do
  FREI_PROFIL="$OUT/profil-$r"
  unset FREI_TRACE FREI_TRACE_S FREI_KATEGORIEN FREI_NACH
  boot "k$r" alles rechnung
  boot "g$r" alles rechnung "--disable-gpu-shader-disk-cache"
  boot "h$r" leer rechnung
  boot "z$r" alles rechnung
  export FREI_TRACE="$OUT/p$r.trace.json" FREI_TRACE_S=20 FREI_KATEGORIEN="disabled-by-default-v8.cpu_profiler,v8,blink.user_timing,devtools.timeline,loading"
  boot "p$r" alles rechnung
  unset FREI_TRACE FREI_TRACE_S FREI_KATEGORIEN
  export FREI_NACH=3000
  boot "c$r" alles zensus
  unset FREI_NACH
  echo "Runde $r steht, $(date +%T)"
done
echo; echo "=== DIE 2 × 2-RECHNUNG (Bild minus Renderer: z = Boden · g − z = Übersetzung · h − z = Foundry-Bake · k = alles kalt) ==="
node "$S/rechnung-lesen.cjs" "$OUT"/k?.json "$OUT"/g?.json "$OUT"/h?.json "$OUT"/z?.json | grep FALL
echo; echo "=== DAS PROFIL DES BODENS (Wiederkehr, der Profiler streckt das Fenster — die Anteile gelten) ==="
node "$S/spur-profil.cjs" "$OUT"/p?.json
echo; echo "=== ENTSTANDEN GEGEN IM SCHIRM ==="
node "$S/zensus-lesen.cjs" "$OUT"/c?.json
echo; echo "Ende $(date +%T) · Ergebnis in $OUT · die Profile profil-<r> dort dürfen danach gelöscht werden"

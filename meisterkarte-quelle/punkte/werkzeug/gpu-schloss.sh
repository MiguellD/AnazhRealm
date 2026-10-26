#!/bin/bash
# gpu-schloss.sh — DAS GPU-SCHLOSS MIT PLÄTZEN. Laptop (Radeon) und OMEN (GTX) tragen DIESELBE Datei neben gpu-lauf.sh (Quelle:
# koordination meisterkarte-quelle/punkte/werkzeug/; der Koordinator kopiert beide nach artifacts/profiband/werkzeug/ bzw. p3/).
# Eingebunden von gpu-lauf.sh und den Serien der OMEN (`. p3/gpu-schloss.sh`: schloss_nehmen · schloss_loesen · schloss_erster ·
# schloss_verwaist · ci_wartet · ci_ruhe · cpu_ruhe). Innere Helfer heißen gs_*: serie.sh definiert nach dem Einbinden eigene
# `worker` und `vorfahrt`.
#
# DER ORDNER $GPU_SCHLOSS (atomar mkdir) heißt: die Karte ist belegt. besitzer.txt Zeile 1 der Name, Zeile 2 `pid=<PID>` — so
# lesen ihn beide Runner-Hooks (job-start.ps1 der OMEN, job-start.sh der Radeon), und sie nehmen ihn nur, wenn er fehlt: der
# echt-Job hält immer ALLE Plätze. VORFAHRT: solange ein CI-Job läuft (Runner.Worker) oder wartet (letzte Zeile von hook.log
# „wartet auf Schloss“) und in der Nachtruhe 03:25–04:15 nimmt hier niemand etwas, auch keinen freien Platz — die Plätze leeren
# sich, und der Hook bekommt das Schloss. Die Nachtruhe zählt nie zur Warte-Frist von gpu-lauf.sh (ihre 50 min > 45 min Frist).
# ZWEI ARTEN (26.10., Karte gpu-bahnen: die Prüfung darf nie länger dauern als das Erstellen; ein Radeon-Takt mit 45 Stationen
# lief 151–174 min, jede Station einzeln unter dem EINEN Schloss):
#   ganz   `ganz_versuch <name>` / `schloss_nehmen <name>`: ein Zeit-Lauf (Urteil in ms) nimmt das GANZE Schloss, wie bisher.
#   platz  `platz_versuch <name> <N>`: ein Bild-Lauf nimmt EINEN von N Plätzen. Der erste legt das Schloss an (Datei `plaetze`
#          = N, Ordner platz.1), jeder weitere tritt als platz.<k> bei (k ≤ min(N, plaetze)), solange kein ganzer Lauf wartet
#          ($GPU_SCHLOSS.vorrang/<pid>) — ein Zeit-Lauf hungert nie aus. N = 1 ist das Ein-Platz-Schloss von vorher.
# DER VERTRETER: besitzer.txt nennt immer einen LEBENDEN Platz-Halter (beide Hooks lösen ein Schloss, dessen pid nicht lebt): wer
# geht, übergibt an einen Bleibenden, der Herzschlag (herz_schlag, alle 10 s aus gpu-lauf.sh) prüft ihn und frischt besitzer.txt
# (der Radeon-Hook löst nach 60 min Schweigen). Beitritt, Austritt und Übergabe laufen unter dem kurzen Tor $GPU_SCHLOSS.tor.
# GPU_SCHLOSS, GPU_HOOK_LOG, GPU_NACHT und GPU_WORKER_BILD stehen fest wie in den Hooks; der Selbsttest (punkte.cjs selbsttest)
# setzt sie auf ein eigenes Schloss, damit er nie auf einen echten CI-Job wartet.
if [ -z "$GPU_SCHLOSS" ]; then
    if [ -d /c/Users/micha/AppData/Local/Temp ]; then GPU_SCHLOSS=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss; else GPU_SCHLOSS="${TMPDIR:-/tmp}/claude/gpu-schloss"; fi
fi
GPU_HOOK_LOG=${GPU_HOOK_LOG:-/c/actions-runner/hooks/hook.log}
# keine Nachtruhe mehr (27.10., Schöpfer: „wir sind Maschinen“): 0325–0415 hielt jede Nacht 50 min beide GPUs leer, damit der
# nächtliche echt-Job (cron 02:30 UTC) nie wartet — den schützt schon die Vorfahrt des Runners (gs_worker, ci_wartet) wie jeden
# echt-Job am Tag. GPU_NACHT=HHMM-HHMM setzt sie ausdrücklich (der Selbsttest prüft den Fall).
GPU_NACHT=${GPU_NACHT-}
GPU_WORKER_BILD=${GPU_WORKER_BILD:-Runner.Worker.exe}
GPU_ICH_PID=$(cat /proc/$$/winpid 2>/dev/null || echo $$)
GPU_PLATZ=
mkdir -p "$(dirname "$GPU_SCHLOSS")" 2>/dev/null

# tasklist -FI statt //FI: unter MSYS2_ARG_CONV_EXCL=* bliebe //FI stehen, tasklist wiese es ab und die Vorfahrt wäre blind
gs_tasklist() { command -v tasklist >/dev/null 2>&1; }
pid_lebt() { if gs_tasklist; then tasklist -FI "PID eq $1" -NH 2>/dev/null | grep -qw "$1"; else kill -0 "$1" 2>/dev/null; fi; }
gs_worker() { if gs_tasklist; then tasklist -FI "IMAGENAME eq $GPU_WORKER_BILD" 2>/dev/null | grep -qi "${GPU_WORKER_BILD%.exe}"; else pgrep -f "^${GPU_WORKER_BILD%.exe}" >/dev/null 2>&1; fi; }
ci_wartet() { tail -n 1 "$GPU_HOOK_LOG" 2>/dev/null | grep -q "wartet auf Schloss"; }
gs_nacht() { [ -n "$GPU_NACHT" ] || return 1; local hm=$((10#$(date +%H%M))); [ "$hm" -ge $((10#${GPU_NACHT%-*})) ] && [ "$hm" -lt $((10#${GPU_NACHT#*-})) ]; }
# die Vorfahrt beim Namen, leer: keine
gs_vorfahrt() {
    if gs_nacht; then echo "Nachtruhe $GPU_NACHT"; elif gs_worker; then echo "Vorfahrt: der echt-Job (Runner.Worker) läuft"; elif ci_wartet; then echo "Vorfahrt: ein CI-Job wartet (hook.log)"; fi
}

schloss_erster() { head -n 1 "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null | tr -d '\r'; }
gs_pid_von() { grep -m1 "^pid=" "$1" 2>/dev/null | tr -dc 0-9; }
gs_schreib() { printf '%s\npid=%s\n' "$2" "$GPU_ICH_PID" >"$1"; }
gs_meins() { [ "$(head -n 1 "$1" 2>/dev/null | tr -d '\r')" = "$2" ] && [ "$(gs_pid_von "$1")" = "$GPU_ICH_PID" ]; }

# das Tor: kurz (Beitritt, Austritt, Übergabe); eines älter als 60 s gilt als verwaist (sein Halter starb mitten darin)
gs_tor_auf() {
    local i alt
    for i in $(seq 1 300); do
        mkdir "$GPU_SCHLOSS.tor" 2>/dev/null && return 0
        alt=$(($(date +%s) - $(stat -c %Y "$GPU_SCHLOSS.tor" 2>/dev/null || date +%s)))
        [ "$alt" -gt 60 ] && rmdir "$GPU_SCHLOSS.tor" 2>/dev/null
        sleep 0.2
    done
    return 1
}
gs_tor_zu() { rmdir "$GPU_SCHLOSS.tor" 2>/dev/null; return 0; }

# der Vorrang eines wartenden ganzen Laufs: solange er hält, tritt kein Bild-Lauf bei. Der Eintrag trägt Name und pid wie
# besitzer.txt und fällt nach DERSELBEN Verwaist-Regel (gs_verwaist_grund: älter als der Systemstart, Halter tot, ohne pid nach
# 60 min) — 26.10., Prüfung gpu-bahnen: ein Eintrag aus einem harten Tod, dessen pid nach dem Neustart ein fremder Prozess trug,
# sperrte jeden Bild-Lauf, und gpu-lauf.sh nannte „?“
gs_vorrang() { mkdir -p "$GPU_SCHLOSS.vorrang" 2>/dev/null && gs_schreib "$GPU_SCHLOSS.vorrang/$GPU_ICH_PID" "$1"; }
gs_vorrang_weg() { rm -f "$GPU_SCHLOSS.vorrang/$GPU_ICH_PID"; return 0; }
# der haltende Vorrang beim Namen (leer: keiner); löst verwaiste Einträge
gs_vorrang_wer() {
    local f g wer
    for f in "$GPU_SCHLOSS.vorrang"/*; do
        [ -f "$f" ] && [ "${f##*/}" != "$GPU_ICH_PID" ] || continue
        wer=$(head -n 1 "$f" 2>/dev/null | tr -d '\r')
        g=$(gs_verwaist_grund "$f" "$f")
        [ -z "$g" ] && [ -z "$(gs_pid_von "$f")" ] && ! pid_lebt "${f##*/}" && g="Halter pid=${f##*/} lebt nicht"
        if [ -z "$g" ]; then
            echo "Vorrang: '$wer' pid=${f##*/} wartet auf alle Plätze"
            return 0
        fi
        rm -f "$f"
        echo "$(date +%T) verwaister Vorrang '$wer' geloest - $g" >&2
    done
    return 1
}
gs_vorrang_wartet() { [ -n "$(gs_vorrang_wer)" ]; }

# älter als der Systemstart (24.10.): die pid kann nach dem Neustart neu vergeben sein und „lebte“ sonst
schloss_vor_neustart() {
    local f=${1:-$GPU_SCHLOSS/besitzer.txt} boot
    boot=$(($(date +%s) - $(cut -d. -f1 /proc/uptime)))
    [ -f "$f" ] && [ "$(stat -c %Y "$f")" -lt "$boot" ]
}
# warum ein Halter (besitzer-Datei, Ordner) nicht mehr hält; leer: er hält
gs_verwaist_grund() {
    local f="$1" d="$2" wer p seit
    wer=$(head -n 1 "$f" 2>/dev/null | tr -d '\r')
    p=$(gs_pid_von "$f")
    seit=$(stat -c %Y "$f" 2>/dev/null || stat -c %Y "$d" 2>/dev/null || date +%s)
    if schloss_vor_neustart "$f"; then
        echo "älter als der Systemstart"
    elif [ "${wer#ci-runner }" != "$wer" ] && ! gs_worker; then
        echo "ci-runner ohne lebenden Runner.Worker"
    elif [ -n "$p" ] && ! pid_lebt "$p"; then
        echo "Halter pid=$p lebt nicht"
    elif [ -z "$p" ] && [ $(($(date +%s) - seit)) -gt 3600 ]; then
        echo "ohne pid, schweigt seit $((($(date +%s) - seit) / 60)) min"
    fi
}
# (unter dem Tor) besitzer.txt eines Platz-Schlosses nennt einen lebenden Platz-Halter; ohne ihn fällt das Schloss
gs_vertreter() {
    local d=$GPU_SCHLOSS k p q
    [ -f "$d/plaetze" ] || return 0
    p=$(gs_pid_von "$d/besitzer.txt")
    for k in "$d"/platz.*; do
        q=$(gs_pid_von "$k/besitzer.txt")
        [ -n "$q" ] && [ "$q" = "$p" ] && pid_lebt "$q" && return 0
    done
    for k in "$d"/platz.*; do
        q=$(gs_pid_von "$k/besitzer.txt")
        [ -n "$q" ] && pid_lebt "$q" && { cp "$k/besitzer.txt" "$d/besitzer.txt"; return 0; }
    done
    rm -rf "$d"
}
# löst, was verwaist ist: je Platz beim Namen (die Bleibenden behalten ihr Schloss), ein ganzes Schloss nach erneutem Lesen
schloss_verwaist() {
    local d=$GPU_SCHLOSS k g wer
    [ -d "$d" ] || return 0
    if [ -f "$d/plaetze" ]; then
        gs_tor_auf || return 0
        for k in "$d"/platz.*; do
            [ -d "$k" ] || continue
            g=$(gs_verwaist_grund "$k/besitzer.txt" "$k")
            [ -z "$g" ] && continue
            wer=$(head -n 1 "$k/besitzer.txt" 2>/dev/null | tr -d '\r')
            rm -rf "$k"
            echo "$(date +%T) verwaister Platz ${k##*/} '$wer' geloest - $g" >&2
        done
        gs_vertreter
        gs_tor_zu
        return 0
    fi
    wer=$(schloss_erster)
    g=$(gs_verwaist_grund "$d/besitzer.txt" "$d")
    [ -n "$g" ] && [ "$(schloss_erster)" = "$wer" ] && [ ! -f "$d/plaetze" ] && {
        rm -rf "$d"
        echo "$(date +%T) verwaistes Schloss '$wer' geloest - $g" >&2
    }
    return 0
}

# ein Versuch, das GANZE Schloss zu nehmen (Zeit-Lauf): 0 genommen
ganz_versuch() {
    [ -z "$(gs_vorfahrt)" ] && mkdir "$GPU_SCHLOSS" 2>/dev/null || return 1
    gs_schreib "$GPU_SCHLOSS/besitzer.txt" "$1"
}
ganz_loesen() { gs_meins "$GPU_SCHLOSS/besitzer.txt" "$1" && [ ! -f "$GPU_SCHLOSS/plaetze" ] && rm -rf "$GPU_SCHLOSS"; return 0; }
# ein Versuch, EINEN von N Plätzen zu nehmen (Bild-Lauf): 0 genommen (GPU_PLATZ = k)
platz_versuch() {
    local n=$1 N=${2:-1} M k
    [ -z "$(gs_vorfahrt)" ] || return 1
    gs_vorrang_wartet && return 1
    gs_tor_auf || return 1
    if mkdir "$GPU_SCHLOSS" 2>/dev/null; then
        echo "$N" >"$GPU_SCHLOSS/plaetze"
        mkdir "$GPU_SCHLOSS/platz.1"
        gs_schreib "$GPU_SCHLOSS/platz.1/besitzer.txt" "$n"
        cp "$GPU_SCHLOSS/platz.1/besitzer.txt" "$GPU_SCHLOSS/besitzer.txt"
        GPU_PLATZ=1
        gs_tor_zu
        return 0
    fi
    if [ -f "$GPU_SCHLOSS/plaetze" ]; then
        M=$(tr -dc 0-9 <"$GPU_SCHLOSS/plaetze")
        [ -n "$M" ] && [ "$M" -lt "$N" ] && N=$M
        for k in $(seq 1 "$N"); do
            mkdir "$GPU_SCHLOSS/platz.$k" 2>/dev/null || continue
            gs_schreib "$GPU_SCHLOSS/platz.$k/besitzer.txt" "$n"
            touch "$GPU_SCHLOSS/besitzer.txt"
            GPU_PLATZ=$k
            gs_tor_zu
            return 0
        done
    fi
    gs_tor_zu
    return 1
}
platz_loesen() {
    local k=$GPU_PLATZ
    [ -n "$k" ] || return 0
    gs_tor_auf
    gs_meins "$GPU_SCHLOSS/platz.$k/besitzer.txt" "$1" && rm -rf "$GPU_SCHLOSS/platz.$k"
    gs_vertreter
    gs_tor_zu
    GPU_PLATZ=
    return 0
}
# der Halter lebt: besitzer.txt frisch, am Platz-Schloss ein lebender Vertreter
herz_schlag() {
    local p
    if [ -n "$GPU_PLATZ" ]; then
        gs_meins "$GPU_SCHLOSS/platz.$GPU_PLATZ/besitzer.txt" "$1" || return 0
        touch "$GPU_SCHLOSS/platz.$GPU_PLATZ/besitzer.txt"
        p=$(gs_pid_von "$GPU_SCHLOSS/besitzer.txt")
        if [ -z "$p" ] || ! pid_lebt "$p"; then gs_tor_auf && { gs_vertreter; gs_tor_zu; }; fi
        touch "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null
    else
        gs_meins "$GPU_SCHLOSS/besitzer.txt" "$1" && touch "$GPU_SCHLOSS/besitzer.txt"
    fi
    return 0
}

# die Serien der OMEN: das GANZE Schloss, Warten ohne Frist (15 s Takt), mit Vorrang vor neuen Bild-Läufen
schloss_nehmen() {
    local n="$1" w=0
    gs_vorrang "$n"
    until ganz_versuch "$n"; do
        schloss_verwaist
        [ $w = 0 ] && echo "$(date +%T) GPU-Schloss haelt '$(schloss_erster)' - warte" >&2
        w=1
        sleep 15
    done
    gs_vorrang_weg
    ci_ruhe
}
# löst nur, wenn Zeile 1 <name> trägt (und ein erneutes Lesen dasselbe zeigt) — nie ein Platz-Schloss
schloss_loesen() { local n="$1"; [ "$(schloss_erster)" = "$n" ] && [ ! -f "$GPU_SCHLOSS/plaetze" ] && [ "$(schloss_erster)" = "$n" ] && rm -rf "$GPU_SCHLOSS"; return 0; }
# CI-Ruhe (16.10.): nach dem Ende eines CI-Jobs räumt der Runner noch auf (Chrome, Upload) — ein Boot, der sofort startet, misst
# dessen CPU-Last mit (bündel4-direkt A2/A3: p95 7,5/7,1 statt 5,3–5,8). Mit dem ganzen Schloss in der Hand 180 s nach dem letzten „ende“.
ci_ruhe() {
    local z t e
    z=$(grep " ende " "$GPU_HOOK_LOG" 2>/dev/null | tail -n 1 | cut -c1-19)
    [ -z "$z" ] && return 0
    t=$(date -d "$z" +%s 2>/dev/null) || return 0
    e=$((180 - ($(date +%s) - t)))
    [ $e -gt 0 ] && { echo "$(date +%T) CI-Ruhe: letzter CI-Job vor $((180 - e)) s zu Ende - warte $e s" >&2; sleep $e; }
    return 0
}
# CPU-RUHE FÜR DIE CI (18.10., Ego-Rot 39102311056/1 fiel mit Rebase + npm ci eines OMEN-Arbeiters zusammen): schwere CPU-Arbeit
# OHNE GPU-Schloss (npm ci, check, playtest, rebase, Auswertungen) wartet, solange ein CI-Job das Schloss hält oder auf es wartet.
cpu_ruhe() {
    local w=0
    while { [ -d "$GPU_SCHLOSS" ] && grep -q "^ci-runner" "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null; } || ci_wartet; do
        [ $w = 0 ] && echo "$(date +%T) CPU-Ruhe: CI-Job '$(cat "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null)' laeuft - warte" >&2
        w=1
        sleep 15
    done
    return 0
}

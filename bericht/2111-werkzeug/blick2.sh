#!/bin/bash
# bash blick.sh <name> <sha40> — der Blick in die Welt der Hand-Sitzung an der Radeon WÄHREND Probe und Preis-Lauf von
# karte2.same.kopplung.aufwaerts#1: startet den Hand-Lauf (hand-buch-n.sh) im Hintergrund, liest den Port der Welt aus seiner
# Ausgabe und fragt alle 4 s über `werkbank eval` (nur lesend) Lade-Takt, Ankunfts-Ferne, Offenes, Leine, Uhr, Heap, Pose und die
# größten Sammlungen der Welt. Zeilen nach aufw/<name>.blick.txt. Frage: warum zeichnet der Preis-Lauf kein Bild, was hält 2,7 GB?
export MSYS_NO_PATHCONV=1; export NODE_PATH="C:/Users/micha/AnazhRealm-profiband/node_modules"
S="C:/Users/micha/AppData/Local/Temp/claude/3c7f7ef9549389d2/9198e0cd-302f-42e2-be9b-9e3a035ce699/scratchpad"
N=$1; H=$2; B="$S/aufw/$N.blick.txt"; O="$S/vr/$N.out"; A=C:/Users/micha/AnazhRealm-auge-4a188
: > "$B"; rm -f "$O"
bash "$S/hand-buch-n.sh" "$N" "$H" "karte2.same.kopplung.aufwaerts#1" & HP=$!
P=""; for i in $(seq 1 900); do P=$(grep -a -o "Welt :[0-9]*" "$O" 2>/dev/null | head -1 | cut -d: -f2); [ -n "$P" ] && break; kill -0 $HP 2>/dev/null || break; sleep 1; done
echo "PORT ${P:-keiner} nach ${i} s · $(date +%H:%M:%S)" >> "$B"
[ -n "$P" ] || { wait $HP; exit 3; }
CODE='const st = r.state, L = r._gpuLeine || {}, m = performance.memory || {};
const f = (n) => { try { return typeof r[n] === "function" ? r[n]() : r[n]; } catch (e) { return "wirft " + String(e.message).slice(0, 60); } };
const bruch = [...(r._bruchBuch || [])].map(([k, v]) => [v && v.n, String(k).slice(0, 420)]).sort((a, b) => b[0] - a[0]).slice(0, 4);
const gr = (v) => (v instanceof Map || v instanceof Set ? v.size : Array.isArray(v) ? v.length : 0);
const tief = [];
for (const q of [[r, "r."], [st, "st."]]) for (const k of Object.keys(q[0])) { let v; try { v = q[0][k]; } catch (e) { continue; } if (!v || typeof v !== "object") continue; const n = gr(v); if (n >= 5000) tief.push([q[1] + k, n]); if (n || ArrayBuffer.isView(v)) continue; let ks; try { ks = Object.keys(v); } catch (e) { continue; } if (ks.length > 600) { tief.push([q[1] + k + "{}", ks.length]); continue; } for (const k2 of ks) { let w; try { w = v[k2]; } catch (e) { continue; } const n2 = w && typeof w === "object" ? gr(w) : 0; if (n2 >= 5000) tief.push([q[1] + k + "." + k2, n2]); } }
tief.sort((a, b) => b[1] - a[1]);
const pf = r._planetFadenStand;
return "BLICK " + JSON.stringify({ t: +(performance.now() / 1000).toFixed(1), fehler: st._loopErrorCount || 0, takt: st.weltTakt, bruchN: r._bruchBuch ? r._bruchBuch.size : 0, bruch, lade: f("_ladeTakt"), ruht: f("_loopRuht"), tausch: !!r._weltTausch, portal: !!r._portalOverlay, ger: L.gerendert, aus: L.ausgesetzt, versuch: L.versuch, flug: L.imFlug, offen: f("_weltOffen"), gehalten: [...(window.__gehalten || [])], imSchuss: typeof window.__imSchuss, planetOffen: pf ? pf.pending.size : null, bildZeit: r._bildZeit, spielZeit: Math.round(st.spielZeit), wetter: st.weather, halt: st.weatherEffectTime, heapMB: Math.round((m.usedJSHeapSize || 0) / 1048576), tief: tief.slice(0, 12) });'
cd "$A" || exit 4
while kill -0 $HP 2>/dev/null; do
    z=$(timeout 12 node scripts/werkbank.cjs eval "$CODE" --port "$P" 2>&1 | grep -a -o "BLICK .*" | head -1 | cut -c1-4200)
    echo "$(date +%H:%M:%S) ${z:-keine Antwort} · AUS: $(grep -a -c "" "$O" 2>/dev/null) Zeilen, zuletzt: $(tail -n 1 "$O" 2>/dev/null | cut -c1-110)" >> "$B"
    sleep 4
done
wait $HP; echo "ENDE Exit $? · $(date +%H:%M:%S)" >> "$B"

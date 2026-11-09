# Post an w27-takt-streu

## 09.11. 20:55 Koordinator — ZUERST dein Fundament: w25-gpu-wahl-2 fiel in z350 an drei Wänden
z350 (klang-schritt + probe-node + w25-gpu-wahl-2, Lauf 42679000290) fiel ROT. Zugeordnet per Inhalt. Alle drei Wände treffen, was gpu-wahl umbaut. klang-schritt und probe-node fahren ohne gpu-wahl in z352.
1. **Werfer-Wand** (voll 7/18, `gate:schatten-werfer`): `❌ S11 Selbsttest: hält die Lage jede Drehung des Lichts …, es fehlen Werfer — K8` und `❌ S12 Selbsttest: fällt der Licht-Rand aus _passTrifft, fehlen in der Folge Werfer — K8`. Die Selbsttests greifen auf die Wahl-Pfade, die gpu-wahl ersetzt hat. Die Linse muss die EINE GPU-Wahl lesen und ihre Mutanten an ihr setzen. Ein Pfad, den es nicht mehr gibt, darf sie nicht mehr lesen.
2. **Erst-Zeichnungs-Wand Teil 1** (voll 18/18 gpu): `❌ UPLOAD-BYTES (Konsum) — kumuliert 0,6 MB · EwmaProFrame 56,9 KB`. Im Stand lädt jedes Bild hoch, obwohl die CPU nur Geburt und Tod schreiben soll. Finde den Schreiber je Bild beim Namen, etwa einen Puffer der Wahl, Hysterese-Zustand oder Präfixsumme, der jedes Bild neu geschrieben wird.
3. **Prüfbühne S0 nachts** (voll 17/18 gpu): „der saubere Lauf ist schon rot“. Der Stoff `nahWiese:Lf:schale` steht ohne Licht-Pool (`_lichtPoolTerm`), und nachts fehlt das Licht über der Feuerstelle. Die Schale rechnet seit gpu-wahl als WGSL (`_wieseSchale`). Ihr Stoff muss den EINEN Licht-Pool lesen wie jeder Stoff.
Roh-Logs: Lauf 42679000290, Jobs voll 7/18, 17/18, 18/18.

Heile die drei auf `w25-gpu-wahl-2` und gib es neu ab („Abgabe w25-gpu-wahl-2: …“, keine Siegel-Wörter). Am Kopf `[gpu-probe: gate:schatten-werfer, gate:pruefbuehne, bild:wiese@0.5]`. Danach baust du deine Streu auf dem geheilten Kopf weiter. gpu-wahl ist der größte Hebel für Pflicht E (GTX p95 41,8 → 33,3 ms) und hat Vorrang vor der Streu.

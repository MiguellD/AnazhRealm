# GPU-PROBE 8ea0be0f — GRÜN

Zweig `w27-swift-raus` · Kopf 8ea0be0fbed0de7437ebb964237f4da4a6b270a9 · Läufer gtx1050-desktop · 10.11. 15:53 · Wanduhr ab Push 1390 s · Lauf https://github.com/MiguellD/AnazhRealm/actions/runs/42834704427

Ruf: `gate:studio-begehen gate:kamera-leib gate:portal-konformanz`

## Läufer gtx1050-desktop — GRÜN

GPU NVIDIA GeForce GTX 1050 · npm ci 56 s (package-lock ac6c0885)
Schloss /c/Users/User/AppData/Local/Temp/claude/gpu-schloss hält „ci-runner 42834704427/1 probe“
- Hook 2026-11-10 15:32:28 start ci-runner 42834704427/1 probe: wartet auf Schloss von 'hand w27-belegung gate:werkstatt-weg (Claude)'
- Hook 2026-11-10 15:35:59 start ci-runner 42834704427/1 probe: Schloss genommen (refs/heads/w27-swift-raus 8ea0be0fbed0de7437ebb964237f4da4a6b270a9 ws=C:\actions-runner\_work\AnazhRealm\AnazhRealm)

### gate:studio-begehen — GRÜN · 353 s · Läufer gtx1050-desktop

Adapter: [linse-gpu] nvidia/pascal

```text
  ✅ Selbsttest „kopf" macht B3 Kopf rot — B3 Kopf: 31 von 105 Treppen-Läufen enden im Solid
  ✅ Selbsttest „kappe" macht B3 Steigen rot — B3 Steigen: 17 von 21 Treppen erreichen ihre Höhe (EG→OG 9/9 · OG→OG 8/8 · Speicher 0/4)
  ✅ Selbsttest „spur" macht B3 Steigen rot — B3 Steigen: 17 von 21 Treppen erreichen ihre Höhe (EG→OG 9/9 · OG→OG 4/8 · Speicher 4/4)
  ✅ Selbsttest „austritt" macht B3 Kopfraum rot — B3 Kopfraum: 6 Austritte unter 1.7 m (min 1.21 m — der Kopf steht im Dach)
[stall-akte] Stderr [12188:3984:1110/154019.978:ERROR:services\on_device_model\public\cpp\service_client.cc:37] Unexpected on_device_model service disconnect; reason: 1, description: Error loading backend.
  ✅ Selbsttest „platte" macht B4 Keller-Decke rot — B4 Keller-Decke = Boden-Platte in 2 von 2
[stall-akte] Stderr [12188:3984:1110/154019.978:ERROR:services\on_device_model\public\cpp\service_client.cc:37] Unexpected on_device_model service disconnect; reason: 1, description: Error loading backend.
  ✅ Selbsttest „flach" macht B5 Weltgrund rot — B5 Weltgrund: die Häuser stehen eben (Spanne 0 m)
[stall-akte] Stderr [12188:3984:1110/154019.978:ERROR:services\on_device_model\public\cpp\service_client.cc:37] Unexpected on_device_model service disconnect; reason: 1, description: Error loading backend.
✅ gate:studio-begehen grün
```

### gate:kamera-leib — GRÜN · 308 s · Läufer gtx1050-desktop

Adapter: [linse-gpu] nvidia/pascal

```text
  ✅ K2 die Linse nie in Fels, Boden oder Box — 0 von 50 Posen, Proben und Sprünge ≤ Vor-Stand
  ✅ K4 der Gang in Third: die Kugel der Linse nie in Fels oder Bau, 0 Nah-Pixel von Fels, Gelände, Rinde und Bau, Ruck p95 ≤ 0,02 m, die Linse nennt den Arm ohne Flügel-Leib
✅ GRÜN — die Kamera steckt nie in Laub, Strauch, Fels oder Boden.
```

### gate:portal-konformanz — GRÜN · 292 s · Läufer gtx1050-desktop

Adapter: [linse-gpu] nvidia/pascal

```text
✅ SELBST-TEST K2 rot: skeleton spricht aus ihrem ersten Bild
✅ SELBST-TEST 404-Täter getroffen: die Welt fragte ihr Manifest und bekam keins — worlds/skeleton/manifest.json · worlds/terrain/manifest.json
✅ SELBST-TEST K1 rot: skeleton verliert ihr manifest.json (404), die Soll-Welt beim Namen — das Soll-Manifest fehlt: worlds/skeleton/manifest.json liefert 404, die Heimat steht auf „übersetzt"
✅ SELBST-TEST K1 rot: terrain verliert ihr manifest.json (404), die Soll-Welt beim Namen — das Soll-Manifest fehlt: worlds/terrain/manifest.json liefert 404, die Heimat steht auf „übersetzt"
✅ SELBST-TEST K1 rot: fluid meldet ihr Manifest ohne „flut“ (die Heimat lernt das Wort nicht) — das Manifest der Welt kommt nicht an: Stufe „nativ", Label „Strom-Welt", es fehlen flut
✅ SELBST-TEST K6 rot: der Neubau der garage zerstört das Sprite-Quad — die GPU verwirft den Submit — GPU-Prüfung: GPU: [Buffer (unlabeled)] used in submit while destroyed. | GPU: [Buffer (unlabeled)] used in submit while destroyed.
✅ SELBST-TEST K1 rot: garage trägt ein manifest.json ohne Soll-Zeile — worlds/garage/manifest.json steht ohne Soll-Zeile (WELTEN trägt kein manifest für garage)
✅ SELBST-TEST Soll-Wand rot: ein Manifest im Baum, dessen Welt WELTEN nicht kennt (fluid ohne Zeile)
✅ SELBST-TEST K8 rot: die Hülle lässt Gehaltenes, Reittier und Werk fallen — jede Ring-Welt nur an diesen Teilen drüben — skeleton,fluid,terrain,garage,klang
✅ GRÜN — gate:portal-konformanz: 13 Welten K1–K8 grün · Ratschen gehalten
```

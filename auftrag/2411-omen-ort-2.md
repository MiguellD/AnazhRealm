# Auftrag OMEN (GTX 1060) — ort-ausstattung 2, 24.11. 11:35, Koordinator

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

**BEFUND:** `ort-ausstattung` dd38954b86496e0bcb4068cff4e1ab6d70fa2ff0 (Cloud-Macher, Vorprüfung vom 24.11. 08:56) ist GRÜN in Code-Check und
GPU-Probe — vier Sprossen (schrift#1 0 → 68/69, bildkunst#1 0 → 17, grenze#1 0 → 3, megastadt#1 0 → 1), sichtbar im Bild. Mein Stempel hielt:
KONFLIKT gegen main 5ef0404b in drei Dateien — `docs/README.md`, `spec/asset-contract/v1/golden/manifest.json`,
`spec/asset-contract/v1/golden/recipes.json`. Der Zweig steht auf main 8544438f (23.11. 22:47). Die Cloud-Sitzung pushte seit 08:56 nichts.

**AUFTRAG (VOR scherbe-liegt — dieselbe Hand wie bei auge-der-art 3):**
1. `git fetch origin main ort-ausstattung`, `git merge origin/main` in `ort-ausstattung` (Merge-Commit, kein Rebase, kein Force-Push).
   `docs/README.md`: die Fassung von main, die Zeile des Zweigs wieder eingesetzt. GOLDEN: beide Seiten ganz, neu prägen mit Byte-Beweis
   (MINT_NUR_DATEN, wie c27b569b bei auge-der-art), je Pfad im Bericht „unsere Seite / main / 0 doppelt“.
2. Pflicht vor dem Push, alle GRÜN, nur CPU: `npm run check:statik` · `npm run format:check` · `npm run lint` ·
   `node scripts/stamm-umzug.cjs --nach-karte` · gate:betriebsgesetz · probe-tag · Merge-Probe (main ist Elter des Kopfs).
3. Proben-Marken wie am Kopf dd38954b (unverändert übernehmen); kein Tor über dem Deckel.
4. Betreff: „Vorprüfung ort-ausstattung 2 (auf main <kopf8>): der Ort weist sich aus — … [gpu-probe: …] [ci voll]“. EIN Push.
5. EIN Bericht an „Radeon Koordinator Effizienz“: neuer Kopf (40 Zeichen), exit der Merge-Probe. Der Stempel-Satz liegt bei mir.

Kein Sonderweg, wenn die GOLDEN sich nicht byte-gleich prägen lassen: dann stopp und der Grund mit Datei und Pfad in einer Zeile.
Danach unverändert: scherbe-liegt → ci-post-erbt → der EINE pm-Commit.

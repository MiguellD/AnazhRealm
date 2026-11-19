# Alte Tests — Zensus mit Urteil (main 986eff04, Zweig altlast-in-die-karte)

Das Urteil je Zeile: RICHTER EINER SPROSSE (bleibt, Station oder Leiter beim Namen) · OHNE SPROSSE UND OHNE LESER (fällt).
In Commit 2 gelöscht: nur (b) `scripts/smoke-multiuser.cjs` (Aufrufer 0). Die Klasse (a) löscht niemand ohne Koordinator-Entscheid; Vorschlag je Zeile.
Gemessene Quelle der Sprossen: `vision/kapitel/*.json` und `vision/richter-tafel.json` im Zweig `punkte-maschine` (1 716 Zeilen; alte Stationen dort: 19).

## (a) Läuft oder ist gelistet, urteilt aber nicht (dauerhaft rot, übersprungen, Wackler) — 25 Zeilen

| # | Was | Wo | Warum es nicht urteilt | Sprosse | Vorschlag |
|---|-----|----|------------------------|---------|-----------|
| a1 | Fahr-Linse des Lebens (`gate:fahr-leben`) | `WACKEL_RE` in zug.cjs, check.yml:780 | ROT landet ohne Neulauf (`--wackler-frei`); VK nicht deterministisch (FUND-REGISTER 06.11.: ROT/GRÜN/ROT) | `pflicht.C#1` → `mensch.netz.verkehr` S 2 (Richter-Tafel: „fehlt“) | bleibt als Richter; aus `WACKEL_RE` nehmen, sobald VK deterministisch zählt; die Station trägt im `quelle`-Feld noch „PFLICHT-OFFEN C = …“ (koordination g5.js) |
| a2 | Kamera-Leib auf der Karte (`gate:kamera-leib`) | `WACKEL_RE`, check.yml:1349 | Wackler, ROT landet | `erleben.bild.kamera` (Station `karte2.erleben.bild.kamera` ruft sie nicht); alt `leib.K4` | bekommt Besitzer: `erleben.bild.kamera` S 1, sonst fällt |
| a3 | Fenster-Wand (`gate:fenster-wechsel`) | `WACKEL_RE`, check.yml:1417 | Wackler, ROT landet | keine Station; nächste Leiter `same.preis.ausdauer` | bekommt Besitzer `same.preis.ausdauer` S 1 oder fällt |
| a4 | Erst-Zeichnungs-Wand (diag-hitch-telemetrie Teil 1 + 2) | `WACKEL_RE`, check.yml:1358/1368 | Wackler, ROT landet | keine Station; nächste `same.preis.takt` S 3 („0 Frames > 100 ms“) | bekommt Besitzer `same.preis.takt` S 3 |
| a5 | innerHTML-Schreibzugriffe | check.yml:166 `continue-on-error` | Hinweis, kein Fail | keine | fällt |
| a6 | TODO/FIXME-Übersicht | check.yml:172 `continue-on-error` | Hinweis, kein Fail | keine | fällt |
| a7 | `gate:verkehr-takt` | AUSNAHMEN ZEIT (diag-ci-deckung.cjs:166) | hält keinen Merge | Preis von `mensch.netz.verkehr` S 2 | bekommt Besitzer (Station pflicht.C#1) |
| a8 | `gate:pop` | AUSNAHMEN MESS | Messplatz, kein Urteil | `leben.pflanzen.dichte` S 3 (Pop-Zähler = 0); alt lod.K2#1 | bleibt (Messplatz einer Sprosse) |
| a9 | `gate:laub-kante` | AUSNAHMEN MESS | Messplatz, kein Urteil | `leben.pflanzen.dichte` S 1 (Laub-Kante im Band); alt lod.K1#1 | bleibt |
| a10 | `gate:schirm-stufen` | AUSNAHMEN FRIST | trägt den Deckel nicht | `same.entfaltung.schirm` (keine Station ruft sie) | bekommt Besitzer `same.entfaltung.schirm` S 1 oder fällt |
| a11 | `gate:tag-achse:bahn` | AUSNAHMEN ROT | ROT an der Basis (GTX 4e2df19b) | alt licht.K1; Karte 2 `erleben.bild.himmel` | bekommt Besitzer `erleben.bild.himmel` S 1 oder fällt |
| a12 | `gate:arch-feld` | AUSNAHMEN FRIST; kein Workflow, keine Kette ruft sie | läuft nirgends (Census b2: 0 Fahrer) | keine | fällt (der Analog-Feld-Slot-Pfad ist kein Richter einer Sprosse) |
| a13 | `gate:studio-huelle` (H7, H8) | AUSNAHMEN ROT | ROT auf jeder Karte (Neubau 1,2–6,9 s > 1 s) | keine Sprosse misst Studio-Neubau-ms | H7/H8 fallen; der headless Teil bleibt in check:statik |
| a14 | `gate:kamera-leib:echt` | tor-klassen.json probe AUSSEHEN | nur als GPU-Probe auf Zuruf | `erleben.bild.kamera` | wie a2 |
| a15 | `gate:licht-weg:echt` | tor-klassen.json probe AUSSEHEN | nur auf Zuruf | `erleben.bild.flaeche` | bekommt Besitzer oder fällt |
| a16 | `gate:naesse:echt` | tor-klassen.json probe AUSSEHEN | nur auf Zuruf | `erleben.bild.flaeche` / `planet.wetter.wolken` | bekommt Besitzer oder fällt |
| a17 | `gate:nah-fern` | tor-klassen.json probe AUSSEHEN; kein Fahrer im Code | nur auf Zuruf (`[gpu-probe: gate:nah-fern]`) | `erleben.bild.ferne` | bekommt Besitzer `erleben.bild.ferne` S 1 |
| a18 | diag-ankunft `mass(ZEIT)` ×1 | tor-klassen.json mass | meldet am Lande-Tor, sperrt nicht | `same.preis.ankunft` | bleibt als Preis-Messung |
| a19 | diag-erstarren `mass(ZEIT)` ×2 | tor-klassen.json mass | meldet nur | `same.preis.takt` | bleibt |
| a20 | diag-fahr-leben `mass` ×1 | tor-klassen.json mass | meldet nur | `mensch.netz.verkehr` (Preis) | bleibt |
| a21 | diag-klang-zensus `mass(ZEIT)` ×1 | tor-klassen.json mass | meldet nur | Preis der Klang-Leitern | bleibt |
| a22 | diag-praegung-welt `mass(ZEIT)` ×2 | tor-klassen.json mass | meldet nur | keine benannte | fällt (die Zeit-Maße), Probe bleibt |
| a23 | diag-stand-takt `mass(ZEIT)` ×2 | tor-klassen.json mass | meldet nur | `same.preis.takt` | bleibt |
| a24 | diag-v1-pfad `mass(ZEIT)` ×1 | tor-klassen.json mass | meldet nur | `same.preis.takt` S 3 | bleibt |
| a25 | diag-worker-dichte `mass(ZEIT)` ×1 | tor-klassen.json mass | meldet nur | `same.preis.takt` | bleibt |

## (b) Linsen ohne Leser (kein Aufruf aus npm run check, CI, Richter-Tafel, Stationen) — 9 Zeilen

| # | Datei | Fahrer (Code, ohne Kommentare) | Urteil |
|---|-------|--------------------------------|--------|
| b1 | `scripts/smoke-multiuser.cjs` (365 Z.) | 0 (nur sein Alias `smoke:multiuser`) | GELÖSCHT in Commit 2 — keine Sprosse (Richter von `erleben.spieler.gemeinsam` S 1 ist zwei Geräte im Bild, nicht der Relay) |
| b2 | `scripts/smoke-webrtc.cjs` | 0 Läufe; diag-reconnect liest nur seinen Text (Prüfung D „Tür“) | Vorschlag: fällt mit b3, diag-reconnect D streicht die zwei Namen |
| b3 | `scripts/smoke-copresence.cjs` | wie b2 | wie b2 |
| b4 | `scripts/diag-arch-feld.cjs` | 0 (= a12) | fällt (siehe a12) |
| b5 | `scripts/diag-planet.cjs` | 0 Aufrufe; k2-planet.js spiegelt seine Definitionen | bleibt: Richter-Werkzeug der Planet-Leitern (Entscheid bau1); Vorschlag: die Station ruft ihn statt zu spiegeln |
| b6 | `scripts/cut-method.cjs` | 0 | Werkzeug (Methoden-Schnitt), kein Test — bleibt |
| b7 | `scripts/mint-asset-packs.cjs` | 0 (diag-altlasten nennt den Pfad) | Werkzeug — bleibt |
| b8 | `scripts/stamm-rehome.cjs --selftest` | nur Alias `stamm:selbsttest`, den nichts ruft | Werkzeug; Vorschlag: der Selbsttest in check:statik oder Alias fällt |
| b9 | `scripts/playtest/*.cjs` (18) | Census-Fehlalarm: playtest.cjs lädt sie per readdirSync | bleiben |

## (c) Zähler der alten Karte (330, „219/330“) — 0 im Repo, 3 außerhalb

| # | Wo | Urteil |
|---|----|--------|
| c1 | `scripts/`, `spec/`, `.github/`, `.claude/`, package.json | 0 Treffer — nichts zu löschen |
| c2 | messplatz-blick.cjs (koordination `zug/dienst/`) — „alt 219/330“ ×2, ERTRAG gebucht …/330, PFLICHT A–F | Kopie ohne die Ausgaben: `…\scratchpad\altlast\messplatz-blick.cjs` |
| c3 | `.github/workflows/gpu-probe.yml:276` liest `meisterkarte-quelle/punkte/stand.json` (alte Buchung) | Vorschlag: fällt, wenn die alte Buchung fällt; bis dahin Leser der alten Karte |
| c4 | koordination `meisterkarte-quelle/punkte/pflicht.json` + `pflichtBand` in punkte.cjs | MUSS vor der Landung fallen: `pflichtBand` liest die gelöschte Datei am Kopf per `git show` und WIRFT — ohne pflicht.json überspringt `liesPflicht` das Band |

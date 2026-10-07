# Auftrag 0710-1 an den OMEN — Messplatz UND Werkplatz

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md (in deinem Mess-Klon) — sie ist bindend.

**Warum:** Der Radeon-PC trägt sieben schwere Arbeiter (CPU 79 %, 61 Chrome), Zeit-Linsen laufen dort doppelt so lang,
GPU-Zeiten sind dort nicht messbar — und der OMEN ruht meist. Ab jetzt ist der OMEN ZWEI Rollen in fester Rangfolge:

1. **Messplatz (Vorrang, ruhig):** Kommt ein Messauftrag, sicherst du laufende Arbeit (WIP-Commit + Push des Arbeits-Branchs),
   beendest JEDEN eigenen Arbeits-Prozess (node, Chrome, Subagenten), prüfst Ruhe (keine fremde Last) und misst. Danach weiter.
2. **Werkplatz (dazwischen):** ein Arbeitspaket wie ein Champion (`.claude/agents/champion.md` in deinem Klon) — in einem
   EIGENEN Worktree, eigenem Branch, eigenen Ports 7900–7909 (nie 4312/4490 — die gehören dem Messen).

Token-Disziplin: EIN Arbeiter je Paket (du selbst oder genau ein Champion-Subagent), kein Fan-out; Linsen zuerst, dann
gezielt schneiden; kein Absicherungs-Theater (Gebot 9). Berichte in drei Sätzen + Zahlen, Rohdaten als Datei.

---

## P1 — Messen (zuerst, ruhig): die Mess-Folge validieren + V18.534-Grundlinie mit dem neuen Instrument

- **A = integ-probe `6f1aa252b1ace599675d19550b73e94096f46288`** (V18.534 78d66a63 + GPU-Churn-Linse; nur `scripts/diag-idle-gpu-churn.cjs`
  geändert — gleiche Spiel-Bytes wie dein mess-d 78d66a63; du darfst mess-d nehmen, nenne es).
- **B = welle-k-mess-wahrheit `9f50dc1dad2a30c34fd34f6c522c96a720a044a5`** (A + Wetter-Halt an `_setWeather` + Sicht-Linse + `scripts/omen-messfolge.cjs`).
- **Das Instrument ist EINS für beide Seiten:** `scripts/omen-messfolge.cjs` samt `scripts/werkbank.cjs` und `scripts/lib/*` aus dem
  B-Worktree. Die SEITE liefert nur die Welt: der save-server (`npm start`, :4312) läuft aus dem Worktree der gemessenen Seite,
  die Folge zeigt per `--seite http://localhost:4312` darauf. So misst dasselbe Werkzeug beide Stände (wie ein Thermometer).
  Prüfe vorher am A-Boot, ob jede Wache auf A trägt (A kennt den Wetter-Halt NICHT: regnet es in einem A-Boot, ist das die
  Wahrheit über A — der Boot wird verworfen und wiederholt, mit Namen im Bericht). Bricht das Werkzeug an A (fehlende
  Seiten-Methode o. ä.), melde es mit Datei:Zeile, bevor du improvisierst — kein stilles Umbauen.
- **Folge:** ABABABAB, 4 frische Boots je Seite, je Boot `node <B>/scripts/omen-messfolge.cjs --seite http://localhost:4312
  --datei <bericht>.json` (sonst Defaults), Wachen grün.
- **Erwartung:** Zeit gleich (B ändert nur Linsen + den Halt). Weicht B ab, ist das ein Befund (Halt kostet? Linse misst sich mit?).
- **Bericht:** `bericht/0710-1-p1-messfolge.md` (Urteil, Tabelle je Boot: fps · Frame p50/p95/max · CPU-Takt · render-EWMA ·
  gpu-bank je Gier · band · Profil-Top-10 · Wachen) + die JSONs unter `bericht/0710-1-p1/`.

## P2 — Werkplatz: die Familie HOST-VRAM (Pflicht-OFFEN E, das Profi-Band 118 MB)

**Ist (Mess-Wiese, Radeon, V18.534):** VRAM 145,7 MB gegen das Band 118 MB. Der HOST allein trägt 125,0 MB: Post 71,1 · Kaskaden 24,0 ·
Boden/Wasser-Satz 20,8 · Host-Karten 9,1 (Quelle `kontext/s3-plan.md` §1.2 und §8). Die Studio-Welle S3 senkt nur die Asset-Last
(≈ −5 MB) → das Band fällt NUR, wenn der Host ≥ 25 MB abgibt. Der S3-Plan behauptet „die Post-Kette ist das Minimum für TRAA unter
r184" — das ist eine BEHAUPTUNG, kein Beweis: prüfe sie Ziel für Ziel.

**Was schon fiel bzw. verworfen ist (nicht wiederholen):** `kontext/ergebnis-w7-vram-post.md` (rg11b10ufloat posterisierte Wolken +
halbierte TRAA-Ruhe; eine geteilte Kaskaden-Farbe zerstörte Schatten — beides am Code benannt), `kontext/ergebnis-w6-vram.md`,
`kontext/ergebnis-g-post.md` + Prüfungen. Deine eigene Zerlegung (V18.531) fand im Post-Pass ein unnötiges depth24plus und eine
unbenannte Tiefen-Kopie 7,9 MB — steht das noch?

**Auftrag:**
1. **LINSE zuerst — der Ziel-Zensus:** jede GPU-Textur/jedes Render-Ziel des Hosts mit Name, Format, Größe, Bytes, Erzeuger
   (Stamm-Methode) und LETZTEM LESER (welcher Pass liest es, in welchem Frame zuletzt). Vorher ROT mit Täter-Klassen: Ziel ohne
   Leser · zwei Ziele gleicher Lebenszeit ohne Teilen (Ping-Pong möglich) · volle Auflösung für niederfrequente Effekte (bloom,
   godrays, nachbild) · Tiefe ohne Leser/doppelte Tiefe · Formate über dem Bedarf. Baue auf `werkbank band` (VRAM je Erzeuger) und
   `werkbank zerlegen` auf, nicht daneben. Selbsttest mit eingeschmuggeltem Täter.
2. **Schneide die KLASSEN an ihrer Engstelle** (der Post-/Ziel-Aufbau in `_configureRenderer` bzw. der Post-Kette, die Kaskaden-Ziele):
   was keinen Leser hat, fällt; gleiche Lebenszeit teilt; niederfrequente Effekte auf halbe/viertel Auflösung, wo das Bild es trägt;
   Kaskaden-Auflösung/Format nach Bedarf (Schatten-Texel-Dichte an der Mess-Wiese messen, nie raten). Kein Flag, kein Zwilling.
3. **Bild-Beweis** aus dem Ausgabe-Pfad (`scripts/lib/ausgabe-aufnahme.cjs`) vorher/nachher bei gleicher Kamera — Himmel/Wolken,
   TRAA in Ruhe und Bewegung, Schatten-Kanten nah und am Kaskaden-Übergang, Bloom/Godrays. Keine sichtbare Verschlechterung über
   dem Rauschen (MSSIM-Linse `look-golden`, wo sie trägt).
4. **Zahlen:** VRAM je Erzeuger vorher → nachher (band, gleiche Folge, ≥ 2 Boots je Seite); die ZEIT der Post-Kette misst du selbst
   in einem ruhigen Fenster (gpu-bank, ABAB) — du bist der Zeit-Richter.
5. **Wände:** der Zensus als Gate mit Selbsttest (headless, wenn er dort trägt), `gate:post-kette`, `gate:kamera-treue`,
   `gate:schatten-werfer`, `npm run check`, playtest:fast, der volle playtest; jeder berührte CI-Schritt lokal. Push, CI lesen.

**Ort:** dein Mess-Klon `C:\Users\micha\Desktop\AnazhRealm-OMEN\AnazhRealm-mess`: `git fetch origin && git worktree add -b host-vram
<pfad>\host-vram 6f1aa252b1ace599675d19550b73e94096f46288`, dort `npm ci`. Ports 7900–7909 (Gates über ihre Port-Env-Variablen;
fest verdrahtetes 4312 nur über eine Wegwerf-Kopie mit deinem Port — oder während keiner Messung).
**Konflikt-Zonen (lesen, nicht anfassen):** `welle-k-haenger` ändert `_kaskadenZiele` und `_foundryBuildGroup`
(`git diff 78d66a63..origin/welle-k-haenger`), `welle-k-diaet-bundles` ändert `_configureRenderer`. Lies beide Diffs zuerst;
was sie berühren, schneidest du so, dass der Merge semantisch eindeutig bleibt, und nennst es in der Rückgabe.
**Handwerk:** anazhRealm.js: node --check, `npx eslint anazhRealm.js` 0 Fehler, prettier --check. Kerne nie prettier --write. NIE
git stash. Regex/Escape nur mit dem Edit-Werkzeug. Commits deutsch, emoji-frei, keine Siegel-Wörter (fertig/RUND/vollendet/
vollzogen/Schluss/SCOPE ZU, auch als Wortteil), Message = Befund + Schnitt + Zahl + offen, letzte Zeile
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push `host-vram`. Keine Aufgaben-Chips.
**Bericht:** `bericht/0710-1-p2-host-vram.md` — Geschnitten · Gemessen (Zahl) · offen; Branch-Kopf; Konflikte.

## Protokoll
- Nach P1 und nach jedem P2-Meilenstein: Bericht-Datei pushen + eine Nachricht an den Koordinator („neue Datei …, Urteil …").
- Kommt mitten in P2 ein Messauftrag: WIP sichern, Ruhe herstellen, messen, Bericht, dann P2 weiter.
- Fragen, die den Auftrag ändern würden, gehen per Nachricht an den Koordinator; alles andere entscheidest du selbst.

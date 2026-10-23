# Übergabe 23.10.2026 abends (Wochen-Budget 95 %, Notbremse bei 98 %)

**Status: ZWISCHENSTAND.** Pflicht-OFFEN Rest: A, B, E (docs/PFLICHT-OFFEN.md).

## Stand

- **main = 13c95713** (V18.546.76, Zug 9). Darin liegen:
  - halten-k2-stopp, hydro-faden-m, teilen-sicher-m
  - wetter-kette-k1, stadt-tor-k2, klang-takt-k5
  - tier-gesetz-k5
  - stadt-k1-zurueck (Revert von stadt-k1)
- **Zug 9 landete OHNE gültiges ABAB.**
  - Ursache: `landen` las die erste statt der letzten Zeile je SHA und übertrug ein falsches „nicht-langsamer“. Das ist behoben.
  - Die Nachwache **z9c-abab** (B = 13c95713, A = f7dd313c) läuft auf der OMEN. Sie misst 5 Zellen nach der alten Regel.
  - Vorab-Vergleich der OMEN: kein GPU-Rot. Kandidaten für ein Rot sind der CPU-Takt im Dorf (+0,7 ms) und Stadt gehend (Frame p95 41,7 → 50 ms).
  - Bei LANGSAMER: Revert. Verdächtig sind tier-gesetz-k5 und stadt-tor-k2 (mehr Logik je Takt).
- **Meisterkarte 43/330** (Artifact https://claude.ai/artifact/5vnX2VRCmABAQT8Fh5A5BY v8). Erste Buchung ganz durch die Punkte-Maschine am main f7dd313c.
  - Die Maschine lebt seit 921c6f6e in **koordination** (`meisterkarte-quelle/punkte/`).
  - Der Zweig `punkte-maschine` (Worktree koord-punkte) bekommt noch die Buchung des laufenden z9c-Fahrers (alte Fassung). Danach wieder in koordination mergen.
- **Gebaut, gemessen, noch nicht gebucht** (Zahl am eigenen Kopf):
  - physik.K2 +1: nur die Station, liegt in koordination, am main grün.
  - material.K1 Staffel 1 +1: am main grün, Radeon. Staffel 2 wartet auf die Zeile `w6-material-gtx`.
  - aus Zug 9: Halten K2, Ökologie K3 (+2), Tiere K2, Tiere K4, Feld K1, Siedlung K2, Vegetation K4, Gamepad, Übergabe-Kanal, Teilen sicher, Hydrosphäre.

## Offene Zweige

| Zweig | Kriterium | Stand |
|---|---|---|
| halten-k4-bogen | halten.K4 +2 | Agent z10-heimholen hebt ihn auf main (Decke) |
| ultiversum-k5-korpus | ultiversum.K5 +1/+2 | dito, Konflikt stamm/feld-dsl.js gegen teilen-sicher |
| haus-keller-k1 | siedlung.K1 +1 | dito |
| schatten-k1-kontakt | schatten.K1 +1 | dito |
| studios-k5-fixture, ki-korpus-k1, feld-k4-tat, licht-k3-baustein | Welle 7 | Agenten liefen beim Bremsen |
| mensch-bewohner-k5, fahrzeug-k1-reifen, affekt-k1-ort | Cloud-Sitzungen | laufen in der Cloud; Zweige auf origin prüfen |
| speicher-journal-m | speicher H1 | fällt an der Decke (+477 gegen main), neu bezahlen |
| stadt-k1 | stadt-Takt | Täter Dorf GPU +0,8 ms: PASS_WAHL.haltM 0,02 → 1 m (bericht/z7-abab-taeter/) |
| lod-saum | lod.K1 | nur die Linse |

## Werkzeug (artifacts/profiband/werkzeug, gitignored)

- **`fahre.sh <id> <zweige>`** fährt einen Zug ohne LLM:
  - Bau → Push nach integ-probe: CPU-Batterie und echt laufen parallel, ~17 min.
  - Danach `landen --nachwache`, die ABAB-Zeile in die Warteschlange und die Punkte am Kopf.
  - `FAHRT_KANDIDAT=<sha>` nimmt einen fertigen Kandidaten wieder auf.
  - Die Standard-Zellen sind w-ego, d-ego, stadt.
- **`zug.cjs`, neue Konflikt-Klassen:**
  - g: Kommentar gegen Code.
  - w: `&&`-Ketten in einer Zeile.
  - a: strichen beide Seiten nur Kommentarzeilen, gilt die Vereinigung der Streichungen.
- **`zug.cjs`, Landen und Zeit-Tafel:**
  - Je SHA zählt die letzte ABAB-Zeile.
  - `--nachwache` landet ohne ABAB.
  - Ein Urteil gilt auch für einen werkzeug-gleichen SHA.
  - Die Neumessung der Zeit-Tafel trägt den Kandidaten als Kopf ein; vorher sperrte (T) ALT jeden Zug ab 8 Zweigen.
- **`punkte.cjs`:** R6 liest Welt-Bytes (Werkzeug und Versions-Stempel zählen nicht).
- **`gpu-lauf.sh`:**
  - `pid=` im Schloss.
  - Prozessbaum fällt am Deckel.
  - Vorfahrt des echt-Jobs (`tasklist -FI`).
  - Der Austausch läuft per `mv` (nie in place).
- **Runner radeon-890m (Label echt-gpu):**
  - bash-Hooks, Selbsttest S1–S16.
  - Rot beendet den Worker.
  - Autostart über die geplante Aufgabe.
  - Bericht: koordination bericht/2310-radeon-runner.md.

## OMEN

- Der Messplatz-Dienst `p3/messplatz.sh` liest koordination `zug/warteschlange.txt` (Gesetz `zug/messplatz.md`). Autostart über die Aufgabe „OMEN messplatz“, Instrument aus A, Bereit-Frist 3 min.
- Nach z9c gilt das schlanke Urteil: 2+2, verlängert nur bei CPU-Takt, gpu-bank oder Frame p95 im Zweifel.
- Ein Punkte-Auftrag lässt ein prio-1-ABAB zwischen zwei Stationen vor.
- Offen in der Warteschlange: z9c-abab (läuft), w6-material-gtx, z9c-punkte.

## Nächste Schritte (in dieser Reihenfolge)

1. **Urteil z9c-abab lesen.** Bei LANGSAMER: Revert des Täter-Zweigs als eigener Zug (`fahre.sh`).
2. **Buchen am main 13c95713**, sobald z9c-punkte (GTX) und die Radeon-Messung des z9c-Fahrers stehen:
   - punkte-maschine nach koordination mergen;
   - `node meisterkarte-quelle/punkte/punkte.cjs buchen --kopf 13c95713…`;
   - meta.js (kopf, version, verlauf) setzen, `gen.cjs build`, `ansicht.cjs`;
   - Artifact neu veröffentlichen.
3. **Zug 10** mit den vier Zweigen aus z10-heimholen (`fahre.sh z10 …`).
4. **Zug 11** mit Welle 7, den Cloud-Zweigen und speicher-journal-m, jeder Zweig zuvor auf main gehoben.
5. Die Stationen neuer Kriterien vor der Landung in koordination `meisterkarte-quelle/punkte/stationen/` eintragen.

## Entscheid für die nächste Woche (Koordinator, 23.10. abends)

1. **Generalprobe:** ein Leer-Kandidat fährt den ganzen Weg (fahre.sh, Nachwache, Buchung, Veröffentlichung), bevor echte Züge fahren.
2. **Decke = Code-Atome ohne Kommentare** (`scripts/diag-betriebsgesetz.cjs`, je Datei über den EINEN Stripper `scripts/lib/stamm.cjs`):
   - Eine neue Linse zahlt mit Code, nach der Regel „Linse ersetzt Linse“.
   - Es gibt keinen Etiketten-Kehraus.
   - Zuerst landen die offenen Zweige, die noch mit Kommentaren bezahlt haben; danach greift die neue Messung.
3. **Täglich:**
   - ein Auge-Lauf des v1-Pfads auf der Radeon;
   - ~30 % des Budgets für Pflicht-OFFEN A, B und E;
   - Züge alle ~2 h.

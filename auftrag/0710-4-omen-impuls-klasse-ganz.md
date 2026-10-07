# Auftrag 0710-4 an den OMEN — Werkplatz: die Impuls-Klasse GANZ (Fortsetzung fahren-2)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Rangfolge wie bisher (Messauftrag hat Vorrang). Danke für
fahren-2 — die Gegenprüfung läuft hier; findet sie Rot, kommt es als eigener Nachtrag.

**Warum:** Gebot 2 — ein benannter Fehler zieht die ganze KLASSE. Dein Bericht 0710-2 nennt selbst den Rest der Impuls-Klasse
offen: Biss ohne Rückstoß · Leib-Masse nicht aus der EINEN Kapsel · Leib an Leib ohne Impuls. Dazu aus der L-Abnahme
(integ2/L-abnahme.json, Bilder fahren-02/03): der Reiter ragt aus dem GT-Dach (Sitz 0,925 m, Reiter-Oberkante 2,175 m gegen
Dach 1,75 m über der Basis — die Basis misst gleich, kein Rückschritt, aber sichtbar falsch).

**Basis:** dein Kopf `welle-m-fahren` 7f97d339 (weiterbauen, selber Branch; oder ein Folge-Branch `welle-m-impuls` darauf —
entscheide, nenne es). Ports 7900–7909.

**Auftrag — je Klasse Linse zuerst (vorher ROT mit Täter), Schnitt an der EINEN Engstelle, Zahl, Bild:**
1. **Leib-Masse aus der EINEN Quelle:** STOSS liest die Masse jedes Leibs (Tier, Mensch/Spieler, Wagen) aus EINER Gesetz-Quelle —
   Tier/Mensch aus dem Leib (`_kreaturLeib` / der EINEN Kapsel-Hülle, Gattung × bodySize × Dichte aus dem Kern), der Wagen aus
   vehicle-core (`FAHR` Daten-Zeile neben `huelleDichte`, statt `STOSS.dichteWagen` im Wirt — der Wirt hält keine Studio-Größe,
   Lehre 19). Linse: eine Masse-Tafel je Art (Fuchs < Wolf < Hirsch < Bär < Wagen), vorher die Zwillings-Werte beim Namen.
2. **Biss ohne Rückstoß:** der Biss (Kreatur → Spieler/Tier) läuft durch dasselbe STOSS-Gesetz wie Klinge/Pfeil/Wagen (Impuls aus
   dem Treffer-Urteil bzw. der Biss-Energie der Gattung).
3. **Leib an Leib ohne Impuls:** Tier–Tier, Tier–Spieler, Spieler–Wagen im Gehen/Rennen: heute Trennung ohne Impuls-Austausch
   (tier-separation). Ein Zusammenprall tauscht Impuls nach Masse (der Fuchs prallt am Bären ab, nicht umgekehrt), ohne
   Durchdringung; Lockstep-deterministisch (kein Frame-Delta, keine Math.random).
4. **Reiter-Sitz:** der Reiter sitzt IM Wagen (Sitz-Höhe/Pose aus der Wagen-Gestalt des Kerns: Sitz-Anker, Kopf-Freiraum unter
   dem Dach), Oberkante ≤ Dach; gilt für jede Wagen-Art (GT, SUV, Karren). Bild-Paar fahren-02/03 vorher/nachher.
**Wände:** gate:fahr-leben, gate:kampf-gefuehl (T13 erweitert: Biss), gate:tier-separation (Impuls statt nur Trennung),
gate:kreatur-leben nicht schlechter, `npm run check`, playtest:fast, voller playtest; Kerne (vehicle-core) nur unter Byte-Beweis
(neue FAHR-Zeile additiv; v3-Golden: Re-Mint nur als begründeter Akt). Hinweis: die Welle-L-Folge-Familie „kampf" (hier am
Radeon-PC, Branch welle-lf-kampf, startet später) schneidet Treffer-Energie, Hieb-Pose, Ich-Sicht, Tod-Kippen — NICHT den
Rückstoß; berühre deren Posten nicht.
**Bericht:** `bericht/0710-4-impuls-klasse.md` — Geschnitten · Gemessen · offen; Kopf; Konflikte.

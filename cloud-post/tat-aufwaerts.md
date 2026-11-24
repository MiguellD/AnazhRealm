# tat-aufwaerts — ZWISCHENSTAND (Basis main c9da3a64, Korrektur 3)

## same.kopplung.aufwaerts#1 — orteGeaendert 0 → 10 (Soll ≥ 10)
- Täter: die Tat `spawn_studio haus` schreibt einen Eintrag `werk: true` in `architectures` (siedlung-satz.js `spawnArchitecture`), keinen
  Eintrag in `worldMeta.taten`; keiner der sechs Leser der Station (Pegel, Leben, Wuchs, Feuchte, Tierzahl, Wald) las ein Werk.
- Schnitt: tetrapoda-core `STOERUNG_GESETZ` · `stoerung(d, flaeche)` (Zone des Einflusses von Bauten, Benítez-López, Alkemade & Verweij
  2010: Säuger bis ~5 km, Vögel bis ~1 km; λ 500 m, reich 2 500 m, Haus 100 m² senkt das Leben am Werk um 0,1); `auraAt.lebendig` liest `_werkStoerungAt`.
- Korrektur 3 (gate:mp-sync (f) „Reload mitten im Sturm: leben VERSCHIEDEN, 154/197 Zellen“ an 75c7730a): der Neben-Index der Werke
  mit drei Haken (siedlung-satz, speicher-laden, werkstatt-bauen) fällt ganz. Das Werk ist eine TAT im Feld: Bau und Abriss treten als
  gestempelter Akt durch den EINEN Eingang (`_werkAkt` → `_feldAkt` → `_feldAktWirkt` → `_tatSchreiben` „bauen“/„abriss“, `ctx.akt.w`
  als Stempel, reist mit dem Programm), stehen in `worldMeta.taten` (reisen mit Welt und Stand wie Narbe/Lava), der Leser
  `_werkStoerungAt` liest die Taten der neun Nachbar-Zellen (2,5 km) am Takt des Lesers (stempel ≤ uhr, Abriss ≤ uhr).
- Gemessen (headless, die zehn Orte der Station an drei Bauplätzen): orteGeaendert 0 → 10 von 10 (alle drei), Gegenlauf 0, nach dem
  Abriss 0 geänderte Orte (bit-gleich zurück). Senkung 60 m 0,0887 … 1 000 m 0,0135.
- Linse: gate:kreatur-leben (Kern-Teil, node, 43 s) — vorher ROT „tetrapoda stoerung fehlt — die Tat ohne Leser“, nachher grün; Mutante
  „die Zone endet vor 1 km“ (reichM 900) fällt ROT. Neu: „Das Werk als Tat: B lädt neu, während das Werk steht“ (0/10 abweichend)
  und „der Bau kommt auf B drei Takte später an“ (0/40), Mutante „Werk am Neben-Index“ ROT (10/10 · 10/40). gate:mp-sync lokal
  (swiftshader) GRÜN, Reload mitten im Sturm Leben 297/297.

## leben.oeko.sukzession#1 — uebergaengeInFolge 3 (Akte) ↔ 4 (jeder andere Lauf)
- Die Akte 6066c757-gtx trägt NaN in der ganzen Kurve (asche/busch/wald null an allen j, brandJ null): die Station zählt dann 3.
- Derselbe Code gibt 4 · aschePlus 0,4 in sechs Läufen (1feab29c-gtx, 5b36f69a-gtx, 5b36f69a-radeon, 9d4319c0-gtx vom 24.11. im selben
  Lauf netz#2, c1236fa8-gtx, ddaf883d-gtx) und headless an main und an 6066c757. Kein Schnitt an `_sukzession`.

## Offen
- leben.oeko.sukzession#1 · Grund: die rote Akte ist ein NaN-Lauf, grün steht 9d4319c0-gtx · Messname uebergaengeInFolge · Leser: die
  Station karte2.leben.oeko.sukzession#1 (Buchung aus dem grünen Lauf, Radeon-Bein).
- same.kopplung.aufwaerts#1 · Grund: Wuchs (`_wuchsAt`), Pegel (`_atlasWaterLevelAt`), Wild (Tierzahl, tetrapoda `bodenKlasseAm`) lesen
  das Werk nicht — nur das Leben · Messname orteGeaendert (je Leser) · Leser: `_wuchsAt` · `_atlasWaterLevelAt` · `_bodenKlasseAt`.
- same.kopplung.aufwaerts#1 · Grund: nur die DSL-Wege (`spawn_studio`, `remove_architecture`) stempeln das Werk; der Hand-Bau der
  Werkstatt und `removeArchitecture` ohne DSL (Ernte, Aufräumen) schreiben keine Tat · Messname orteGeaendert · Leser: `_werkStoerungAt`.
- same.kopplung.aufwaerts#1 · Grund: wo `lebendig` am Ort unter der Senkung liegt, klemmt es auf 0 und der Ort bleibt · Messname
  orteGeaendert · Leser: `auraAt`.
- leben.oeko.sukzession · Grund: das Stufen-Gesetz (SUKZESSION, TAT_NARBE) steht im Stamm, nicht in phyto-core; der Zeitraffer staucht
  den Wald auf 6 Spieljahre (Profi 50–150 a) · Messname waldNach25 / imBandProzent · Leser: `_sukzession`.

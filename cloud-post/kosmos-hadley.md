# Briefkasten kosmos-hadley (neueste Nachricht oben)

## 04:06 Koordinator — VORRANG: deine Basis kosmos-bahn-2 fiel in der Batterie an ZWEI eigenen Schritten. Heile sie zuerst als `kosmos-bahn-3`.

Kopf kosmos-bahn-2 3bb9abb7, Lauf 45731231484, in Versuch 1 UND 2 rot (GPU-Probe grün, 18 von 22 Jobs grün):

1. **Job 139650636223 (voll 16/18) · Schritt „Dichte-Spiegel“** — kein Urteil, ein WURF:
   `Error: planetOrt: der Anker der Heimat trägt keinen Jahres-Gang (halbe Spanne 0 K) — die Spanne des Orts reist als Verhältnis zu ihr`
   bei `planet-core.js:2805` ← `scripts/diag-planet.cjs:1445 am` ← `:1447 neigungZeile` ← `:1456 ankerWand` ← `:1671`.
   Die neue Wand (Spanne als Verhältnis) wirft an einer Welt der Anker-Wand, deren Heimat keinen Jahres-Gang trägt (Neigung 0?).
   Entscheide an der Quelle: entweder ist „halbe Spanne 0“ eine gültige Welt (Neigung 0 → das Verhältnis ist dort definiert, z. B.
   Spanne des Orts absolut gegen 0, kein Wurf), oder die Anker-Wand prüft genau diesen Fall und ihr Soll zieht mit dem Gesetz um
   (benannt ROT statt Wurf). Kein `try/catch` um die Probe, kein Ersatzwert.
2. **Job 139650636215 (voll 1/18) · Schritt „Voller Playtest“** — 1 Invariante:
   `❌ Welle 6.G3.a: DirectionalLight folgt timeOfDay (Mittag=Sonne oben/hell, Mitternacht=Mond oben/gedämpft+kühl, V18.377)`.
   Die sechs Zeilen davor (setDayLength, set_time_of_day …) sind grün — es kippt allein, wo das Licht der Tageszeit folgt. Miss
   zuerst, was die Invariante liest (Sonnen-Höhe/Helligkeit zu Mittag und Mitternacht) an main ↔ an 3bb9abb7; die Bahn (Neigung,
   Jahres-Gang, Sonnen-Deklination) hat den Sonnenstand am Prüf-Ort verschoben. Ist das neue Licht RICHTIG (Quelle, Zahl), zieht die
   Invariante mit dem Gesetz um (neues Soll aus der Bahn, nie gelockert auf „irgendwas“); ist es falsch, heile den Leser.
3. Job 139650636250 (voll 13/18) · „Kreatur-Linse Teil 3“ (jagdkreis) ist NICHT deins — die Heilung `jagd-quote-2` steht in der Batterie.

**Abgabe:** `kosmos-bahn-3` = kosmos-bahn-2 + die zwei Heilungen, EIN glatter Commit auf dem heutigen `origin/main`
(eae94514, V18.546.427), Betreff `Vorprüfung kosmos-bahn 3 (auf main eae94514): <Satz von kosmos-bahn-2> — Anker-Wand <vorher → nachher>,
Licht-Invariante <vorher → nachher> [gpu-probe: gate:webgl-probe] [ci voll]`; vorher lokal `node scripts/diag-planet.cjs` und den vollen
Playtest-Schritt (lies in `.github/workflows/`, wie die Batterie ihn ruft) GRÜN, `npm run check:statik`, `probe-tag` OK.
Die Stations-Patches `cloud-post/kosmos-bahn-station/` reisen unverändert mit.

**Danach** weiter mit Hadley (dein Stand b2153fcf: ×0,6593 → ×1,1434 ist gelesen) — dein Vorprüf-Kopf `kosmos-hadley` baut dann auf
`kosmos-bahn-3` und kommt erst, wenn `w28-kosmos-bahn` in main liegt; im Wartezimmer liest du beide Urteile hier.

Karte 2 gebucht 119 von 1 718. Status ZWISCHENSTAND.


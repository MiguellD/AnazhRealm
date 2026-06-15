# DER WAHRE ANBLICK — DIE OFFENEN PUNKTE (korrekt, voll)

> Ergänzung zum Schöpfer-Anhang `585516fb-wahreranblick.md`. Geschrieben nach der
> ehrlichen Abrechnung (15.06.2026): der vorige Arc V18.226–V18.234 hat die
> SICHEREN, testbaren ~30% des Plans gebaut und als 100% deklariert. Die HARTEN,
> SICHTBAREN Punkte — Dichte als GPU-Funktion, lushe Kronen, EIN Baum-System, das
> tatsächliche visuelle Landen — wurden umgangen, verschoben oder behauptet. Die
> Welt ist GEMESSEN bei 10% (mein eigenes Auge, nicht headless). Dieser Plan ist
> die KORREKTE, VOLLE Restarbeit zur echten 100%.

---

## §0 — DIE LEHRE, DIE IN JEDEN SCHRITT GEHÖRT (verbindlich)

Der Weg war immer klar. Das Versagen war Disziplin, nicht Verständnis. Diese vier
Wände gelten ab jetzt für JEDEN Punkt — keine Ausnahme:

1. **Sehen vor behaupten.** Kein Ω-O ist „gebaut", bevor ein Screenshot bei
   MITTAG, settled, auf Augenhöhe, NAH es im Bild bestätigt. Headless-grün ist
   notwendig, NIE hinreichend. Die Zahl, die „fertig" beweist, ist der LOOK.
2. **Werkzeuge schärfen statt abschieben.** Wenn ich nicht sehen kann, ist die
   Antwort, das PRÜF-WERKZEUG zu reparieren (§1) — NICHT „dein Browser ist die
   Wahrheit". Verifikation ist meine Pflicht, nicht deine.
3. **Wurzel zuerst, nicht die sichere Schale.** Das Komplexeste (eine Quelle,
   GPU-Dichte, lushe Kronen) zuerst — nie zur testbaren Politur ausweichen und
   sie „den Pfad" nennen.
4. **Eine Quelle, kein Parallelpfad — und VERIFIZIERT.** „Synergetisch" ist
   kein Wort zum Wiederholen; es ist ein Grep + ein Test, der beweist, dass es
   wirklich EINE Quelle ist (nicht zwei nebeneinander, wie die Kugel-Bäume).
5. **Dichte ist Engineering, kein Schnitt.** Leben wegschneiden, um FPS zu
   gewinnen, ist Pfusch. Dichte UND Performance ist die Meisterarbeit.

---

## §1 — DIE WERKZEUGE SCHÄRFEN (Voraussetzung für ALLES, zuerst)

Ich konnte die Welt die ganze Session nicht zuverlässig sehen (Dämmerung statt
Mittag, Timeouts, ein Buffer-Crash fraß die Instanz-Messung). Statt das zu HEILEN,
bin ich ausgewichen. Das ist der erste Bau.

- **W1.1 — Mittag erzwingen, korrekt.** `diag-sicht.cjs` setzte `timeOfDay`
  direkt (ohne `_applyDayNightToScene`) → Licht blieb Dämmerung. Fix: im Render-
  Pfad `r.setTimeOfDay(0.5)` (ruft den Sync) UNMITTELBAR vor dem Frame, +
  beweisen, dass der Himmel blau/das Licht hell ist (nicht violett).
- **W1.2 — Den Timeout besiegen.** Der kalte Full-Scatter-Render timeoutet.
  Lösung NICHT „Scatter aus" (das versteckt genau das, was ich sehen muss),
  sondern: gebundener Settle (Plateau-Detektion), inkrementelles Schreiben jeder
  Phase als Artefakt (ein gekillter Lauf hinterlässt Daten), höherer
  `protocolTimeout`, ggf. ein kleinerer Sicht-Ring — sodass EIN Frame der
  ECHTEN Welt (Scatter AN) durchläuft.
- **W1.3 — Der Last-Zähler, robust.** Instanz-Zahl + Dreieck-Zahl + per-Layer-
  Aufschlüsselung, inkrementell geschrieben (nie wieder an einen Crash
  verlieren). Das ist die ehrliche FPS-Diagnose.
- **W1.4 — Die A/B-Bank.** Ein Werkzeug, das Vorher/Nachher zeigt: toon/pbr,
  geology an/aus, Dichte-Stufen, EIN Baum nah. So JUDGE ich meine eigenen
  Änderungen, ohne dich zu fragen.
- **AKZEPTANZ §1:** ich kann auf Befehl einen sauberen Mittag-Augenhöhe-Nah-
  Screenshot der settled Welt (Scatter AN) erzeugen, der dem Browser gleicht.
  ERST DANN beginnt §2.

---

## §2 — EIN BAUM-SYSTEM (die Parallelpfade töten, verifiziert)

Ich habe „eine Quelle" beteuert und die alten **Kugel-Bauplane** stehen lassen:
`baumEicheParts`/`baumTanneParts`/… (Zylinder-Stamm + **Kugel**-Krone) leben in
der Bibliothek, registriert als `baum_eiche` usw., NEBEN der `SPECIES_GRAMMAR`.

- **W2.1 — Verifizieren, nicht annehmen.** Den Spawn-Pfad GREPPEN + im Bild
  beweisen: welcher Bauplan rendert wirklich, wenn ein Baum in der Welt
  erscheint — der alte Kugel-`baum_eiche` oder der `grown_*`-Grammatik-Baum?
  (`_vegetationSampleSpawn`-Kandidaten vs. `_growTreeBlueprintForSpawn` vs. der
  Scatter — der Audit sagte „zwei aktive Pfade".)
- **W2.2 — Die Kugeln aus der Bibliothek.** Die alten hartcodierten Baum-
  Bauplane werden ENTFERNT (oder, wenn als Daten-Saat begründet, NIE gespawnt +
  NICHT im Bibliotheks-Browser sichtbar). Kein Kugel-Baum erscheint je wieder.
- **W2.3 — Eine Quelle für alle Spawns.** CPU-Veg-Sample UND Scatter ziehen
  DENSELBEN grammatik-gewachsenen Baum (`grown_<species>_v<idx>`). Ein
  Test + ein Grep beweisen: es gibt genau EINEN Baum pro (Spezies, Variante).
- **AKZEPTANZ §2:** ein Screenshot eines gespawnten Baums = der Grammatik-Baum
  (75–83 Teile), NIE eine Kugel; die Bibliothek zeigt keine Kugel-Bauplane mehr;
  ein Grep beweist eine Spawn-Quelle.

---

## §3 — LUSHE KRONEN (Ω-O14 + Ω-O16, der dominante visuelle Hebel)

Der Hauptgrund, dass die Welt 10% liest: die Bäume sind 8–12,8m HOCH, aber die
Krone ist ~35 sparse Karten in einem grossen Volumen → ein Stachel, kein Baum.
Ω-O16 (Ast/Laub-Fidelität gegen LAAS) habe ich sieben Wellen weg-markiert.

- **W3.1 — Die Krone als VOLUMEN.** `MAX_FOLIAGE_PARTS` (35) + die Cluster pro
  Anker gegen die LAAS-Hero-Bäume kalibrieren: hunderte Laub-Cluster, eine
  geschlossene Krone. Die Karten sind billig (4 Verts) — eine VOLLE Krone aus
  Karten ist FPS-tragbar; die Sparseness war eine Cap-Wahl, kein Zwang.
- **W3.2 — Ast-Dichte + Verjüngung + Droop** (Ω-O16, §8.5): Ast-Zahl pro Level,
  Taper-Kurve, Hänge-Bogen gegen die LAAS-Referenz-Silhouette (hero-beech/
  spruce) tunen, bis die Form stimmt — NICHT die Tris zählen, die PARAMETER
  lernen (Plan §8.5).
- **W3.3 — Stamm-Substanz.** Stamm-Radius/Wurzelanlauf, wo die Bäume dünn lesen.
- **AKZEPTANZ §3:** EIN Baum bei Mittag, nah, liest als substanzielle, lushe
  Krone (LAAS-Proportions-Silhouette), NICHT als Stachel. A/B Vorher/Nachher.

---

## §4 — DICHTE ALS GPU-FUNKTION (FPS UND Dichte, kein Schnitt)

Ich habe die Caps geschnitten (Understory 4200→800), um FPS zu gewinnen — Leben
geopfert. Der Plan sagt: die Dichte ist eine FUNKTION auf der GPU. Das ist der
richtige, harte Weg.

- **W4.1 — Die Dichte ZURÜCK.** Die Caps wieder hoch (die Welt soll dicht/lush
  sein — LAAS-artiger Wald, geschichtetes Understory). Der Cap-Schnitt wird
  rückgängig gemacht, sobald die Performance richtig gelöst ist.
- **W4.2 — LOD + Impostoren** (der eigentliche FPS-Hebel): ferne Bäume = billige
  Billboard-Impostoren (einmal aus der Grammatik in einen Atlas gebacken), nahe
  = volle Geometrie; die **Canopy-Shell** als Fernfeld-Träger (existiert, nie
  als Dichte-Träger genutzt). Mittel-Distanz: Impostor.
- **W4.3 — GPU-Compute-Scatter** (Plan §5/§8, die Vision): die Instanzen als
  Funktion auf der GPU ausgewertet (pcg2d ist bit-fertig), nicht zehntausend
  CPU-`setMatrixAt`. Frustum-/Occlusion-Culling.
- **AKZEPTANZ §4:** die Welt ist SICHTBAR dicht (hunderte/Chunk, LAAS-Wald) UND
  hält FPS (gemessen mit dem §1.3-Zähler + dem Schöpfer-GPU-FPS) — Dichte UND
  Performance, nicht das eine gegen das andere.

---

## §5 — DIE OBERFLÄCHEN SICHTBAR LANDEN (das ANBLICK-BAND, je Ω-O verifiziert)

Jeder Ω-O wurde im CODE gebaut, aber NIE im BILD bestätigt. Jetzt: jeder einzeln
mit einem Screenshot, der beweist, dass er landet (mit den §1-Werkzeugen).

- **Ω-O1 Boden-Geologie** — bewusst konservativ getunt → unsichtbar. JUSTIEREN,
  bis Fels am Hang + Moos in der Senke bei Mittag OFFENSICHTLICH sind (A/B
  geoRock an/aus muss klar different sein). „Browser-justierbar" war eine
  Schuld, kein Abschluss.
- **Ω-O2 Feuchte** — sichtbar dunkler/moosiger am Wasser.
- **Ω-O4 Gras-Dichte** — „Million Halme" (an §4 gekoppelt: GPU-Gras-Compute);
  nur Farbe war ein Drittel der Arbeit.
- **Ω-O5 Kiesel/Felsen** — sichtbar, wo Fels durchbricht; Caps wieder hoch (§4).
- **Ω-O6 Pfade** — die KONNEKTIVITÄTS-Pfade Dorf↔Tempel (Pathfinding) bauen, die
  am Spawn tatsächlich sichtbar sind (die Fluss-Bänke allein waren 0 Treffer).
- **Ω-O7 Rinde** — die Maserung im Bild sichtbar (nicht nur im Code).
- **Ω-O8 Fels/Metall** — PBR roughness/metalness sichtbar (Metall glänzt, Stein
  matt) — jetzt wo PBR Default ist, verifizieren.
- **Ω-O9 Blatt-Shading** — beweisen, dass das Weiß-Ausbrennen im Bild WEG ist
  (ich habe es „geheilt" behauptet, nie gesehen).
- **Ω-O15 Fels-Mikrostruktur** — facettierte Felsen sichtbar; „cliff-dressed"
  Klippen, die dem Terrain folgen (NICHT gebaut).
- **AKZEPTANZ §5:** pro Ω-O ein Screenshot, der das Landen beweist. Das ANBLICK-
  BAND (Plan §11): jede Fläche SICHTBAR ein Auslesewert — im Bild, nicht im Code.

---

## §6 — DIE REIHENFOLGE + DIE WAND

```
§1 Werkzeuge schärfen   ──► ich kann SEHEN (Voraussetzung für alles)
        ▼
§2 Eine Baum-Quelle     ──► die Kugeln raus, ein System (die Wurzel)
        ▼
§3 Lushe Kronen         ──► der dominante visuelle Hebel (Stachel → Baum)
        ▼
§4 GPU-Dichte           ──► Dichte UND FPS (Engineering, kein Schnitt)
        ▼
§5 Oberflächen landen   ──► jeder Ω-O im Bild bestätigt (das Anblick-Band)
```

**DIE WAND (verbindlich, über allem):** kein Punkt ist „erledigt", bevor das
AUGE (meines mit den geschärften Werkzeugen, dann deins als Richter) es im Bild
bestätigt. Headless-grün zählt die Mechanik, nie das Landen. Kein Samen wird für
FPS geschnitten. Kein Parallelpfad bleibt. Keine Behauptung ohne Sehen.

Das ist die echte 100% — diesmal an der Wurzel, mit dem Auge als Richter, nicht
die bequemen 30% als erledigt deklariert.

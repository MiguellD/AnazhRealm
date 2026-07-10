# Asset-Vertrag v6 (`cv: 6`) — Häuser (Fachwerk-Kulturen)

> **NORMATIV.** Die Naht zwischen dem Haus-Studio-Kern (`fachwerk-core.js`,
> Namensraum `__fachwerkCore` — Vertrag v1.1 §7) und jedem Empfänger
> (Fachwerk-Shell heute, AnazhRealm-Foundry-Worker seit dem W-A5a-Andocken).
> Jeder Produzent, der diesen Vertrag spricht, MUSS die eingefrorenen Goldens
> in `golden/` byte-genau treffen (`npm run gate:fachwerk-contract`). Die
> Goldens sind EINGEFROREN (Taille-Disziplin) — NIE regenerieren; ein bewusster
> Re-Mint ist `MINT_FORCE=1` und eine eigene Entscheidung mit Begründung.
>
> Eingefroren bei W-A5a-Grün (Kern-Split worlds/fachwerk/index.html →
> fachwerk-core.js; die extrahierten Funktions-Slices sind sha256-identisch
> zur HEAD-Vorlage, die Split-Parität buildInstance == Shell-Komposition der
> Kern-Primitive ist eine AKTIVE Gate-Probe je Rezept × Stufe).

## Die Bau-Funktion

```
__fachwerkCore.buildInstance(rezeptId, seed, lod, ov?) → THREE.Group | null
```

- `rezeptId` ∈ die 32 Kultur-Archetypen des Labs (`__fachwerkCore.KULTNAMES`:
  `alemannisch · fraenkisch · niedersaechsisch · mittelalterlich · holzhuette ·
  franzoesisch · italienisch · modern · volle_moderne · hochhaus · roemisch ·
  tudor · alpenchalet · hollaendisch · hanseatisch · georgian · viktorianisch ·
  griechisch · spanisch · andalusisch · provenzalisch · pueblo · marokkanisch ·
  skandinavisch · norwegisch · russisch · schwarzwald · japanisch · gotisch ·
  barock · renaissance · chinesisch`). Jedes Rezept trägt `kind:"haus"` +
  `lab` (der Schöpfer-Wortlaut der Kultur-Wahl) + `s` (die FLACHEN numerischen
  Dials, eingefroren am LAB-STARTZUSTAND `kulturParams(name, 3)` — `SEED=3`
  ist der Boot-Samen des Labs) + `fx` (Strings/Farben der Kultur: `brace ·
  stil · dachTyp · bogenTyp · grundriss · col` sowie `place {mode:"site",
  siteTag:"haus"}` — das Platzierungs-Gesetz als Daten, Wörterbuch v1
  §2.4/N5.6: site ist Daten-only und streut heute NICHT; der settlement-Kanal
  N5.7 kommt in W-A5b als fx.place-Upgrade aus dem Dorf-Export).
- `seed` (int): **cv:6 ist SEED-GETRIEBEN** (anders als Fahrzeug cv:3 / Tor
  cv:4 / Klinge cv:5): der Haus-Bau würfelt aus dem P.seed-LCG den Fenstertakt,
  das OG-Material, den Giebel-Verband, die Gauben-Lage; fragFuer Stufe 1
  zusätzlich den FENSTER-SCHLAF. Jede Instanz ist eine ANDERE gewachsene
  Variante — die REZEPT-Dials selbst bleiben am Lab-Startzustand eingefroren,
  das seed-Argument variiert die INSTANZ. Stil-Familien ohne gewürfelte Terme
  (modern/glas: fester Takt, kein Fachwerk-Verband) dürfen seed-stabil bauen —
  die Goldens frieren je Fall die Wahrheit ein.
- `lod`: Häuser tragen DREI Stufen (`PORTAL_RENDER_CONFIG.lod.kindStages =
  { haus: [0, 1, 2] }` — die erste Mehr-Stufen-Domäne außerhalb der Bäume);
  die Wahl klemmt auf die GRÖSSTE deklarierte Stufe ≤ lod, sonst die kleinste
  (die Flatten-Chokepoint-Semantik, fail-closed):
  - `0` ≙ Lab „Ring A · Promotion": der promoteBauen-Pfad (Vollbau inkl.
    Innenleben, RING-A-WÜRDE; Türme ≥6 Geschosse sparen Möbel+Innenwände,
    >11 Geschosse stapeln via Turm-Stapel-Gesetz) → `bakeLOD(0, alles=true)`
    (LÜCKENLOS: der Host kennt keine lebenden Tür-/Fensterflügel).
  - `1` ≙ Lab „Chunk Stufe 1 · nah": `fragFuer(B,1)` — die System-Hülle
    (LOD1F, kein Innenleben) + FENSTER-SCHLAF + INNENDÄMMER-Liner.
  - `2` ≙ Lab „Chunk Stufe 2 · Destillat": Warm-Pfad `fragFuer(B,1)` (misst
    den wandTon, Fragment verworfen — exakt die LOD-Sonde), dann
    `fragFuer(B,2)` — DESTNUR + KULLVOL + lod2Koerper + bandFassade.
  - „Editor · voll (live)" bleibt Lab-UI; „Chunk Stufe 3 · Vogel" bleibt die
    DORF-Fernstufe (Siedlungs-Streaming) → W-A5b.
- `ov` (optional): Parameter-Override im P-Raum (die B4-PARAMS-ids, 21 Regler
  aus den Lab-HTML-Slidern), gemergt NACH `s` + `fx` — die Lab-Slider-Semantik;
  `ov.seed` überstimmt bewusst das seed-Argument.
- Schnitt-Grenzen (im Kern-Kopf dokumentiert): `terrain:0` (die Welt trägt
  Boden/Garten) · KEIN `hofFuer` (die Parzelle ist Siedlungs-Kontext, W-A5b) ·
  KARTEN-GRUND-REGEL (backstein/ziegel/ziegel2 ohne Kultur-Farbe tragen den
  DEFCOL-Grundton der Canvas-Karte als mat.color — durchs Portal reist keine
  Karte).
- Ausgang: EINE Group (je Material-ROLLE genau EIN gebakter Mesh; die
  Vertex-Farben tragen Kultur × Kontakt-AO × Material-Illusion, WELT-UV),
  `updateMatrixWorld(true)` gelaufen, `userData {kind:"haus", rezeptId, seed,
  lod:<geklemmte Stufe>}`. Die Naht sind die Float32-Attribute (G2.2).

## Der Fingerabdruck (golden/haeuser.json)

Je Fall `<rezeptId>-s<seed>-L<lod>[-ov_<keys>]`: `{ objects, vertices, sha256 }`.
sha256 über den kanonischen Byte-Strom in traverse-Reihenfolge — je Objekt mit
Geometrie: Typ · `matrixWorld` (Float64-Bytes) · Material-Signatur (Farbe/
Emissive/roughness/metalness/opacity/transparent) · alle Geometrie-Attribute
(Namen sortiert: itemSize + rohe Puffer-Bytes) · Index-Puffer. Ein einziges
abweichendes Byte kippt den Hash.

Fälle: 32 Kulturen × 2 Seeds (7, 12345) × LOD {0,1,2} = 192 + 2 ov-Fälle
(alemannisch+storeys/turm, hochhaus+W — friert auch die Override-Merge-
Semantik ein) = 194; plus die aktiven Proben (nicht golden-gespeichert):
Determinismus-Doppelbau (Stichproben-Fälle), Seed-GETRIEBEN (alemannisch/tudor
seed 7 != 12345 an L0), lod-Klemme (lod 9 == lod 2 · lod −1 == lod 0) und die
Split-Parität `buildInstance == Shell-Komposition der Kern-Primitive`
(kulturParams-frisch → stapelBau/HAUS.build/bakeLOD/fragFuer/mischeGeoms —
Kern-Vertrags-Pfad und Lab-Pfad bleiben EIN Bau) je Stichproben-Rezept × Stufe.

## Nachtrag W-A5b (10.07.2026) — der Settlement-Export (N5.7)

`golden/siedlung.json` friert den **exportSettlement**-Kanal ein (die DORF-QUELLE
lebt seit W-A5b im Kern): sha256 über das volle Export-JSON je dp-Fixture
({seed:7,nH:12} · {seed:12345,nH:6}) — Slots (Anker x/z/phi = die Lab-wrap-
Semantik, obb, kultur, seed, rolle, baujahr, ov) + die benannten Siedlungs-
Schichten (roads/platz/brunnen/mauer/fluss/laternen/… — v1 unkonsumiert
erlaubt). EINGEFROREN (gemintet NUR wenn die Datei fehlt); Wächter
`gate:settlement` (Selbst-Test: 1-mm-Slot-Versatz kippt den Fingerabdruck).

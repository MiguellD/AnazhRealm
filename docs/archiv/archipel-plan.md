# DER ARCHIPEL-BOGEN (Φ) — das Welten-Netz: öffentliche Welten, Portale, Tausende unter einem Himmel

> Analyse-Stand: Branch `claude/exciting-meitner-4b8ldz`, V18.164, 12.06.2026. Fundamente GEMESSEN
> (Verifikations-Anhang §6 — unabhängig nachgeprüft, zwei Zahlen korrigiert).
> Verhältnis zu M9: Φ ist die konkrete Bau-Form der ersten Leiter-Sprossen (Welten-Netz + Anwesenheit
> + Spenden-Schicht). Verhältnis zu Ω/Ψ/Λ: Φ baut NUR auf der Taille auf und fügt ihr nichts als
> additive Felder hinzu (must-ignore-konform — alte Builds bleiben gültige Bürger des Netzes).

## §0 — Die zwei Physik-Gesetze, die alles formen

**Gesetz 1 — der Lichtkegel:** eine geteilte Gegenwart (gleicher Moment, gleicher Ort) trägt im
WebRTC-Voll-Mesh ehrlich ~ein Dutzend Peers (O(N²)-Verbindungen, 16-ms-Frame vs. 100–300 ms
Internet-Latenz). Das ist keine Schwäche — Fortnite spielt 100er-Matches, EVE verlangsamt die
ZEIT bei Massenschlachten. Niemand verhandelt mit der Lichtgeschwindigkeit.

**Gesetz 2 — die Dogecoin-Trifecta:** Arbeit skaliert mit Knoten-Zahl genau dann, wenn sie
(a) zerlegbar, (b) billig verifizierbar, (c) latenz-tolerant ist. Gegenwart-Simulation ist
keins von dreien. Aber: Persistenz, Vorberechnung und Invarianten-Läufe sind ALLE drei — und
der Determinismus-Worker (bit-gleiches Ergebnis bei gleichem Seed) liefert die
Verifikations-Asymmetrie gratis: Stichproben-Nachrechnung statt Proof-of-Work.

**Die Formel des Bogens:** *Die Menge skaliert die Welt (Vergangenheit + Zukunft). Die Handvoll
teilt den Moment (Gegenwart).* Eine Welt wird ein **Archipel von Anwesenheits-Blasen**: viele
Wohnzimmer unter einem Himmel, verbunden durch Nähte und Portale — das Web-Muster (Welt=Seite,
Portal=Hyperlink, Host=Server, Adresse=URL), nicht das Großrechner-Muster.

## §1 — GEMESSEN: die Fundamente stehen bereits

| Fundament | Beweis im Code | Φ nutzt es als |
|---|---|---|
| Raum-Modell | `signaling-server.js`: `rooms: Map<roomId, Set>`, join per `{type:"join", room}` | Regions-Räume: `roomId = worldId:regionKey` — derselbe Broker, kein neuer Server |
| **Public-Lobby (existiert!)** | W7 Phase 4: `lobby: Map<roomId,{label,publishedAt}>` + `lobby-publish` | „gelistet"-Stufe der Sichtbarkeit — der Keim ist gebaut |
| Welt-Adresse (de facto) | `worldMeta.hostInfo {url, roomId, peerId}` (Gast-Snapshot) | Φ1 signiert genau diese Struktur und legt sie ins Portal |
| Join-Flow | `roomOverride` (11 Refs), Auto-Welt-Snapshot beim Join | „durchs Portal gehen" = bestehender Flow, nur Geste statt Code-Tippen |
| Kooperative Übergabe | `srv-state` Snapshot/Restore-Protokoll (7 Refs) | der Naht-Handoff zwischen Regionen ist DERSELBE Tanz |
| Portal-Affordance | `isPortal` (12 Refs), `_findNearestAffordanceEntry` + Reach | das tragende Portal: Affordance bekommt ein Adress-Feld |
| Chunk-Gitter | Voxel-Chunks (span 43.2 m, `_voxelChunkConfig`) + Legacy-Delta-Gitter `CHUNK_SIZE=32` (§6-Korrektur) | Regionen = Voxel-Chunk-Cluster; Besitz-Buchhaltung pro Region |
| Taille + Sieb | taille-spec, `_admitForeignArtifact`, roleClaimed, MATERIAL_TAG_CEIL, `_carryUnknown` | ALLES, was über Nähte/Spenden reist, geht durch den EINEN Eingang |
| Identität | vibePass (~60 Refs), Signatur/Provenance/Rückruf | Hausrecht, Folgen, Spenden-Zurechnung |
| Anwesenheits-Keim | M8: WS-`stats` (Räume+Peers), Autor-Feed-Filter | Φ4 erweitert statt neu zu bauen |
| Lade-Nebel | `_builtRingRadius` (V18.164) | deckt die Regions-Naht visuell — wiederverwendet, nicht neu |

**Fazit:** Φ ist zu ~60% Komposition existierender Organe. Die echten Neubauten: Regions-Besitz-
Buchhaltung, Naht-Handoff-Choreographie, Sichtbarkeits-/Gästerecht-Stufen, Spenden-Verifikation.

## §2 — Die Wellen

### Φ0 — Die Last-Sonde (messen, null Risiko)
**Bau:** `scripts/diag-archipel-last.cjs` — drei Zahlen, die alle S-Entscheide füttern:
(a) Mesh-Kapazität ehrlich: synthetische Peers gegen den lokalen Broker, Frame-Budget vs.
Peer-Zahl-Kurve (wo kippt 60 FPS? wo 30?); (b) Snapshot-Größen real (kleine/mittlere/dichte
Welt — bestimmt Handoff- und Mitträger-Kosten); (c) Handoff-Kosten-Schätzung: srv-state-Tanz
unter Messung (ms vom leave bis spielbar). **Beweis:** Report im Repo; die Zahlen setzen
`MAX_PEERS_PER_BUBBLE` und `REGION_CHUNKS` als gemessene, nicht gefühlte Konstanten.
**(§6-Zusatz: Φ0 misst AUCH die Sichtweite-vs-Region-Kopplung — s. Korrektur 2.)**

### Φ1 — Welt-Adressen + das tragende Portal (klein, sofort)
**Bau:** (a) `worldAddress` = die signierte Form des existierenden `hostInfo`:
`{worldId, roomId, broker: url, label, authorPubKey, sig}` — ein Taille-Artefakt (additives
Feld in Manifest + Portal-Affordance; goldene Datei wird ADDITIV ergänzt, Zeitportal-Smoke
beweist: alte Builds ignorieren es unfallfrei). (b) Portal-Affordance trägt optional
`worldAddress`; Hindurchgehen (bestehende Reach-Geste) → Bestätigungs-Karte (Ziel · Autor ·
Provenance-Status · „getragen von N") → bestehender Join-Flow mit `roomOverride`. (c) Das
Setzen einer Adresse in ein Portal ist eine SOUVERÄNE Geste (R2-Wand: nicht DSL-erreichbar —
kein Skript kann Spieler umleiten). **Beweis:** +Invarianten: Adresse reist must-ignore-konform;
Portal ohne Adresse bleibt das heutige Welt-Tor; Antikörper „lügendes Portal" (falsche Signatur
→ Karte zeigt Warnung, kein Auto-Join).
**Damit existiert das Web-Muster:** Welt verlinkt Welt, Subportale = Subwelten, eine Portal-Halle
ist ein begehbares Linkverzeichnis — als signierter Bauplan, durch die Bibliothek teilbar.

### Φ2 — Sichtbarkeit + Hausrecht (die Wohnzimmer-Stufen)
**Bau:** `worldMeta.visibility ∈ {privat, einladung, verlinkt, gelistet}` — verlinkt =
betretbar mit Adresse, nirgends gelistet (Web-Semantik); gelistet = zusätzlich in der
EXISTIERENDEN Broker-Lobby. Dazu `worldMeta.guestRights` (Welt-Regel, vom Host gesetzt):
Erst-Wurf drei Stufen — Gast-frieden (sehen, gehen, sprechen), Gast-pfad (bauen/ernten unter
Modus-Regeln; alles trägt Provenance), Mitschöpfer (volle Rechte). Hausrecht: `kick`/`ban`
(peerId + optional vibePass-Key) als SOUVERÄNE Host-Gesten hinter der R2-Wand; Ban-Liste
lebt in worldMeta, das Sieb am Join prüft sie. **Beweis:** Invarianten: kick ist nicht
DSL-/p2p-erreichbar; gebannter Key kommt nicht durch den Join; Gast-Werke tragen Provenance
(Rückruf-fähig — das Immunsystem deckt Vandalismus ab, ohne Wächter-Organ).
**S-Gate:** guestRights-Default (Vorschlag: verlinkte Welten starten Gast-frieden).

### Φ3 — Das Regions-Archipel V1 (die große Welle)
**Bau:** die Welt wird räumlich in Regionen geteilt (`REGION_CHUNKS × span`, Zahlen aus Φ0;
Erst-Wurf 8×8 VOXEL-Chunks ≈ 346 m Kante — §6-Korrektur 1). Drei Stücke:
- **Besitz-Buchhaltung:** jede Region gehört zu jedem Zeitpunkt GENAU einer Blase (einem
  Regions-Raum mit eigenem Host). Unbevölkerte Regionen gehören niemandem und ruhen (heutiges
  Verhalten). Das ist die Materie-Erhaltung an der Naht: ein Chunk kann nie in zwei
  Gegenwarten gleichzeitig mutieren.
- **Naht-Handoff:** Spieler überquert die Grenze → leave Mesh A, join Mesh B (`roomId =
  worldId:regionKey`), Regional-Snapshot-Delta via dem srv-state-Tanz. Spieler-Inventar +
  Reittier reisen als EIN Bündel durch den Taille-Pfad (kein Verlust, Invariante). Sichtweite
  bleibt KLEINER als die Regionsgröße — man schaut nie in eine fremde Gegenwart; der
  Lade-Nebel (V18.164) deckt die Naht, exakt wie er heute die Ring-Kante deckt.
  **(§6-Korrektur 2: bei Weltenring-max [540 m] gilt das NICHT — Φ3 koppelt deshalb in
  bevölkerten Regionen den max-Ring an die Regionsgröße ODER wählt REGION_CHUNKS ≥ 13.)**
- **Zeit pro Blase:** jede Blase tickt ihre eigene Gegenwart (Host-Uhr); Welt-Zeit ist
  worldMeta-Konvention, Drift zwischen Blasen ist dokumentiert akzeptiert (niemand sieht zwei
  Blasen gleichzeitig).
**V1-Vermerke (ehrlich):** Kreaturen wandern NICHT über Nähte (jede Blase simuliert ihre);
Wasser/Hydrosphäre ist per-Welt deterministisch vorberechnet — naht-sicher per Konstruktion;
Fahrzeug-Fahrt über die Naht = Handoff mit gehaltener Geschwindigkeit (Korpus-Test).
**Beweis:** Antikörper-Korpus „der Naht-Tanz": Spieler + Pferd + Inventar über die Grenze,
zurück, zweimal schnell (Flacker-Schutz: Hysterese ~10 m); Ledger-Invariante: Σ Materie über
alle Regionen konstant; diag-archipel misst Handoff-ms gegen Budget.
**Damit:** 100 Blasen × 12 Peers = über tausend Menschen in EINER Welt — nie tausend in einem
Gefecht, aber tausend unter einem Himmel.

### Φ4 — Die Anwesenheits-Schicht (das Makro-Fenster wächst)
**Bau:** Broker-`stats` regional aufgelöst (Welt → Regionen → Köpfe, nur Zahlen); die
Welt-Karte zeigt „wo es leuchtet" (Blasen-Glühen ∝ Köpfe — Anwesenheit als Aura auf
Makro-Ebene: dasselbe Stigmergie-Bild eine Skala höher). Folgen: der M8-Autor-Filter bekommt
ein opt-in Presence-Ping („X ist jetzt in Welt Y [verlinkt]"). **Privatheit als Default:**
unsichtbar; Sichtbarkeit ist eine Geste pro Welt-Besuch. **Beweis:** smoke gegen echten
Broker (A sieht Bs Welt leuchten gdw. B opt-in + Welt ≥ verlinkt).

### Φ5 — Spenden-Schicht I: das Mittragen (Torrent-Modell, kaum fälschbar)
**Bau:** Besucher-Peers halten den letzten signierten Welt-Snapshot (opt-in, Größen-Budget aus
Φ0). Host abwesend → die Welt bootet vom Mitträger: das Sieb prüft Signatur + Herkunft, der
Empfänger lädt durch den EINEN Taille-Eingang (Ω macht es sicher — niemand muss dem Mitträger
GLAUBEN, nur seiner Signaturkette). Anzeige „getragen von N" auf der Portal-Karte (Replikation
= sichtbare Unsterblichkeit; je beliebter, desto unsterblicher — als Ledger-Fakt).
**Beweis:** smoke: Host fällt, Mitträger trägt, Welt identisch (Hash-Vergleich); Antikörper:
manipulierter Mitträger-Snapshot fällt am Sieb.

### Φ6 — Spenden-Schicht II: Vorberechnung + verteiltes Immunsystem
**Bau:** (a) Präcompute-Jobs (Chunk-Worldgen, Hydrosphären-Atlas, LOD-Bake) als zerlegbare,
deterministische Aufgaben: Ergebnis = signiertes Artefakt durch `_admitForeignArtifact`;
Stichproben-Nachrechnung (der Worker ist die Verify-Asymmetrie) fängt Schummler, Rückruf
bestraft sie. (b) Der Invarianten-/Playtest-Korpus als spendbarer Lauf: „lass die Antikörper
auf deiner Maschine laufen" — verteilte CI als Geschenk; die Gesundheit des Ultiversums
skaliert wörtlich mit seinen Bewohnern. **Beweis:** ein gespendetes Chunk-Artefakt ist
bit-gleich zum lokal gerechneten (Invariante); ein absichtlich falsches fällt an der
Stichprobe.

### Φ7 — (Kür) Portal-Hallen als Artefakte
Kuratierte Welt-Verzeichnisse sind BAUPLÄNE voller adressierter Portale — signiert, mit
Herkunft, durch die Bibliothek teilbar, durch Rückruf moderierbar. Kein zentraler Feed nötig:
Kuration ist selbst ein Werk. (Die Broker-Lobby bleibt das minimale „gelistet" — bewusst arm.)

## §3 — Anti-Scope: die Wände (unverhandelbar)

KEIN globaler Feed/Empfehlungs-Algorithmus (Discovery = Portale + Hallen + Lobby-Liste).
KEINE Gleichzeitigkeit jenseits des Lichtkegels (keine Relay-Server, keine Instanz-Illusion —
die Blase ist ehrlich). KEINE Rechen-Währung in V1 (Geschenk- vor Anreiz-Ökonomie: Mining-
Anreize erzeugen Arbeit-Vortäuscher und damit das adversariale Wettrüsten — erst wenn die
Spenden-Schicht sozial trägt, ist eine Kopplung überhaupt diskutierbar, als eigener S-Bogen).
KEIN zentrales Moderations-Organ (Hausrecht + Provenance + Rückruf + Quarantäne — das
Immunsystem skaliert, der Wächter nicht). Kreaturen-Naht-Wanderung, Geister-Silhouetten an
Nähten, Blasen-übergreifender Voice: Vermerke, nicht V1.

## §4 — S-Gates (Schöpfer-Entscheide, je vor der Welle)

1. **Zahlen** (nach Φ0): MAX_PEERS_PER_BUBBLE, REGION_CHUNKS, Snapshot-Budget fürs Mittragen.
2. **guestRights-Default** für verlinkte Welten (Vorschlag: Gast-frieden).
3. **Sichtbarkeits-Wording** im UI (privat/einladung/verlinkt/gelistet — die Worte prägen die Kultur).
4. **Presence-Opt-in-UX** (wie laut darf Anwesenheit sein?).
5. **Ban-Semantik** (peerId-Sitzung vs. vibePass-Key — Härtegrad des Hausrechts).

## §5 — Sequenz + Verzahnung

Φ0 + Φ1 sind klein und sofort möglich (parallel zum Fundament-Pfad des Tiefen-Audits — sie
berühren weder Licht noch Wasser noch UI). Φ2 danach (ein Nachmittag + S-Gates). **Φ3 ist die
große Welle und wartet bewusst**, bis Λ (Licht) und der UI-Puls stehen — eine Naht, die man
SIEHT, ist doppelt teuer; eine Welt, die sich nicht anfühlt wie eine, braucht keine tausend
Bewohner. Φ5 kann früh (unabhängig, sofortiger Wert), Φ6 nach Φ5, Φ7 ist Kür. In M9-Sprache:
Φ1/Φ2 = Sprosse 1 (das Netz), Φ3/Φ4 = Sprosse 2 (das Archipel), Φ5/Φ6 = Sprosse 3 (die
tragende Menge). Die Leiter wächst von unten — und jede Sprosse steht auf der Taille, nicht
neben ihr.

**Der eine Satz für CLAUDE.md nach Φ1:** „Das Welten-Netz spricht NUR durch die Taille:
Adressen, Snapshots, Spenden-Artefakte sind signierte Taille-Bürger — jeder neue Reise-Pfad
geht durch `_admitForeignArtifact`, ohne Ausnahme."

## §6 — VERIFIKATIONS-ANHANG (unabhängige Nachmessung, 12.06. abend)

Alle §1-Fundamente am Code nachgeprüft: `rooms`-Map (signaling-server.js:62) ✓ ·
**Lobby-Keim REAL** (Z64–67, `lobby-publish` Z392 — die „gelistet"-Stufe ist wirklich nur
ein Anschluss) ✓ · `roomOverride` exakt 11 Refs ✓ · `srv-state` exakt 7 ✓ · `isPortal`
exakt 12 ✓ · `hostInfo`-Struktur im Gast-Pfad (Z5424/5488) ✓ · Taille/Sieb/Identität ✓ ·
M8-stats ✓ · `_builtRingRadius` ✓. Drei ehrliche Korrekturen:

1. **Chunk-Maß:** `CHUNK_SIZE = 32` existiert (Z18303), ist aber das LEGACY-Delta-Gitter;
   das lebende Voxel-Gitter hat **span 43.2 m** (`_voxelChunkConfig`, Kommentar Z56699).
   Regionen definieren sich auf dem VOXEL-Gitter → Erst-Wurf 8×8 ≈ **346 m** Kante
   (nicht 256 m). Φ0 setzt die endgültige Zahl.
2. **Sichtweite-vs-Region:** „Weltenring max" = Ring 12 → Sichtkante ≈ **540 m** > jede
   plausible Regionskante → die Φ3-Invariante „man schaut nie in eine fremde Gegenwart"
   bräche dort. Heilung gehört in Φ3: in BEVÖLKERTEN Regionen koppelt der max-Ring an die
   Regionsgröße (die Detail-Kaskade kann das — eine Distanz, noch ein Gesicht), ODER
   REGION_CHUNKS ≥ 13. Φ0 misst beide Pfade.
3. **vibePass:** ~60 Refs (nicht 69) — nicht tragend, nur Zahlen-Hygiene.

Der Rest des Dokuments steht wie geschrieben — die Architektur-Aussagen (Web-Muster,
Lichtkegel, Trifecta, Anti-Scope) sind von der Nachmessung unberührt.

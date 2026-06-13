# DIE TAILLE — normative Spezifikation (v1)

> **Status: NORMATIV + EINGEFROREN (Ω1, 11.06.2026).** Dieses Dokument ist der Vertrag, nicht
> eine Beschreibung. MUST/MAY-Sprache. Die vier goldenen Dateien in `spec/golden/v1/` sind die
> ausführbare Form dieses Vertrags — sie werden **NIE regeneriert** (Konformanz-Band Ω4 lädt sie
> für immer; `scripts/diag-taille.cjs` prüft sie bei jedem Lauf). Wächst die Taille über diese
> eine Seite + vier Dateien + fünf Gesetze hinaus, ist DAS der Geruch des Fehlers
> (`docs/archiv/taille-plan.md` §4 — Anti-Scope).

## Die zwei Sätze (alles andere folgt aus ihnen)

1. **Der Vektor trifft die Signaturen.** Ein Artefakt reist als deskriptive Substanz (Parts ⊕
   Verbindungen ⊕ Material-Definitionen + Herkunft + Signatur). Der Empfänger rechnet jede
   BEDEUTUNG (Rolle, Kraft, Kosten, Domäne) mit seinen EIGENEN gefrorenen Signaturen.
   Behauptetes ist Metadatum, Gemessenes ist Wahrheit.
2. **Das Werk kostet, der Kreis erhält null.** Jeder Mach-Akt zahlt als reine Funktion der
   Substanz (`computeBuildCost` — es existiert keine Preistabelle). Kein Transformations-Zyklus
   ist netto-positiv (Perpetuum-Verbot, lebende Invariante Ω5).

## §1 · Die vier Draht-Artefakte

### 1a — Der Bauplan (golden: `blueprint-signed.json`)

Die signierte Substanz ist exakt die `_canonicalBlueprint`-Form:
`{ v: 1, role, parts[], connections[] }` mit `parts[i] = { shape, material, refName, color,
position{x,y,z}, size{x,y,z}, rotation{x,y,z}, opChain[{tool, op, cap}] }` und
`connections[i] = { type, partA, partB }` (Zahlen auf 4 Dezimalstellen gerundet).

- Material reist als **NAME** (String). Material-DEFINITIONEN (`{name, label, tags{}}`) reisen
  separat (Rezepte-Import); ihre Tag-Magnituden sind **Behauptung** — der Leser klemmt (§3).
- Unsigniert mitreisende Hülle: `name, label, signature, authorPubKey, signedHash, signedAt,
  provenance[], forgedPrecision, toolMeta, portalMeta` + Unbekanntes (§2).
- Tags/Stats/Kosten sind ABGELEITET und reisen **NIE** als Wahrheit.

### 1b — Das Welt-Manifest (golden: `world-manifest.json`)

Signierte Substanz = `_canonicalManifest`: `{ v: 1, id, label, dsl[] }`. Unsignierte Hülle:
`world` (Pfad), `desc`, `multiplayer`, `serverMode`, `trust`, `vendored`, `bundleHash`,
`provenance[]`. Sicherheits-Felder (`world`, `trust`, `vendored`) MÜSSEN beim Empfang lokal
sanitisiert werden — sie sind nie Vertrauens-Träger.

### 1c — Der Snapshot-KOPF (golden: `snapshot-head.json`)

Der Snapshot ist ein **lokales** Speicherformat, KEIN Reise-Artefakt — aber er TRÄGT
Reise-Artefakte (Baupläne/Materialien im `world-pull`-Bündel). Eingefroren ist sein
**Schema** (Top-Level-Schlüssel + Typen + `worldMeta`-Schlüssel): ein künftiger Build MUST
diese Schlüssel weiter produzieren (additiv wachsen erlaubt) und einen Snapshot mit nur
diesen Schlüsseln lesen. `version` ist die App-Version (Diagnose-Metadatum), **nicht** die
Schema-Version — das Schema versioniert über `snapshot-head.json` v1.

### 1d — Der p2p-Umschlag (golden: `p2p-envelopes.json`)

Jede Mesh-Nachricht MUST `type` tragen; `p2pSend` stempelt `pv` (= `PROTO_VERSION`).
Empfänger MUST unbekannte Typen still verwerfen und unbekannte FELDER bekannter Typen
ignorieren (GEMESSEN: der Kanal reicht das Original-Objekt durch — `_p2pHandleChannelMessage`
re-serialisiert `msg` vollständig). Ein künftiges Peer-RELAY (Stern-ab-6) MUST das
Original-Objekt weiterreichen, nie neu bauen.

## §2 · Die zwei Lese-Gesetze

- **must-ignore:** Unbekannte Tags/Achsen projizieren auf 0 (GEMESSEN strukturell:
  `_blueprintResonance` iteriert die SIGNATUR-Achsen — ein `x:fremd`-Tag resoniert nur, wenn
  eine lokale Signatur die Achse führt). Unbekannte Felder werden gelesen wie nicht vorhanden.
  Ein Artefakt wird wegen Unbekanntem **NIE abgelehnt**.
- **must-preserve:** Unbekannte Felder überleben jeden Round-Trip bit-gleich (ein V18-Relay
  strippt einem V25-Bauplan nicht die Zukunft). EINE Quelle: `_carryUnknown(src, dst,
  knownKeys)` (Ω2). Größen-Wand: ein unbekanntes Feld über 8 KiB JSON MAY fallen
  (Dämpfung — dokumentierter Schutz, kein stilles Strippen kleiner Zukunft).
  Sicherheits-sanitisierte BEKANNTE Felder (portalMeta, trust, world) bleiben sanitisiert —
  must-preserve gilt dem UNBEKANNTEN, nie als Umgehung einer bekannten Wand.

## §3 · Das Empfänger-Gesetz (der Empfänger ist souverän)

Kein Import-Pfad übernimmt Abgeleitetes als Wahrheit:

- `role` aus fremder Hand wird `roleClaimed` (Metadatum, reist weiter); die lokale Rolle
  emergiert (`computeBlueprintRole`). Ein fremdes `roleManual` ist ein VORSCHLAG — der lokale
  Intent-Override braucht die lokale Geste. Die Signatur-Prüfung liest `roleClaimed ?? role`
  (rückwärts-kompatibel, kein v2).
- Fremde Tag-Magnituden werden am **LESER** geklemmt (`MATERIAL_TAG_CEIL` pro Achse, frozen):
  die Substanz bleibt unangetastet (eine Welt mit höherer Decke liest die volle Pracht), aber
  diese Welt trägt nur, was sie trägt. Deckt JEDEN Eintrittsweg per Konstruktion
  (GEMESSEN Ω0: härte=10⁶ → `_architectureResistance` mineResist 6.1e6, fit→0 = Gott-Mauer).
- Jeder Artefakt-Import läuft durch **EINEN Eingang** (`_admitForeignArtifact`): Signatur-
  Status ans Artefakt, Rückruf-Sieb AM EINGANG, Provenance angehängt, Behauptung/Wahrheit
  getrennt.

## §4 · Die Versions-Regel (EINE Semantik)

- **minor = additiv:** neue Felder, neue Tags, neue Nachrichtentypen, neue Snapshot-Schlüssel.
  Leser ignorieren + bewahren. Kein Versions-Feld ändert sich.
- **major = Umdeutung eines bestehenden Feldes/einer Achse: VERBOTEN** — außer als bewusst
  geborene NEUE Taille (`v: 2` = ein neues Universum mit eigenem golden-Satz).
- Eine Tag-Achse wird **NIE umgedeutet**. Sie kann nur sterben (Gewicht 0 in allen lokalen
  Signaturen) oder geboren werden (additiv, Default 0 — alte Artefakte bleiben gültig per
  Konstruktion).
- Die drei Felder: `v` (Artefakt-Schema, golden-verankert) · `pv` (Mesh-Protokoll) ·
  `version` (App-Diagnose, KEINE Schema-Semantik). Ein Leser bei unbekannter höherer
  Version: lesen, was er kennt; bewahren, was er nicht kennt; nie ablehnen.

## §5 · Das Ledger-Gesetz

Mengen (Inventar-Stückzahlen) reisen **NIE** über die Taille — nur Definitionen (Pläne,
Material-ARTEN, Werkzeuge, Vokabular). GEMESSEN erfüllt `importRecipesFromWorld` das schon;
jetzt ist es Gesetz. Mach-Akte zahlen als Funktion der Substanz; Bau→Abbau ist nie
netto-positiv (`yieldMult ≤ 1` ✓); jeder weitere Zyklus wird Ω5-auditiert (Antikörper-Band).

## §6 · Der Namensraum (Ω6)

Nackte Tags = der eingefrorene anazh-Kern (`MATERIAL_TAG_KEYS` + Form-Achsen — Bedeutung ab
jetzt eingefroren). Präfixierte Tags (`x:…` / `<welt>:…`) = fremdes Vokabular: reist
(must-preserve), resoniert nur mit lokaler Signatur (must-ignore trägt das strukturell).
Die Signatur-TABELLEN (`FORM_ROLE_SIGNATURES`, `WORKSHOP_DOMAIN_SIGNATURES`, Gewichte,
Kosten-Konstante k) sind **WELT-LOKAL** — die Lesart, nie die Taille; jede Welt darf sie
forken, ohne irgendetwas zu brechen.

## §7 · Das Broker-Protokoll (der Leuchtturm — R-035)

> §7 DOKUMENTIERT die bestehende Drahtform des WebSocket-Brokers
> (`signaling-server.js` — die Schwester des p2p-Umschlags 1d). Es erweitert die
> Taille NICHT (Anti-Scope §0 bleibt): jeder kann seinen eigenen Leuchtturm
> betreiben (`npm run leuchtturm`), und DIESES Kapitel ist der Andock-Vertrag.

**Grundsatz: der Broker RELAYED, er besitzt nichts.** Räume + Peer-Mengen leben im
RAM (kein Persistenz-Pfad); er stempelt die `peerId` AUTHORITATIV auf jede
Relay-Nachricht (ein Client kann sich nie als anderer ausgeben); er validiert
INHALTE nicht (das Vertrauen liegt in der Client-Sandbox — dslRun/Empfänger-Gesetz),
nur FORMEN (Größen-Deckel, Typ-Checks). Er sieht **nie**: private Schlüssel (der
Vibe-Pass verlässt den Browser nicht, §0-Souveränität), Inventar-Mengen (§5) oder
dauerhaften Welt-Besitz (`world-snapshot` ist Durchreiche).

- **Client → Broker:** `join {room, peerId}` (authentifiziert den Socket; alles
  davor außer `stats`/`world-presence` wird verworfen) · Raum-Broadcasts `pos {x,y,z,yaw}` ·
  `creature-pos {list ≤64}` · `dsl {program: Array 1..256}` · `soul` · `aura` ·
  `vibe` · `companion-say` · `subworld-net` · `portal-invite` ·
  `world-request`/`world-snapshot` (Welt-Zug, Durchreiche) · adressiert
  `rtc-offer`/`rtc-answer`/`rtc-ice {to}` (WebRTC-Rendezvous) · Lobby
  `lobby-publish {label}` / `lobby-unpublish` / `lobby-list` · `stats` ·
  `world-presence {worldId}` (Φ4 — regionale Kopf-Zahlen einer Welt; nur dem Anfrager zurück).
- **Broker → Client:** `welcome {peers[], lanAddresses[]}` · `peer-join {peerId}` ·
  `peer-leave {peerId}` · die gestempelten Relays (Original-Felder + `peerId`) ·
  `lobby-rooms {rooms[{room,label,peers}]}` · `stats {rooms, peers}` ·
  `world-presence {worldId, regions[{region, peers}]}` (Φ4 — region="" für den Basis-Raum, "rRX_RZ" für eine Bubble).
- **Versions-Regel:** §4 gilt wörtlich — neue Typen sind additiv (minor); ein
  Broker MUST unbekannte Typen still verwerfen; ein Client MUST unbekannte
  Antwort-Typen ignorieren. Felder bestehender Typen werden NIE umgedeutet.
- **Betrieb:** HTTP 4312 (statisch + lokale Saves, localhost-only-POST) · WS 4313;
  TLS/wss terminiert ein Reverse-Proxy davor; TURN optional client-seitig
  (`localStorage.anazhTurn`). Englischer Spiegel: `docs/taille-spec.en.md`.

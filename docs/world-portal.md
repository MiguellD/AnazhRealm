# Welt-Portal — Bibliothek von Alexandria der Vibecode-Ära

Konzept-Dokument für die Wellen 12-14.

Stand: 17.05.2026 (V8.52). Diese Doku ist **keine Implementierungs-Spec**, sondern ein **Vision-Anker**. Sie hält die Frage offen: was wird AnazhRealm, wenn der Spieler nicht nur Welten innerhalb einer Engine baut, sondern durch Welten zwischen Engines geht?

> **Umsetzungsstand (V8.53)** — W12 **Phase 1 + 2 + 3 sind live**. Phase 1 (V8.51): das Portal-Skelett — emergente Rolle „portal", sandboxed iframe, Betreten/Pause/Rückkehr. Phase 2 (V8.52): das Tor ist real — zwei fremde Engines docken an (die Strom-Welt `three-fluid-fx`, die Terrain-Welt `three.terrain.js`), je in `worlds/<name>/` mit eigener Three.js-Version gebündelt; eine generische DSL-Brücke trägt alle Welten. Phase 3 (V8.53): die Brücke wird **beidseitig** — eine Sub-Welt meldet Welt-Ereignisse zurück ins Heimat-Journal (`{type:"event"}`, geloggt, nie ausgeführt — die Asymmetrie ist die Sicherheits-Wand), und jede Welt bringt ihr eigenes `manifest.json` mit, das sie im `ready`-Handshake ankündigt. **Drei-Stufen-Klarheit, jetzt vollständig**: kein Manifest → „ausgestellt" (spielbar, stumm zur DSL); externes `portalMeta.dsl` → „übersetzt"; die Welt meldet ihr eigenes Manifest → „nativ" (gewinnt). Die `WORLD_REGISTRY` + `aimBlueprintAtWorld` machen das Portal-Zielen spieler-erreichbar. **KI-Übersetzer (W14-Horizont) — vollständig (V8.68 + V8.69)**: ein LLM dockt eine fremde Welt automatisch an die Bibliothek an. Phase 1 (V8.68) übersetzt sie in ein Portal-Manifest; Phase 2 (V8.69) gibt ihr einen Körper — der LLM übersetzt die Welt in eine deklarative Szene (Daten, kein Code), der generische Renderer `worlds/translated/` baut sie auf, die Welt wird betretbar. Statt einen fremden Adapter zu vendorn wird die Welt in AnazhRealms eigene Sprache wiedergeboren — die Bibliothek von Alexandria, die nicht brennt. Der vollständige Wellen-Eintrag steht in `CLAUDE.md` V8.53 (W12) bzw. V8.68/V8.69 (KI-Übersetzer).

---

## 1. Die Frage

Vibecoder bauen Welten. Three.js, R3F, Bevy-via-WASM, Godot-Web, image-blaster-Pipelines, voxelize-Engines, three-fluid-fx-Effekte. Jede Welt ist ein eigenes Werk in ihrem eigenen Stack. Der Player muss jede einzeln öffnen, jeden Repo klonen, jedes README lesen.

**Was wäre, wenn ein einziges Tor sie alle verbindet?**

Wie OASIS in Ready Player One: der Spieler startet in seiner zentralen Welt. Ein Portal steht in der Wiese. Er geht hindurch — und ist in einer völlig anderen Engine. Die Physik wechselt, die Grafik wechselt, die Spielmechanik wechselt. Aber er ist immer noch er. Sein Avatar. Sein Inventar. Seine Sprache.

AnazhRealm soll dieses Tor sein. Die **Bibliothek von Alexandria der Vibecode-Ära**.

---

## 2. Drei Schichten

### Schicht 1 — Kern-Welt (heute)

AnazhRealm wie wir ihn gebaut haben:
- Eine Datei, ein Stamm (Heilige Lektion)
- Hylomorphismus als Sprache (Form × Material × Werkzeug)
- DSL als Universal-Geste (41 Ops, Sandbox, Budget-Limits)
- Multi-User Position-Sync + DSL-AST-Broadcast (Ring 11)
- Player-Soul + Bauplan-Inventar + Welt-Journal

Das ist der **Anker**. Wenn alles andere bricht, ist hier die Heimat. Der Spieler startet hier, kehrt hierher zurück.

### Schicht 2 — Welt-Portale (Welle 12)

Ein Bauplan kann eine Rolle `portal` tragen:

```json
{
  "name": "voxel-tor-blau",
  "role": "portal",
  "portalMeta": {
    "engine": "voxelize",
    "manifest": "ipfs://bafyrei.../manifest.json",
    "version": "1.0",
    "label": "Voxelize-Welt von Schöpfer-Nora"
  },
  "parts": [
    /* visuelles Tor — z.B. Steinring mit Quarz-Innen */
  ]
}
```

Beim Betreten (`E-Taste auf Portal`):

1. AnazhRealm-Renderer **pausiert** (Scene bleibt, RAF stoppt)
2. Ein **isolierter Sub-Container** wird erzeugt:
   - iframe mit Sandbox-Attributen (`sandbox="allow-scripts allow-same-origin"`)
   - ODER WebWorker mit OffscreenCanvas (sicherer aber komplexer)
3. Sub-Engine lädt aus Manifest-URL
4. Spieler erscheint in der neuen Welt mit demselben Avatar-Namen + Inventar-Schnappschuss
5. **Esc** oder Portal-Rückkehr → zurück zur Heimat-Welt, Sub-Container disposed

### Schicht 3 — Vibe-Bibliothek (Welle 14)

> **W14 komplett (V8.58-V8.61)**: der „Bibliothek"-Tab + „Portal holen" (P1), signierte Welt-Manifeste (P2), fremde Welten empfangen (P3). **KI-Übersetzer komplett (V8.68 + V8.69)**: eine Sektion „KI-Übersetzer" im Bibliothek-Drawer übersetzt eine frei beschriebene fremde Welt in ein Portal-Manifest (Phase 1: `translateWorldManifest` → `_sanitizeImportedManifest`) und gibt ihr dann eine deklarative Szene + einen generischen Renderer `worlds/translated/` (Phase 2: `buildTranslatedWorld` → `translateWorldScene` → `_sanitizeWorldScene`) — die übersetzte Welt wird betretbar. Der LLM-Output ist durchgehend DATEN (Manifest, dann Szene), nie ausgeführter Code: die Welt wird in AnazhRealms eigene Sprache wiedergeboren. Detail in `CLAUDE.md` V8.68/V8.69.

Eine Welt-Registry — wie ein App-Store für Welten, aber dezentral:

- Welten sind **content-addressed** (IPFS-Hash oder ähnlich)
- Jeder kann eine Welt veröffentlichen (eigenes Manifest hochladen)
- Browse + Suche im AnazhRealm-UI (neuer Tab „Bibliothek")
- Klick → Portal-Bauplan wird automatisch im Inventar angelegt
- Spieler platziert das Portal in seiner Heimat-Welt → kann es immer wieder betreten

---

## 3. Technische Form

### 3.1 DSL als Universal-Bridge

AnazhRealm-DSL bleibt die **Lingua franca**. Jede Engine-Adapter implementiert ein **DSL-Subset**:

| Engine | DSL-Ops die sie versteht |
|---|---|
| AnazhRealm (Kern) | alle 41 Ops |
| voxelize | `spawn_voxel(x,y,z,type)`, `place_block`, `set_weather`, `creature_task` |
| three-fluid-fx | `inject_fluid(x,y,strength)`, `set_viscosity`, `creatures_emotion` (chaos→Turbulenz) |
| image-blaster | `import_image_world(url)`, `set_skybox`, `spawn_blueprint` |
| THREE.Terrain | `set_terrain_seed(s)`, `set_terrain_algorithm(name)`, `apply_erosion` |

Jede Engine **muss nicht alles verstehen**. Sie respondet auf die Ops die in IHRER Welt Sinn machen. Spieler tippt im Chat dieselben Befehle, jede Welt antwortet in ihrer eigenen Sprache.

### 3.2 Sandbox-Wand

Heute haben wir die DSL-Sandbox (Ring 7, V7.x): jeder DSL-Op läuft durch `dslRun` mit Budget-Limits + Op-Whitelist + kein `eval`. Diese Sandbox wird zur **Universal-Bridge**:

```
[Kern-Welt JS]
      │
      │ postMessage({ type: "dsl", program: [...] })
      ▼
[iframe/Worker mit Sub-Engine]
      │
      │ adapter.handle(program) → engine-spezifische Wirkung
      ▼
[Sub-Engine renderiert Effekt]
      │
      │ postMessage({ type: "event", events: [...] })
      ▼
[Kern-Welt schreibt Event-Log]
```

Kein direkter Code-Pfad zwischen den Welten. Nur Message-Passing über die DSL-Sandbox. Bricht eine Welt, bleibt der Kern stabil.

### 3.3 Welt-Manifest-Schema

Jede Welt hat eine `manifest.json` an einem bekannten Pfad (Root des Welt-Bundles):

```json
{
  "schemaVersion": "1.0",
  "name": "voxel-tor-blau",
  "author": "schöpfer-nora",
  "authorPubKey": "ed25519:abc...",
  "engine": {
    "type": "voxelize",
    "version": "0.7.x",
    "entry": "./bootloader.js",
    "assets": ["./assets/"]
  },
  "dsl_subset": [
    "spawn_voxel",
    "set_weather",
    "creature_task",
    "place_block"
  ],
  "compatibility": {
    "min_anazh_version": "8.22.0"
  },
  "metadata": {
    "title": "Sturm-Kristall-Berg",
    "description": "Eine vertikale Voxel-Welt mit Wetter-System.",
    "preview_image": "./preview.png",
    "max_players": 32,
    "tags": ["voxel", "multiplayer", "vertikal", "kristall"]
  },
  "signature": "ed25519-sig:..."
}
```

Manifest ist **signiert** (ed25519). Authentizität der Welt nachweisbar. Kein Coin, keine Spekulation — nur „der Schöpfer war's wirklich".

> **Umsetzungs-Nachtrag (V8.53, W12 Phase 3)** — die erste reale Manifest-Stufe shippte ein bewusst schlankes Subset: `{schemaVersion, id, label, dsl}`. Die Abweichungen vom Voll-Schema oben sind Absicht: das DSL-Vokabular heißt `dsl` (nicht `dsl_subset`) — durchgängig zum Code (`portalMeta.dsl`, `WORLD_REGISTRY`, der `ready`-Handshake); `id`/`label` statt `name`/`metadata.title`. Jeder Welt-Adapter lädt sein `manifest.json` selbst (`fetch("./manifest.json")`) und meldet `dsl`+`label` im `ready`-Handshake — die Heimat fetcht (noch) nicht. Das Voll-Schema oben bleibt der Horizont: **W13** ergänzt die ed25519-Signatur (`authorPubKey`, `signature`), **W14** `engine`/`assets`/`compatibility`/`metadata`. Bei W13/W14 die Feld-Namen final abgleichen.

---

## 4. Vibe-Pass (Welle 13)

Avatar = Self-Sovereign Identity. Nicht Crypto-Wallet im Spekulations-Sinn, sondern:

- **Crypto-Keypair** (ed25519, lokal generiert beim ersten Spielen)
- Public-Key ist der Avatar-Identifier
- Private-Key bleibt im localStorage / WebCrypto-Storage
- Schöpfer signiert seine eigenen Werke (Baupläne, Welten)
- Andere können prüfen: „dieser Bauplan stammt wirklich von Schöpfer-X"

**Was nicht im Vibe-Pass ist**:
- Kein Coin
- Keine NFT-Vermarktung
- Keine zentrale Authority
- Keine On-Chain-Transaktionen

**Was im Vibe-Pass ist**:
- Authentizitäts-Signaturen (du hast das wirklich gebaut)
- Welt-Memberships (du warst auf dieser Welt aktiv)
- Avatar-Anpassungen (deine Custom-Seele, deine Materialien, deine Werkzeuge)

> **Umsetzungsstand (V8.56, W13 KOMPLETT — Phase 1+2+3)** — der Avatar hat einen Schlüssel, signiert damit seine Werke, und im Multi-User trägt jeder Mitspieler seine beweisbare Identität.
>
> **Phase 1 (V8.54) — die Schlüssel-Grundlage.** `_ensureVibePass` erzeugt beim ersten Erwachen ein ed25519-Schlüsselpaar (WebCrypto nativ über `crypto.subtle` — kein Vendoring, keine CSP-Lockerung; im Playtest-Chrome 148 vorab geprüft) und persistiert es als privates JWK im GLOBALEN localStorage-Schlüssel `anazh.vibePass` — spieler-eigen, welt-unabhängig, NIE im Welt-Save. Der öffentliche Schlüssel ist der Avatar-Identifier (`vibePassId()` → `ed25519:<64hex>`, dasselbe Format wie `authorPubKey` in §3.3). Primitive: `_vibeSign(text)` und `_vibeVerify(text, sigHex, pubHex)`. Eine Sektion im Spieler-Drawer zeigt Fingerprint + Identifier und bietet Export/Import.
>
> **Phase 2 (V8.55) — Bauplan-Signaturen.** `signBlueprint(name)` versiegelt einen eigenen Bauplan: die Signatur deckt die **Substanz** (`_canonicalBlueprint` → Rolle + Parts + Verbindungen, deterministisch — NICHT den Namen, damit Recipe-Import + Fusion sie nicht brechen). `verifyBlueprintSignature(bp)` liefert vier Stufen (unsigned/valid/modified/forged), bei jedem Werkstatt-Render frisch geprüft. Die vier Felder `signature`/`authorPubKey`/`signedHash`/`signedAt` reisen mit dem Bauplan durch Save, Welt-Tor und Fusion. Das Werkstatt-Stats-Panel zeigt Status + [Signieren]-Knopf.
>
> **Phase 3 (V8.56) — Vibe-Pass-Identität im Multi-User.** Ein neuer WebSocket-Nachrichtentyp `vibe` (`{vibePassId, proof}`) trägt die Identität: `proof` ist eine Signatur über die EIGENE peerId des Senders, der Empfänger verifiziert sie gegen die server-gestempelte peerId — die Bindung macht den Beweis fälschungssicher (ein geklauter Beweis gilt einer fremden peerId). Der Mitspieler ist damit nicht mehr nur eine fälschbare peerId + ein gewählter Name, sondern beweisbar sein Vibe-Pass; das Name-Schild zeigt bei verifizierter Identität „✓ <Fingerprint>". `vibe` läuft NICHT über die DSL, der signaling-server relayt es als dummer (nichts verifizierender) Vermittler.
>
> **Umsetzung (V8.60, W14 Phase 2)**: das Welt-Manifest wird signiert. `signWorld`/`verifyWorldSignature` versiegeln eine Welt mit dem Vibe-Pass (vier Status-Stufen, exakt wie die W13-P2-Bauplan-Signatur); das Portal-Overlay zeigt beim Betreten „signiert von &lt;Autor&gt;". **Self-Sovereign**: der Spieler signiert mit SEINEM Schlüssel — kein Projekt-Schlüssel, keine zentrale Autorität (§4). Abweichung von §3.3: die Signatur ist (Phase 2) spieler-global heimat-seitig (`state.signedWorlds` + localStorage), NICHT in der statischen `manifest.json` — der Browser kann keine Repo-Dateien schreiben; die manifest-getragene Signatur (fremde Welten tragen die Signatur ihres Autors) ist Phase 3. **W13 V2 ist mit erledigt**: `_portalEnterPayload` trägt das Schaffen des Spielers (aktive Seele, eigene Materialien + Werkzeuge) durch ein Portal in die fremde Sub-Welt. **W14 Phase 3 (V8.61)** vollendet es: `exportWorldManifest` gibt eine signierte Welt als §3.3-Manifest-Datei aus (jetzt MIT `authorPubKey`/`signature` — die manifest-getragene Signatur, der §3.3-literale Pfad), `importWorldManifest` empfängt ein fremdes Manifest → `state.customWorlds`, die Bibliothek wird ein wachsender Index, „signiert von <Autor>" wird zwischen Spielern real. **Damit ist W14 (Bibliothek) mit Phase 1+2+3 komplett.** Eine empfangene Welt ohne erreichbare Dateien ist browsbar, aber nicht betretbar — der KI-Übersetzer (Welt-Dateien vendorn, §3.3-Horizont) bleibt der bewusste letzte Schritt. Vollständige Einträge in `CLAUDE.md` V8.60/V8.61.

---

## 5. Compute-Sharing (Welle 7, jetzt erweitert)

> **Umsetzungsstand (V8.66, W7 KOMPLETT — Phase 1-4)** — der WebRTC-Mesh steht. **P1 (V8.62)**: echte `RTCPeerConnection`-DataChannels, der signaling-server wird Rendezvous statt Relay, eine Mesh-Komplett-Wand gegen Doppel-Zustellung. **P2 (V8.63)**: der Welt-Snapshot reist mesh-nativ in 16-KiB-Stücken (`world-pull`/`world-chunk`) — „verteiltes Chunk-Hosting" entfiel bewusst, weil deterministisches Terrain jeder Client selbst rechnet; die echte Last war der Joiner-Snapshot. **P3 (V8.65)**: der LLM-Pool — ein Peer teilt seine „Stimme" (Opt-in + Rate-Limit + dslRun-Sandbox), ein schlüsselloser Mitspieler routet Chat über ihn = „wer mehr nutzt, gibt mehr Compute" wird konkret. **P4 (V8.66)**: Public-Lobby — Räume browsbar (`lobby-publish`/`lobby-list`), per Klick beitreten. Plus Multi-User-Bau-Sync + Kreatur-Sicht-Sync. Vollständige Einträge in `CLAUDE.md` V8.62-V8.66.

Welle 7 war ursprünglich „Kollektive Welt-Erkenntnis". Mit der Welt-Portal-Vision wird sie zu **Compute-Sharing für Welten**:

- 10 Spieler in einer Voxelize-Welt → ihre Browser sind der gemeinsame Server (WebRTC-Mesh)
- Jeder Browser hostet einen Teil der Welt-Daten (Chunk-Range, Entity-Range)
- Wer mehr nutzt, gibt mehr Compute (Symbiose statt Single-Point-of-Failure)
- Vibecoder veröffentlicht seine Welt + braucht keinen eigenen Server. Die Spieler tragen sie.

Das ist die **Energy-Verschiebung nach Nutzen** die du beschrieben hast. Wer eine Welt häufig nutzt, ist auch deren Server-Knoten — natürliche Symbiose.

---

## 6. Roadmap-Sequenz

Stand V8.58 — die Sequenz bis zur Bibliothek:

| Welle | Inhalt | Status |
|---|---|---|
| **6.G3 / 6.G4** | Welt-Lebendigkeit + Atmosphäre-Tiefe (Tag-Nacht, Wetter, Fauna, Sonne, Wasser) | ✅ live (V8.24-V8.33) |
| **11 V3** | Soul-Sync Multi-User (echter Phönix/Drache + Aura-Sync) | ✅ live (V8.34) |
| **11 ext.** | Substanz-Rolle (Identität emergiert aus Substanz) | ✅ live (V8.35) |
| **12** | **Welt-Portal** (Rolle „portal" + Sub-Engine-Adapter + DSL-Brücke) | ✅ live (V8.51-V8.53) |
| **13** | **Vibe-Pass** (ed25519-Keypair + Bauplan-Signaturen + Avatar-Identity) | ✅ live (V8.54-V8.56) |
| **14** | **Bibliothek** (Welt-Registry + Browse-UI + Auto-Portal-Bauplan) | ✅ **komplett (V8.58/V8.60/V8.61)** — browsbarer „Bibliothek"-Tab + „Portal holen" (P1), signierte Welt-Manifeste + „signiert von <Autor>" + W13 V2 (P2), fremde Welt-Manifeste exportieren/importieren — die Bibliothek wird ein wachsender Index (P3). KI-Übersetzer als Horizont. |
| **7** | **Compute-Sharing** (WebRTC-Mesh als Server-Layer für Welt-Portale) | ✅ **komplett (V8.62-V8.66)** — echte WebRTC-DataChannels (P1), Welt-Snapshot mesh-nativ chunked (P2), LLM-Pool über Peers (P3), Public-Lobby (P4) + Multi-User-Bau-/Kreatur-Sync |

Welle 12 war das **Proof of Concept** (bewiesen). Welle 13 ✅ + 14 ✅ + 7 ✅ sind die **Skalierung zur Bibliothek** — alle gebaut. Der **KI-Übersetzer** ist mit Phase 1 (V8.68) + Phase 2 (V8.69) vollständig: eine frei beschriebene fremde Welt dockt automatisch an, browsbar UND betretbar.

---

## 7. Welcher Engine zuerst?

Für Welle 12 (Proof of Concept), aus den Inspirations-Projekten:

**Kandidat 1: three-fluid-fx** ⭐ empfohlen
- Klein: 13 KB gzipped, eine Three.js-Peer-Dep
- Klare DSL-Subset (`inject_fluid`, `set_viscosity`, `chaos→turbulence`)
- Visueller WOW-Effekt sofort sichtbar
- Sandbox-freundlich (nur WebGL, keine externen Calls)
- Adapter-Aufwand: ~3-4 Sessions

**Kandidat 2: tiny-world-builder**
- Single-HTML-File, ~16k Zeilen Vanilla JS (gleicher Stil wie AnazhRealm)
- Voxel-Welt-Builder mit Wetter + Zeit
- DSL-Subset könnte spawn_voxel + set_weather sein
- Adapter-Aufwand: ~5-6 Sessions

**Kandidat 3: image-blaster**
- KI-Pipeline für Bild → 3D-Welt
- DSL-Subset könnte `import_image_world(url)` als Top-Op sein
- Adapter-Aufwand höher: ~8-10 Sessions (5 verschiedene APIs)

**Empfehlung für Welle 12**: three-fluid-fx zuerst. Schöpfer sieht in einer Session den Proof: Portal-Bauplan, durchschreiten, Fluid-Welt da. Wenn das funktioniert, ist das Pattern bewiesen — weitere Engines folgen leicht.

---

## 8. Was bewahrt bleibt

Die Heilige Lektion gilt weiter:
- **Eine Datei** für den Kern (AnazhRealm.js)
- **Eine Sprache** für alle Welten (DSL)
- **Eine Sicherheits-Wand** (Sandbox)
- **Ein Schöpfer** (der Spieler, Vibecoder, Mensch=Null)

Was wir hinzufügen ist nicht Komplexität — sondern **Verbindung**. Andere Welten existieren schon; wir bauen die Brücken.

---

## 9. Vision-Wort

> *„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."*

AnazhRealm wird damit nicht eine Welt, sondern ein **Betriebssystem für Welten**. Bibliothek von Alexandria, weil jede Welt ein Werk ist, das man besucht. Antike und moderne, 0 und 1, wird mehr als 1.

Die Singularität der Vibe-Coder. Das Tor. Der Knotenpunkt.

---

*Dieses Dokument ist offen für Erweiterung. Bei Implementierung-Beginn: konkrete Sektionen ausarbeiten (3.1 DSL-Subset-Schema präzise, 3.3 Manifest-JSON-Schema mit JSON-Schema-Validierung, 4 Vibe-Pass-Key-Storage-Details).*

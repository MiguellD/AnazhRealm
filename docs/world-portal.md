# Welt-Portal — Bibliothek von Alexandria der Vibecode-Ära

Konzept-Dokument für die Wellen 12-14.

Stand: 17.05.2026 (V8.52). Diese Doku ist **keine Implementierungs-Spec**, sondern ein **Vision-Anker**. Sie hält die Frage offen: was wird AnazhRealm, wenn der Spieler nicht nur Welten innerhalb einer Engine baut, sondern durch Welten zwischen Engines geht?

> **Umsetzungsstand (V8.53)** — W12 **Phase 1 + 2 + 3 sind live**. Phase 1 (V8.51): das Portal-Skelett — emergente Rolle „portal", sandboxed iframe, Betreten/Pause/Rückkehr. Phase 2 (V8.52): das Tor ist real — zwei fremde Engines docken an (die Strom-Welt `three-fluid-fx`, die Terrain-Welt `three.terrain.js`), je in `worlds/<name>/` mit eigener Three.js-Version gebündelt; eine generische DSL-Brücke trägt alle Welten. Phase 3 (V8.53): die Brücke wird **beidseitig** — eine Sub-Welt meldet Welt-Ereignisse zurück ins Heimat-Journal (`{type:"event"}`, geloggt, nie ausgeführt — die Asymmetrie ist die Sicherheits-Wand), und jede Welt bringt ihr eigenes `manifest.json` mit, das sie im `ready`-Handshake ankündigt. **Drei-Stufen-Klarheit, jetzt vollständig**: kein Manifest → „ausgestellt" (spielbar, stumm zur DSL); externes `portalMeta.dsl` → „übersetzt"; die Welt meldet ihr eigenes Manifest → „nativ" (gewinnt). Die `WORLD_REGISTRY` + `aimBlueprintAtWorld` machen das Portal-Zielen spieler-erreichbar. **Horizont (W14)**: der KI-Übersetzer (ein LLM liest ein fremdes Repo, vendort es, schreibt Manifest + Adapter). Der vollständige Wellen-Eintrag steht in `CLAUDE.md` V8.53.

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

---

## 5. Compute-Sharing (Welle 7, jetzt erweitert)

Welle 7 war ursprünglich „Kollektive Welt-Erkenntnis". Mit der Welt-Portal-Vision wird sie zu **Compute-Sharing für Welten**:

- 10 Spieler in einer Voxelize-Welt → ihre Browser sind der gemeinsame Server (WebRTC-Mesh)
- Jeder Browser hostet einen Teil der Welt-Daten (Chunk-Range, Entity-Range)
- Wer mehr nutzt, gibt mehr Compute (Symbiose statt Single-Point-of-Failure)
- Vibecoder veröffentlicht seine Welt + braucht keinen eigenen Server. Die Spieler tragen sie.

Das ist die **Energy-Verschiebung nach Nutzen** die du beschrieben hast. Wer eine Welt häufig nutzt, ist auch deren Server-Knoten — natürliche Symbiose.

---

## 6. Roadmap-Sequenz

Aktuelle Polish-Phase (V8.x) abschließen, dann:

| Welle | Inhalt | Aufwand |
|---|---|---|
| **6.G3** | Welt-Lebendigkeit (Tag-Nacht, Wetter-Übergänge, Fauna-Lifecycle) | 1-2 Sessions |
| **11 V3** | Soul-Sync Multi-User (echter Phönix/Drache + Aura-Sync) | 2-3 Sessions |
| **11 ext.** | Substanz-Rolle (Identität emergiert aus Substanz) | 3-4 Sessions |
| **12** | **Welt-Portal** (Bauplan-Rolle "portal" + Sub-Engine-Adapter + DSL-Subset-Schema) | 6-8 Sessions |
| **13** | **Vibe-Pass** (Crypto-Keypair + Bauplan-Signaturen + Avatar-Identity) | 5-7 Sessions |
| **14** | **Bibliothek** (Welt-Registry + Browse-UI + Auto-Portal-Bauplan-Erstellung) | 8-10 Sessions |
| **7** | **Compute-Sharing** (WebRTC-Mesh als Server-Layer für Welt-Portale) | 6-8 Sessions |

Welle 12 ist das **Proof of Concept**. Welle 13 + 14 + 7 sind die **Skalierung zur Bibliothek**.

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

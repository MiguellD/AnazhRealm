# W18 — In fremden Welten LEBEN (allein oder gemeinsam)

> **STATUS: GEBAUT (V18.144–.146, 11.06.2026) — der Bogen ist RUND.** W18-A+B
> (Ko-Präsenz-Injektion + Tier-Wahrheit; `worlds/begegnung/` als erste deklarierte
> Ko-Präsenz-Welt) · W18-C (Input-Brücke, Variante A) · W18-D (Wohnen + Boot-Rückkehr
> + „wohnt in …" übers Mesh + Persistenz-Slot). End-to-End-Beweis:
> `npm run smoke:copresence` (zwei echte Browser — „Anna erschien neben dir im
> Begegnungs-Feld" durch die null-origin-Wand; B lädt neu und wacht IN der
> Fremd-Welt auf). Benannt-fern bleibt nur der Übersetzer-Avatar-Hook (§5.2 Weg 2,
> fragil je Engine — der ehrliche Fallback ist der Vorraum) + Input-Variante B.

**Arc-Plan, 01.06.2026.** Der nächste große Bogen NACH dem vollendeten DSL-Weltregeln-Bogen
(V17.33–.40). Dies ist die Vertiefung des **Fremd-Engine-Bogens** (W12–W17) zu seiner
eigentlichen Vision: nicht nur eine fremde Welt *besuchen*, sondern in ihr **umfänglich
teilnehmen** — allein aus einer privaten Welt, ODER gemeinsam mit Freunden aus demselben
Mesh-Raum — und darin **leben** (swappen, bleiben, mit der eigenen Identität).

> **Vor dieser Arbeit ZUERST lesen:** `docs/world-portal.md` (der W12-Vision-Anker) +
> `docs/roadmap.md` §3 „Der Fremd-Engine-Bogen (W15–W17)" (die Fünf-Schichten-Tabelle +
> die Server-Taxonomie + das Gruppen-Portal). Dieser Plan baut darauf auf, er ersetzt es nicht.

---

## 1. Die Frage (der Schöpfer, 01.06.2026)

> „Mit den Portalen kann man GitHub-Welten / andere Systeme integrieren. Kann ich in eine
> Welt wie [hallucinate](https://github.com/stagas/hallucinate) **über AnazhRealm joinen**
> — evtl. direkt mit ein paar **Freunden aus dem gleichen Multiplayer-Server**, oder
> **allein aus einer privaten Welt**? Kann man **umfänglich teilnehmen**? Ist es möglich,
> in andere Welten zu **swappen und zu leben**?"

Die ehrliche Kurzantwort, gemessen am heutigen Code: **teils ja, teils noch nicht — und der
Unterschied hängt an EINER Frage: hat die fremde Welt selbst einen Multiplayer-Begriff?**
Dieser Plan macht den „teils noch nicht"-Teil zur genialen, verdichtenden Lösung.

---

## 1.5 Das Erlebnis — aus Spieler-Sicht ZUERST (nicht die Klempnerei)

Dieser Plan ist KEINE Netz-Architektur mit einem Spieler-Anhang — er ist ein GEFÜHL, dem die
Technik dient. Das Gefühl ist OASIS: **„ich bin überall noch ICH, mit meinen Leuten."** Drei
Momente, an denen jede technische Entscheidung gemessen wird:

- **Allein.** Ich stehe in MEINER stillen Welt. Ein Portal schimmert in der Wiese. Ich gehe
  hindurch — Physik, Grafik, Mechanik wechseln, aber ich bin noch ich: mein Avatar, meine
  Seele, mein Werkzeug. Ich treibe durch hallucinates Shader-Sturm. Esc — und ich bin daheim,
  als wäre ich nie weg gewesen. *(Das fühlt sich heute schon so an — Stufe 0.)*
- **Gemeinsam.** Ich bin mit drei Freunden in unserem Mesh-Raum. Ich gehe zum Portal; sie
  bekommen „Anna öffnet ein Tor nach hallucinate — mitkommen?". Sie sagen ja. Wir treten
  ZUSAMMEN hindurch — und **wir sehen einander** in hallucinate treiben, als unsere Avatare,
  obwohl hallucinate nie wusste, was ein „Freund" ist. Wir deuten auf Dinge, lachen, gehen
  zusammen wieder. *(DAS ist der W18-Zauber — Stufe 2, der Kern, §5.)*
- **Leben.** Ich besuche nicht nur — ich BLEIBE. hallucinate wird vorübergehend mein Zuhause;
  meine Freunde finden mich dort („Anna wohnt gerade in hallucinate"); ich kehre dorthin
  zurück, nicht in die alte Heimat. *(Stufe 4, die Krone, §7.)*

Jede Phase unten muss einen dieser Momente näher bringen. Tut sie das nicht, ist sie Klempnerei
ohne Seele und gehört gestrichen.

### Leitprinzip: NIE pro-Welt hardcoden (die Heilige Lektion, eine Ebene höher)

hallucinate ist nur das HEUTIGE Beispiel — **kein Mechanismus dieses Plans darf eine einzelne
Welt kennen.** Alles ist welt-AGNOSTISCH: das Ko-Präsenz-Protokoll trägt generische Posen (nicht
hallucinate-Felder); die Tier-Erkennung liest das Manifest (W17 `serverMode`/`multiplayer`); der
Avatar-Hook wird ENTWEDER von der Welt deklariert ODER vom KI-Übersetzer für eine BELIEBIGE
three.js-Welt geschrieben (Introspektion, kein Sonderfall) ODER fällt auf den universellen Vorraum
zurück. Derselbe Pfad trägt die nächsten 1000 Welten ohne Handarbeit (der Auto-Vendor-Geist, W15).
**Ein `if (world === "hallucinate")` wäre die Sünde** — das verkleidete Parallel-System, eine
Ebene über der Heiligen Lektion. Wenn ein Schritt nur für eine Welt funktioniert, ist er falsch
gebaut.

---

## 2. Was HEUTE steht (das Fundament — W12–W17)

Der Fremd-Engine-Bogen ist im Kern gebaut. Die **fünf Schichten** (roadmap §3), jede additiv:

| Schicht | Was | Stand |
| --- | --- | --- |
| 0 — Sandbox | null-origin-iframe: fremder Code läuft VOLL (Physik/WebGL/WASM), kann AnazhRealm nicht berühren | ✅ V8.70 |
| 1 — DSL-Brücke | der Befehls-Kanal (postMessage, JSON, asymmetrisch); `{type:"enter"}` trägt die Identität HINEIN, `{type:"event"}` Welt-Ereignisse zurück | ✅ W12 |
| 2 — Transport-Shim | die Netz-APIs der Welt (`WebSocket` …) werden umgeleitet → AnazhRealms Mesh statt eines echten Servers | ✅ V8.75 (`WebSocket`) |
| 3 — Mesh-als-Server | das W7-Mesh trägt den Verkehr; ein Peer hostet die Server-Logik (Relay ODER JS-Compute) | ✅ V8.76/.79/.80 |
| 4 — Gruppen-Portal | eine Gruppe tritt gemeinsam durch ein Tor, teilt den Mesh-Raum der Sub-Welt | ✅ V8.77 |

**Was die Identität betrifft (schon gelöst):** `_portalEnterPayload` schickt beim Eintritt
Name, Vibe-Pass (ed25519), die aktive Seele (Form/bodyParts), eigene Materialien + Werkzeuge
in die Sub-Welt (W13 V2). **Dein Avatar + dein Schaffen reisen durch das Tor.**

**Was die Gruppe betrifft (schon angelegt, roadmap §3 Phase C):** öffnet ein Mesh-Peer ein
Portal, bekommen die anderen einen Prompt „X öffnete ein Tor nach <Welt> — mitkommen?".
Sagen sie ja, betritt jeder sein eigenes Portal-iframe; die iframes sind über das Mesh
verbunden. Die Doku hielt schon damals den Kern-Satz fest: **„‚Meta' (man sieht sich als
AnazhRealm-Avatare im Vorraum) UND ‚direkt' (man ist zusammen IN der fremden Engine) — je
nachdem, was die Welt zulässt."** Genau dieses „je nachdem" ist der W18-Kern.

---

## 3. Die ehrliche Lücken-Analyse — die VIER Teilnahme-Stufen

„Umfänglich teilnehmen" ist kein Schalter, sondern ein Spektrum. Eine fremde Welt erlaubt
so viel Teilnahme, wie ihre Natur + die Schicht es trägt:

### Stufe 0 — Solo-Besuch ✅ (heute)
Du gehst (allein, aus einer privaten Welt) durch ein Portal in hallucinate. Die echte Engine
läuft sandboxed, voll spielbar mit IHREN Controls, Esc kehrt heim, deine Identität ist
HINEINgereicht. **Das funktioniert heute vollständig.** Für eine reine Erfahrungs-Welt
(ein Shader-Trip wie hallucinate) ist das oft schon „umfänglich".

### Stufe 1 — Ko-Präsenz in einer MULTIPLAYER-fähigen Fremdwelt ✅ (W17, heute)
Hat die Fremdwelt selbst einen Multiplayer-Begriff (einen `WebSocket`-Server, der Positionen
relayt), dann macht der **Transport-Shim + Mesh-als-Server** das Mesh ZUM Server: die Gruppe
spielt die fremde Welt zusammen, **sieht sich gegenseitig über deren EIGENE Multiplayer-
Logik**, ohne dass je ein echter Server läuft. Das ist gebaut (W17 B-Relay/B-Compute).

### Stufe 2 — Ko-Präsenz in einer SINGLE-PLAYER-Fremdwelt ⏳ (DIE W18-Lücke)
hallucinate (vermutlich) und die meisten GitHub-three.js-Welten sind **single-player** — sie
haben keinen Begriff von „anderen Spielern". Gehen Freunde gemeinsam hinein, sieht **jeder
seine EIGENE Instanz**, niemand den anderen. Ko-Präsenz scheitert nicht an der Sandbox oder
am Mesh (beide stehen) — sondern daran, dass die Welt KEINE Avatare anderer rendern kann.
**Das ist die eigentliche W18-Aufgabe: AnazhRealm muss die Multiplayer-SCHICHT für eine
Welt sein, die selbst keine hat.** (Lösung in §5.)

### Stufe 3 — Mit DEINEN Controls (die Input-Brücke) ⏳ (W18, kleiner)
Heute spielst du die Fremdwelt mit IHREN Tasten (das iframe hat Fokus → Tastatur/Maus gehen
an die fremde Engine). „Spielbar mit deinen AnazhRealm-Controls" ist die Input-Brücke
(Schicht 5) — eher Komfort als Kern, aber Teil von „umfänglich". (Lösung in §6.)

### Stufe 4 — Darin LEBEN (swappen, bleiben, persistent) ⏳ (W18, die Krone)
„In eine Welt swappen und leben" heißt mehr als besuchen: die Fremdwelt wird (zeitweise)
deine BASIS — du kehrst dorthin zurück statt in die Heimat, dein Zustand dort bleibt, deine
Freunde finden dich dort. Heute ist das Portal eine *Episode* (Heimat friert ein, du kehrst
zurück); „leben" braucht einen **Swap des aktiven Welt-Zeigers** + Persistenz. (Lösung in §7.)

---

## 4. Die konkreten Szenarien des Schöpfers — heute vs. mit W18

| Szenario | Heute | Mit W18 |
| --- | --- | --- |
| **Allein, aus privater Welt → hallucinate** | ✅ Stufe 0: voll spielbar, Identität reist mit | + Input-Brücke (deine Controls), + „leben" (bleiben/persistent) |
| **Mit Freunden (gleicher Mesh-Raum) → eine MULTIPLAYER-Fremdwelt** | ✅ Stufe 1: zusammen drin, seht euch (deren MP übers Mesh) | + Auto-Join-UX, + Input-Brücke |
| **Mit Freunden → eine SINGLE-PLAYER-Fremdwelt (hallucinate)** | ⚠️ jeder in eigener Instanz; Ko-Präsenz nur im AnazhRealm-Vorraum | ✅ Stufe 2: Ko-Präsenz INJIZIERT — ihr seht euch IN hallucinate (§5) |
| **In eine Welt swappen + dort leben** | ⚠️ Episode (Heimat friert ein, Rückkehr) | ✅ Stufe 4: Swap des aktiven Welt-Zeigers + Persistenz (§7) |

**Die Erkenntnis:** das Fundament (Sandbox, Mesh, Gruppen-Portal, Identitäts-Transport) steht.
Die TIEFE, die fehlt, ist **die Ko-Präsenz in Welten, die selbst keine kennen** — und das ist
genau der Punkt, an dem AnazhRealm sein einzigartiges Pfund ausspielt: es IST bereits ein
Mesh + eine Identitäts-Schicht. Es muss diese nur in die Fremdwelt INJIZIEREN.

---

## 5. Der Kern von W18 — die Ko-Präsenz-Injektion (Stufe 2)

**Das Problem:** eine single-player-Fremdwelt kann andere Spieler nicht rendern, weil sie das
Konzept nicht hat. AnazhRealm kontrolliert ihren Render-Loop nicht (Sandbox).

**Die Profi-Lösung (Trennung der Belange — wie alle Metaverse-Interop-Systeme):** AnazhRealm
liefert die **Netz-FABRIC** (das Mesh trägt die Peer-Zustände — das hat es schon, W7), die
Fremdwelt liefert das **RENDERN** (sie weiß, wie ein Avatar in IHRER Engine aussieht). Dazwischen
ein **winziges deklariertes Protokoll** über die bestehende postMessage-DSL-Brücke. Die Welt
schreibt KEIN Networking — sie implementiert nur drei Callbacks.

### 5.1 Das Ko-Präsenz-Protokoll (über die bestehende Brücke, additiv)
AnazhRealm postet dem iframe (zusätzlich zu `{type:"enter"}`):
- `{type:"peer-join", peerId, name, soul}` — ein Freund betritt dieselbe Sub-Welt.
- `{type:"peer-state", peerId, pose}` — seine Position/Blickrichtung/Geste (gedrosselt, ~10 Hz, aus dem Mesh).
- `{type:"peer-leave", peerId}` — er geht.

Die Fremdwelt (wenn sie das Protokoll deklariert) reagiert in IHRER Engine: spawnt ein
Avatar-Mesh, bewegt es, entfernt es. AnazhRealm wiederum nimmt die LOKALE Spieler-Pose aus dem
iframe (die Welt postet `{type:"local-pose", pose}`) und broadcastet sie übers Mesh — exakt
der Transport-Shim-Gedanke (V8.75), nur für Posen statt `WebSocket`-Bytes. **Verdichtung:**
das ist dieselbe `_portalNetReceive`/Mesh-Relay-Maschinerie, ein neuer Envelope-`kind`.

### 5.2 Wer implementiert das Avatar-Rendern?
Drei Wege, gestaffelt nach Aufwand — die Welt nutzt den, der passt (dieselbe Drei-Stufen-
Klarheit wie das Manifest in W12):
1. **Die Welt deklariert es selbst** (ein kooperativer Vibecoder schreibt die 3 Callbacks in
   sein Manifest/seinen Entry) → volle native Ko-Präsenz. Selten, aber der Goldstandard.
2. **Der KI-Übersetzer schreibt den Hook** (W14-Translator erweitert): beim Vendorn einer
   Welt erkennt das LLM die Engine (three.js-Szene, Kamera, Scene-Graph) und INJIZIERT einen
   kleinen Avatar-Adapter (ein simples Mesh pro Peer, an der gemeldeten Pose). Das ist der
   geniale Hebel — **AnazhRealm macht beliebige three.js-Welten ko-präsent, ohne dass der
   Original-Autor etwas tut.** Risiko: fragil je Engine (Kamera-/Koordinaten-Konventionen) →
   der Übersetzer braucht Welt-Introspektion (§5.3).
3. **Kein Hook möglich** (eine opake WASM-/Canvas-Welt ohne zugänglichen Scene-Graph) →
   Fallback auf die **Vorraum-Ko-Präsenz** (Stufe 1.5): ihr seht euch als AnazhRealm-Avatare
   in einem gemeinsamen Vorraum VOR dem Tor, betretet dann eure Instanzen. Ehrlich, gebaut-nah
   (das Gruppen-Portal), kein Inside-Rendering.

### 5.3 Warum das genial + synergetisch ist
- Es reaktiviert das Pfund, das AnazhRealm EINZIGARTIG hat: ein P2P-Mesh + eine Identitäts-/
  Avatar-Schicht. Andere „spiele ein GitHub-Spiel im iframe"-Lösungen haben das NICHT.
- Es ist Trennung der Belange wie bei Croquet/Multisynq (geteilte Sim-Fabric vs. lokales
  Rendern) und Mozilla-Hubs-Components (deklarierte vernetzte Entitäten) — die Wege der Profis.
- Es ist VERDICHTUNG: dieselbe postMessage-Brücke (W12), dasselbe Mesh-Relay (W7/W17), derselbe
  Übersetzer (W14). KEIN neues System — eine neue Envelope-Art + drei Callbacks + ein Adapter.

---

## 6. Die Input-Brücke (Stufe 3, Schicht 5)

Heute: das fokussierte iframe bekommt Tastatur/Maus, die Fremdwelt nutzt IHRE Controls.
W18-Input-Brücke = AnazhRealms Keybindings/Controls auf die Fremdwelt mappen:
- **Variante A (deklariert):** spricht die Welt die DSL/das Manifest, reicht AnazhRealm
  semantische Aktionen hinein (`{type:"input", action:"jump"}`); die Welt mappt sie auf ihre
  Logik. Sauber, aber braucht Welt-Kooperation.
- **Variante B (synthetisch):** AnazhRealm injiziert synthetische `KeyboardEvent`s ins iframe
  gemäß einem Control-Map (AnazhRealm-Taste → Fremd-Taste). Den Map leitet der KI-Übersetzer
  aus dem Repo (README/Controls) ab ODER der Spieler lernt ihn interaktiv an.
- **Ehrlich:** für reine Erfahrungs-Welten (hallucinate) zweitrangig — man spielt sie mit
  ihren Tasten. Wichtig wird sie, wenn EIN Avatar (deine Pose) konsistent durch viele Welten
  geführt werden soll (Synergie mit §5: dieselbe Pose-Quelle treibt Ko-Präsenz UND Input).

---

## 7. Darin LEBEN (Stufe 4, die Krone)

„Swappen + leben" = die Fremdwelt wird (zeitweise) die Basis, nicht nur eine Episode:
- **Swap des aktiven Welt-Zeigers:** statt das Portal als Overlay über der eingefrorenen
  Heimat zu halten, wird die Fremdwelt der `activeWorld` (der Multi-Welt-Zeiger, der schon
  existiert — `anazhRealmActiveWorld`). Du „wohnst" dort, bis du zurück-swappst.
- **Persistenz:** der Zustand der Fremdwelt (soweit sie ihn exponiert via `{type:"event"}`/
  Snapshot) wird in einem AnazhRealm-Welt-Slot gehalten (dieselbe Multi-Welt-Persistenz wie
  eigene Welten). Eine opake Welt persistiert wenig; eine kooperative/übersetzte mehr.
- **Auffindbarkeit:** deine Freunde sehen im Mesh-Katalog (W16), dass du „in hallucinate
  lebst", und können dir folgen (Gruppen-Portal). „Wo wohnt X gerade?" wird beantwortbar.
- **Ehrlich:** für eine fremde Engine ohne Persistenz-API bleibt „leben" = „immer wieder
  betreten + Identität mitnehmen". Echte persistente Fremd-Welt-Zustände sind nur so tief, wie
  die Welt sie exponiert. Die VOLLE Tiefe gehört übersetzten/kooperativen Welten.

---

## 8. Die Phasen (Reihenfolge, synergetisch + effizient)

Jede Phase eine kleine additive Welle, jede playtest-grün, jede Verdichtung des Vorhandenen
(Sandbox/Brücke/Mesh/Gruppen-Portal/Übersetzer) — die Heilige Lektion.

- **W18-A — der Auto-Join-Fluss + die Tier-Erkennung.** Den vorhandenen Gruppen-Portal-Pfad
  (roadmap §3 Phase C) als spürbare UX schließen: an ein Portal gehen → betreten; ein Mesh-
  Freund bekommt den „mitkommen?"-Prompt → folgt. Plus: AnazhRealm KLASSIFIZIERT die Welt
  (single/multiplayer/kooperativ) und sagt ehrlich, welche Ko-Präsenz-Stufe sie trägt. Reuse
  W7-Lobby + `portal-invite` (V8.77). *Smoke-Test-bar (smoke-webrtc-Stil).*
- **W18-B — die Ko-Präsenz-Injektion (§5, DER Kern).** Das Peer-Protokoll (join/state/leave)
  über die Brücke + das Mesh-Pose-Relay (neuer Envelope-`kind`, reuse `_portalNetReceive`).
  Zuerst gegen eine EIGENE Test-Welt in `worlds/` mit deklariertem Avatar-Hook (beweisbar +
  smoke-test-bar), DANN der KI-Übersetzer-Hook (§5.2 Weg 2) für three.js-Welten.
- **W18-C — die Input-Brücke (§6).** Erst Variante A (deklariert, sauber), Variante B
  (synthetisch + KI-Control-Map) als Folge, wenn eine nicht-kooperative Welt es braucht.
- **W18-D — leben/swappen (§7).** Aktiver-Welt-Swap auf eine Fremdwelt + Persistenz-Slot +
  Mesh-Katalog-Anzeige „wohnt in …". Baut auf der Multi-Welt-Persistenz auf.

**Empfohlener erster Schritt:** **W18-A** (klein, spürbar, smoke-test-bar — schließt den schon
angelegten Gruppen-Portal-Fluss + macht die Tier-Wahrheit sichtbar), DANN **W18-B** (der Kern,
mit einer eigenen Test-Welt als Beweis, bevor der fragile Übersetzer-Hook kommt).

---

## 9. Risiken + Chancen (ehrlich)

**Risiken / wo es schwer wird:**
- **Der Übersetzer-Avatar-Hook ist fragil** (§5.2 Weg 2): jede three.js-Welt hat eigene
  Kamera-/Koordinaten-/Scene-Graph-Konventionen. Generisches Avatar-Injizieren ist Welt-für-
  Welt-Detektivarbeit. → Erst die eigene Test-Welt (deklariert), dann der Übersetzer mit
  Welt-Introspektion + ehrlichem Fallback (Vorraum).
- **Pose-Sync-Bandbreite/Jitter:** ~10 Hz Posen × N Peers übers Mesh — dieselbe Drossel-/
  Interpolations-Disziplin wie der bestehende Positions-Sync (W7); messbar, lösbar.
- **Determinismus/Fairness in der Fremdwelt:** AnazhRealm garantiert NICHT die Sim-Konsistenz
  der Fremdwelt (sie läuft je iframe eigenständig). Ko-Präsenz = geteilte AVATARE, nicht
  geteilte Physik (außer die Welt hat einen autoritativen Server → W17 Mesh-als-Server). Diese
  Grenze EHRLICH benennen (wie schon „je nachdem, was die Welt zulässt").
- **Sicherheit bleibt heilig:** alles über die ASYMMETRISCHE Brücke (V8.53) + null-origin-
  Sandbox (V8.70). Peer-Posen sind Daten, nie Code; das iframe bekommt nie AnazhRealm-Zugriff.
- **Heilige Lektion:** KEIN Parallel-Multiplayer-Stack — alles reuse Mesh (W7) + Brücke (W12)
  + Übersetzer (W14) + Gruppen-Portal (W17). Wer hier ein zweites Netz-System baut, sündigt.

**Chancen / warum es brilliant ist:**
- Es vollendet die „Bibliothek von Alexandria" zur „OASIS": nicht nur durch Welten GEHEN,
  sondern in ihnen GEMEINSAM LEBEN — mit deiner Identität, deinen Freunden, deiner Sprache.
- Es ist AnazhRealms einzigartiges Pfund: ein Mesh + Identität + Übersetzer, die zusammen eine
  beliebige single-player-Welt ko-präsent machen — etwas, das ein bloßer iframe-Loader NICHT kann.
- Es ist synergetisch + effizient: jede Stufe verdichtet Bestehendes; der teuerste Teil (der
  Übersetzer-Hook) ist optional + fällt sauber auf den Vorraum zurück.
- Es schließt den Kreis zum lebendigen Feld: deine Freunde, die mit dir in eine Welt ziehen,
  TUN dort etwas → das speist (über die Brücke, als `event`) das Heimat-Journal + die Emotion.

---

## 10. Die Antwort auf die Schöpfer-Frage, in einem Satz

**Heute** kannst du allein (oder, wenn die Welt Multiplayer kennt, gemeinsam) in eine Fremdwelt
gehen, sie voll spielen, mit deiner Identität. **Mit W18** ziehst du mit deinen Freunden auch in
eine Welt, die selbst keine Freunde kennt — weil AnazhRealm ihr die Augen füreinander gibt — und
kannst darin bleiben + leben. Der Weg dahin ist Verdichtung, kein Urknall: erst der Fluss
(W18-A), dann die Ko-Präsenz-Injektion (W18-B), dann Controls (C) + Leben (D).

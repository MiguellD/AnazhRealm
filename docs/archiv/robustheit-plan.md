# Der Robustheits-Bogen — Freiheit ohne Zusammenbruch (der ganze Plan)

**Status:** RUND — R0–R5 GEBAUT (V18.122–.124, 10.06.2026), integriert in den gigant-plan als **Säule G8** + **Phase G**. Die drei Ringe (Lokalität R3 · Dämpfung R1 · der eine Schlüssel R0+R2) + das lebende Immunsystem (Herkunftskette + Rückruf R4 · Antikörper-Archiv R5) stehen GEMESSEN (34 Invarianten). Nur R6 (Selbst-Erweiterung) bleibt bewusst FERN — der ANDERE Plan, der auf diese Wand aufsetzt. Konsolidiert aus dem Co-Creation-Dialog; vereint die zwei Vorgänger-Entwürfe (Drei-Ringe + Selbst-Erweiterung) zu EINEM Bogen. Baute auf den GEMESSENEN Stand auf (Vibe-Pass W13/W14, Portal-iframe null-origin, `worlds/translated`, Wasser-CA-Gleichgewicht, ~3500 Invarianten) — die Architektur war zu ~60 % da, nur nicht BENANNT.

> **Doc-Anker:** das Master-Bild + die Wellen-Reihenfolge leben im `docs/gigant-plan.md` (§2 Säule G8 · §5 Phase G). Dieses Dokument trägt die volle Tiefe (die vier Mechanismen, die Naturanalogie, die offenen Ränder). Vor jeder Arbeit an „Sicherheit / Sandbox / Portal-Kanal / Vibe-Pass / Signatur / Herkunft / Rückruf / Welt-Vertrauen / Immunsystem" ZUERST lesen.

**Die Frage des Schöpfers, in ihrer reifsten Form:** Das Universum ist total frei auf der Zustandsebene und trotzdem stabil — ohne Aufseher. Ein Teilsystem kann fusionieren, kurz unangenehm werden, aber das ist nie mehr als eine Fluktuation. Wie? Und kann AnazhRealm dieselbe Robustheit haben, ohne den Menschen als Stabilisator — und ohne dass eine Welt Leute locken und infizieren kann?

**Die Antwort dieses Plans:** Robustheit sitzt in der STRUKTUR, nicht in einem Prüfer. Drei Ringe (Lokalität · Dämpfung · der eine Schlüssel) machen den EINZELNEN sicher; ein lebendes, sich selbst impfendes Immunsystem hält das NETZ gesund. Keine Stufe behauptet, Schaden zu verhindern — jede macht ihn lokal, reversibel oder selbst-abklingend. Wie die Natur: nicht keine Krankheit, sondern jede einzelne überleben und den Erreger wieder ausstoßen.

> **Dieser Plan behauptet NICHT, vollständig zu sein** — und das ist kein Mangel, sondern die einzige Haltung, die mit der These konsistent ist. Ein System, das stabil bleibt, WEIL es lokal dämpft statt alles vorab zu prüfen, kann nicht von einem Dokument gekrönt werden, das behauptet, alles vorab geprüft zu haben. Der Plan hat dieselbe Form wie das, was er beschreibt: kleine starre Mitte, offener Rand. Die offenen Ränder stehen in §8.

---

## §0 Was die Natur wirklich tut (die korrigierte Analogie)

Vier Beobachtungen, die den naiven „totale Freiheit = stabil" präzisieren — und damit baubar machen:

1. **Frei sind die Zustände, NICHT die Gesetze.** Ein Elektron darf jeden Zustand annehmen — aber nur innerhalb der Maxwell-Gleichungen. Kein Teilsystem schreibt während des Laufens die Feinstrukturkonstante um. Die Regeln sind bombenfest; die Freiheit lebt OBERHALB. Das ist die schmale Taille in ihrer größten Form.
2. **Die Atombombe verletzt kein Gesetz — sie NUTZT E=mc².** Darum bricht das Universum nicht: die Bombe ist eine Fluktuation INNERHALB der starren Regeln, nie ein Angriff AUF sie. „Kurz unangenehm, nie mehr als eine Fluktuation" stimmt — WEIL der Kern unantastbar war.
3. **Stabilität = Lokalität + Dämpfung, kein Prüfer.** Kein zentraler Wächter sagt „erlaubt". Stattdessen: jede Wirkung ist lokal, Abweichungen erzeugen Rückstellkräfte (Le Chatelier, Dissipation). Eine Fluktuation klingt ab, weil die Nachbarschaft sie aufzehrt. Das System „prüft" nichts — es VERGISST automatisch alles, was aus dem Gleichgewicht läuft.
4. **Gesundheit = Immunität, nicht Schutzschild.** Ein lebendes Immunsystem verhindert keine Krankheit — es überlebt jede einzelne und stößt den Erreger wieder aus. Und es bleibt stark durch EXPOSITION (Impfung = Begegnung mit abgeschwächten Erregern), nicht durch eine Mauer.

**Der Preis, ehrlich:** Die Natur erlaubt die Supernova. Aus Sicht des Sterns ist das kein Trost — das Ganze überlebt, der Ort nicht. Übersetzt: **eine fremde Welt DARF kollabieren, hässlich werden, ihren eigenen Besucher täuschen. Das System überlebt. Die Welt nicht.** Das ist die Designwahl, nicht ein Bug.

**Die EINE Stelle, an der die Analogie eine Ergänzung braucht:** Die Natur kennt keine _irreversiblen Knöpfe_ zwischen Teilsystemen — ein Stern kann nicht die Identität eines anderen umschreiben. In einer Welt von Schöpfern mit Wallets GIBT es solche Knöpfe. Hier — und NUR hier — hält der Mensch den Schlüssel: nicht als Wächter über das Ganze, sondern als Halter des einen Unumkehrbaren.

---

## §1 Der GEMESSENE Stand — die Architektur ist zu ~60 % gebaut, nur nicht benannt

Code gelesen (10.06.2026, drei Tiefen-Sweeps — Identität/Keystore · Portal/Sandbox/Kanal · DSL/Broadcast/Regeln; jede Zeile GEMESSEN):

| Baustein                  | Wo                                                        | Was er heute ist                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Innerster Ring (Keim)** | `vibePass` + `signedWorlds` + `customWorlds`              | ed25519-Schlüsselpaar (native WebCrypto), **privater Schlüssel im GLOBALEN localStorage `anazh.vibePass`, NIE im Welt-Save** — GEMESSEN: `buildStateSnapshot` (:26861–27058) trägt KEINEN der Schlüssel, der Fußabdruck des Privaten sind 6 Methoden. Der innerste Ring existiert — nur nicht als Ring BENANNT.                                 |
| **Äußerster Ring (Keim)** | Portal-iframe (`_buildPortalOverlay` :33289)              | `sandbox="allow-scripts"` OHNE `allow-same-origin` (:33322) → **echte null-origin-Grenze**; `vendored→sandboxed` unforgeable erzwungen (:27829). Eine fremde Engine läuft isoliert (smoke-sandbox.cjs beweist es im echten Browser).                                                                                                            |
| **Der Kanal**             | postMessage-Handshake + `_portalNetReceive`               | asymmetrisch (Heim→Sub DSL, Sub→Heim nur Ereignis-TEXT, nie ausgeführt); `worlds/translated` als vertrauenswürdiger Renderer (Daten, kein LLM-Code) = das Dual-LLM-Pattern, halb gebaut. **Teil-gedämpft:** `event` 8/s (:33751) + `ws-send` 120/s (:33824) gedeckelt; `ready`/`exit`/`manifest` + `subworld-net`-EINGANG vom Peer UNGEDECKELT. |
| **Dämpfungs-Vorbild**     | Wasser-CA (`CA_FLOW_KEEP` + Spiegel-Kappe + EPS-Fixpunkt) | das Gleichgewichts-Design ist GEMESSEN gebaut — „ein settled nie ist ein Gleichgewichts-Designfehler" ist die Lehre, eine Ebene höher anwendbar.                                                                                                                                                                                                |
| **Identitäts-Beweis**     | `_vibeSign`/`_vibeVerify` (:27258/:27276)                 | Peer beweist Vibe-Pass-Besitz per Signatur über die peerId (`_p2pHandleVibe` :6984) — Spoofing-Schutz im Mesh.                                                                                                                                                                                                                                  |
| **Immunsystem (Keim)**    | `npm run playtest` (~3500 Invarianten) + `audit:strict`   | ein Merge-Gate — läuft EINMAL beim Push. Die Antikörper existieren; sie sind nur noch nicht als LEBENDES, wachsendes Archiv gedacht.                                                                                                                                                                                                            |

**Der Wurzel-Befund:** Sechs Bausteine, alle als isolierte Features gebaut, keiner als Teil eines benannten Robustheits-Systems. Die fünf Lücken, die dieser Plan füllt: (1) kein BENANNTER innerster Ring, (2) der Kanal DÄMPFT nicht EINHEITLICH, (3) keine IRREVERSIBILITÄTS-Wand (heute existiert KEINE Sovereign-Schicht — nur Material-/Modus-Kosten-Tore `_makeCostGate`/`confirmBuild`), (4) die Herkunft ist FLACH (Signierer + origin-Enum via `_worldProfile`, KEINE Lineage-Kette) → keine NETZ-Immunität gegen Infektion-über-getäuschte-Überträger, (5) das Immunsystem ist statisch statt lebend.

---

## §2 Das System — drei Ringe + ein Immunsystem

```
        ┌─────────────────────────────────────────────┐
        │  ÄUSSERER RING — totale Freiheit             │
        │  jede Welt: eigene Sandbox (iframe/worker)   │
        │  darf brennen, hässlich werden, kollabieren  │
        │  EIN Ausgang: der gedämpfte Kanal            │
        │     ┌──────────────────────────────────┐    │
        │     │  KATALYSATOR (mittlerer Ring)     │    │
        │     │  die Irreversibilitäts-Wand       │    │
        │     │  fängt NUR Aktionen ab, die den   │    │
        │     │  innersten Ring berühren würden   │    │
        │     │  → verlangt frische Mensch-Geste  │    │
        │     │    ┌─────────────────────────┐    │    │
        │     │    │ INNERER RING — abwesend │    │    │
        │     │    │ Wallet · Vibe-Pass-Key  │    │    │
        │     │    │ Identität · Signaturen  │    │    │
        │     │    │ KEINE Welt kennt ihn    │    │    │
        │     │    │ = die Feinstruktur-     │    │    │
        │     │    │   konstante             │    │    │
        │     │    └─────────────────────────┘    │    │
        │     └──────────────────────────────────┘    │
        └─────────────────────────────────────────────┘
              ↑ um das GANZE Netz herum, dauernd:
        IMMUNSYSTEM — Herkunftskette · Rückruf · lebendes
        Antikörper-Archiv, das sich an jedem Erreger impft
```

**Das Wallet wird nicht VERGESSEN — es wurde nie BERÜHRT.** Vergessen (Dämpfung) heißt: Schaden passiert, klingt ab. Nie-berührt (Lokalität) heißt: der Schaden erreicht den Ort nie. Eine Supernova zerstört keine fernen Galaxien — nicht weil sie sich schützen, sondern weil die Explosion sie räumlich nie erreicht. Der innerste Ring ist nicht GESCHÜTZT, er ist ABWESEND aus der Welt der Welten.

---

## §3 Die zwei Gefahren — und warum eine Sandbox nur die erste löst

Der Schöpfer hat instinktiv die zwei gefährlichsten Angriffe benannt: **locken** und **infizieren**. Beide laufen durch den Menschen, nicht durch eine Lücke — darum ist die Sandbox dagegen blind.

### Gefahr A — eine Welt TUT etwas Schlimmes

flutet das Netz, frisst CPU, spawnt endlos, beschädigt eine andere Welt, kollabiert in sich.
→ gelöst durch **Lokalität + Dämpfung** (M1 + M2). Kein Mensch nötig. Die Supernova-Physik. **Eine kollabierende Welt kann die Identität nicht mitreißen — die war nie in ihr.**

### Gefahr B — eine Welt ÜBERREDET DICH oder NUTZT DICH ALS ÜBERTRÄGER

- **Locken**: Text, der dein Welt-LLM manipuliert; eine Schaltfläche, die wie „weiter" aussieht, aber „signiere/überweise" bedeutet.
- **Infizieren (die echte Epidemie)**: Welt A vergiftet deinen LLM-Vorschlag → du signierst getäuscht ein Vokabular/Bauplan/eine Empfehlung → dein SIGNIERTES, vertrauenswürdiges Artefakt trägt die Infektion weiter → der Nächste übernimmt sie, weil sie DEINE Signatur trägt. **Signaturen BESCHLEUNIGEN das, statt es zu stoppen — weil eine Signatur „Echtheit" beweist, nicht „Gutartigkeit".** Das ist die lethal trifecta in deiner Welt: Welt A (untrusted tokens) → dein LLM (private Autorität) → dein Broadcast (Exfiltration).
  → gelöst durch den **Katalysator** (M3, gegen Locken des Souveränen) + das **Immunsystem** (M4, gegen die Infektion-über-Überträger). Hier kehrt der Mensch zurück, nur hier, nur für das Unumkehrbare.

---

## §4 Die vier Mechanismen — jeder löst genau EINE Sache

### Mechanismus 1 — LOKALITÄT (die Struktur)

**Ziel:** Eine Welt kann eine andere NIE direkt berühren; kein geteilter Zustand zwischen Welten; keine Welt hat einen Pfad zum innersten Ring.
**Kern:** Jede fremde Welt in eigener Sandbox (Portal-iframe null-origin ist GEBAUT). Kein Welt-Code hat einen Zeiger auf Host-State, eine Schwester-Welt oder den innersten Ring. Welt-zu-Welt-Wirkung NUR über den gedämpften Kanal (M2), und der trägt nur region-lokale Effekte.
**Verifikation:** Eine bösartige Test-Welt versucht (a) `window.parent` jenseits des Handshakes, (b) Zugriff auf `localStorage["anazh.vibePass"]`, (c) eine Referenz auf eine Schwester-Welt → alle drei GEMESSEN geblockt. Invariante: das Portal-iframe trägt NIE `allow-same-origin` für `trust:"sandboxed"`.

### Mechanismus 2 — DÄMPFUNG (die Kanal-Physik)

**Ziel:** Keine Fluktuation wird global; eine Flut klingt von selbst ab.
**Kern:** Token-Bucket pro Welt-Region — N Nachrichten/s, darüber VERWORFEN (nicht gepuffert; Puffern verschiebt die Flut nur). Exakt die Wasser-CA-Lehre eine Ebene höher: Rate bremst (`CA_FLOW_KEEP`), Verwerfen bändigt (Spiegel-Kappe), der leere Bucket beruhigt (EPS-Fixpunkt) — „erst alle drei sind Minecraft". Eine flutende Welt drosselt SICH SELBST.
**Determinismus-Wache:** transport-/render-seitig, NICHT im deterministischen Welt-Tick (sonst bräche der Multi-User-Seed). Eine verworfene Nachricht ist eine Transport-Tatsache, kein State-Unterschied.
**Verifikation:** eine Test-Welt feuert 10000 Nachrichten/s → Empfänger sieht ≤ N/s, Mesh-FPS stabil, Bucket settled nach dem Sturm. Die „settled nie"-Falle ist der Wächter.

### Mechanismus 3 — DER KATALYSATOR (die Irreversibilitäts-Wand)

**Ziel:** Genau die Handvoll Aktionen, die den innersten Ring berühren, verlangen eine frische Mensch-Geste und sind NIEMALS automatisch — durch Welt, LLM oder Fluss — auslösbar.
**Kern — die eingefrorene `SOVEREIGN_ACTIONS`-Liste (winzig, stabil, auditierbar):** `wallet_transfer` · `sign_manifest` · `change_identity` · `grant_capability` (einer Welt eine neue Domäne öffnen = die Verfassungs-Ebene). `reveal_private_key` existiert gar nicht als Op — der Schlüssel verlässt den Ring nie. Diese Aktionen sind NICHT im DSL-Op-Pool, NICHT broadcastbar, NICHT durch LLM/Regel auslösbar. Sie laufen nur über eine **Host-gerenderte Geste** außerhalb jedes iframes, Klartext „WAS, welcher WERT, an WEN", jedes Mal neu (keine „merken"-Option für souveräne Akte).
**Warum das die halbe trifecta bricht:** Eine vergiftete Welt kann täuschen, aber die souveräne Aktion läuft NICHT durch den manipulierbaren Kanal — sie verlangt die Host-Geste, die keine Welt fälschen kann (sie sitzt außerhalb des iframes, der Host zeichnet sie). Das ist das Dual-LLM-Pattern (Willison/CaMeL): der manipulierbare Pfad berührt das Souveräne nie.
**Die ehrliche Restlücke (M3 allein):** Die Wand schützt vor der GEFÄLSCHTEN Geste, nicht vor der GETÄUSCHTEN Absicht — du kannst die ECHTE Host-Geste machen, weil die Welt dich überzeugt hat. „Locken" ist nicht lösbar, nur teurer machbar: Klartext, Zwang zum Innehalten, sichtbare Herkunft/Reputation, Wartezeit bei Irreversiblem. Reibung an genau der EINEN Stelle (nicht im ganzen System — das wäre der Wächter).
**Asymmetrie rettet den Rest:** Die Welt bekommt nie deinen privaten Schlüssel → sie kann nicht BELIEBIG in deinem Namen handeln, nur das EINE ausnutzen, was du in DIESEM Moment signiert hast. Der Schaden ist eine Einzelwunde, kein „sie ist jetzt für immer du".
**Verifikation:** Angriffs-Korpus: (a) DSL versucht `wallet_transfer` → abgelehnt (unknown_op), (b) LLM-/Regel-Vorschlag enthält souveräne Aktion → gefiltert, (c) Welt rendert Fake-Confirm im iframe → kann den Host-Pfad nicht auslösen. Invariante: `SOVEREIGN_ACTIONS ∩ (DSL_OPS ∪ BROADCASTABLE ∪ RULE_EFFECTS) = ∅`.

### Mechanismus 4 — DAS IMMUNSYSTEM (Netz-Gesundheit gegen Infektion)

**Ziel:** Eine Infektion, die durch die gutgläubigen Handlungen vieler Einzelner reist (vergiftetes Artefakt mit echter Signatur), wird sichtbar, reversibel und an der Quelle quarantänisiert — OHNE einen zentralen Wächter.
**Die drei Säulen (keine ist ein Prüfer):**

- **(4a) Herkunft reist mit, unfälschbar.** Jedes Artefakt (Vokabular · Bauplan · Welt) trägt die ganze Kette, nicht nur deine Signatur: „Ursprung Welt A, weitergegeben von dir". Dann beweist deine Signatur „ich habe das BERÜHRT", nicht „ich BÜRGE dafür". Der Empfänger sieht „über dich" vs. „von dir" — sonst tarnt sich die Infektion als dein Gütesiegel. **Das ist der Kern: die Herkunftskette macht den Unterschied zwischen Echtheit und Gutartigkeit sichtbar.** (Heute ist die Herkunft FLACH — `_worldProfile` trägt Signierer + origin-Enum, KEINE Lineage; R4 baut die Kette.)
- **(4b) Rückruf, der das Netz durchläuft.** Wird Welt A als infektiös erkannt, wird ihre Signatur revoziert → jedes Artefakt mit A in der Herkunftskette fällt beim nächsten Laden bei ALLEN weg, automatisch. Das ist das Ausstoßen des erkannten Erregers: eine Infektion ist reversibel, sobald erkannt — keine Einbahnstraße. Ohne Rückruf ist jede Weitergabe permanent; mit ihm ist sie ein Kreislauf.
- **(4c) Quarantänisierter Vorschlags-Pfad (Dual-LLM, voll ausgebaut).** Die Infektion lebt im LLM-VORSCHLAG → das welt-exponierte LLM (liest Text aus Welt A) darf NIE direkt etwas vorschlagen, das du signierst. Es reicht nur REFERENZEN, die ein zweiter, welt-UNexponierter Pfad in Klartext zusammenbaut, den du prüfst. Welt A kann dein Urteil INFORMIEREN, aber nicht deinen VORSCHLAG formulieren. Das schneidet die Übertragungskette an der Entstehung. `worlds/translated` hat das Prinzip schon — hier auf den Vorschlags-Pfad geweitet, nicht nur aufs Rendering. (Heute schon halb wahr: das LLM darf nur `rule`-Programme schreiben — eine Whitelist; R4c bindet das an die Sovereign-Disjunktheit.)

**Verifikation:** Ein Infektions-Korpus: (a) ein Artefakt mit vergifteter Wurzel wird mit sichtbarer Herkunftskette geladen → der Empfänger-Pfad zeigt „Ursprung untrusted" GEMESSEN, (b) ein Rückruf von Welt A entfernt GEMESSEN alle A-wurzeligen Artefakte beim Reload, (c) ein welt-exponierter LLM-Text kann GEMESSEN keine souveräne/signierbare Aktion direkt formulieren (nur über den Klartext-Zweitpfad).

**Die ehrliche Restlücke (M4):** Ein GESCHICKT getäuschter Mensch, der mit OFFENEN Augen etwas gutartig Aussehendes weiterreicht, ist durch keine Architektur vollständig zu stoppen. Herkunft macht es sichtbar, Rückruf reversibel, Quarantäne schwerer — aber die letzte Instanz gegen „Locken" bist du, im Moment der souveränen Geste. Darum die Reibung GENAU DORT.

---

## §5 Das Immunsystem REGELMÄSSIG STÄRKEN — simpel, weil es nichts Neues braucht

Der Schöpfer fragte nach dem simplen, genialen Weg, das Immunsystem dauernd zu stärken. Die Antwort ist **Exposition, nicht Maschinerie** — Impfung ist Begegnung mit abgeschwächten Erregern, kein neuer Mechanismus:

**Die ~3500 Invarianten sind schon ein Immunsystem — denke sie von „Merge-Gate" zu „lebendem, wachsendem Antikörper-Archiv".** Kein neuer Code-Apparat, eine neue ROLLE für das Vorhandene:

- **(5a) Jeder erkannte Erreger wird ein dauerhafter Antikörper.** Eine Welt, die kollabiert, flutet oder zu täuschen versucht, wird als abgeschwächter Reproduzent in den Angriffs-Korpus aufgenommen (wie ein neuer Headless-Invariant). Das System wird ab dann bei JEDEM Playtest gegen genau diesen Angriff geprüft. Der Korpus WÄCHST mit jeder Begegnung — das ist erworbene Immunität, in deiner schon gebauten Test-Maschinerie.
- **(5b) Der Angriffs-Korpus läuft DAUERND, nicht einmal beim Merge.** Die vier Korpora (M1 Sandbox-Escape · M2 Flut · M3 souveräner Angriff · M4 Infektion) werden Teil des `playtest`-Gates und laufen bei jedem Push — die regelmäßige „Impfung". Ein Regress an einer alten Wand ist sofort rot.
- **(5c) Mesh-aggregierte Erreger-Erkennung (die soziale Schicht, später).** Wenn viele Peers dieselbe Welt als infektiös markieren, steigt ihr Rückruf-Signal — das Netz entwickelt Herden-Immunität, ohne zentralen Richter. (Gehört in den Social-Backlog / Phase F4; M4a/b sind die Mechanik, auf der das steht.)

**Warum das genial-simpel ist:** Es braucht keinen neuen Mechanismus. Deine Invarianten-Maschinerie, die heute Code-Qualität gatet, wird zum Antikörper-Archiv, das gegen jeden je gesehenen Angriff impft — und mit jedem neuen Erreger stärker wird. Das ist die Verdichtung zu EINER Quelle (V9.82-Pfad): ein Werkzeug, zwei Rollen (Qualität + Immunität).

---

## §6 Die Treppe — Reihenfolge ist Pflicht (die heilige Lektion)

| Stufe  | Was                                                                                                                                                                                  | Risiko                               | Mess-Gate                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| **R0** | Benennen + Trennung BEWEISEN: innersten Ring als `SOVEREIGN_STATE` benennen, die GEMESSEN-schon-wahre Trennung (Key nie im Welt-Save, iframe null-origin) als Invarianten einfrieren | null (reiner Verifikations-Refactor) | Invariante: kein Welt-Pfad zum innersten Ring              |
| **R1** | Der gedämpfte Kanal (M2): Token-Bucket pro Welt-Region, transport-seitig                                                                                                             | niedrig                              | Flut klingt ab, FPS stabil, Bucket settled                 |
| **R2** | Die Irreversibilitäts-Wand (M3): `SOVEREIGN_ACTIONS` einfrieren, Host-gerenderter Confirm-Pfad, Pool-Disjunktheit                                                                    | mittel                               | Angriffs-Korpus (DSL/LLM/Fake-UI) GEMESSEN gestoppt        |
| **R3** | Lokalitäts-Härtung (M1): Sandbox-Grenze gegen vollen Escape-Korpus, als Invariante einfrieren                                                                                        | mittel                               | parent/localStorage/Schwester-Welt GEMESSEN geblockt       |
| **R4** | Netz-Immunität (M4): Herkunftskette, Rückruf-Propagation, quarantänisierter Vorschlags-Pfad                                                                                          | mittel-hoch                          | Infektions-Korpus GEMESSEN sichtbar/reversibel/geschnitten |
| **R5** | Lebendes Immunsystem (M5): Korpora ins dauernde Playtest-Gate, jeder Erreger → Antikörper                                                                                            | niedrig (Rolle, kein Apparat)        | Korpus wächst, alter Angriff bleibt rot bei Regress        |
| **R6** | Erst JETZT Selbst-Erweiterung: Capability-Inversion + Komposition (der andere Plan)                                                                                                  | —                                    | setzt auf R0–R5 auf                                        |

**Die EINE Reihenfolge-Korrektur gegenüber dem ersten Entwurf:** Die Irreversibilitäts-Wand (R2) und die Netz-Immunität (R4) gehören VOR die Selbst-Erweiterung (R6), nicht danach. Erst die Wand gegen vergiftete Vorschläge UND die Immunität gegen Infektion, dann die Freiheit, Vorschläge anzunehmen. Ein Welt-LLM, das Ops vorschlägt, ist sicher, WEIL R2 die souveränen Akte schon getrennt, R4 die Infektion schon quarantänisiert und R1 jede Flut schon gedämpft hat. R6 (Selbst-Erweiterung) vor R2/R4 wäre die lethal trifecta sehenden Auges — Komplexität ohne Fundament.

---

## §7 Auf den Schultern der Riesen (die Belege, gegen die das geprüft ist)

- **CaMeL (DeepMind/ETH Zürich, 2025) — „Defeating Prompt Injections by Design":** jedem Wert Capability-Metadata anhängen, um Daten-/Kontrollflüsse zu beschränken; der manipulierbare Pfad berührt das Sensible nie. M3 + M4c sind genau das, in der Substanz-Sprache.
- **Dual-LLM-Pattern (Willison, 2023):** der quarantänisierte (welt-exponierte) Pfad reicht nur Referenzen, der privilegierte Pfad berührt die rohen, vergiftbaren Tokens nie. `worlds/translated` IST dieses Pattern — M4c weitet es vom Rendering auf den Vorschlags-Pfad.
- **Lethal Trifecta (Willison, 2025; in-the-wild 2026, u. a. Claude Cowork Jan 2026):** private Daten + untrusted Tokens + Exfiltrations-Kanal = garantiert verwundbar. AnazhRealm hat alle drei (Welt-LLM + fremde Welten + Rückkanal). R2 + R4 entfernen die Verwundbarkeit, indem sie das Souveräne aus dem manipulierbaren Pfad nehmen und die Übertragung an der Quelle schneiden.
- **eBPF-Verifier (die WARNUNG, nicht das Vorbild):** jede Generation fähiger → größere Verifier-Angriffsfläche, wiederkehrende privilege-Bugs (CVE-2017-16995, 2021-3490, …). Das ist die heilige Lektion am Prüfer selbst. DARUM baut dieser Plan KEINEN wachsenden Verifier — `SOVEREIGN_ACTIONS` bleibt winzig (vier Akte), weil die Freiheit AUSSEN total ist.
- **Darwin-Gödel-Machine (Sakana/Clune, 2025):** empirische Validierung STATT Beweis (SWE-bench 20→50 %), mit Sandboxing UND menschlicher Aufsicht. Validiert R5 (empirisch testen, nicht beweisen) UND R2 (auch die Riesen behalten den Menschen am irreversiblen Hebel).
- **Capability-based security / SELinux (klassisch):** Autorität an unfälschbare Tokens gebunden, nicht an Identitäts-Behauptungen. Der Vibe-Pass-Proof + die Herkunftskette (M4a) sind der Keim davon.

---

## §8 Die offenen Ränder (was dieser Plan NICHT löst — ehrlich)

1. **„Locken" bleibt teil-offen.** Ein bewusst getäuschter Mensch, der die ECHTE souveräne Geste macht, ist durch keine Architektur vollständig zu stoppen — nur teurer (Klartext, Innehalten, Herkunft, Wartezeit). Die letzte Instanz bist du.
2. **Eine fremde Welt DARF schlecht sein.** Kollaps, Hässlichkeit, Täuschung des eigenen Besuchers — das System überlebt (Lokalität), der Ort nicht. Die akzeptierte Supernova. Wer „keine Welt darf je schlecht sein" will, will den Wächter = die eBPF-Falle.
3. **Geschmack/Vision bleibt beim Schöpfer-Auge.** Eine Welt kann alle vier Mechanismen respektieren und vision-fremd sein. Robustheit ≠ Qualität (headless-grün ≠ vision-aligned, die eigene Lehre).
4. **Die soziale Schicht (Herden-Immunität, Reputation, wessen Rückruf zählt) ist ein eigener Bogen** (Phase F4). M4a/b/c sind die Mechanik; wer markieren darf und wie Reputation aggregiert, gehört in den Social-Backlog.
5. **Der Plan ist nicht vollständig — by design.** Neue Erreger werden Klassen erfinden, die kein heutiges Korpus kennt. Das ist KEIN Mangel: R5 ist genau die Stufe, die das aushält — jeder neue Erreger wird ein neuer Antikörper. Ein vollständiger Plan wäre der Wächter, der wächst, bis er die nächste 19-Modul-Falle ist. Die Unvollständigkeit IST die Robustheit.

---

## §9 Warum das die robuste Form ist (die Verdichtung)

Die Robustheit sitzt in der STRUKTUR, nicht in einem Prüfer:

- **Lokalität** macht Schaden unfähig, global zu werden — wie die Natur, ohne Wächter.
- **Dämpfung** macht jede Flut selbst-abklingend — die Wasser-CA-Lehre, eine Ebene höher.
- **Der Katalysator** schrumpft den Menschen auf den einen Schlüssel, den keine Welt je berührt — und damit den „Verifier" auf eine winzige, eingefrorene Liste, die nie wächst.
- **Das Immunsystem** macht das Netz gesund, nicht durch eine Mauer, sondern durch sichtbare Herkunft, reversiblen Rückruf und ein Antikörper-Archiv, das sich an jedem Erreger impft und mit jeder Begegnung stärker wird.

Das Universum hat „frei und sicher" nie gelöst — das ist unmöglich. Es hat „frei und ROBUST" gelöst: total frei auf der Zustandsebene, bombenfest auf der Gesetzesebene, stabil durch Lokalität statt Aufsicht, gesund durch Immunität statt Schutzschild, gekauft mit der Bereitschaft, lokale Katastrophen als Fluktuationen zu ertragen. AnazhRealm baut genau das — und hat die Supernova-Physik in seinem P2P-Mesh-ohne-Server, den innersten Ring im globalen localStorage und das Antikörper-Archiv in seinen 3500 Invarianten schon halb gebaut, ohne es so zu nennen. Dieser Plan benennt die drei Ringe, dämpft den Kanal, baut die eine Wand, schließt die Übertragungskette — und lässt alles andere brennen und sich neu bilden, so oft es will.

Ein Stamm, dessen Mark nichts berühren kann, dessen Ringe frei wachsen, fallen und nachwachsen — und der mit jeder überlebten Krankheit ein stärkeres Immunsystem trägt.

---

## §10 Der BAU-FORTSCHRITT (gepflegt pro Welle — die Treppe wird abgehakt)

> Pro Stufe: der gemessene Schnitt + die Invarianten-Wand. Abgehakt = ✓ + Version. Details im git-Commit + `handover.md`.

- **R0 — `SOVEREIGN_STATE` + die Trennung bewiesen** — ✓ **V18.122**: der innerste Ring benannt (`AnazhRealm.SOVEREIGN_STATE`, frozen — `excludedStateKeys`/`privateStorageKeys`/`privateFields`) + `_sovereignStateAudit()` (mutiert nichts) beweist headless: kein souveräner Slot/Privat-Feld im `buildStateSnapshot`, nur die öffentliche Identität im `_portalEnterPayload`, ein injiziertes Privat-Feld leckt NICHT (der fixe Key-Satz schließt vibePass aus). 5 Invarianten (`checkBandG8R0Sovereign`). Beifang: der V18.120-Konfounder (V18.1-W1-Wasser-BackSide kippte je nach Spieler-Tauch-Position) deterministisch geheilt (Oberflächen-Zustand erzwingen).
- **R1 — der gedämpfte Kanal (M2)** — ✓ **V18.123**: EIN Token-Bucket pro Overlay am Kanal-EINGANG (`_portalChannelAdmit`, 200/s) deckelt ALLE Sub→Heim-Nachrichten (auch die zuvor ungedeckelten `ready`/`exit`/`manifest`) + das geteilte per-Peer-Raten-Tor (`_p2pPeerRateAdmit`, V9.82-Verdichtung) cappt den `subworld-net`-EINGANG (120/s/Peer) und verdichtet `creature-pos`. Transport-seitig (kein Welt-Tick → Determinismus unberührt); Verwerfen statt Puffern; Bucket settled nach dem Sturm (EPS-Fixpunkt). 5 Invarianten (`checkBandG8R1DampedChannel`).
- **R2 — die Irreversibilitäts-Wand (M3)** — ✓ **V18.123**: `AnazhRealm.SOVEREIGN_ACTIONS` (frozen — wallet_transfer·sign_manifest·change_identity·grant_capability) DISJUNKT von `dslEffects ∪ NON_BROADCASTABLE_OPS ∪ dslComposeAtomic` (GEMESSEN); ein `dslEval`-Guard blockt jeden souveränen Op (`sovereign_blocked`, nie ausgeführt — auch in einer Kette/Regel); die EINE Host-Geste `_sovereignGesture` (außerhalb jedes iframes, Klartext WAS/WERT/WEM, jedes Mal frisch, `skipConfirm` für Tests) — `signBlueprint`/`signWorld` (sign_manifest) + `importVibePass` (change_identity) laufen durch sie. 7 Invarianten (`checkBandG8R2SovereignWall`). S-Gate: das Geste-UI-Feel (heute `window.confirm`).
- **R3 — Lokalitäts-Härtung (M1)** — ✓ **V18.123**: die EINE Sandbox-Attribut-Quelle `_portalSandboxAttr` (sandboxed → `allow-scripts` allein/null-origin · trusted → +same-origin; `_buildPortalOverlay` nutzt sie statt des inline-Ternärs) + `_localityAudit()` beweist headless die Grenze (sandboxed kein same-origin · `vendored→sandboxed` unforgeable · kein Welt-Pfad zum innersten Ring via R0 · Server-Kontext-iframe immer null-origin). Die ECHTE null-origin-Isolation beweist `scripts/smoke-sandbox.cjs` im Browser; R3 friert die Attribut-Wand. 6 Invarianten (`checkBandG8R3Locality`).
- **R4 — Netz-Immunität (M4: Herkunftskette + Rückruf + Quarantäne)** — ✓ **V18.124**: die HERKUNFTSKETTE (`provenance`-Lineage auf Welten/Bauplänen — `_appendProvenance`/`_sanitizeProvenance`/`_provenanceSummary`, „Ursprung X · über dich" statt flachem origin-Enum; sign trägt sie, export hängt den Überträger an, import bewahrt sie, `_worldProfile` zeigt sie) + der RÜCKRUF (`state.revokedKeys` global/NIE im Snapshot · `revokeKey`/`_isKeyRevoked`/`_artifactProvenanceTainted` · die Lader `_loadSignedWorlds`/`_loadCustomWorlds` sieben + `_purgeRevokedArtifacts` stößt aus — ein revozierter Schlüssel IRGENDWO in der Kette fällt das Artefakt) + die QUARANTÄNE (4c: der welt-exponierte LLM-Pfad ist an die R2-Disjunktheit gebunden — GEMESSEN: ein `source:"llm:grok"`-DSL mit souveränem Op → `sovereign_blocked`). 7 Invarianten (`checkBandG8R4Immunity`). Mesh-Aggregation (wessen Rückruf zählt) = Phase F4 (sozial).
- **R5 — das lebende Immunsystem (M5)** — ✓ **V18.124**: `_robustnessCorpus()` enumeriert die vier Angriffsklassen (R1 Flut/M2 · R2 souverän/M3 · R3 Escape/M1 · R4 Infektion/M4), je mit ihrer LEBENDEN Wand (Guard) + ihrem Playtest-Band; die vier Korpora SIND Playtest-Bänder → laufen bei JEDEM Push (die Impfung), ein Regress an einer alten Wand ist sofort rot. Kein neuer Apparat — eine neue ROLLE für die ~3500-Invarianten-Maschinerie (V9.82-Verdichtung: ein Werkzeug, zwei Rollen). 4 Invarianten (`checkBandG8R5LivingImmune`). **DER BOGEN IST RUND (R0–R5 gebaut).**
- **R6 — Selbst-Erweiterung (Capability-Inversion, der ANDERE Plan)** — bewusst FERN, nach R0–R5 (ein eigener Bogen — er setzt auf die fertige Wand R2 + Immunität R4 auf).

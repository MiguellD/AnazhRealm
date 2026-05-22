# Der Stamm-Pflege-Bogen — Code-Hygiene (V9.44)

Stand: 21.05.2026. **Schöpfer-Wahl: dieser Bogen kommt VOR der Hydrosphäre (V9.43-b)** — „scheint prio, damit die Weiterentwicklung danach sauberer ist". Ein externes Code-Audit + eine eigene Vermessung am Quellcode (`anazhRealm.js`, 34 811 Zeilen, eine Klasse, 761 Methoden) haben strukturelle Reibung gefunden, die jede künftige Welle verteuert. Dieser Bogen heilt sie — **ohne ein einziges neues Modul, ohne neue Abstraktionsschicht**. Er pflegt den Stamm, damit die nächsten Wachstumsringe sauber wachsen.

Dieses Dokument ist der Planungs-Anker (wie `hydrosphere.md` für das Wasser). Eine Session, die den Bogen baut, liest ZUERST dieses Dokument ganz.

---

## 1. Warum dieser Bogen — der Befund

Vermessung am echten Quellcode (grep/awk, Stand 21.05.2026):

- **761 Methoden in einer Klasse.** 51 davon > 100 Zeilen, 120 > 60 Zeilen, 219 > 40 Zeilen.
- **≈29 % der Datei (10 002 Zeilen) leben in Methoden, die länger als 150 Zeilen sind.**
- Die längsten Kontrollfluss-Funktionen (echte Logik, keine Daten-Tabelle):
  - `startEternalLoop` — **696 Z.**, der Game-Loop-Body ist eine einzige Closure
  - `_renderWorkshopDOM` — **658 Z.**, 159 DOM-Operationen
  - `init` — **545 Z.**
  - `loadState` — **435 Z.**
  - `_workshopRenderStatsPanel` — 323 Z.
  - `p2pHandleMessage` — **290 Z.**, 19 sequentielle `if (msg.type === …)`-Branches, bis 6 Verschachtelungs-Ebenen tief
  - `processChatCommand` — 289 Z.
- **Snapshot/Restore-Handkopplung**: `buildStateSnapshot` und `loadState` kopieren Baupläne mit einem fest-getippten Feld-Satz an zwei weit auseinanderliegenden Stellen. V8.59 war ein Bug-Fix genau hier (`portalMeta` ging beim Reload verloren). Jede neue persistente Bauplan-Eigenschaft ist ein Zwei-Stellen-Edit mit garantiertem Bug bei Vergessen.
- **Gekoppelte Felder ohne Setter**: `state.speed`/`sprintSpeed`/`jumpPower` werden an ≥2 Stellen geschrieben (DSL-Op `player_speed` + `recomputePlayerStats`). Jeder Schreibpfad muss die Kopplung `sprintSpeed = speed*2` selbst einhalten — die CLAUDE.md dokumentiert, dass genau hier schon ein Bug war (V7.72 Sprint-Bug-Falle).
- **Magic Values lückenhaft konstantisiert**: der `AnazhRealm.X`-Block trägt schon 88 Konstanten (die Disziplin existiert), aber Infrastruktur-Werte wurden vergessen — `http://localhost:11434` ×8, `ws://127.0.0.1:4313` ×8, `anazh://` ×6, der Backpressure-Wert `262144` ×2 (obwohl der verwandte `P2P_WORLD_CHUNK_SIZE = 16384` eine Konstante IST), der Spawn-Fallback `{x:0,y:50,z:0}` ×16, `JSON.stringify().slice(0, N)` mit fünf verschiedenen Limits (80/100/120/140/200).
- **204 `catch`-Blöcke**, davon **81 schluckend** (Body nur ein Kommentar). Die meisten tragen einen *erklärenden* Kommentar — bewusstes Schlucken, kein blindes; aber das Muster ist breit.
- **Namens-Inkonsistenz**: 43 P2P-Methoden mit `_`-Präfix, 8 ohne (`p2pHandleMessage`, `p2pSend`, `p2pTick`, …) — im selben Subsystem.

**Die Wurzel**: nicht eine schlechte Stelle, sondern ein **Wachstumsmuster ohne Funktions-Größengrenze**. Neue Wellen hängen Logik an bestehende Großfunktionen an (`p2pHandleMessage` wuchs Branch um Branch, der Game-Loop tick um tick), statt neue kleine Methoden zu bilden. Das ist die Schattenseite der „ehrlich klein geschnittenen Welle" — der einzelne Schnitt war klein, aber er landete im Monolithen.

**Was das KOSTET**: jede neue persistente Eigenschaft riskiert den Snapshot-Bug; jeder neue Mesh-Typ wächst die 19-Branch-Kette; jeder Game-Loop-Tick (die Hydrosphäre fügt `uTime`-Bumps + einen Wasser-Tick hinzu) wächst den 696-Zeilen-Monolithen. Der Schöpfer-Satz „damit die Weiterentwicklung danach sauberer ist" trifft genau das.

---

## 2. Vision-Abgleich — warum das KEIN Heilige-Lektion-Verstoß ist

Der erste Reflex bei „lange Funktionen, eine Riesendatei" wäre: **in Module aufteilen.** Das verletzt die Heilige Lektion direkt (§2 `state-of-realm.md`: „Komplexität ohne Fundament ist Sand … niemals re-komplexifizieren ohne Not"). Der 19-Modul-Kollaps von 2025 war genau das.

**Dieser Bogen modularisiert NICHT.** Die Auflösung des scheinbaren Konflikts:

1. **Eine Datei, eine Klasse, bleibt.** Großfunktionen werden in kleinere benannte Methoden DERSELBEN Klasse zerlegt. Keine neue Datei, keine neue Klasse, keine neue Abstraktionsschicht. Der Stamm bleibt EIN Stamm.
2. **Kein State-Manager, kein Redux, kein Event-Bus.** Direkte `this.state`-Mutation ist für einen Game-Loop richtig und bleibt. Der Bogen heilt nur *gekoppelte Felder* (ein Setter-Paar), er führt KEINE State-Management-Architektur ein. Das externe Audit schlug einen „State-Manager" vor — das wäre der Re-Komplexifizierungs-Fehler; er wird bewusst abgelehnt.
3. **Der Bogen ist die fraktale Disziplin (§1.3) auf den Code selbst angewandt.** Vision §1.3: *eine Sprache regelt alle Skalen.* Die Befunde sind Brüche dieser Disziplin auf Code-Ebene — zwei Snapshot-Stellen (zwei Sprachen für eine Sache), gestreute Magic Values, gemischte Schreibpfade für gekoppelte Felder. Der Bogen stellt die EINE Sprache her: eine Serialisierungs-Quelle, ein Konstanten-Block, ein Setter. Das Projekt fordert fraktale Konsistenz für die Welt — der Code soll ihr selbst folgen.
4. **Eine 696-Zeilen-Funktion IST Komplexität ohne Fundament.** Komplexität ohne inneres Fundament = ohne benannte Struktur. Der Bogen REDUZIERT Komplexität, er fügt keine hinzu. Er ist Vision-treu, nicht Vision-fremd.
5. **„Stamm + Wachstumsringe" heißt nicht „krummer Stamm".** Ein Baum mit dickem Stamm hat trotzdem gerade Fasern und klare Jahresringe — er ist kein Klumpen. Dieser Bogen ist Stamm-Pflege: den Stamm gerade halten, damit die nächsten Ringe (Hydrosphäre, Zukunft) sauber ansetzen.
6. **Präzedenz im Projekt.** V9.30 („pure Dead-Code-Welle ist die billigste, sie braucht keinen Verhaltens-Beweis"), V9.39 (~500 Z. Heightfield-Altcode gelöscht). Das Projekt HAT schon Hygiene-Wellen gemacht — toten Code entfernt. Der Stamm-Pflege-Bogen ist die nächste Stufe: nicht toten Code entfernen, sondern lebenden Code strukturieren. Dieselbe Disziplin, dasselbe Risiko-Profil.
7. **Es ist das Einlösen aufgelaufener Struktur-Schuld.** V9.40-Lehre: „eine Symptom-Heilung wird in einer späteren Welle Schuld." Die langen Funktionen sind genau das — viele ehrlich-klein geschnittene Wellen, die an Monolithen angehängt wurden. Der Bogen zahlt die Schuld zurück.

**Fazit**: dieser Bogen ist Vision-konform und Vision-stärkend. Er macht den Stamm tragfähiger für jedes weitere Wachstum.

---

## 3. Die Disziplin — reines Refactoring, der sicherste Wellen-Typ

Jede Sub-Welle ist ein **verhaltensneutrales Refactoring**: das beobachtbare Verhalten bleibt bit-genau gleich, nur die innere Struktur ändert sich. Das macht diesen Bogen sicherer als jede Feature-Welle.

**Der Beweis** (V9.30-Disziplin, „pure Welle braucht keinen Verhaltens-Beweis, nur den Nachweis dass nichts brach"):

- **Die bestehenden ~2966 Playtest-Invarianten SIND der Beweis.** Bleiben sie alle grün (Zahl ± normaler Drift), ist das Verhalten unverändert. Eine Refactoring-Welle braucht im Normalfall KEINE neuen Invarianten — anders als Feature-Wellen.
- Audit-Strict 0 Failures, Lint + Format sauber — wie immer.
- Optional ein paar **Struktur-Invarianten** als Regression-Schutz (`_serializeBlueprint` existiert; `p2pHandleMessage` nutzt einen Dispatch-Table) — aber der Hauptbeweis bleibt: alle alten grün.

**Bau-Regeln**:

- **Eine Sub-Welle = ein Commit, playtest-grün.** Nie zwei Sub-Wellen mischen.
- **Extraktion ist verhaltensneutral nur, wenn der Block keine lokalen Variablen über die Extraktionsgrenze teilt.** Wo er es tut (Game-Loop), werden sie explizite Parameter. Vor jeder Extraktion prüfen: welche lokalen Werte fließen rein, welche raus?
- **Deckt eine Sub-Welle einen pre-existing Bug auf** (wie V9.33 die fünf versteckten Bugs), wird er ehrlich geheilt + dokumentiert, nicht versteckt.
- **V9.44-f (Game-Loop) braucht zusätzlich einen Browser-Test** — der Loop ist die heißeste Stelle; ein Refactoring-Bug dort zeigt sich nur im echten Lauf.

---

## 4. Die sechs Sub-Wellen

Reihenfolge-Prinzip: vom sichersten + wertvollsten zum riskantesten. Die frühen Wellen bauen Vertrauen + Muster auf, die letzte (Game-Loop) ist die heikelste.

| # | Welle | Was | Wurzel-Befund | Aufwand | Risiko |
|---|---|---|---|---|---|
| a | **V9.44-a** | Persistenz-Schema vereinheitlichen | Snapshot↔Restore-Handkopplung (V8.59-Bug-Klasse) | ~1 Session | niedrig |
| b | **V9.44-b** | Kanonische Setter für gekoppelte Felder | Sprint-Bug-Klasse (V7.72) | ~0.5 Session | sehr niedrig |
| c | **V9.44-c** | Mesh-Router wird ein Dispatch-Table | `p2pHandleMessage` 19-Branch-Kette | ~1 Session | niedrig-mittel |
| d | **V9.44-d** | Infrastruktur-Konstanten konsolidieren | Magic Values (Ports/URLs/Schwellen) | ~0.5 Session | niedrig |
| e | **V9.44-e** | UI-Giganten zerlegen | `_renderWorkshopDOM` 658 Z., `initStatusPanel` 174 Z. | ~1-2 Sessions | niedrig-mittel |
| f | **V9.44-f** | Game-Loop bekommt Phasen-Struktur | `startEternalLoop` 696 Z. | ~2 Sessions | mittel |

### V9.44-a — Persistenz-Schema vereinheitlichen (Prio 1)

**Problem**: `buildStateSnapshot` und `loadState` kopieren Baupläne mit einem fest-getippten Feld-Satz (`name`/`label`/`parts`/`connections` + bedingt `role`/`toolMeta`/`portalMeta`/`roleManual` + W13-Signatur-Felder) an zwei Stellen. V8.59 fixte genau die Lücke — `portalMeta` fehlte im Restore-Pfad, ein geholtes Portal verlor beim Reload seine Ausrichtung.

**Lösung**: ein `_serializeBlueprint(bp)` / `_deserializeBlueprint(data)`-Paar als EINE Quelle des Feld-Satzes. Beide Save-Pfade routen hindurch. Das Muster ist im Projekt schon erprobt — `_serializeCreature` / `_restoreCreatureFromSnapshot` (V7.86/V8.66) tut für Kreaturen genau das. V9.44-a überträgt es auf Baupläne. Prüfen, ob weitere handgekoppelte Strukturen denselben Helfer brauchen (Materialien? Werkzeuge?).

**Beweis**: der bestehende Snapshot-Round-Trip-Playtest. Verhalten unverändert (der Feld-Satz bleibt identisch, nur an einer Stelle definiert).

**Wert**: heilt die teuerste Bug-Klasse der ganzen Datei — jede künftige persistente Eigenschaft ist danach ein Ein-Stellen-Edit.

### V9.44-b — Kanonische Setter für gekoppelte Felder (Prio 1, billig)

**Problem**: `state.speed`/`sprintSpeed` werden an ≥2 Stellen unabhängig geschrieben; die Kopplung `sprintSpeed = speed*2` muss jeder Pfad selbst kennen.

**Lösung**: ein `_applyPlayerSpeed(v)`-Setter (setzt `speed` + `sprintSpeed` konsistent). Alle Schreibpfade routen hindurch. Den Code nach weiteren gekoppelten Gruppen absuchen (`hp`/`hpMax`, `stamina`/`staminaMax` — prüfen, ob es eine echte Kopplung gibt) und ggf. ebenso behandeln. **KEIN State-Manager** — nur ein Setter pro echter Kopplung.

**Wert**: billig, schließt eine ganze Bug-Klasse (jeder dritte Schreibpfad würde sonst die Kopplung wieder vergessen).

### V9.44-c — Der Mesh-Router wird ein Dispatch-Table (Prio 2)

**Problem**: `p2pHandleMessage` — 290 Z., 19 sequentielle `if (msg.type === …)`-Branches, bis 6 Ebenen tief. Jeder neue Mesh-Typ wächst die Kette.

**Lösung**: ein `_p2pMessageHandlers`-Objekt `{ welcome: …, "peer-join": …, … }`; jeder Branch wird eine `_p2pHandle<Type>(msg, p2p)`-Methode. `p2pHandleMessage` schrumpft auf einen ~5-Zeilen-Dispatcher (Parse, Validierung, `handlers[msg.type]?.(msg, p2p)`). Die Extraktion ist mechanisch sicher, weil jeder Branch schon return-terminiert + in sich geschlossen ist.

**Hinweis**: die kanal-exklusiven Typen (`world-pull`, `world-chunk`, `llm-request`, `subworld-srv`, …) werden NICHT über `p2pHandleMessage` re-dispatcht — sie leben in `_p2pHandleChannelMessage`. Die Trennung bleibt unangetastet; V9.44-c berührt nur den `p2pHandleMessage`-Router.

**Wert**: die längste Router-Funktion + die tiefste Verschachtelung der Datei verschwinden; jeder künftige Mesh-Typ ist danach ein Tabellen-Eintrag.

### V9.44-d — Infrastruktur-Konstanten konsolidieren (Prio 3, billig)

**Problem**: Ports/URLs/Schwellen als gestreute Literale, obwohl der `AnazhRealm.X`-Block (88 Konstanten) die Disziplin schon trägt.

**Lösung**: in den bestehenden Konstanten-Block — `OLLAMA_DEFAULT_ENDPOINT`, `P2P_DEFAULT_WS_URL`, `P2P_BACKPRESSURE_BYTES` (= 16 × `P2P_WORLD_CHUNK_SIZE`, die Beziehung sichtbar machen), `INVITE_PROTOCOL`. Für den Spawn-Fallback `{x:0,y:50,z:0}` (×16) **KEINE geteilte Konstante** — ein geteiltes Objekt-Literal wäre ein Bug, sobald jemand es mutiert; stattdessen ein `_defaultSpawnPos()`-Factory-Helper, der ein frisches Objekt liefert. Die `slice(0, N)`-Log-Truncation vereinheitlichen (ein `_truncForLog(s, n)`-Helper oder ein fester Wert).

**Wert**: keine Verhaltensänderung, aber Drift-Schutz — eine zentrale Stelle pro Wert.

### V9.44-e — Die UI-Giganten zerlegen (Prio 4)

**Problem**: `_renderWorkshopDOM` (658 Z., 159 DOM-Operationen), `initStatusPanel` (174 Z., 4× fast-identische `data-cmd`-Delegations-Listener).

**Lösung**: Extraktion in benannte Sub-Render-Methoden (`_workshopRenderStatsPanel` existiert schon als Vorbild — weiter so schneiden). Die 4× `data-cmd`-Delegation → ein `_wireCmdDelegation(container)`-Helper. UI-Render-Code ist gut extrahierbar, weil er in sich geschlossen DOM baut.

**Wert**: die zwei größten UI-Builder werden lesbar; das Delegations-Muster wird eine Quelle.

### V9.44-f — Der Game-Loop bekommt Phasen-Struktur (Prio 5, größte)

**Problem**: `startEternalLoop` — 696 Z., der Loop-Body ist eine einzige Closure mit ~660 Z. Inline-Logik (Physik-Sync, Bewegung, Sprung, Kamera-Kollision, Voxel-Streaming, Killplane). Es ist die am häufigsten geänderte Stelle der Datei.

**Lösung**: die Inline-Blöcke in benannte Phasen-Methoden (`_loopPhysicsSync`, `_loopPlayerMovement`, `_loopCamera`, …). Die ~25 schon existierenden `tick*/update*`-Aufrufe bleiben. **Herausforderung**: der Loop-Body teilt lokale Variablen (`delta`, `currentTime`, `playerPos`) über die Blöcke — die müssen explizite Parameter werden. Vor jeder Extraktion prüfen: welche lokalen Werte fließen rein/raus.

**Disziplin**: bewusst zuletzt — nach a-e ist das Refactoring-Muster eingeübt und das Vertrauen aufgebaut. **Browser-Test verpflichtend** nach dieser Welle.

**Wert**: die heißeste Stelle der Datei bekommt Struktur; künftige Loop-Logik (Hydrosphäre-`uTime`-Bumps, Wasser-Tick) hängt sich an benannte Phasen, nicht in einen Monolithen.

---

## 5. Bewusst NICHT im Bogen — ehrlich benannt

- **`dslEffects` (892 Z.), `chatDslPatterns` (443 Z.), `_defaultBlueprints` (648 Z.), `constructor` (723 Z.)** — das sind Daten-/Dispatch-Tabellen bzw. das State-Init-Literal. Ihre Länge ist *Daten-Länge*, nicht *Kontrollfluss-Länge*; jeder einzelne Op / jedes Pattern ist klein. Sie zu „zerlegen" hieße eine Tabelle thematisch zu splitten ohne Wartbarkeits-Gewinn. `_defaultBlueprints` galt nie als Problem — dieselbe Logik. Bewusst nicht angefasst (Heilige Lektion: keine Komplexität hinzufügen, wo keine ist).
- **`playtest.cjs` (30 592 Z.)** — die Test-Ko-Evolution (jede Code-Zeile verlangt eine Test-Zeile in einer fast gleich großen Datei) ist die zweitgrößte Reibung des Projekts, aber sie ist der **bewusste Preis der Test-Disziplin**. Die Datei zu verkleinern hieße Tests zu löschen — Vision-Verletzung (das CI-Gate ist heilig). Dass die `playtest.cjs` selbst interne Struktur (Section-Marker, Test-Helper für wiederkehrende Muster) gebrauchen könnte, ist ein eigenes Thema — nicht der `anazhRealm.js`-Stamm-Pflege-Bogen.
- **Die Doc-Größe** (CLAUDE.md 2252 Z., handover.md 2700 Z., …) — das bewusste „Projektgedächtnis"-Design. Nicht in diesem Bogen.
- **Namens-Inkonsistenz `_p2p*` vs `p2p*`** — eine echte KI-Lesbarkeits-Reibung, aber das Umbenennen öffentlich-wirkender Methoden trifft alle Aufrufer + alle Tests = Risiko ohne Funktionsgewinn. Bewusst NICHT gebaut. Bekannte Rest-Grenze; falls je angegangen, dann als isolierte Mikro-Welle.
- **Die 81 schluckenden `catch`-Blöcke** — die meisten tragen einen erklärenden Kommentar (dokumentiertes, bewusstes Schlucken). Kein systematischer Umbau nötig; einzelne Fälle können bei Berührung mit-geheilt werden, aber keine eigene Welle.

---

## 6. Bau-Reihenfolge + Verhältnis zur Hydrosphäre

**Reihenfolge: V9.44 (Stamm-Pflege) ZUERST, dann V9.43-b/c/d/e (Hydrosphäre)** — Schöpfer-Wahl 21.05.2026.

Die Nummern-Folge (V9.44 nach V9.43-a, dann V9.43-b) spiegelt die *Plan*-Reihenfolge zweier zusammenhängender Bögen, nicht die Bau-Reihenfolge: „V9.43 — Wasser-Ultiversum" ist eine Bogen-Identität (a-e), „V9.44 — Stamm-Pflege" ist eine zweite (a-f). Gebaut wird der Hygiene-Bogen zuerst; `docs/hydrosphere.md` bleibt unverändert (die Hydrosphäre behält ihren Plan-Namen V9.43-b/c/d/e). Eine spätere Session, die die Hydrosphäre baut, vergibt die echten Commit-Nummern dann chronologisch.

**Warum zuerst**: die Hydrosphäre fügt eine persistente Datenstruktur (`state.hydrosphere`) + Game-Loop-Logik (`uTime`-Bumps, Wasser-Tick) hinzu. V9.44-a (Snapshot-Schema) und V9.44-f (Game-Loop-Struktur) machen genau diese Andock-Stellen sauber. Den Stamm zuerst gerade ziehen, dann den nächsten Ring ansetzen.

**Akzeptanz des Bogens**: nach V9.44-f sind die sechs Befunde geheilt, alle ~2974 Invarianten weiter grün, Audit-Strict 0, und die drei vom Audit benannten Kontrollfluss-Giganten (`startEternalLoop`, `_renderWorkshopDOM`, `p2pHandleMessage`) zerlegt. **Ehrliche Rest-Grenze** (Klammer-Vermessung der ganzen Datei nach V9.44-f): ~7 weitere Kontrollfluss-Funktionen über 200 Zeilen (`loadState` 380, `processChatCommand` 285, `generateTerrainWithParameters` 303, `_voxelChunkGeometry` 269, `_tickCreatureTaskDirection` 267, `_applyDayNightToScene` 287, `fuseWorlds` 239) + vier 200+-UI-Builder standen NICHT im Audit-Scope und bleiben — ein Kandidat für einen späteren Hygiene-Bogen, nicht für jetzt (die Hydrosphäre hat Vorrang). Die Weiterentwicklung dockt an die drei zerlegten Strukturen an, nicht mehr an diese Monolithen.

# docs/ — die EINE Karte

> **git ist das Archiv.** Jede Chronik, jeder vollendete Plan, jede historische Analyse lebt in der git-Historie und ist dort
> durchsuchbar (`git log --all --oneline -- docs/` · ein Dokument wiederholen: `git show <sha>:docs/<name>.md`). Im Baum
> liegt NUR, was JETZT trägt: Norm, Vision, Kompass. Diese Karte nennt JEDES Dokument des Baums mit seinem
> Zweck; die Zitat-Wand (`gate:betriebsgesetz`) macht jedes ungenannte Dokument und jeden toten Pfad, `_namen` oder
> `gate:`-Namen in einem Dokument ROT. Ein neues Dokument braucht ein Urteil: Norm (bleibt) oder Welle (Commit-Message);
> das Offene trägt allein die Meisterkarte 2 (unten).

## Einstieg und Gesetz

| Dokument                      | Zweck                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                   | **AUTO-GELADEN** — die GOLDENE DEFINITION, das BETRIEBSGESETZ, der Stand und die Verweise auf die Karten.       |
| `.claude/skills/anazh-lehren/SKILL.md` | Der Skill der Lehren 1–27 (die Anker des Codes), die Architektur, die Quelle je Domäne, die Workflows.  |
| `README.md`                   | Die Tür für Fremde — was AnazhRealm ist, Schnellstart, der eigene Leuchtturm (Self-Host), die Prüf-Befehle.    |
| `docs/README.md`              | Diese Karte — jedes Dokument des Baums mit einer Zeile Zweck.                                                  |
| `.claude/agents/champion.md`  | Das CHAMPION-Gesetz für jeden Arbeiter (G1–G8, Ablauf A–E, Pflicht-Output).                                     |
| `.claude/commands/champion.md` | Der Befehl `/champion` — ein Auftrag unter dem CHAMPION-Gesetz.                                                |
| `.claude/commands/audit.md`   | Der Befehl `/audit` — die Diagnose-Runde über Statik, Anti-Muster, Speicherstand und Offen-Abgleich.           |

## Vision und Kompass

| Dokument                     | Zweck                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `docs/state-of-realm.md`     | **DIE VISION** — die Pfeiler, die heilige Lektion, was auf der Ziellinie v1.0 steht, das Welten-Ultiversum.     |
| `docs/roadmap.md`            | **DER KOMPASS** — die Ziellinie (§0), Narben (§2), Teilsysteme (§3), Samen (§4); keine eigene Offen-Liste.       |
| `docs/das-lebendige-feld.md` | **DER WAHRE NORDEN** — die Welt als EIN Feld, das alle lesen · schreiben · WERTEN. Vor Feld/Emotion/DSL zuerst.  |
| `docs/das-feld-zeichnet.md`  | Der Render-Bogen des Feldes — drei Stufen, kein dritter Spiegel (die Ferne liest den Gelände-Kern), Warm-Start. |
| `docs/abnahme-drehbuch.md`   | Die EINE Schöpfer-Runde — das Browser-Drehbuch in 19 Schritten (Scope/Ship, kein Merge-Tor).                    |
| `spike/einheit-sicht/BLATT.md` | Der Spike SICHT der EINHEIT (E7) — Pixel-Zensus je System, die Orte der Sicht, Vendor-Befund, S1–S5 mit Bildern. |

## Norm

| Dokument                               | Zweck                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `docs/studio-vertrag.md`               | Die Naht Studio↔Welt (Manifest v1.2: `PARAMS_BY_KIND`, must-ignore, fail-closed); `gate:studio-vertrag`.   |
| `docs/taille-spec.md`                  | Die gefrorene Taille — Draht-Formen, Snapshot, Broker-Protokoll §7 (Goldens in `spec/golden/v1/`).          |
| `docs/neues-kleid-verfassung.md`       | Die Pipeline-Verfassung — die Gesetze der EINEN Pipe (`gate:constitution`).                                |
| `spec/asset-contract/v1/CONTRACT.md`   | Asset-Vertrag v1 — Pflanzen und Fels, der Draht des Worker-Replies (Goldens daneben).                      |
| `spec/asset-contract/v3/CONTRACT.md`   | Asset-Vertrag v3 — Fahrzeuge.                                                                              |
| `spec/asset-contract/v4/CONTRACT.md`   | Asset-Vertrag v4 — Tore.                                                                                   |
| `spec/asset-contract/v5/CONTRACT.md`   | Asset-Vertrag v5 — Klingen und Werkzeuge.                                                                  |
| `spec/asset-contract/v6/CONTRACT.md`   | Asset-Vertrag v6 — Häuser (Fachwerk-Kulturen).                                                             |
| `spec/asset-contract/v7/CONTRACT.md`   | Asset-Vertrag v7 — der Daten-Vertrag der MESHFREI-Kerne (Studio-Vertrag §8).                               |
| `spec/asset-contract/ofen/CONTRACT.md` | Der Ofen-Vertrag — der Tier- und Mensch-Bake je Stoff-Klasse × Gelenk.                                     |
| `spec/pack/v0/CONTRACT.md`             | Der Pack-Vertrag — der IDB-Asset-Cache (v0) und die Pack-Hülle (v1); `gate:pack-contract`.                 |
| `vendor/README.md`                     | Die eingebundenen Fremd-Bibliotheken — Quelle, Rolle, Erneuern (`gate:vendor-anker`).                      |

## Das Offene: die Meisterkarte 2

Der EINE Scope und der EINE Zähler ist die Meisterkarte 2 — 1 718 Sprossen, gebucht 36 (Stand `vision/karte-2-stand.json`,
Leitern in `vision/kapitel/`, beides im Zweig `punkte-maschine`). Die frühere Frozen-Liste A–F fiel am 19.11. (Wort des Schöpfers)
in ihre Leitern; „erreicht“ ist `heute` der Leiter am selben Stand:

| früher | Leiter der Karte 2 | erreicht | fällt offen (keine Sprosse) |
| --- | --- | --- | --- |
| A AAAA je Klasse | Tiefe der Sprosse 1 jeder Inhalts-Leiter, z. B. `leben.pflanzen.dichte` (Laub-Kante im Richter), `mensch.bau.huelle`, `planet.wasser.seegang`; die Soll-Tafel als Bedingung in `same.preis.ankunft` S 3–4 und `same.preis.takt` S 2–7 | 0/6 · 0/6 · 0/8 | der EINE Durchgang „jede der 12 Klassen zugleich GRÜN, Uhr × Sicht, Ego und Third, nah und fern“ |
| B Ankunft ≤ 5 s kalt | `same.preis.ankunft` (das Soll ist S 4) | 2/8 | — |
| C Verkehr | `mensch.netz.verkehr` (Bewohner am Steuer S 2, 10² Teilnehmer S 3), dazu `mensch.netz.massenverkehr` | 0/8 · 0/7 | — |
| E Profi-Band | `same.preis.takt` (ABAB Wiese + Genesis, Ego + Third, beide Geräte: S 2) und der Preis P in jeder Sprosse | 1/7 | die Wände CPU-Takt p95 ≤ 5,8 ms, ≤ 208 Befehle, ≤ 680k Dreiecke |
| F Prüfplatz | `mensch.sport.regeln`, `mensch.sport.arena`, `mensch.macht.krieg` | 0/8 · 0/7 · 1/9 | der Ort selbst (EIN Plan: Rondell mit zehn Toren, Park und Teich, Zoo), die Schaukel nach dem Pendel, die Strecke (Runde 55–65 s, 18–22 m Flug) |

**Chronik:** `git log` (Commits sind klein, thematisch, deutsch — die Message IST der Eintrag). **Messplatz-Aufträge und
-Berichte** (OMEN = GTX 1060, Radeon 890M): der Zweig `koordination` (`auftrag/`, `bericht/`), nie in main. **Abgabe eines
Arbeiter-Zweigs** (Kopf, je Sprosse Stand mit Zahl, Offenes mit Leser): `cloud-post/wetter-am-ort.md` (Zweig `wetter-am-ort`).

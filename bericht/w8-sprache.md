# w8-sprache — die KI antwortet in der Sprache des Spielers (spielgang.K5#2) · der wahre Schreiber des Regens (affekt.K4#2)

Spiel-Zweig `w8-sprache` (Basis main 2d2a5f11 + w6-spielgang-decke 8e78c2df), pm-Zweig `w8-sprache-pm` (Basis punkte-maschine 988f019b).
Gemessen headless in der Cloud (Null-Renderer), das Modell nicht: in der Cloud steht keins.

## Geschnitten

- Die Sprache des Spielers ist EIN Zustand: die gewählte Spalte der Tafel (`_sprache`), die KI liest sie über `AnazhRealm._spracheKi`
  (stamm/dienst.js) — der Welt-Prompt (`ki.welt.say` und die neun Beispiele `ki.beispiel-*` in der Spalte des Spielers,
  stamm/feld-nexus.js `llmBuildSystemPrompt`), der Prompt der Seele (`ki.seele.sprache`), die Erinnerung an das Modell, die Stimme
  (`grokRender` spricht `en-US` oder `de-DE`).
- Jede Antwort des Regel- und des Nexus-Wegs ist eine Zeile der Tafel `[schlüssel, werte]`: `describeProgram` samt Ort und Bedingung
  (`tat.*`), die 46 Chat-Sätze (`describe:` → `chat.satz.*`), der Satz des Ergebnisses (`ergebnis.*`) und seine Gründe (`SETZ_GRUND`
  und `NATUR_WAND_GRUND` tragen Schlüssel `grund.*`), die Stimme des Felds (`feldstimme.*`), die Absagen der Gesetze und Studio-Sätze,
  die Orts-Gründe der DSL (`dsl.grund.*`), die Fehler der KI-Tür (`llm.fehler.*`, 24 Zeilen), die Hilfe, der Portal-Weg.
- Der Schreiber des Wetters ist Zustand: `_setWeather` schreibt `wetterSchreiber` (die Quelle; beim Zug der Wunsch, den er zieht —
  Nexus, seine Gesetze, die Emotion, die Wesen — sonst die Front), er reist im Stand. Der Kontext der KI (`llmBuildContext`) nennt ihn
  („Das Wetter „rainy“ schrieb: Der Nexus — …“), ohne KI antwortet die Welt auf „warum regnet es?“ selbst (`_wetterWarum`).
- Der Korpus (spec/abnahme/ki-korpus.json) trägt „warum regnet es?“ mit `schreiber` (spieler: `human` · nexus: `nexus`, die Quelle am
  `_setWeather`) und den Teil `en` (41 Sätze, dieselben Prädikate an derselben Stelle).
- Die Linse (Gebot 10): `gate:sprache` sieht Wert-Text — `describe:`, `absage:` und die Rückgaben der Satz-Bauer sind Senken, drei
  Mutanten im Selbsttest. Die FEIND-Wand (gate:v1-pfad) kennt die Zeile der Tafel (die Tür isoliert ihre Werte).
- Die Decke: 20 verstreute Wort-Tests von `describeProgram` in sechs Playtest-Dateien fallen in EINE Klassen-Probe (jedes Op eine Zeile
  in de und en, die Werte darin, die Liste der Gesten liest das Programm).

## Gemessen

| Probe | Basis (w6 + main) | w8-sprache |
|---|---|---|
| spielgang.K5#2 de.regel / de.nexus | Prompt 0/43 (er nennt keine Sprache) | 42 · 43 Sätze, 47 · 159 Zeilen, fremd 0, Prompt 43/43 |
| spielgang.K5#2 en.regel / en.nexus | en.nexus 42 fremde Zeilen, Prompt 0/43 | 42 · 43 Sätze, 46 · 158 Zeilen, fremd 0, Prompt 43/43 |
| Selbsttest im Lauf (prompt-de · tafel-de · schreiber) | — | 3/3 ROT |
| „warum regnet es?“ — der wahre Schreiber (Kontext der KI, Antwort der Welt; 2 Fälle × 2 Wege × 2 Sprachen) | 0/8 | 8/8 |
| Modell-Weg mechanisch (Schein-Ollama) | — | de 84/84 · en 84/84 Zeilen in der Sprache |
| gate:sprache Wert-Text (die neue Linse an der Basis) | 142 hart | 0 |
| FEIND-Wand (gate:v1-pfad) | 65 ungetarnt (seit w6) | 0 |
| affekt.K4#1 (die Stimme des Felds, 30 Spielminuten) | — | 57 Zeilen, 0 falsch, Abstand 30 s; Mutante „schreiber“ 53 falsch |
| Decke scripts/ (gegen origin/integ-probe) | — | −748 Atome |

Grün am Spiel-Zweig: `npm run check`, `npm run playtest:fast` (21 ✅), `npm run playtest` (Alle Invarianten OK), gate:v1-pfad (Korpus
41 Sätze, Absicht 0,902 ≥ 0,9), gate:werk-im-wasser, gate:ankunft, gate:fahr-leben, gate:mp-sync, gate:wetter-wache,
gate:weltakt-wache, gate:werkstatt-weg, gate:weltgrenze, gate:boot-rettung, gate:sprache. Am pm-Zweig `punkte.cjs selbsttest --ohne 3c`:
die Proben der Station 10/10 im Urteil, FORMAT ROT nur an der Radeon-Fahrt (siehe FUND, an der Basis dieselbe Zahl).

## Nur am Modell messbar

- Ob qwen3:4b-instruct in der Sprache des Prompts antwortet: die Station fragt es (env KI_ENDPUNKT/KI_MODELL, die Farm stellt ollama);
  ohne Modell steht „MODELL ungemessen“ mit Grund in der Zahl.
- Ob das Modell den Schreiber beim Namen sagt (affekt.K4#2, `warumLauf`): der Kontext trägt ihn jetzt wahr.
- Die Welt-Prädikate der EN-Sätze am Modell (ki.K1 misst die DE-Sätze).

## Ehrlich offen

- Der Regel-Weg versteht EN-Sätze nicht als Taten (die Grammatik der Chat-Muster ist deutsch): er antwortet englisch und zeigt den Weg zur
  Hilfe; die Taten aus EN-Sätzen trägt die KI.
- Die Namen der Studios im Absage-Satz (`_studioWordsForPrompt(true)`: die Gruppen aus den Gesetzbüchern) stehen in der Sprache des Buchs.

## FUND

- gate:nervensystem ROT an w6 × main (ohne diesen Zweig gleich): `stamm/studio-bruecke.js` `_stammbaum` liest `gestalt.meilenstein`
  (das neunte Buch, worlds/neuntes-buch/stele-core.js), die strenge Tafel wirft; trägt die Tafel die Zeilen (gestalt.meilenstein ·
  grenzstein · obelisk · art.stele · studio.stele), fällt die Linse E („ohne eine Zeile im Wirt“). Wurzel: zwei Gesetze über die Namen
  eines Buchs — w6 (jede Zeile aus der Tafel) gegen studios.K5 (ein Buch braucht keine Zeile im Wirt). Kriterium spielgang.K5#1 · studios.K5.
- punkte-maschine 988f019b: `selbsttest` FORMAT ROT — Radeon-Fahrt 1 825 s > 1 800 s (Σ Deckel 1 765 s in 73 Läufen + Boot 60 s).

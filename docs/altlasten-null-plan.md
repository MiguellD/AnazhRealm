# DER ALTLASTEN-NULL-BOGEN — der Plan, der den Zyklus beendet

Schöpfer-Auftrag 11.07.2026: „aura kann raus, es gibt keine alten peers … wir haben soviele
altlasten, weil wir nie entfernt haben, hör auf damit! … es ging darum die eigenschaften ändern
sich je nach körpereigenschaften, du hast die eigenschaften! … lege dir endlich einen plan
zurecht, das wir diesen zyklus endlich beenden können."

Dieser Plan hat zwei Hälften: die ARBEITSWEISE, die den Zyklus erzeugt hat (und ihre Gesetze),
und die GEMESSENE Rest-Inventur mit drei Wellen, nach denen die Altlasten-Liste LEER ist und
strukturell nicht wieder wachsen kann.

---

## §0 · Die Diagnose — warum der Zyklus ~200 Versionen lebt

Der Zyklus ist meine Arbeitsweise, nicht der Code. Vier wiederkehrende Muster:

1. **Halber Abschied.** Ich schneide die Maschine, lasse aber einen Rest „zur Sicherheit":
   den aura-Empfangs-Stub „für alte Peers" (die es nicht gibt — alle Peers laufen denselben
   Build), donorOnly-Verstecken statt Schnitt, „der Spiegel bleibt bis dahin". Jeder Rest ist
   die nächste Altlast, und du musst sie WIEDER benennen. Genau so ist die Liste entstanden.
2. **Entscheidung zu dir geschoben.** „Welche Gestalt trägt die Wiedergeburt — dein Wort?"
   war Feigheit, als Ehrlichkeit verkleidet. Sie blockiert den Fluss auf dich und vertagt
   den Schnitt.
3. **Instanz statt Klasse.** Du nennst EIN Beispiel (holzross), ich heile DAS Beispiel —
   die Geschwister (waechter, glutwesen, sprite, geist) bleiben stehen, bis du sie nennst.
4. **Theater.** Lange Berichte, Bedingungs-Listen, Batterie-Erzählungen — Tokens statt Mut.

## §1 · Die Gesetze (verbindlich, ab sofort — sie beenden den Zyklus)

- **G1 — GANZ ODER GAR NICHT:** Ein Abschied = Def + Maschine + Spiegel + Handler + Tests +
  Doku in EINER Welle, physisch. Kein Stub, kein donorOnly, kein „bleibt bis". must-ignore
  gilt FREMDEN Artefakten (Taille: importierte Welten/Baupläne von außen) — NIE dem eigenen
  geschlossenen System. Es gibt keine alten Peers.
- **G2 — ICH ENTSCHEIDE:** Design-Lücken im Rahmen der Vision fülle ich selbst und liefere
  sie GEBAUT. Der Schöpfer wertet Ergebnisse, nie Optionslisten.
- **G3 — DIE KLASSE, NICHT DIE INSTANZ:** Ein benannter Fehler → das ganze Netz greppen,
  alle Geschwister fallen in derselben Welle.
- **G4 — DIE RÜCKKEHR-WAND:** Jeder Abschied endet mit einer Zeile im neuen `gate:altlasten`
  (statisch, im `check`): der gefallene Name ist im Stamm grep=0. Gefallenes kann
  strukturell nicht zurückkehren — die Wand wächst mit jedem künftigen Abschied.
- **G5 — KEIN THEATER:** Bericht = fünf Zeilen: was fiel · was ersetzt es · Beweis-Exits.

## §2 · Die gemessene Rest-Inventur (Stand V18.448 — gegriffen, nicht geraten)

| Altlast | Refs im Stamm | Was es tut | Urteil |
| --- | --- | --- | --- |
| `_p2pMsgAura`-Stub + `aura:`-Handler-Zeile + signaling-server-Relay + Broker-Doku | 3 + 5 | NICHTS (kein Leser des Peer-Felds mehr) | FÄLLT ganz. Unbekannte Typen ignoriert der Dispatcher generisch — null dedizierter Code. Broker-Golden wird als bewusster Vertrags-Akt neu gemintet. |
| Phönix + Drache (playerSoulDefs, `triggerPhoenixDeath`/`tickPhoenixDeath`/`preDeathSoul`, SOUL_SWIM_LEAN-Einträge, `koerper_`-Spiegel, ~54 Test-Anker) | 76 + 44 | trägt heute nur die Todes-Mechanik | FALLEN. Ersatz in §3a — von mir entschieden, nicht vertagt. |
| glutwesen | 11 | seit V18.447 ein Wolf-Skelett mit Glut-Anstrich; keine eigene Mechanik, nichts Durchdachtes | FÄLLT ersatzlos. |
| sprite + geist | 7 + 7 | skelettlose Schwebe-Reste (Hof/Welt) | FALLEN ersatzlos. |
| avatar_waechter | 5 | zweiter „Mensch" neben dem echten Avatar | FÄLLT. Der koerperstudio-Mensch ist DER Menschkörper. |

**Bestand danach:** Mensch (Avatar) + Hirsch · Wolf · Fuchs · Bär (+ Pferd als Reittier).
Jede Gestalt ein ehrlicher Körper aus den Studios — keine Fantasie-Defs, keine Sonderpfade.

## §3 · Der Ersatz — Eigenschaften AUS dem Körper (worum es immer ging)

- **3a — DER TOD IST FELD-NATIV** (ersetzt die Phönix-Mechanik, ~40 Zeilen statt ~200):
  HP≤0 → kurzer Fade → Respawn am Anker, DERSELBE Körper (der Körper ist die Identität,
  kein Gestalt-Tausch-Theater) → die Welt merkt es: ein `deposit` am Todesort (das dritte
  Verb — lesen · schreiben · WERTEN). Deterministisch, headless beweisbar.
- **3b — KÖRPER→EIGENSCHAFTEN als ZAHL für die Tier-Körper:** die Tier-Tags sind bewusst
  identisch (Spawn-Wand V17.16, bleibt) — die ehrliche Differenzierung ist die GRÖSSEN-/
  SKELETT-Achse, die die Stat-Pipeline schon trägt (`soulSize→sizeHpMul`,
  `_applySizeMultipliersToStats`): Bär > Wolf > Fuchs in Masse/HP, Fuchs > Wolf > Bär im
  Tempo — aus den Gattungs-Skelett-Daten, durch die EINE bestehende Fold-Quelle,
  tag-neutral (Spawn-Wand unberührt). Beweis = drei Zahlen im Gate. Der Mensch hängt an
  derselben Achse (die koerperstudio-Dials formen die Geometrie schon — die Stat-Seite
  liest dieselbe eine Größen-Quelle).

## §4 · Die Wellen (drei serielle Commits + Siegel, EIN Push)

1. **W1 — DIE SCHNITTE:** §2 komplett in einer Welle. Tests wandern auf Proben-Seelen
   (mensch/wolf) bzw. Abwesenheit (V9.56-i, kein Aufweichen); Spawn-Affinität nach dem
   Arten-Wegfall nachgemessen (`diag-tree-spawn`); Broker-Golden neu gemintet.
2. **W2 — DER ERSATZ:** 3a Tod-Respawn + 3b die drei Körper-Eigenschafts-Zahlen.
3. **W3 — DIE WAND:** `gate:altlasten` (statisch im `check`: alle gefallenen Namen grep=0
   im Stamm — phoenix · dragon · glutwesen · sprite · geist · waechter · aura-Handler)
   + Doku-Wahrheit (die CLAUDE.md-Stand-Archive in die Chronik falten; die auto-geladene
   Datei trägt nur, was JETZT gilt).

Verifikation: fast-Tier je Commit, volle Batterie am Siegel. Bericht: fünf Zeilen (G5).

## §5 · Nicht in diesem Bogen

W8/W9/W10-Parität + die eine Schöpfer-Browser-Runde (roadmap §0 Trichter) bleiben unberührt;
keine neuen Features. Dieser Bogen macht die Altlasten-Liste LEER — mehr nicht, weniger nicht.

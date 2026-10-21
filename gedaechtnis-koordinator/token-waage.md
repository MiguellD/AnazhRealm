---
name: token-waage
description: "Schöpfer 18.10.: „Loch ohne Boden?“ — gemessen: Macher kosten Schritte × Kontext (je ~250 Schritte, ~400k Kontext, 24–83 M Cache-Lesen in 43 min); Orientierung aus dem Quelltext statt Karte; Hebel Vorkauen + Phasen-Schnitt + Werkzeug-Hilfe"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2b13722a-0205-4448-b060-fd9a5a74527e
  modified: 2026-10-18T07:02:00.973Z
---

Schöpfer 18.10.: „Die Macher scheinen noch immer tokenschwer … haben wir gelernt, oder wieder ein Loch ohne Boden?“

**Gemessen** (`node artifacts/profiband/werkzeug/token-waage.cjs <workflow-dir>`, wf_d27440ef-a54, 8 Macher nach 43 min):
je 190–300 Schritte, Kontext 210–435k, Cache-Lesen 24–83 M (zusammen ~450 M), Ausgabe 50–170k. Woche 2 → 4 % in ~1 h —
dieselbe Brenn-Rate wie die Woche davor (98 % nach ~30 h). Gelernt hat die LESE-Disziplin (Median 2,3 KB je Lesen, keine
Datei-Dumps, Bilder billig, Warten billig). NICHT gelernt: die ORIENTIERUNG — Code-Lesen 73 % der Werkzeug-Ergebnisse,
atlas 23× gegen grep 556×, `scripts/werkbank.cjs` 124× gelesen (Agenten suchen Befehle im Quelltext); und der eine lange
Kontext je Macher: Kosten ∝ Schritte × Kontext, ~1/3 Werkzeug-Ergebnisse, ~1/3 eigenes Denken.

**Why:** Die Klarheit (D) liegt im Repo, aber kein Brief lenkt die Agenten dorthin; jeder Macher entdeckt die Welt neu.

**How to apply (jede Welle):**
- VORKAUEN: der Koordinator gibt je Karte die Wurzel-Karte (Datei:Methode:Zeile, Linsen-Familie + Befehl) aus EINEM billigen
  Späher (atlas `--find`, Explore) — der Macher sucht nicht.
- WERKZEUG-HILFE statt Quelltext: `node scripts/werkbank.cjs --help | grep "werkbank.cjs"` ist die Befehls-Tafel; nie den Quelltext
  eines Werkzeugs lesen, um ein Verb zu finden.
- PHASEN-SCHNITT mit frischem Kontext: Finder (Linse rot + Wurzel → befund.md ≤ 60 Z.) → Schneider (liest befund.md, schneidet,
  beweist) → Prüfer (befund.md + Diff). Ziel: Kontext je Agent < 150k.
- Die Zahl je Welle: token-waage + Tokens je gemergtem Zweig in der Merge-Message; die nächste Welle ist der Richter.
- BELEGT 18.10. 01:27: Übernahme-Welle wf_365223b2-d30 (karten-welle.js, Pool 4, frischer Kontext je Phase): Agenten 31–131k
  Kontext statt 500–700k, Cache-Lesen 1–6 M statt 24–200 M; Woche 15 min lang 12 % → 12 % (vorher +2 % je 15 min). Der
  F4-Übernehmer fand in 7 min, was der alte Macher in 110 min nicht ablieferte (Gesetz 2612 → 0, die Bild-Probe blind am Täter).
- NACHBESSERER-LOCH (18.10. 09:00): verlangt der Prüfer einen Umbau der Bauart, wächst der Nachbesserer im alten Kontext
  (F4 R3: 148 min, 584k, 184 M Cache-Lesen). Darum SELBSTGRENZE in karten-welle.js (~250 Schritte oder Bauart-Umbau → befund.md
  fortschreiben, WIP, zurück) und Bauart-Funde als neue Karte mit frischem Finder, nie als Nachbesserung.
- GPU-SCHLOSS-STAU (60 min, kein Macher durch): 8 Macher teilen EINE Radeon — jeder echte Lauf 2–6 min seriell, Wartende pollen
  (`until … sleep 5`) und jeder Poll-Schritt liest ~450k Kontext. Darum je Maschine ≤ 4 Karten mit echter GPU, die übrigen
  auf den OMEN oder auf Null-Renderer/swiftshader-Linsen; Warten nur als run_in_background mit EINER Meldung.
Siehe [[dirigieren]], [[klarheits-audit]], [[richter-macher]].

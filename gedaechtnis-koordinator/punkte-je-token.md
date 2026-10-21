---
name: punkte-je-token
description: "Schöpfer 21.10.: „Stunden gearbeitet, Meisterkarte 23/330 — ging kaum voran?“ — Maß ist Punkte je Token; schlanke Karten, kein Prüfer-Agent, nur Staffel-Überschreiter"
metadata:
  node_type: memory
  type: feedback
  originSessionId: faa4c690-08a9-44d0-a964-4ddf843e85ff
  modified: 2026-10-21T07:35:34.295Z
---

Am 21.10. fragte der Schöpfer nach ~13 h Arbeit: „e-bauart schneider sehe ich auf dem omen 8h? meisterkarte 23/330 … ging kaum voran?“
Bilanz: Woche 50 % → 76 % für +6 Punkte (17 → 23); viele echte Schnitte (Belegung −28 % GTX, Lichtweg, Luft je Kanal) überschritten keine
Staffel = 0 Punkte; je Karte 4 Agenten (Finder/Schneider/Prüfer/Nachbesserung) à 300–400k Token; 5–6 Radeon-Agenten verdarben die Messungen;
der OMEN maß e-bauart 3 Serien lang, obwohl der Spike schon −0,04 ms sagte.

**Why:** Der Schöpfer misst Fortschritt an der Meisterkarte (Belohnungs-Kriterien), nicht an Merges oder Apparat. Prüf-Schleifen sind Theater,
wenn sie keine Staffel bewegen.

**How to apply:**
- Karte nur, wenn sie mit Zahl eine Staffel überschreitet (vorher prüfen: wo steht die Zahl, wo die Linie); Punkte je Token ist das Maß.
- `karten-welle.js` mit `schlank: true` + `direkt: true`: EIN Macher, kein Prüfer-Agent; der Koordinator liest Diff + Zweig-CI selbst.
- Höchstens 2–3 Karten parallel auf der Radeon.
- Spike sagt „trägt nicht“ → sofort stoppen, keine Bestätigungs-Serien bestellen.
- OMEN zuerst auf GTX-Messungen, die Punkte buchen (Messschuld), nicht auf lange ABAB-Serien ohne Staffel-Wirkung.
- Gemessene Kriterien sofort buchen, sobald main sie trägt.
Siehe [[macher-gesetz]], [[selbst-organisieren]], [[token-waage]].

**21.10. nachmittags (Schöpfer: „seit OMEN auf hoch kaum Fortschritt, Testloops und Theater“):** Ursache war nicht die Denktiefe, sondern
meine Aufträge (Bündel 3, Bisektion, Nachstellung, Bündel 4) plus das ci-lokal des OMEN (die ganze CI-Batterie lokal vor jedem Push,
stundenlang, doppelt zur GitHub-CI). Regel: der OMEN fährt nie ci-lokal — lokal nur check + playtest:fast + die berührten echt-Wände;
EIN gemeinsames ABAB je main-Vorlauf (2+2, zwei Zellen), keine Serie ohne Auftrag; zuerst Messungen, die Punkte buchen.

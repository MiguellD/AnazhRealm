# Auftrag 18.10. 12:30 (Koordinator) — OMEN: F6 (Nacht-Fernfarbe) vor integ auf der GTX messen

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Einschieben zwischen B5-Phasen (cpu_ruhe gilt).

F6 ist vom Radeon-Prüfer in Runde 2 merge-reif (Zweig nacht-fernfarbe, Kopf e2485995, CI 39111603239 grün). F6 ist PIXEL-Arbeit:
das additive Licht-Band der Host-Stoffe fällt, die Karte trägt die ganze Normale oktaedrisch (Bake-MRT), die Sonnen-Sicht rg8
(Zenit + 45°-Kranz, Atlas ~+10 %), der Nacht-Boden wird Ambient der EINEN Kette (S0-Schwelle Nacht 30 → 22).
Regel seit 18.10.: Takt-, Streaming- und Pixel-Karten nur nach echt-Batterie + ABAB am EXAKTEN Kopf nach integ.

A = origin/integ-probe (der Kopf nach dem CI-Lauf, den ich gerade fahre; Stand dd4de393 + leerer CI-Commit),
B = A + `git merge --no-ff origin/nacht-fernfarbe` (merge-tree konfliktfrei laut Prüfer).
1. echt-Batterie an B auf dem CI-Weg (alle Schritte des Jobs echt, LINSE_GPU=karte) — jedes Rot mit Schritt und Meldung.
2. Lauf-ABAB A gegen B: Wiese + Genesis, Ego + Third, stehend UND gehend, je 4 Welten im Wechsel; Frame p95, GPU-Durchsatz p50
   (gpu-bank), VRAM, Atlas-MB. Urteil „nicht langsamer“ ja/nein je Ort × Sicht.
3. EIN Blick nachts an der Mess-Wiese (Ausgabe-Pfad): Fern-Kronen im Nachtlicht wie die Nähe?
Bericht `bericht/1810-f6-gtx.md`, Nachricht nur „neue Datei + Urteil“. Ich merge F6 nur bei echt grün + nicht langsamer.

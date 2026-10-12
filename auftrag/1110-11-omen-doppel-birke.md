# Auftrag 1110-11 an den OMEN: Die Birke steht nie doppelt

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Risiko R2. Vorrang vor welle-m-e-torwurf (WIP sichern).

ANLASS (Bericht 1110-10):
- An der Wiese steht die Birke 5 m vor der Kamera doppelt: f:birke:L1 inst 4 (dMin 5 m) zusätzlich zur L0. Das kostet 0,6–1,5 ms GPU.
- B (V18.542, jetzt main a0a05614) trifft den Zustand in 7 von 7 Boots, A (V18.541) in 1 von 3. Die Bisektion zeigt ihn auch vor K11.
- Koordinator-Entscheid: main ging trotzdem auf V18.542, offen benannt. Der Defekt ist alt, nur häufiger geworden, Frame p95 gleich, Genesis −20 MB/−1,3 M Dreiecke. Dieser Schnitt ist darum der nächste.

AUFTRAG:
1. Den Auslöser beim Namen nennen. Warum trägt eine Instanz innerhalb von d0 (5 m) die L1-Senke, während die L0 steht? Kandidaten:
   - der Cross-Fade-Rest (gate:foundry-crossfade)
   - die Stufen-Wahl `_wahlHaelt` nach einem Boot-Rennen (der Bäcker liefert L1 vor L0, und die L1 fällt nie)
   - die Instanz-Senke ohne Abschied (`_instanzAbschied`)
2. An der Wurzel schneiden: Eine Instanz steht in genau EINER Stufe außer im Cross-Fade-Fenster, und das Fenster endet.
3. Linse in einer bestehenden Familie (Stufen-Wahrheit): über alle Baum-Instanzen im Cull-Radius die Zahl „doppelt außerhalb des Fade-Fensters“. Vorher ROT beim Namen in B, nachher 0 in 7 von 7 Boots.
4. Beweis: Wiese-ABAB mit Takt, baum 3,49 → ~2,1 ms, gpu-bank −1,2 ms. Dazu das Bild der Birke auf 5 m vorher/nachher.

Branch `welle-m-birke` ab main a0a05614. Bericht `bericht/1110-11-doppel-birke.md`. Danach welle-m-e-torwurf.

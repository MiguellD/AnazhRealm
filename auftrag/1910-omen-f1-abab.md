# Auftrag 19.10. (Koordinator) — OMEN: F1 Kamera-Rig ABAB VOR den B/E-Karten (gibt main frei)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. VORRANG vor auftrag/1910-omen-b-e-karte.md.
A = main 47c8b089 (V18.546.21), B = integ-probe e93134f4 (V18.546.22: + F1 f1-rig b308b694 — EIN Kamera-Rig, der Band-Partner fährt
im EINEN Setzer mit, chaseKamera im Kern, Interpolation zwischen den zwei jüngsten Sim-Zuständen für den ganzen Spieler,
`_tickMountedMovement` auch in ruhenden Takten).
1. Lauf-ABAB: Wiese + Genesis, Ego + Third, stehend UND gehend, je 4 Welten im Wechsel; Frame p95, CPU-Takt p95, GPU p50, VRAM.
2. FAHRT-ABAB (neu, F1 ist eine Fahr-Karte): GT an der Wiese im Kreis (Radeon: 6 m/s, 121 m je Lauf; A 14,7/14,7 gegen B 14,9/14,8 ms
   CPU p95 bei 2+2 Boots — im Rauschen, ungeklärt), 4+4.
3. EIN Blick: in Fahrt Third → Ego → Third am Hang bergab — steht der GT im Bild?
Urteil „nicht langsamer“ je Zelle. echt läuft über die CI an e93134f4. Bericht `bericht/1910-f1-gtx.md`, Nachricht „neue Datei + Urteil“.

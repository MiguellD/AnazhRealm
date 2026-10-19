# Auftrag 19.10. (Koordinator) — OMEN als MACHER: B-Wald, der Wald-Plan der Ankunft in EINEM Zug

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du SCHNEIDEST diesmal (Werkplatz), proportional bewiesen.
Täter (dein bericht/1910-b-kette-gtx.md): die Wald-Schlange `_waldPlanSchlange` läuft im Ping-Pong mit dem Haupt-Faden — der Faden
rechnet 3,37 s für 42 Aufträge, die Antworten warten Σ 12,57 s auf das Ende einer LongTask (38/42), je Lade-Bild nur EINE Runde
(2 × 64 Zellen); die 4 Wald-Stücke warten auf die LEERE Schlange (`_waldPlanZusage`) bis 14,83 s → Weltbild 15,2–16,0 s.
SCHNITT an der Wurzel: der Ankunfts-Kasten reist in EINEM Zug an den Wald-Faden (oder: die Schlange hält N Aufträge im Flug, nie
eine Runde je Bild), die Zusage wartet auf die Zellen IHRES Kastens, nie auf die ganze Schlange. Kein Zwilling, kein Flag.
Zweig `b-wald` ab main e93134f4. Datei-Besitz: Wald-Plan und Wald-Faden (vegetation-wiese.js `_tickWaldPlan`, `_waldPlanZusage`,
der Faden wald-darts / `_nebenAuftrag("wald")`); NICHT Halm/Nah-Wiese (dort schneidet S4 auf der Radeon).
Beweis (Gebot 9, proportional): Linse diag-boot-stage --kalt --echt auf der GTX — „Wald-Schlange leer“ und t(Weltbild) vorher/nachher
(4 Boots je Seite), dazu gate:worker-dichte + playtest:fast + check lokal; Zweig-Kopf `[ci voll]` gepusht, VOLLE Zweig-CI grün;
EIN Blick aufs Ankunftsbild (ganz, kein halbes Weltbild). Ziel: t(Weltbild) GTX deutlich unter 16 s.
Bericht `bericht/1910-b-wald.md` (Schnitt · Zahl · offen), Nachricht „neue Datei + Zweig-Kopf + t(Weltbild) vorher→nachher“.
Ich merge nach integ.

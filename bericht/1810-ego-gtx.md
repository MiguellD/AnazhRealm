# Bericht 1810 Ego-Schatten auf der GTX (vor B5)

**Status: ZWISCHENSTAND.**
- **Nicht nachstellbar, nicht geschnitten.** Lokal gab es 7 von 7 Läufen GRÜN auf der GTX:
  - 4d5f1c0c: 2× lokal, dazu 3× auf dem CI-Weg (Node 22.23.3 des Läufers, `CI=true CI_KLASSE=gpu LINSE_GPU=karte`);
  - 9b3acc1d: 2×.
- **Der echt-Neulauf** 39102311056 Versuch 2 an 4d5f1c0c ist am Ego-Schatten GRÜN. Rot war dort ein anderer Schritt: 17 Foundry-Impostor.
- **Bündel-Neuaufnahme intakt:** In jedem der 7 Läufe nimmt das Leib-Bündel beim Ego-Schuss neu auf (`kopf-e1-ego-wurf neu 1`,
  Render-Objekte 8 → 0). Die vermutete ausbleibende Neuaufnahme ist hier widerlegt.
- **Offen:** der Täter des einen CI-Rots. Die zeitliche Spur zeigt auf die Last des Messplatzes während des Jobs (unten); daraus folgt
  eine neue Platz-Regel.

## Läufe (Schloss `omen-1710-n` je Lauf; Rohdaten `bericht/1810-ego-gtx/`)

| Lauf | Stand · Weg | Leib bereit | 3rd: Wurf · Leib px | Ego: wurf · leibPx · leibAufNull · IoU | Bündel im Ego-Schuss | Exit |
|---|---|---|---|---|---|---|
| 4d5f-a1 | 4d5f1c0c · lokal | 8 s | 761 · 892 | 754 · 0 · 0 · 0,991 | neu 1, 8 → 0 | EXIT=0 |
| 4d5f-a2 | 4d5f1c0c · lokal | 9 s | 762 · 892 | 754 · 0 · 0 · 0,990 | neu 1, 8 → 0 | EXIT=0 |
| 4d5f-c1 | 4d5f1c0c · CI-Weg | 7 s | 660 · 883 | 653 · 0 · 0 · 0,989 | neu 1, 8 → 0 | EXIT=0 |
| 4d5f-c2 | 4d5f1c0c · CI-Weg | 8 s | 762 · 892 | 754 · 0 · 0 · 0,990 | neu 1, 8 → 0 | EXIT=0 |
| 4d5f-c3 | 4d5f1c0c · CI-Weg | 6 s | 660 · 867 | 660 · 0 · 0 · 1,000 | neu 1, 8 → 0 | EXIT=0 |
| 9b3a-b1 | 9b3acc1d · lokal | 11 s | 658 · 920 | 656 · 0 · 0 · 0,994 | neu 1, 8 → 0 | EXIT=0 |
| 9b3a-b2 | 9b3acc1d · lokal | 10 s | 762 · 892 | 754 · 0 · 0 · 0,990 | neu 1, 8 → 0 | EXIT=0 |

Sonde = `auftrag/1810-ego-probe/mach-probe.cjs`, unverändert (Port 7905). Auffällig: der 3rd-Wurf ist zweigipflig, 660 oder 761 px, mit
leicht anderem Leib im Bild (867–883 / 892 / 920 px). Die Leib-Gestalt zum Schuss-Zeitpunkt unterscheidet sich also von Lauf zu Lauf;
das passt dazu, dass der Leib auf der GTX erst bei 6–11 s steht, kurz vor den Schüssen.

## Die Spur des CI-Rots (hook.log gegen die Logs der OMEN-Arbeiter)

- **Versuch 1 (rot am Ego, 07:57:26–08:12:07):** Um 08:01 brach der B5-Schneider seine Lauf-Serie für den Rebase auf 4d5f1c0c ab.
  Rebase, Checkout der A-Seite und `npm ci` liefen damit mitten im Job-Fenster, CPU- und Platten-Last ohne Schloss. Ein Leib, der unter
  Last später steht, landet in der Ego-Linse zwischen den Schüssen, während der Spiel-Loop ruht. `_applyEgoSicht` läuft im Spiel je Bild
  in `_loopCamera`, in der Linse nur beim Moduswechsel.
- **Versuch 2 (rot an Foundry-Impostor, 10:06:45–10:21:46):** Mein `npm ci` für die Ego-Bäume endete 10:06:53; das überlappt nur den
  Job-Anfang. Für diesen Schritt bleibt die Spur offen.
- Das Bild des CI-Rots (1 071 px Leib im Auge, 0 gezählte Leib-Meshes auf Ebene 0, Wurf 0) passt zu einer Haut, die NACH dem Sammeln
  der Mesh-Liste der Linse kam. Das ist eine Hypothese, gemessen ist es nicht; der Täter-Commit bleibt ohne Namen.

## Geschnitten am Platz (nicht im Code)

`p3/gpu-schloss.sh` trägt `cpu_ruhe`. Schwere CPU-Arbeit ohne GPU-Schloss (npm ci, check, playtest, rebase, große Auswertungen) wartet,
solange ein CI-Job das Schloss hält oder auf es wartet. Der laufende B5-Schneider hat die Regel bekommen.

## Offen

Falls das Ego-Rot wiederkommt, nennt eine schärfere Sonde den Täter: je Schuss die Haut-Ids von `pm` gegen die gesammelte Mesh-Liste,
dazu `_applyEgoSicht`-Treffer. Weiter mit B5.

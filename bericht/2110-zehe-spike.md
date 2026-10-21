# Bericht 2110 Zehen-Gelenk-Spike (leib.K2, Hebel Leib H1) — TRÄGT; abgebrochen auf Umsteuerung (Auftrag 2110-omen-profiband-k3)

- **Frage:** Bringt ein Zehen-Gelenk den Fuß des Spielers im K8 unter 3 cm p95? Der Spike baut kein Gelenk, er misst die Obergrenze des Gewinns.
- **Weg:** Mess-Patch `zehe-patch.cjs` an `diag-koerper-stand --k8`, Kopf main 2160be58, nach dem Lauf zurückgesetzt.
  - Im Fuß-Lock teilt er je Probe die Schuh-Vertices des Knöchels an der Ballen-Linie: Fuß-Achse Knöchel → weitester Vertex, Zehe = die vordersten 28 % (bzw. 20 %).
  - Gemessen wird der tiefste Rest-Vertex gegen das gezeichnete Mesh. Ein ideales Gelenk legt die Zehe auf den Boden.
- **Lauf 1 (Ego, Ballen 0,72):**
  - Wiese: Fuß 3,6 → ohne Zehe **1,6** cm. Die Zehe ist in 196/200 Proben der tiefste Punkt, in 39 taucht sie > 1 cm ein.
  - Hang 24,4°: 3,3 → **2,2** cm (Zehe tiefster Punkt 129/339).
- **Lauf 2 (Third, Ballen 0,8):** Wiese 3,6 → **2,3**, Hang 3,3 → **2,5** cm.
- **Urteil:** Der Spike trägt. In beiden Läufen liegt der Fuß ohne Zehe unter 3 cm; der Täter ist die starre Schuh-Spitze im Abrollen.
- **Offen:** Das Gelenk selbst (koerper-core Bein-Baum, Ofen skinJoints, Rig, `_gaitIKPrep`), Stufen und der Spielgang. Nicht begonnen, umgesteuert auf Profiband K3.
- **Ehrlich:** Am Hang zählt der Rest mehr Proben (339/340) als der Fuß (200), weil die Probe auch zählt, wenn der Knöchel-Tiefpunkt keinen Boden fand.

Roh: hier `bericht/2110-zehe-spike/` (zehe-ego.log, zehe-third-080.log, zehe-patch.cjs).

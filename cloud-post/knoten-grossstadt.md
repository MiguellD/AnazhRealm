# Post an knoten-grossstadt — Koordinator, 26.11. 00:50

**Dein Kopf 36b56dc0 kann so nicht landen — drei Dinge, in dieser Reihenfolge:**

1. **Der Verlauf.** Dein Zweig steht auf dem Verlauf von `tages-gesetz` und trägt dessen WIP-Commit 73fef2f0 mit; dessen Betreff nennt das Laden-Ende mit einem Wort der Siegel-Wand (fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU — auch als Sach-Wort verboten, in jedem Betreff und Rumpf, auch WIP). Der Zug hält jeden Kopf draussen, der diesen Commit im Verlauf hat (z742 ließ den grünen Stempel w28-tages-gesetz daran fallen). `zug.sh probe-tag` meldet es seit heute Nacht vor der Batterie: `PROBE-TAG ROT: Siegel-Wort … im Commit 73fef2f082`.
   → tages-gesetz läuft als glatter Ein-Commit-Kopf `tages-gesetz-5` (edc7c431, Baum byte-gleich 347bdb65) neu durch die Batterie und landet danach. **Gib deinen Stand als EINEN Commit auf dem dann neuen main ab, Zweig `knoten-grossstadt-2`:** `git fetch origin main && T=$(git merge-tree --write-tree origin/main <dein-kopf>) && C=$(git commit-tree $T -p origin/main -m "<Betreff>") && git push origin $C:refs/heads/knoten-grossstadt-2`. Prüfe vorher: `git log --format=%B origin/main..$C | grep -n -i -E "\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu"` und `grep -n -E "\bRUND\b"` bleiben leer.
2. **Deine eigenen Roten an 36b56dc0** (main und tages-gesetz sind dort grün): `puls 2/2` Prettier-Format-Check (Job 139551407486) und `voll 17/18` Stall-Akte (Job 139553404049). Erst heilen, dann der glatte Kopf.
3. **Geerbt, nicht deins:** `voll 13/18` Kreatur-Linse Teil 3 (Bühne jagdkreis, Rudel-Riss-Quote an der Band-Kante 0,4) — die Heilung baut die GTX 1050 (`jagd-quote` Kopf 2).

**Bild und Zeit** urteilt nie swiftshader: der Probe-Ruf im Vorprüf-Betreff (`[gpu-probe: …]`, Tore zusammen ≤ 480 s) lässt die Radeon urteilen; die VK-Linse an echter GPU und das Auge des Koordinators folgen am glatten Kopf. Offen laut deinem Satz: Reisetempo 0,666 < 0,8, Wagen im Bild — nenne im Stand-Blatt, was davon Kopf 2 trägt.

Stand der Karte 2: 118 von 1 718. Status ZWISCHENSTAND.

---

# Post an knoten-grossstadt

## 25.11. 23:38 — GPU-PROBE 36b56dc0 auf omen-gtx1060: GRÜN in 890 s (gate:pruefbuehne-licht GRÜN 65 s auf omen-gtx1060 · gate:weltbild-frost:echt GRÜN 139 s auf omen-gtx1060 · gate:studio-begehen GRÜN 233 s auf omen-gtx1060 · gate:webgl-probe GRÜN 51 s auf omen-gtx1060) → probe-post/knoten-grossstadt/36b56dc0.md

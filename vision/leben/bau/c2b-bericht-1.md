# C2b, Bericht des Vorgängers (19.11.) — Kopf `leben-leser` 569bbeb09d52bcb2dc60fb361d3660fd57a0924a (zwei Commits auf bcdcc4f1)

Geschnitten (nur headless bewiesen): L1 `_bestandVerkoerpern` liest das Bild des Gaus, die alte Bilanz rechnet nur Fuchs und Bär, freie
Hirsche/Wölfe im Regions-Verzeichnis 0 · L2 Annahme und Fall rufen `_gauAkt` mit Takt-Stempel (Fall am Takt 61: Revier 6 → 5 Köpfe,
Gau 11 971 → 11 970).
Headless gemessen: 31 Köpfe in 4 Herden = 31 Leiber in 4 Gruppen, 12 Kälber bei ihrer Mutter; Mutant × 0,5 → 16 Leiber (Probe
`c2b-konsum.cjs`, `--halb` = Mutant; `konsum-2.txt`, `konsum-halb.txt`). Kosten headless: `_gauTakt` p50 0,06 · p95 0,145 · max 2,07 ms
(der erste Ruf trägt die Geburt des Fadens); `_gauAntwort` p50 0,125 · p95 0,285 · max 1,22 ms; erste Antwort 1,4–2,1 s.
Geänderter Code: `stamm/kreatur-erbe.js`, `stamm/kreatur-leben.js`, `spec/stamm/modul-karte.json`.

OFFEN (dein Auftrag): L3 (zwei Linsen-Zeilen mit Mutant) · L4 (19 Linsen-Stellen; drei lesen `_kreaturBestand(…).deer.K`,
`scripts/diag-kreatur-leben.cjs` ~Z. 264, 383, 1441 — der Schlüssel existiert nicht mehr, die Bühnen werfen; `gate:kreatur-takt` und
`gate:mp-sync` nie gefahren) · L5 und L7 im echten Spiel · L6 Bildpaar · L8.

Eigene Setzungen des Vorgängers: Welt-Kennung `g<gx>,<gz>/` + Kennung des Kerns; Annahme-Kennung `a<Revier>.<Seite>.<n>` · Akt-Stempel
= höchster bestellter Takt + 1 · Anker der Herde = Zelle des Reviers mit dem meisten Lebensraum × Substrat, Anker des Rudels = Zelle mit
dem meisten Wolfs-Lebensraum · ein Kopf, der das Bild verließ: sein Leib fällt am Alter, sonst bleibt er Zeichnung ohne Tier, bis er
außer Blick geht · ein gebundener Leib ohne Tier bleibt beim Spieler · der Takt von Fuchs und Bär wartet auf die erste Antwort des Gaus
· `_kreaturNahrung` rechnet den Fraß des Gaus ein · Hirsche/Wölfe aus alten Ständen verlassen das Regions-Verzeichnis, ihr Leib wird in
den Gau angenommen.

Fund-Zeilen: (1) `_feldAktWirkt` (`stamm/feld-leben.js`) ohne Gau-Zweig — Akte für Hirsch/Wolf erreichen keinen Mitspieler ·
(2) `auraAt` / `_lebenStufe` (`stamm/feld-leben.js`) lesen den Fraß des Gaus nicht — der Spieler sieht keine Äsung mehr; der Leser
`_gauFrassAt(x, z)` steht bereit · (3) die Lese-Naht nennt weder Ursache noch Jäger eines Tods und kein K je Revier · (4) das
Geschlecht steht am Datensatz, kein Leser im Bild nutzt es · (5) Fuchs und Bär lesen das jeweils letzte Bild des Gaus (hängt an der
Ankunftszeit der Antwort; Gleichlauf zweier Seiten unbewiesen).
Im Spiel gilt `maxCreatures` 20; am Spawn tragen die vier nahen Reviere 31 Hirsche — die Kappe schneidet dort. In den nahen Revieren am
Spawn stehen 0 Wölfe (Gau 23–28 Wölfe in 5 Rudeln), Entfernung zum nächsten Rudel ungemessen.
Ungemessen: alles auf echter GPU; Abdruck gegen bcdcc4f1; `playtest:fast` nur am ersten Commit grün; Laden eines Stands, Sprung der
Welt-Uhr, Gau-Grenze geschrieben, nie gefahren.

# Stand GTX 1050 — 24.11. 15:44 (Sicherung vor dem Konto-Wechsel)

ZWISCHENSTAND · Karte 2 gebucht 83 von 1 718. Alles hier Genannte ist geschoben; lokal liegt nichts Ungesichertes.

## Kopf je Zweig

| Zweig | Kopf | Stand | nächster Handgriff |
| --- | --- | --- | --- |
| `anatomie-r4-heil` | 3bbb5b233f33458176ca28bda54b6d113638ed2b | abgegeben 15:33, angenommen 15:36 (in ort-ausstattung gemischt, der Koordinator stempelt) | keiner an der GTX |
| `klima-aufwind-wip` | 40fbd2e77 | Schnitt gebaut und gemessen, main 499f8b57 im Baum, das Blatt `cloud-post/klima-aufwind.md` im Baum; KEIN Vorprüf-Kopf | `npm run check:statik` an diesem Kopf zu Ende lesen (lief ab 15:38, Log K/ka/wand5.statik.log an der GTX), dann ein leerer Commit „Vorprüfung klima-aufwind 1 (auf main 499f8b57): … [gpu-probe: gate:kopplung, gate:wetter-wache, bild:wiese@0.5] [ci voll]“ auf `klima-aufwind`, EIN Bericht |
| `einlass-ruf-erbe-wip` | db4bf13b3 | der Einlass-Schnitt 9da5ae70d (Ruf des Erbes im Post, ein Lauf ohne Probe urteilt ROT, der leere Ruf weist beim Namen ab) auf cf7deb94e, darüber ein leerer Commit [skip ci] | 9da5ae70d auf main 499f8b57 pflücken (w28-probe-deckel-einlass ist gelandet), gate:apparat · gate:ci-deckung · check:statik, Blatt, Vorprüf-Kopf als eigener kleiner Zweig |

## Was grün ist

- anatomie-r4-heil am Commit: gate:ci-deckung (Selbsttest + Tor), gate:apparat (Selbsttest + Tor), gate:betriebsgesetz; die R-Zeilen der
  echten Linsen-Datei (R1 · R2 · R4 · R4-Bühne · R3); 12 von 12 frischen Läufen der Mutante. Die ganze Kette check:statik am Commit lief um 15:44 noch (Log K/ar/statik.log an der GTX).
- klima-aufwind am Kern-Stand des Kopfes: diag-planet welle1 61 s · --selftest 55 s · --anker 8 s · --anker --selftest 20 s ·
  --bytes 143 s · stamm-umzug --lint; check:statik GRÜN 1 197 s am Baum mit main a8dd22b5 (am Kopf mit main 499f8b57: lief um 15:44 noch);
  unter dem GPU-Schloss am Kopf 880ef7f42: gate:kopplung GRÜN 36 s, wetter-wache --selftest GRÜN 88 s, wetter-wache erster Lauf am Hand-Deckel 130 s abgebrochen (der Rechner trug zwei Statik-Ketten), der zweite mit Deckel 330 s läuft seit 15:42;
  gate:betriebsgesetz GRÜN mit dem Blatt (Zitat-Wand).

## klima-aufwind in Zahlen (das Blatt trägt die Tafel)

Linse `klima.aufwind` (Heimat, 291 Kämme) 1,56 → 2,49 · Zensus 12 Saaten, 2 252 Kämme: Luv/Lee 1,37 → 1,61, Anteil ≥ 2 von 31 % auf
42 % (Kämme mit Abfall ≥ 3 km 2,31; Breite 35–50° 2,49; wie die Station misst 1,22 → 1,33) — #1 bleibt auf allen Saaten offen.
#2 Rang 0,23 → 0,29 (Soll ≥ 0,7), #5 Lee −0,8 → −2,1 % (Soll −50 %). Der Preis: Richter gesicht `klima.sprung20` p99 158 → 320 mm
(Soll ≤ 40), größter Sprung 2 042 → 6 492 mm, `klima.kante.flach` 2,39 → 4,14 % — der Takt der Luft-Schritte (100 km), eine Zeile
im FUND-REGISTER. Das Bild liegt unter probe-post/klima-aufwind/kette-bogen-gegen.png.

## Offene Funde

- `gate:koerper-stand` K6 (rot an main a8dd22b5, Job 138446232280: 5 von 21 541 Punkten an der Stufen-Naht antworten null, Stufen
  0110, zuerst −41,95|−42,6). BERICHTIGT 15:49: die Linse steht in `R6_ZUSATZ` (scripts/lib/ci-klasse.cjs:122) — ruht ihr
  Selbsttest, fährt der Aufruf OHNE Schalter; der Hauptlauf lief also an jedem Zweig, und K6 ist eine Zeile des Hauptlaufs
  (scripts/diag-koerper-stand.cjs:1348). Meine Fassung von 15:44 („das ganze Tor ruhte am Zweig“) war falsch; geruht haben nur die
  Täter-Welten (nachgestellt mit dem Diff von w28-auge-der-art). Lief das Tor an main 499f8b57 (gleiche Laufzeit-Bytes) grün, ist K6
  ein Wackler mit 1 von 2 an gleichen Bytes — die Stufen-Lage der eingeschwungenen Welt hängt am Strom; auge-der-art ist NICHT
  belegt. Nächster Handgriff: die Lage 0110 an der Naht im Hauptlauf festhalten (welche Stufen stehen beim Messen), dann der Leser
  `_bodenSichtAt` / `_bodenKarteEcke` an genau dieser Lage. Die Register-Zeile „[apparat ruhe]“ ist berichtigt.
- Die drei Register-Zeilen von 15:33 (Dither-Blende 2 von 3 Läufen · Trägerhemd am Achsel-Ausschnitt · zwei Halter der Lagen-Folge
  unter dem Arm) und die Zeile von heute zum Takt der Luft-Schritte.

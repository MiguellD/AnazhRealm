# Hebel-Tafel — was die roten Stationen der Karte 2 am Kopf f68dbf09 (GTX, Stand 2026-11-19T13:51:09.279Z) wirklich blockiert

Urteile gelesen: 498 (grün 3). Quelle: `punkte-maschine:meisterkarte-quelle/punkte/messung/f68dbf09-gtx.json`.

| Stationen | Leitern | Was fehlt | Beispiel |
|---|---|---|---|
| 104 | 41 | SPIEL Leser fehlt (die Fähigkeit ist nicht gebaut) | karte2.erleben.bild.ferne#1: Frist der Probe 64 s gerissen — kein Urteil, UNGEMESSEN (die Probe sah: S1 · ROT Leser fehlt: Ferne = Nähe (Fernbild gegen verkleinerte Nahaufnahme nach Abzug der Luft, SSIM ≥ 0,8, ΔE ≤ 5): kein Leser — nahFernSicht (scripts/lib/l |
| 102 | 19 | PROBE Frist gerissen | karte2.erleben.spieler.praesenz#3: Frist der Probe 64 s gerissen — kein Urteil, UNGEMESSEN (die Probe sah: S3 · kein Ergebnis der Sprosse im Lauf der Leiter erleben.spieler.praesenz) · Täter: @@PUNKTE@@ FRIST 64 s der Probe gerissen — Abbau, die Ausgabe trägt den S |
| 82 | 35 | BUEHNE Umfang (sonst) | karte2.erleben.bild.ferne#5: Frist der Probe 64 s gerissen — kein Urteil, UNGEMESSEN (die Probe sah: S5 · ROT Umfang nicht erzeugbar: die Welt zeichnet bis 40.0 km (Feld-Pass FELD_PASS.rMaxM, stamm/bild-sicht.js:3907) (verlangt 100 km Sicht, die Welt erzeugte |
| 65 | 21 | SONST | karte2.erleben.spieler.zeit#1: die Urteils-Zeile fehlt — kein Urteil, UNGEMESSEN (die Probe sah: S1 · kein Ergebnis der Sprosse im Lauf der Leiter erleben.spieler.zeit) · Täter: ❌ URTEILS-WACHE: 1 ROTE Zeile(n) bei Exit 0 — die erste: @@ 16.4 s · erleben.spiele |
| 44 | 21 | BUEHNE Kosmos: EIN System / EIN Planet, Sterne auf der Kuppel | karte2.erleben.bild.ferne#7: Frist der Probe 64 s gerissen — kein Urteil, UNGEMESSEN (die Probe sah: S7 · ROT Leser fehlt: Umfang nicht erzeugbar (der Umfang „Planet: Boden → Orbit ohne Ladebild“ trägt keine Zahl): die Welt zeichnet bis 40.0 km (Feld-Pass FEL |
| 35 | 26 | BUEHNE Saaten: die Sitzung hält EINE Saat, verlangt sind viele | karte2.erleben.spieler.praesenz#2: Frist der Probe 64 s gerissen — kein Urteil, UNGEMESSEN (die Probe sah: S2 · ROT Umfang nicht erzeugbar: die Sitzung hält eine Saat (anazh-realm-seed); die Lagen-Stichprobe verlangt 10 Saaten — kein Wechsel der Saat im Lauf (verla |
| 35 | 19 | BUEHNE Menge: größte Siedlung / Bewohner-Zahl unter dem verlangten Umfang | karte2.same.preis.speicher#3: Frist der Probe 87 s gerissen — kein Urteil, UNGEMESSEN (die Probe sah: S3 · ROT Umfang nicht erzeugbar: die Welt der Sitzung trägt 28 Bauten in 0 Siedlungen (die größte Stadt des Gesetzes am Messort stadt-voll, „dorf 7 300“) (ver |
| 28 | 12 | BUEHNE Spieler: die Sitzung trägt EINEN Spieler | karte2.erleben.spieler.gemeinsam#1: Last: Referenz f 1,985 (Faden 1,693 · alle Kerne 1,985; vor 151,9/449 ms, nach 134,6/360,1 ms, Ruhe 89,7/226,2 ms seit 2026-11-16) · fremd: node.exe scripts/diag-settlement.cjs --nur-a 5,1 CPU-s · Explorer.EXE 1,1 CPU-s · claude.e |

## Lesart des Koordinators (19.11.)
- Von 498 Urteilen sind 3 grün. Das Geräte-Paar ist NICHT die Bremse des Zählers: ein zweites Gerät, das 1 428 rote Stationen
  nachmisst, bucht nichts. Regel ab jetzt: das zweite Gerät misst nur, was das erste GRÜN urteilte (heute 3 Stationen, in die
  Radeon-Zeile der Runde 1 geschrieben, koordination 9055061d); eine rote Station wird erst wieder gemessen, wenn eine Landung
  ihre Leiter berührt.
- 167 Stationen (40 Leitern) tragen KEIN Urteil: „Frist der Probe gerissen“ (102) und „die Urteils-Zeile fehlt“ (65). Das ist
  Apparat, nicht Spiel — ein Heiler am EINEN Läufer (Opus, Zweig `richter-ohne-urteil`).
- 224 Stationen sind rot, weil die BÜHNE den Umfang nicht erzeugen kann, nicht weil das Spiel geurteilt wurde: Saaten (35
  Stationen, 26 Leitern), Kosmos (44/21), Menge (35/19), Spieler (28/12), sonst (82/35). Der breiteste Einzel-Hebel nach Leitern
  ist „die Sitzung hält EINE Saat“ — die Welt als Funktion der Saat, im Lauf wechselbar (Opus, Zweig `saat-im-lauf`).
- 104 Stationen (41 Leitern) sagen „Leser fehlt“: dort fehlt die Fähigkeit im Spiel. Das ist die Bau-Liste der Macher,
  sortiert nach Leiter in der Mess-Datei.
- Werkzeug: `hebel/tafel.cjs <messung-verzeichnis> <ausgabe.md>` — nach dem Ende der GTX-Runde über alle 1 428 neu fahren.

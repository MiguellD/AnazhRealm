# Kartenkopf Woche 2b (ab 26.10. abends) — bindend für jeden Arbeiter

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Dann `auftrag/2510-kartenkopf-w2.md` und `auftrag/2410-kartenkopf.md`
(beide gelten weiter, mit den Änderungen hier). Dann deine Karte. Nichts sonst ganz lesen.

## Die Regel des Schöpfers (26.10. 19:45)
„Die Prüfung darf nie länger dauern als das Erstellen." Am 26.10. kam jeder zweite Cloud-Zweig rot zurück, und jeder rote Zweig kostete
den Koordinator eine lokale Heilung plus einen zweiten Zug. Darum fährt jede Karte VOR dem letzten Push die Wände, an denen ihre
Vorgänger fielen — gemessen, mit Exit-Code (`echo EXIT=$?`, Lehre 9), und nennt sie im letzten Commit-Rumpf.

## Die Wände der Vorgänger-Röten (je Wand: der Zweig, der an ihr fiel)
1. **Decke:** `npm run gate:apparat` GRÜN — `scripts/` wächst nie (bk4-turm, ok4-beute, gk2-damm: je +13 … +32 Atome). Wer eine Linse
   erweitert, zahlt mit Verdichtung in derselben Datei oder Familie.
2. **Ein Helfer, kein Zwilling:** eine Größe, die schon eine Quelle hat, liest diese Quelle (bk4-turm: zweiter Fern-Ring-Punkt-Helfer;
   sk3-schmelze: `_waterLevelAt` statt des EINEN Wasser-Urteils `_nassAt`). Vor dem ersten neuen Helfer: `npm run atlas -- --find <Wort>`.
3. **Welt-Uhr und Wetter:** jede Probe setzt Uhr, Wetter und Saison über das Spieler-Wort (R9), nie über den Zufall des Starts —
   seit fk2-uhr läuft die EINE Welt-Uhr ab dem ersten Zug (Regen am Start machte die Fahr-Proben rot).
4. **Boot:** `npm run gate:welt-boot` GRÜN — kein eigener Fänger, kein `setTimeout`-Schlaf (z37 Lauf 1 rot an der Schlaf-Wand).
5. **Stamm:** `node scripts/diag-atlas.cjs --check` · `npm run stamm:lint` · `npm run check` (darin gate:betriebsgesetz) GRÜN.
6. **Domäne berührt → ihre Wand:** Gelände-Kern oder Worker `npm run gate:worker-dichte` (darin `--faden`, Lehre 14: kein
   Feld rechnet synchron im Haupt-Faden — gk2-damm: Stau-Feld 44–69 ms, zurückgehalten) · Fahrzeug oder Leib `npm run gate:fahr-leben`
   und `npm run gate:mp-sync` · Kreatur oder Bewohner `npm run gate:kreatur-takt` · Klang `npm run gate:klang-zensus` · Studio-Kern
   `npm run gate:ofen-contract` und `npm run gate:studio-vertrag` (Byte-Beweis, Lehre 11).
7. **Merge vor dem Push:** `git merge origin/main` unmittelbar vor dem letzten Push; Konflikte in Import-Zeilen sind Vereinigungen
   (kk2-ufer: drei Linsen holten verschiedene Namen aus welt-boot).
8. **Die Station selbst:** der Befehl der Station läuft im Baum der Karte GRÜN und druckt seine Zahl; eine GPU-Station druckt
   `[linse-gpu] <Hersteller>/…` (physik.K2#2 fiel an „keine Linse nennt eine Karte"). Die Cloud hat keine echte GPU: das Urteil der Radeon
   und der GTX fällt beim Koordinator — du lieferst den Befehl, die headless/swiftshader-Zahl und das erwartete Soll.

## Stand beim Start
main 764776d9 (V18.546.99, z40) · Meisterkarte 97/330 gebucht · Pflicht-Offen A · B · C · E. Zug z41 (fk2-uhr, bk4-turm, ok4-beute,
sk3-schmelze, kk2-ufer) fährt. Fünf Karten laufen parallel; jede nennt ihre Dateien, fremde Dateien editiert sie nicht.

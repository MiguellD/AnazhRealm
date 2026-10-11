# Auftrag 1110-7 an den OMEN: der Aufschlag von koerper-bild, benannt UND geschnitten

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Risiko **R2**. Kartenkopf wie auftrag/karten-1110/K01.md
(WIP alle 45 min mit „[skip ci]“, letzter Push ohne und mit `[ci voll]`, Kontext-Deckel ~250k mit Übergabe). Vorrang vor 0910-8.

## Anlass
- Bericht 1110-6: Ab koerper-bild 269ecfa8 trägt V18.540 an der Bühne +0,19–0,27 ms je Frame, gleichmäßig auf allen Posen und ohne Bild.
- Das ist über dem Band (2σ 0,064). Nach entscheidung §6.9 ist V18.540 damit „langsamer“, und main bleibt V18.539, bis der Täter geschnitten ist.
- Kandidat: der Boden-Stoff mit aHimmel (als aoNode) und dem Fels-Zweig unter dem Himmel (`_bodenFarbeUnterFels`, die wahre Normale unter Fels).

## Auftrag
1. **Benennen:** Toggle je Term des Boden-Stoffs (aHimmel, Fels-Zweig, Normale) in EINER Sitzung an der Bühne, jeder vor und zurück.
   - Je Term die ms und das Bild.
   - `werkbank zaehlen`: Programme und Pipelines vorher und nachher.
2. **Schneiden:** Der Term kostet nur dort, wo er ein Bild trägt (unter Fels, in der Höhle). Unter freiem Himmel kostet er 0.
   - Eine Wurzel, kein Flag und kein Zwilling.
   - Lehre 7: Liegt der Term im Worker-Weg, gilt der Worker-Spiegel bit-identisch (`diag-worker-watersheet` maxDiff 0).
   - r184-Lehre aus K15: ein Zweig im Shader (TSL.If) spart den Term nicht immer. Miss es, statt es anzunehmen.
3. **Beweis:**
   - Bühne ABAB: Kopf gegen 27e369d8 und gegen be1d6e57. Ziel: im Band gegen V18.539 (≤ 2σ).
   - Bild der Höhle Auge 11 (762/−138) aus dem Ausgabe-Pfad: Der Fels zeigt sich weiter.

## Zweig und Basis
- Branch `welle-m-boden-kosten` ab **integ-probe per ls-remote**. Dort läuft gerade die Integration V18.541 (K09a Gelände-Kern + K15 Augenlicht); nimm den Kopf, den ls-remote nennt.
- Dein Instrument-Zweig `welle-m-messort-buehne` af5ed685 geht als Stufe in V18.541 ein.
- Bericht `bericht/1110-7-boden-kosten.md`, danach 0910-8 (die weiße Masse ist derselbe Stoff: `bodenSatz`, eine Klasse, eine Hand).

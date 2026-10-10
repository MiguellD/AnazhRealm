# Auftrag 0910-4 an den OMEN: das Genesis-Band (Pflicht-OFFEN E, der rote Ort)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Werkplatz bis zum V18.538-Messauftrag; der hat dann Vorrang. Eigener Worktree,
Branch `welle-m-genesis-band` ab **main 7dd944e6** (per ls-remote), Ports 7900–7909.

## Stand (Genesis im eigenen Boot, GESTELLT)
- **Radeon:** main 157,0 MB. Mit host-vram-2 146,9/146,6 MB; buf:szene allein 61,8–64,1 MB (Gegenprüfung host-vram-2,
  `artifacts/profiband/vram2-radeon/` auf dem Radeon-PC).
- **OMEN V18.537:** 156,9 MB, 266 Befehle, 2,49 M Dreiecke (bericht/0910-2).
- **Band:** 208 Befehle, 680k Dreiecke, 118 MB. Genesis liegt bei Dreiecken 3,7× und bei VRAM 1,24× darüber.

## Teil 1: die Portal-Membran zeichnet ohne Blick (neu benannt im Spike der Prüfbühne, 10.10.)
8 `portal-membran`-Meshes tragen `frustumCulled = false`. Grund laut `_membranBauFor`: „Wellen-Verformung sprengt die statische
Hülle“. Sie zeichnen 8 Befehle und **129 600 Dreiecke ohne Blick**, auch 148 m hinter der Kamera. Gemessen mit
`werkbank zaehlen` an der Bühnen-Station S2, Klasse portal-membran.
- **Schnitt:** eine Hülle um die Wellen-Amplitude (das Gesetz kennt seine Amplitude), Culling an. Eine Membran im Blick
  zeichnet wie heute (Bild-Paar am Ring), eine Membran außerhalb zeichnet 0.
- **Linse vorher ROT:** Membran-Befehle mit der Kamera weg vom Ring > 0, Täter beim Namen.

## Teil 2: buf:szene an Genesis zerlegen und schneiden
An der Wiese trägt buf:szene ~31 MB, an Genesis ~62 MB. Wer trägt den Unterschied?
- Kandidaten: Tor-Geometrie (Tor-L0 Σ 7 Tore 933k Dreiecke / 588k Vertices; die Tore selbst schneidet S3 tor-fahrzeug-klinge,
  das kommt nach haus), Plattform, Vorschauen (GT, Haus, Esse, Drachentor), Ring-Bau, Satz-Kapazitäten.
- Zerlegung je Erzeuger mit Zahl (`werkbank band --ort genesis`, VRAM je Erzeuger; `werkbank zaehlen`).
- Schneide, was KEIN S3-Posten ist (Kapazität über Inhalt, doppelt hochgeladene Geometrie, Vorschauen, die nach der Ankunft
  nichts mehr zeigen). Benenne, was S3 tor trägt, mit Zahl. Fass die Tor-Kerne nicht an; dort arbeitet S3.

## Teil 3: Messen
- `band --ort genesis` je Seite ≥ 2 frische Boots, GESTELLT, `tex:r184-ausgabe` 0.
- main gegen Kopf, VRAM und Dreiecke je Klasse.

## Bericht
`bericht/0910-4-genesis-band.md`. Inhalt: Kopf, Linse vorher ROT → nachher GRÜN, Zahlen aus Rohdateien, Bild-Paar am Ring
(Membran im Blick unverändert), CI-Lauf, was S3 tor trägt (Zahl), offen mit Zahl.

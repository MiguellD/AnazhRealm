# Auftrag 0910-5 an den OMEN: der Spieler wirft in der Ego-Sicht seinen Schatten (v1-Schritt 2 „laufen + sehen“)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Werkplatz bis zum V18.538-Messauftrag. Der kommt bald, dann gilt: WIP sichern,
Ruhe, messen. Eigener Worktree, Branch `welle-m-ego-schatten` ab **main 7dd944e6** (per ls-remote), Ports 7900–7909.

## Befund (deine Gegenprüfung 0710-12 und deren Gegenprüfer)
Die Ego-Sicht ist der Standard-Blick (`cameraMode: "first"`, anazhRealm.js:~217). `_applyEgoSicht` (~94546–94555) blendet die
Haut des Spielers aus und nimmt damit auch den Wurf: Im normalen Spiel wirft der Spieler KEINEN Schatten. In jedem Spiel mit
Ich-Sicht ist der eigene Schatten am Boden der stärkste Hinweis auf den eigenen Körper (Gehen, Springen, Stand am Hang).

## Schnitt
In der Ego-Sicht sieht die Hauptkamera den Kopf und die Teile des Leibs, die das Bild verdecken würden, nicht; geworfen wird der
GANZE Leib.
- Das ist die Ebenen-Wahrheit aus deinem Schatten-Gesetz. Vorbild: Der Zwilling der Kreatur liegt auf `SHADOW_TWIN_LAYER`, die
  Hauptkamera sieht ihn nie (S3 kreatur, jetzt in integ-probe).
- EIN Schalter für Sicht und Wurf: kein zweiter Leib, kein Flag.
- Der Wechsel zwischen 1st und 3rd (V), Werkzeug/Waffe in der Hand (welle-lf-kampf zeigt das Schwert in der Ich-Sicht: Konflikt
  benennen), Reiten/Fahren (Sitz), Mehrspieler: Ein Peer sieht den Leib wie heute.
- Lehre 26: Der Schatten liest colorNode.a, map.a und maskShadowNode, nie opacityNode. Unsichtbar für die Hauptkamera heißt
  Ebene, nicht Transparenz.
- Zusatz-Kosten: Der Leib wirft schon in der 3rd-Person. Zähle trotzdem die Befehle der Klasse spieler je Kaskade vorher/nachher.

## Linse vorher ROT
Ego-Sicht, Sonne seitlich: Schatten-Maske des Spielers am Boden. main: 0 px. Soll: der Umriss des Leibs, IoU ≥ 0,9 gegen
dieselbe Pose in der 3rd-Person. Dazu: Die Hauptkamera sieht in der Ego-Sicht keinen Leib-Teil vor dem Auge (0 px im Ego-Bild).
Selbsttest; CI-Schritt mit Gruppe, Kosten ≤ 3 min.

## Bericht
`bericht/0910-5-ego-schatten.md`. Inhalt: Kopf, Linse vorher/nachher, Bild-Paar Ego vorher/nachher (Schatten am Boden), CI,
offen mit Zahl.

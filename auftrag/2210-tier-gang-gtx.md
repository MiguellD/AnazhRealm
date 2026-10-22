# Auftrag OMEN 22.10. — Tiere K3 GTX-Hälfte (nach naesse-kosten)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Der Tastgrad liegt jetzt im Gesetz (tier-gang-k3 86d8d41c, in integ-probe ab V18.546.59): Welt Schritt 0,64–0,68, Labor 0,65,
Galopp 0,25–0,30, Welt gegen Labor ≤ 0,03 Zyklus, Querhang 20,8° Schlupf 0,024. Das Radeon-Bild liegt hier daneben
(`2210-tier-gang-gtx/radeon-k3-schritt-10m.png`: Hirsch, Bär, Fuchs, Wolf im Profil aus 10 m). Tiere K3 = 2 braucht die GTX-Hälfte:

1. Am Kopf integ-probe (V18.546.59 oder neuer): `TIER_GANG_PORT=4449 npm run gate:tier-gang`, EXIT-Zeile + Tastgrad-Zeilen.
2. Das Bild: `werkbank start --echt` · `umstellen --ort genesis` · `eval "$(cat <pfad>/2210-tier-gang-gtx/gang-buehne.js)"` ·
   `bild 2.4 91.2 14 2.4 89.6 24 --w 1280 --h 720 --wahl 0 --ziel gang` — je Tier drei Füße am Boden, ein Blick.
3. Bericht `bericht/2210-tier-gang-gtx.md` + das PNG. Kein A/B.

Benannt offen (nicht deine Messung): Galopp-Takt 3,98 Hz beim Wolf (Natur ~3), der Fuchs galoppiert genau an der Kante 0,25.

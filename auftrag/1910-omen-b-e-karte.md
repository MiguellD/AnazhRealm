# Auftrag 19.10. (Koordinator) — OMEN: die Wurzel-Karten für B und E am neuen main (nur messen)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Kein Schnitt — die Zahlen werden die nächsten Karten.
S6-Takt ist geschlossen: Verband 0,015 ms, Rest +0,08 ms unbenannt (JIT/Heap oder Rauschen) — benannt offen, wird nicht weiter gejagt.

main = 47c8b089 (V18.546.21: Garage isoliert r184 · S6 · Ankunfts-Paket B4+B5 geheilt · Garagen-Licht). Radeon kalt 6,3–6,9 s.
1. **B auf der GTX:** `diag-boot-stage --kalt --echt` 4 Boots an 47c8b089 (dazu 2 an ffa8fac8 als Gegenprobe ohne Paket):
   t(Weltbild), und die Zerlegung je Sekunde (blockiert ms, benannt/unbenannt). Frage: welcher Posten trägt die Ankunft auf der GTX,
   und wie groß ist der UNBENANNTE Rest (Radeon: ~700 ms/s bei 4–5 s)? Wenn möglich EIN Chrome-Profil des Haupt-Fadens 0–8 s kalt
   (Selbstzeit je Funktion), damit der Rest einen Namen bekommt.
2. **E auf der GTX:** Genesis Third stehend, `werkbank profil` (Selbst-/Gesamtzeit je Funktion) 4 Boots — die Top-15 des CPU-Takts
   p95 (5,9 ms gegen Soll 5,8) beim Namen, je mit Anteil.
Bericht `bericht/1910-b-e-gtx.md`, Nachricht nur „neue Datei + die zwei größten Posten“.

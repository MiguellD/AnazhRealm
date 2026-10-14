# Bericht 1410 Boden 2 — K51-4 (boden-stufen 672ad0b2) gegen main-naechst f09398e6, GEHEND

**Status: ZWISCHENSTAND.**

**Urteil (OMEN, GTX, Wiese K55 −278/−1038, Regler voll; je Seite 2 Sitzungen im Wechsel A B, dann B A; gehen wie in
`1410-boden-abab.md`: 4 m/s nach −z, 0 → −60 m und zurück):**
- **Eingeschwungen gehend:** K51-4 hält den Frame. p95 24,9 → 25,0 ms, gleich. Der CPU-Takt p95 steigt noch um +0,95 ms
  (14,7 → 15,7); K51-3 lag bei +1,5.
- **Beim Einströmen gehend hält K51-4 NICHT:**
  - Frame p95 29,3 → 41,6 ms (beide Sitzungen 41,6), über dem Profi-Band 33. main-naechst liegt bei 25,2–33,3.
  - CPU-Takt p95 27,0 → 35,0 ms.
  - Gegenüber K51-3 (28,7 → 41,6) hat sich der Einström-Frame nicht bewegt.
- **Die weichen Boden-Stufen gehen damit noch nicht nach main.** Offen bleibt der Einström-Gang. Die Täter aus
  1410-boden (je Frame gehend): `_loopVoxelStreaming` +1,25 ms, `_tickFernRing` +0,58, `_bodenKarteAusMesh` +0,14. Der
  Morph-Anteil, den K51-4 schneidet, war dort nur ein Teil.

| Lauf | A main-naechst: fps / Frame p95 / CPU p50 / CPU p95 | B K51-4 |
|---|---|---|
| gehen 1 (Einströmen), Sitzung 1 | 60,2 / 33,3 / 10,9 / 28,2 | 59,5 / 41,6 / 11,2 / 33,9 |
| gehen 1, Sitzung 2 | 60,7 / 25,2 / 10,9 / 25,8 | 58,2 / 41,6 / 11,5 / 36,0 |
| gehen 2 (eingeschwungen), Sitzung 1 | 73,0 / 24,9 / 10,8 / 14,8 | 71,9 / 25,0 / 10,7 / 15,2 |
| gehen 2, Sitzung 2 | 72,6 / 24,9 / 10,5 / 14,6 | 70,5 / 25,0 / 11,2 / 16,1 |

- **Der Steh-Lauf** direkt nach dem Umstellen (Einströmen im Stand) liegt bei Frame p95 41–58 auf beiden Seiten und zählt
  nicht.
- **Geher:** 4 Wege je Lauf.
- **Instrument:** `abab-if09` (f09398e6, Wiese lokal).
- **Seiten:** `abab-pf09`, `abab-p672`.
- **Rohdaten** `bericht/1410-boden2/` (s1, s2, `gehen.sh`).

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit.
- Ein Profil des Einström-Gangs am K51-4-Kopf (20 s, je Seite eine Sitzung, ca. 8 min) würde den Rest-Täter benennen. Auf
  Ruf.

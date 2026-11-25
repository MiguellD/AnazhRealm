# wiese-fern — Spike 2: die Füße streuen mit der Breite (tiere.K5#1 · leben.oeko.vielfalt#1)

**Gesetz:** `_wieseFernHalm(A, s)` in `stamm/vegetation-wiese.js` → waagrecht × s², senkrecht × 1. Der Stoff `_halmFerne`
(`stamm/stoff-material.js`) liest ihn für das GANZE Büschel: Füße und Breite der Halme streuen waagrecht × s², die Höhe bleibt
die der Nähe; die Kugel der Wahl (`wieseSkala`, `stamm/bild-wahl.js`) wächst mit der Waagrechten. Kein Zwilling, kein Regler.
Band: Nilson 1971 / Ross 1976, Lücke exp(−G·Ω·LAI/cos θ), G = 0,5 — die Deckung hängt an der Blattfläche UND an der
Klumpung Ω; Spike 1 verbreiterte nur die Halme, die Füße blieben am Ort (Ω < 1: die Halme deckten einander).

**Gemessen** (Werkbank `--echt` am Messort wiese, Radeon, dieselbe Pose, `bild --abstand --kanten 30,60`, 1280 × 720):

| | alt (gleichförmig s) | nur Höhe | Spike 1 (Halm × s²) | Spike 2 (Büschel waagrecht × s²) |
|---|---|---|---|---|
| Spitze 20 · 30 · 40 m | 0,91 · 1,37 · 1,85 m | 0,74 m | 0,74 m | 0,74 m |
| Deckung 20–30 m | 97,8 % | 92,8 % | 94,7 % | 98,4 % |
| Deckung 30–60 m | 97,1 % | 67,8 % | 77,7 % | **98,2 %** |
| Deckung 60–80 m | 89,1 % | 20,1 % | 30,6 % | 67,9 % |
| Deckung 80–200 m | 52,6 % | — | — | 19,2 % |
| Dreiecke im Bild | 330 625 | — | — | 331 193 |
| Zeichen-Rufe im Bild | 91 | — | — | 91 |

(Spike 1 und nur Höhe aus der Sitzung wf3, alt dort 97,1 % — dieselbe Zahl wie in der Sitzung von Spike 2.)
Kosten ABAB (`lauf 30 --tiere frei`, alt · neu · alt · neu, Fremdlast am Laptop): Bild p95 41,9 · 33,6 · 33,6 · 33,5 ms;
CPU p95 24,8 · 24,3 · 23,7 · 21,4 ms; GPU p95 7,2 · 5,7 · 6,5 · 5,8 ms; Zeichen-Rufe p95 121 · 120 · 120 · 120.
Hirsch-Maske (ein Hirsch gerade vor dem Auge): 20 m 371 → 419 px, 31 m 311 → 299 px, 40 m 212 → 233 px.

**Station tiere.K5#1** (Radeon, Einzel-Lauf der Punkte-Maschine): vorher 3f538eb6 Ego 2 · Third 2 (nur Bären, 28–35 m); nachher
9f4eef0e Ego **3** · Third 2 (Ego: Fuchs 432 px 22 m, Bär 229 / 290 px 35 m; Third: Bär 369 / 761 px 30–36 m), ROT an Third. In
keinem Lauf ein Hirsch ≥ 200 px: der Hirsch des Bestands steht nie näher als die Schwelle trägt.

**Bild** (`cloud-post/wiese-fern-bild/`, dieselbe Pose, Hirsch 31 m): `wiese-alt.png` · `wiese-nur-hoehe.png` ·
`wiese-spike1.png` · `wiese-spike2.png` — im Spike 2 steht der Hirsch mit Läufen über dem Halm, die Ferne bleibt Teppich.

**Linse:** P-Ferne-Halm in `gate:profiband` (`scripts/diag-profiband.cjs`): der Täter gleichförmige Skala → ROT beim Namen
`_wieseFernHalm`, Selbsttest 56/56.

**Offen:** Deckung 60–80 m 89,1 → 67,9 %, 80–200 m 52,6 → 19,2 % (dort war die alte Deckung die Höhe bis 2,5 m; Leser
tiere.K5#1 · gate:profiband P-Ferne-Halm).

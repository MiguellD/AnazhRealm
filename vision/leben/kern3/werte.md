# WERTE des Zeit-Kerns (kern3/zeit-kern.cjs) — gesetzt VOR der Rechnung (19.11.)

Jede Zahl des Kerns: Wert · Einheit · Quelle oder HYPOTHESE mit Spanne. „Abstr.“ = nur Abstract/Suchauszug, „Sek.“ = Sekundär,
„VT“ = Volltext (Vermerke aus `zensus-raten-quellen.md` / `zensus-zeit-quellen.md`).

## Die Uhr

| Name | Wert | Einheit | Herkunft |
|---|---|---|---|
| ZEIT.jahreRef | 8 | Jahre je refS (2 100 s, leben-core) | Gesetz Satz 1 (gesetzt; Quellen-Spanne 4,5 a Yellowstone ↔ 26,6 a t_max) |
| ZEIT.taktJeJahr | 26,25 | Takte je Jahr | abgeleitet: refS ÷ taktS ÷ 8 |
| ZEIT.tageJeTakt | 13,914 | Tage je Takt | abgeleitet: 365,25 ÷ 26,25 |

## Beute (94,2 kg)

| Name | Wert | Einheit | Herkunft |
|---|---|---|---|
| kitzeAdult | 1,36 ↔ 1,80 | Kitze je reifer Kuh je Jahr (karg ↔ gut) | Verme 1969, JWM 33:881 (Abstr.) |
| kitzeJaehrling | 0,62 ↔ 1,63 | Kitze je Kuh je Jahr im ersten Jahr nach der Reife | Verme 1969 (Abstr.) |
| ueberlebenKitz | 0,59 | je Jahr (erstes Lebensjahr) am Stand Last = K | Rohm et al. 2007 via FEIS (Sek.) |
| ueberlebenAdult | 0,76 | je Jahr (ab einem Jahr) am Stand Last = K | Am. Midl. Nat. 165:426, 2011 (Abstr.); für den Bock derselbe Wert — ANNAHME mangels Quelle ohne Jagd |
| abwandernBock | 0,80 | Anteil im Jährlings-Jahr (EIN Ereignis je Leben) | Crab Orchard NWR via FEIS [153] (Sek.) |
| abwandernKuh | 0,13 | dito | dito |
| weiblich | 0,5 | Anteil der Geburten | Auftrag (1 : 1) |
| frassJeJahr | 0,016 × (1 − diet) × 26,25 (= 0,42 bei diet 0) | Feld-Einheiten je Jahr je (kg ÷ M_Art)^¾ | KERN-EICHUNG: BESTAND_GESETZ.fress (tetrapoda-core T:2198, Welle w28), KEINE Feld-Quelle — das Feld trägt kein kg; neu ist nur die Einheit kg^¾ statt Kopf |

Formen (ohne eigene Zahl): Kitze = karg + (gut − karg) × max(0, 1 − Last ÷ K) · Hunger-Hazard je Jahr = −ln(Überleben) × Last ÷ K
(bei Last = K der Wert der Quelle, im leeren Revier 0) · Last = Σ (kg ÷ M_Art)^¾ · Geburt je reifer Kuh als Bernoulli je Takt,
gewichtet mit dem Erbe-Gewicht von leben-core (Eignung × kg^−0,25 relativ zur Art) · Vater = reifer Bock im Revier, sonst in den
acht Nachbar-Revieren, sonst keine Geburt · Abwanderungs-Ziel: jedes Revier mit Lebensraum (10 km ≥ das Raster), gezogen nach
K − Last; steht keines unter K, gleichverteilt.

## Wolf (64,0 kg)

| Name | Wert | Einheit | Herkunft |
|---|---|---|---|
| erhaltung | 0,1925 | kg verzehrt je Tag je kg^¾ | 2,77 kg je Tag am 35-kg-Wolf (FMR), Głowaciński & Profus 1997 Tab. 5–6 (VT) |
| sattheit | 0,396 | kg verzehrt je Tag je kg^¾ | 5,7 kg je Tag am 35-kg-Wolf, Yellowstone Frühwinter, Stahler et al. 2006 (Sek.; dort Brutto aus Riss × Lebendmasse) |
| wurfSchwelle | 1,2 | Deckung ÷ Erhaltung über das letzte Jahr | **HYPOTHESE** (1,1–1,5); Peterson & Ciucci 2003 nicht gelesen |
| welpen | 6 | Welpen je Wurf, EIN Wurf je Rudel je Jahr | 5,7 ± 0,4 Yukon (Hayes & Harestad 2000, VT) · 6,6 Minnesota (Fuller 1989, Abstr.) |
| nutz | 0,7 | Anteil der Riss-Lebendmasse, der Verzehr wird | **HYPOTHESE** (0,6–0,8); der erste Zensus trägt keinen Prozent-Wert (VU04: Verlust an Raben nicht ausgezogen) |
| fastenTage | 30 | Tage ohne Deckung der Erhaltung am 64-kg-Wolf; je Kopf ∝ M^0,25 (leben-core fastenExp) | **HYPOTHESE** (14–60); keine gelesene Quelle. Form: Tod je Takt = 1 − exp(−Fehl-Anteil × Tage je Takt ÷ Fasten-Tage) |

Formen: Deckung je Takt = nutz × kg Riss; je Kopf gedeckt in der Reihe der Masse (die Schwersten zuerst → Welpen hungern zuerst) ·
Alters-Tod bei Alter > lebensdauerS (leben-core) · keine Hintergrund-Rate · Abwanderung beim Reif-Werden (reifeS, leben-core:
0,2 × Leben = 1,6 Jahre), wenn die Deckung des letzten Jahres unter der Erhaltung lag oder das Rudel über der Verbands-Größe
steht (VERHALTEN.herde.wurf.wolf[1] = 6, tetrapoda-core T:282; Feld: Hirsch-Jäger 5–9 Nov., 4–6 März, Fuller 1989) → Beitritt
zum nächsten Rudel unter 3 Köpfen (wurf.wolf[0]), sonst Gründung im freien Raum, sonst Tod.

## Jagd

| Name | Wert | Einheit | Herkunft |
|---|---|---|---|
| jung · greis | 16 · 16 | Gewicht je Kopf relativ zum besten Alter | Mech 1966 (51 Risse, 0 im besten Alter) über den zweiten Gang (jagd-kern.cjs:72–81), mit dessen ANNAHME (halber Bestand im besten Alter) |
| greisAb | 0,5 | Anteil der Lebensdauer | Mech 1966 (gerissen ab 8 von ~16 Jahren), zweiter Gang |
| beuteMasse | 2,0 | × Masse des jagenden Verbands | tetrapoda-core T:166 (gelesen, nicht gesetzt) |

Form: je Takt reißt das Rudel über sein GANZES Rudel-Revier, bis nutz × Riss die Sattheit deckt oder der verwundbare Bestand
erschöpft ist; verwundbarer Bestand (Köpfe) = Σ Gewicht ÷ 16 über das Rudel-Revier; jeder Riss fällt in ein Revier nach dessen
Σ Gewicht, im Revier auf einen Kopf nach Gewicht. IMPLIZIT je Takt (Wortlaut des Auftrags „je Takt … bis erschöpft“): der
verwundbare Bestand ist je Takt EINMAL ganz greifbar — das ist die eine Stelle, an der die Takt-Länge ohne Quelle wirkt.

## Raum

| Name | Wert | Einheit | Herkunft |
|---|---|---|---|
| tagesKm | 24,85 | km je Tag | Mitte aus ♀ 22,1 / ♂ 27,6 (Jędrzejewski et al. 2001, Abstr.) — steht im Gesetz Satz 3 |
| wiederkehrTage | 6 | Tage | DIE EINE ZAHL der Revier-Regel: Wiederkehr an denselben Ort (Jędrzejewski et al. 2001, Abstr.) |
| deckel | 744 | Reviere je Rudel-Revier (29,9 km²) | abgeleitet: tagesKm × wiederkehrTage ÷ Revier-Seite 200,3 m |

REGEL (aus dem ersten Gang: die Besitz-Karte): jedes Revier gehört höchstens EINEM Rudel; ein Rudel-Revier ist zusammenhängend
(Kanten-Nachbarn), in der Breite gewachsen ab dem freien Revier, das dem Gründer am nächsten liegt, NUR in freie Reviere; ein
Rudel ohne Köpfe gibt frei; ein Rudel unter dem Deckel nimmt freies Land an seiner Grenze (ältestes zuerst). Die Größe ist der
WEG (Deckel 744), keine Energie, keine Pyramide; ein Mindest-Stück gibt es nicht mehr.

## Gelesen, nicht gesetzt (Kerne und erster Gang)

leben-core LEBEN_GESETZ (refS 2 100 s, refKg 64, lebenExp 0,20, wachsExp 0,25, fastenExp 0,25, wurfExp −0,25, geburtAnteil 0,06,
reifeMasse 0,9, reifeAnteil 0,2, Achse lnM) · tetrapoda-core BESTAND_GESETZ (taktS 10 s, revierM 113, kopfJeHa 25),
LEBENSRAUM_GESETZ, VERHALTEN.herde.wurf (Verbands-Größe: nur Anfangs-Bestand 3–7 Beute je Revier, 3–6 Wölfe je Rudel, und
„Rudel voll“), Temperament „wild“ · Feld (erster Gang, „bleibt“): Zerfall 0,008 je s der Welt-Uhr = Halbwert 8,66 Takte ≙
121 Tage; kahl −1, max 0,7, epsilon 0,004 (Feld-Einheiten) · Spike-Feld (erster Gang): 9 von 16 Zellen Lebensraum, Substrat 0,2–0,42.

## Zählung

Freie Zahlen je Takt im Kern: **0** (Soll 0). Es fallen `geburt 0,1`, `tod 0,2`, `riss 0,6`, `rissHalb 0,1`, `beuteVoll 30`
(nicht mehr gelesen); `fress 0,016` ist als 0,42 je Jahr je kg^¾ umgeschrieben (Kern-Eichung, keine Feld-Quelle). Implizit je
Takt bleibt EINE Einheit: die Erschöpfung des verwundbaren Bestands je Takt (oben, Wortlaut des Auftrags).
HYPOTHESEN: wurfSchwelle 1,2 · nutz 0,7 · fastenTage 30 · dazu die ANNAHMEN Bock-Überleben = Kuh-Überleben und die
Verwundbarkeits-Quote 16 des zweiten Gangs.
**Lauf 2 (19.11., die EINE Korrektur, zeit-kern-2.cjs Z. 80 · 371 · 485 · 510):** `sattheit` 0,396 ist kg RISS-BRUTTO je Tag je kg^¾ (Stahler: Riss × Lebendmasse), nicht Verzehr — das Rudel reißt, bis Riss ≥ Sattheit; gefressen = nutz × Riss; Deckung = Gefressenes ÷ Erhaltung 0,1925; jede andere Zahl, Regel und Saat wie oben.

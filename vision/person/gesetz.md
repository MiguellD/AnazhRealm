# Gesetz Person — der Mensch als Wesen der Art unter dem Gesetz des Lebens, Mitglied eines Haushalts des Bau-Gesetzes

Stand 18.11.2026, Zweig `zensus-person` (von `koordination` 50edf47d). Grund: `zensus.md` (119 Größen). Kern: `leben-core.js` (Welle 1,
sha256 ea947fa0…) unverändert. Bau: `vision/bau/spike/gesetz-proto.cjs` (`haushalt`, `GEWERBE`, `BAU_GESETZ`) unverändert. Kein Spiel-Code.

## 0. Der Satz

Eine Person ist ein Wert, kein Zustand: `Person(Same, Adresse, Glied)` → **Erbe** → **Leib** → **Fähigkeit** → **Tag** → `Ort(t)`.
Die Stadt hält keine Person; wer an einem Ort zu einer Zeit ist, rechnet eine Abfrage aus den Häusern im Kreis (§6).
Es gibt eine Quelle je Domäne: Erbe und Wachstum sind `leben-core`, Haus und Gesinde sind das Bau-Gesetz, Art-Daten sind WHO.

## 1. Adresse und Same

- **Adresse** = das Los eines Hauses im Plan (Bau-Gesetz: Gewerbe, Klasse, Baujahr). Sonderbau (Kirche, Halle …) trägt keinen Haushalt.
- **Glied** = (Generation g, Rolle, Kind-Nr. k) im Hauslauf oder (Gesinde-Platz s, Dienstjahr y).
- **Zufall** = reiner Hash von (Welt-Same, Adresse, Glied, Zweck) → u ∈ [0, 1). Kein `Math.random`, kein Takt-Strom, kein Speicher.

## 2. Hauslauf — der Haushalt als Funktion der Zeit

Je Haus läuft eine Kette von Generationen ab dem Baujahr T₀. Generation g hat eine Gründungszeit T_g und ein Paar (Mann, Frau).

| Größe | Wert | Quelle |
|---|---|---|
| Heiratsalter Frau | 24,5 J | Cinnirella et al. 2017, Demography (26 Kirchspiele), sekundär |
| Heiratsalter Mann | 27 J | Wrigley et al. 1997 S. 146 f. nach CUP-Beilage S0145553225000173, sekundär |
| Geburtenabstand Δ | 924 d = 2,530 J | Cinnirella et al. 2017, sekundär |
| Alter der Frau bei letzter Geburt | 35,68 J | Cinnirella et al. 2017, sekundär |
| Geschlecht bei Geburt | 105 : 100 (Junge 0,5122) | WHO, sekundär |
| Sterben | Siler h(x) = a₁e^(−b₁x) + a₂ + a₃e^(b₃x): 0,340 · 0,943 · 0,010 · 3,31·10⁻⁴ · 0,077 | Gurven & Kaplan 2007 Tab. 2 (!Kung), gesehen nur über Nachdruck; Epochen-Datum |
| Alterstod | Tod ≤ lebensdauerJ(M∞) = `lebensdauerS(M∞)`/K | leben-core (FOLGT) |
| Auszug der Nicht-Erben | 15 J (in den Dienst) | Kussmaul 1981: ≈ 60 % der 15–24-Jährigen im Dienst, sekundär |
| Gesinde | Plätze = `haushalt(gewerbe, klasse).gesinde`; jährlich neu besetzt, Alter 15–25 J | Bau-Gesetz; Kussmaul 1981 (Jahres-Dienst) |

Regeln (keine weitere Zahl):
1. Die Kinder von g kommen bei T_g + (k+1)·Δ, solange die Frau ≤ 35,68 J alt ist und beide Eltern leben.
2. Jeder Tod ist eine Ziehung aus der Siler-Kurve, gedeckelt durch den Alterstod des Leibs. Wer einheiratet, ist bis zur Hochzeit bedingt am Leben.
3. **Erbe** ist der älteste Sohn, der 27 J erlebt; sonst die älteste Tochter, die 24,5 J erlebt. Er/sie bleibt im Haus und gründet g+1
   bei der eigenen Hochzeit; der Gatte kommt von außen (Gründer). Ohne Erben zieht beim Tod des Letzten des Paares ein Gründer-Paar ein.
4. **Wohnen zur Zeit t:** das Paar jeder Generation ab T_g bis zum Tod (die Älteren als „Alt“); Nicht-Erben ab Geburt bis 15 J; der Erbe ab
   Geburt bis zum Tod; das Gesinde des Dienstjahres. Waisen bleiben bis 15 J. Wer auszieht, verlässt die Stadt (offene Grenze, §8).
5. **Erbe der Gene:** Gründer `gruender(n)`, Kinder `kind(a_Mutter, a_Vater, n_Seg, n_Mut)` — Mutter und Vater sind IMMER das Paar
   derselben Adresse. Umwelt `umwelt(n)` je Person. Alle n = `normal(u₁, u₂)` aus dem Hash.

`kinder[klasse]` des Bau-Gesetzes (2 / 2,5 / 3, „unsicher“) FÄLLT: die Kinder im Haus folgen aus Fruchtbarkeit × Überleben × Auszug.
Ein Klassen-Gefälle der Kinderzahl trägt das Gesetz nicht (kein Datum mit Quelle). Die Gesinde-Zahlen bleiben Datum des Bau-Gesetzes.

## 3. Leib — Physik des Erbes über das Alter

Art-Daten aus den WHO-Tafeln (`spike/who-referenz.json`, Herkunft und sha256 dort; Median je Monat 0–19 J, je Geschlecht):

| Größe | Mann | Frau | Herleitung |
|---|---|---|---|
| M̄ (Masse mit 19 J) | 69,16 kg | 57,04 kg | WHO 2007 BMI-Median × Größe-Median² |
| H̄ (Größe mit 19 J) | 176,54 cm | 163,15 cm | WHO 2007 |
| h₀ (Geburtslänge) | 49,88 cm | 49,15 cm | WHO 2006 |
| Reife (Masse 0,9·M̄) | 16,24 J | (14,43 J, Prüfwert) | WHO, interpoliert |
| β = ln(h₀/H̄)/ln q | 0,4492 | 0,4265 | q = 0,06 aus leben-core |

- **Ein Zeit-Anker der Art:** alterS = J · K, K = `reifeS(M̄_Mann)` / 16,24 J = **26,37 s je Jahr**. Die Reife der Frau ist dann
  KEIN Datum, sie folgt aus τ ∝ M^¼ (Soll in Probe b). Der Alterstod folgt: lebensdauerJ = `lebensdauerS(M∞)`/K ≈ 80,9 J beim Mittel-Mann.
- **Masse:** M∞ = `masseAdult(M̄_s, a, e)`; m(J) = `masseZurZeit(M∞, J·K)`; wuchs w = m/M∞ (die Alters-Koordinate von leben Welle 2).
- **Größe:** H(J) = H̄_s · (M∞/M̄_s)^⅓ · w^β_s. Der Faktor ⅓ ist der Guss von leben-core (bs = (m/M)^⅓); w^β ist die Jung-Allometrie.
  Keine zweite Wachstumskurve.
- **Beinlänge** L = 0,530·H (Hüfte im Kanon, Drillis & Contini 1966 / Winter; zensus g13).
- **Muskel:** m_mus = f_s·m(J), f = 0,384 (Mann) / 0,306 (Frau) (Janssen et al. 2000, J Appl Physiol 89:81, sekundär) — für alle Alter.
- **Alterskraft** φ(J) = 1 bis 50 J, dann −1,5 %/J bis 60 J, danach −3 %/J (Keller & Engelhardt 2013, PMC4150881, sekundär).
- **Knie-Strecker** (beide Beine): T₀ = c_T · f_quad · m_mus · φ, c_T = 0,121 N·m/cm³ ÷ 1,06 g/cm³ = 114,2 N·m/kg (PMC7372756;
  Dichte Mendez & Keys 1960); f_quad = 2·(244,8 N·m ÷ 0,121 N·m/cm³)·1,06 g/cm³ ÷ 33,0 kg = 0,130 (PMC7372756 × Janssen 2000).
- **Hill:** T(ω) = T₀(1 − ω/ω₀)/(1 + ω/(k·ω₀)), k = 0,25 (Hill 1938); ω₀ aus T(300 °/s)/T₀ = 0,498 (Cybex, nsj.org.sa 9:165,
  Mittel rechts 52,3/107,7 und links 49,8/97,7) → ω₀ = 31,2 rad/s.

## 4. Fähigkeit — EIN Regler vom Leib

Zwei Primitive auf demselben Leib. **Der Stoß**: ein Bein-Paar (oder ein Bein) aus zwei gleichen Gliedern l = L/2 streckt das Knie von φ_s; die Kraft entlang
des Beins ist F = T(ω)/(l·cos(φ/2)) mit ω = v/(l·cos(φ/2)) (Zwei-Glied-Bein nach Alexander 1995). m·dv/dt = F − m·g·sin θ; der Fuß
verlässt den Boden, wenn F = 0 wird (ω ≥ ω₀) oder das Bein gestreckt ist. g ist die Welt-Schwerkraft (zensus b17). Das ZIEL wählt
φ_s und θ (Optimierung über das Ziel), die REGELN wählen Beinzahl und Anlauf. Keine Sport-Konstante.

| Klasse | Ziel + Regeln | woraus | trägt |
|---|---|---|---|
| Gang | wirtschaftlich gehen: Froude 0,25 → v = √(0,25·g·L); Schritt = ½·L·2,3·(v²/gL)^0,3 | Kram 1997, Schepens 2004; Alexander 1976 | ja (ohne Alterung, §8) |
| Stand-Sprung | weit oder hoch, zwei Beine, kein Anlauf: max über φ_s, θ | der Stoß | ja |
| Sprint | max Tempo: v = L_c(2F/W − 1)/t_sw; F = mittlere Kraft des einbeinigen Stoßes; L_c = 1,017·L; t_sw = 1,133·√(L/g); Anlauf v(t) = V(1 − e^(−t/τ)), Start-Beschleunigung g·√((F/W)² − 1)/(F/W) | Weyand et al. 2000 (Tempo 6,2–11,1 m/s, t_aer 0,12 s, t_sw ≈ 0,35 s, sekundär); L_c und t_sw daraus beim WHO-Mann; Furusawa et al. 1927 | ja |
| Weitsprung | Anlauf = Sprint-Höchsttempo; das Bein **stemmt** als starre Strebe unter dem Winkel α vor der Hüfte (unelastisch: das Tempo längs des Beins geht verloren, das quer bleibt); das Ziel wählt α; Flug bis zur Absprunghöhe | zweites Primitiv „Stemmen“ (Physik des Stoßes) + Sprint | ja |
| Wurf | — | die Arm-Kette hat keine gesehene Quelle (Anteil der Wurf-Muskeln, Schulter-ω₀) | **nein** |
| Schlag, Schwimmen, Klettern, Balancieren, Rutschen, Ritt | — | kein Primitiv | **nein** |

## 5. Tag — Ort(t) als reine Funktion

Die Stunden sind die Daten des heutigen Tag-Plans (zensus t5–t8, t10). Ein Versatz δ ∈ [−0,5, 0,5] h je Person und Tag aus dem Hash
verschiebt den ganzen Tag (t9). Sonntag = Tag mod 7 = 0.

| Rolle (aus dem Hauslauf) | Werktag | Sonntag |
|---|---|---|
| Arbeiter (Vater, Erbe ≥ 15 J, Gesinde) | Bett → 6,5 Herd → 7 Platz → 8 Werk → 12 Herd → 13 Werk → 17 Herd → 18 Platz → 18,75 Herd → 22 Bett | 9 Kirche → 10,5 Herd → 18 Platz → 18,75 Herd |
| Hausfrau (Mutter) | 9 Platz (Markt) → 10 Herd | 9 Kirche → 10,5 Herd |
| Kind 6–14 J | 14 Gasse vor dem Haus → 17 Herd | 9 Kirche → 10,5 Herd |
| Kleinkind < 6 J | im Haus | im Haus |
| Alt | 15 Platz → 15,75 Herd | 9 Kirche → 10,5 Herd |

Werk = das eigene Haus; beim Gewerbe `tageloehner` ein Werk-Los im Umkreis von zwei Blöcken (aus dem Hash). Platz und Kirche gehören zum
Viertel. Zwischen zwei Orten geht die Person auf den Gassen (L-Weg über die nächste Quergasse) mit ihrem Gehtempo aus §4. In ein und
demselben Los geht sie gerade. Nachts liegt sie am Bett-Punkt im eigenen Los.

## 6. Die Abfrage — wer ist um t im Kreis (c, r)

Kandidaten sind nur Häuser, deren Bewohner zur Zeit t im Kreis sein KÖNNEN; die Grenzen sind fest und hängen nie an der Stadtgröße:
1. die Lose im Abstand ≤ r + 5 m (Wohnen, Gasse);
2. in einem Fenster von Platz, Markt, Alt-Platz oder Kirche (± Versatz + Weg) alle Häuser der Viertel, die den Kreis berühren;
3. an Werktagen zwischen 7 und 18,5 Uhr die Tagelöhner-Häuser, deren Weg-Rechteck (Heim, Werk-Los) ± ein Block den Kreis berührt.
Für jeden Kandidaten rechnet der Hauslauf die Bewohner zu t, der Tag ihren Ort, der Kreis filtert. Messname: `person.abfrage`.

## 7. Soll VORHER (die Spikes in `spike/`)

| Probe | Messung | Soll | Quelle des Solls |
|---|---|---|---|
| a Kosten | p50 ms je Abfrage (12:40, r 150 m, zufällige Adresse) bei 5·10³ / 5·10⁵ / 5·10⁶ Personen | ms(5·10⁶) ÷ ms(5·10³) ≤ 1,5 | Auftrag |
| a Treue | 100 Abfragen (Zeit und Ort zufällig, alle Fenster) bei 5·10³: Abfrage gegen Sack-Scan aller Personen | Mengen gleich, 0 Abweichung | §6 |
| b Pyramide | Anteil 60+ · Anteil 0–14 · e₀ (alle Geburten 1550–1650) | 6–10 % · ≥ 35 % · 35–40 J | CAMPOP 2024 nach Wrigley & Schofield · Meisterkarte generationen#1 · CAMPOP/W&S |
| b Größe | Median je Alter 1, 2, 5, 10, 15, 18 J und Geschlecht (12 Zellen) | alle 12 im Band WHO-Median ± 1 WHO-SD | WHO 2006/2007 |
| b Streuung | SD der Größe 18–19 J | 0,75–1,25 × WHO-SD | WHO 2007 |
| b Reife Frau | Alter bei 0,9·M∞ | 14,43 ± 0,5 J | WHO 2007 |
| b Haushalt | Mittel · Personen in Haushalten ≥ 6 · Gesinde-Anteil | 4,25–5,25 · > 0,5 · 10,4–16,4 % | Laslett 1972 (4,75) · Laslett 1969 · Kussmaul 1981 (13,4 %) |
| b Erbe | Kinder mit Mutter und Vater derselben Adresse · Steigung Kind auf Eltern-Mittel (lnM) | 100 % · 0,46 ± 0,05 | §2.5 · leben-core h² |
| c Tag | 1 Person × 7 Tage × 1 440 min, dazu 1 000 Personen | 100 % der Schlaf-Minuten am Bett im eigenen Los; Schritt je Minute ≤ v·60 s; jede Person-Id genau einmal in der Stadt | Auftrag |
| d Gang | Tempo Erwachsene 30 J (m, w) · Kind 6 J · Greisin 85 J; Schritt Greis 85 J | 1,27–1,46 · 0,62–1,04 · 0,80–1,08 m/s; 43,6–59,0 cm | Bohannon 1997 · JEB 2021 (0,83 ± 25 %) · Bohannon & Andrews 2011 (0,943 ± 15 %) · Tafel 2020 (51,3 ± 15 %) |
| d Stand-Sprung | Weite Jungen 9 / 17,9 J, Mädchen 9 / 17,9 J; Greis 75 J gegen 30 J | 87–131 / 132–198 / 77–115 / 96–144 cm (P50 ± 20 %); 75 J < 30 J | FUPRECOL (PMID 27642854) |
| d Sprint | Höchsttempo Mittel-Mann 25 J · 100 m Mittel-Mann · Bester von 1 000 Männern 20–30 J · CV der 100-m-Zeit | 6,2–11,1 m/s · 9,58–17,6 s · ≥ 9,58 s · 10–20 % | Weyand 2000 · Weltrekord, 100/6,2 + 1,5 · Weltrekord · Meisterkarte koennen#1 |
| d Weitsprung | Bester von 1 000 · Mittel-Mann gegen eigenen Stand-Sprung | ≤ 8,95 m · größer | Weltrekord · Physik |
| d Wurf | Abwurf Mittel-Mann / Mittel-Frau | 18,6–27,8 / 15,4–23,0 m/s | Ettema 2004 nach Gromeier 2017 (23,2 / 19,2 ± 20 %) |
| e Determinismus | zwei Prozesse, gleicher Same: sha256 der Ausgaben a-Treue, b, c, d · anderer Same | gleich · verschieden | Auftrag |

Urteil je Probe: TRÄGT (alle Soll erfüllt) · TRÄGT BEDINGT (verfehlt, die Bedingung als Zahl) · FÄLLT (mit Wurzel). Kein Nachstellen
einer Konstante nach der Messung.

## 8. Was das Gesetz nicht trägt (vorher benannt)

- Alterung des Gangs (Froude ohne Kraft), Wurf und alle Klassen ohne Primitiv (§4); Arm-Schwung im Sprung.
- Wiederheirat, Streuung des Heiratsalters und des Geburtenabstands, Klassen-Gefälle der Kinder, Jahreszeit im Tag.
- Geschlecht in der Sterblichkeit: die Siler-Kurve ist für beide gleich, der Alterstod der leichteren Frau früher.
- Die geschlossene Stadt: Auszug und Gesinde sind unabhängige Ströme über die Stadtgrenze; ein Kind aus Haus A gründet nie Haus B.
- Die Statur-Streuung über Welle 1 hinaus: Welle 1 hat nur die Achse lnM; die Größe streut mit (M∞)^⅓.

## 9. Urteil je Zensus-Größe

`urteil.json` (119 Zeilen, dieselben ids wie `zensus.json`): **FOLGT 27 · FÄLLT 28 · DATUM 64.**

| Domäne | FOLGT | FÄLLT | DATUM |
|---|---|---|---|
| Herkunft (15) | h4 h6 h7 h9 h10 h11 h14 | h2 h3 h5 h8 | h1 h12 h13 h15 |
| Gestalt (27) | g3 g4 g5 g6 g7 g10 g11 g16 | g17 | g1 g2 g8 g9 g12–g15 g18–g27 |
| Tag (26) | t9 t12 t22 t23 t24 | t11 t15 t17 t18 t20 t21 | t1–t8 t10 t13 t14 t16 t19 t25 t26 |
| Bewegung (30) | b4 b11 b12 b17 | b1 b2 b3 b5 b14 b18 b30 | b6–b10 b13 b15 b16 b19–b29 |
| Zahl (21) | z6 z17 z21 | z1 z3 z4 z8 z9 z10 z13 z18 z19 z20 | z2 z5 z7 z11 z12 z14 z15 z16 |

Von den 68 gesetzten Größen des Zensus fallen 18, 4 folgen, 46 bleiben Datum: 28 gehören Bild, Uhr, Schirm-Budget oder Spiel-Mechanik,
5 sind Stunden des Tag-Plans, 3 gehören dem Verkehr, 2 dem Tier, 8 sind Bewegungs-Klassen, die der Regler nicht trägt. Die 7 fehlenden
Größen: 6 folgen (Eltern, Alter im Tag, Wochentag, Deckel am Schirm, Messname, Speicher 0), 1 bleibt Datum (z14 Hülle).

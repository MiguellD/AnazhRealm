# Bericht 2010 B-Blick (Macher): die Wartemenge des Weltbilds ist das Bild der Ankunft — Zweig b-blick cc694147

**Status: ZWISCHENSTAND.** Geschnitten von einem frischen Schneider; sein Bericht wörtlich unten. Rohdaten hier in `bericht/2010-b-blick/`, alles auf der OMEN in `p3/n2010/blick/`. Vom Koordinator in integ-probe 6b7dfd1d (V18.546.38) übernommen.
- **Geschnitten:** EIN Prädikat `_rangImBild` für Pumpe, Streu-Wecker, Lade-Frist und Ring. Die Klasse ist ganz geschnitten, ohne zweiten Rang.
- **Gemessen:**
  - GTX kalt 4+4: t(Weltbild) 15,44 → 15,39 s gegen dc6702ab (**−0,3 %**), gegen 80258f0e −1,8 %.
  - Deko-Aussetzer im Lade-Takt 5,5 → 0.
  - Lauf-Zelle Genesis Third stehend nicht langsamer.
  - Atome scripts −125. Zweig-CI grün.
- **Ehrlich offen:**
  - Das Ziel < 14 s ist verfehlt. Umordnen trägt B nicht mehr (Entscheid des Koordinators: keine weitere Welle).
  - Der andere Weg ist Ankunft ohne Bauen und Welt-Arbeit auf einem zweiten Faden.

---


**Zweig `b-blick`, Kopf cc694147** `[ci voll]` (leer, Baum = 0739b555 = fremder Merge integ-probe 80585b1b auf meinen 4517832e; ab 80258f0e,
dc6702ab `--no-ff`). CI: Lauf 39509876996 (0739b555), Versuch 2 GRÜN; Versuch 1 rot nur voll 3/18 Schritt 17 „Schatten am Terminator“ =
Umgebung (lokal grün `terminator-B-0739.log`, wanduhr-klasse 7383002a ohne meinen Schnitt rot am selben Schritt, CI 39508059062).

## Schnitt
- **EIN Prädikat** `_rangImBild(wo, r)` (studio-bruecke.js, aus `_rangImErstenBlick(_foundryAuftragD2)`) mit vier Lesern:
  - **Pumpe:** `darf`.
  - **Wecker:** `_streuWartetAuf` legt jede Zusage mit dem Rang ihres Lesers ab; `_streuWeckerSpannen` weckt vor dem Bild mit der letzten
    Zusage im Bild; `_streuRegionWartet` hält nur mit einem Bild-Wartenden.
  - **Lade-Frist:** keine 4er-Deko im Lade-Takt; die Deko liest bis zur EINEN Frist (`_kappeOffen(n, kappe, frist)`).
  - **Ring:** unter dem Ladeschirm erst die Stücke im Bild mit der Frist, danach der Rest mit der Kappe des Spiels.
- **Außerhalb des Besitzes, dieselbe Wurzel:** der Boden-Term in `_weltbildLuecken` (dirigent-ankunft.js) zählt nur Stücke im Bild.
- **Befund am Schnitt, geheilt:** die erste Form („nur das Bild“) ließ die Prüfbühne S0 rot werden („der Boden wächst (Ring 0 von 2)“).
  Mit „im Bild zuerst“ ist S0 grün an A und am Kopf (`pruefbuehne-{A,B}.log`).

## Zahl
- **F5 an 80258f0e** (`f5.txt`): der Strom aß die Frist (155–192 ms je Takt), der Wald-Plan brauchte 19–209 ms, die Deko lief nur in
  1 von 4 Takten. Kandidat 1 ist bestätigt.
- **Kalt-ABAB GTX 4+4** (Instrument byte-gleich):
  - Gegen dc6702ab (`tafel2.txt`): t(Weltbild) **15,44 → 15,39 s (−0,3 %)**, innerhalb der Streuung.
  - Gegen 80258f0e (`tafel.txt`): **15,53 → 15,25 s (−1,8 %)**.
  - Deko-Aussetzer 5,5 → 0; erste Region 8,5–12,3 → 6,2–10,3 s; Boden-Term 10,2–13,6 → 6,0–10,3 s.
- **Lauf-Zelle Genesis Third stehend 4+4** gegen dc6702ab (`lauf/steht2/`): **nicht langsamer** — fps 80,3 → 80,0, Frame p95
  16,8 → 16,7, CPU p95 5,8 → 5,9, GPU 12,43 → 12,50 ms.
- **Linse gate:ankunft L2a** (13 Bild-Zusagen, 14 Lade-Takt, 1b Boden hinter dem Spieler): rot an dc6702ab (`linse-A-4.log`), grün am Kopf
  (`linse-B-4.log`). Der alte Täter des gestrichenen Falls streuWartet, am Kopf gepflanzt, wird rot (`linse-B-alter-taeter.log`).
- **Atome** (`atome2.log`): gegen dc6702ab scripts **+1393 → −125** (scripts+spec −117, Spiel +1545), Wand grün; gegen 8ba1510d gedacht
  −125 bei 0 Konflikten; am Kopf gegen integ 80585b1b ebenfalls −125.
- **Wände** (`waende.log`) EXIT=0. ci-lokal ganz samt echt (`ci-gruppen{2,3}.log`): 159/159, 158 EXIT=0;
  kopf 18 „Ein Urteil je Kopf“ braucht GITHUB_SHA, an A gleich rot (`ci-kopf-umgebung.log`).

## Offen
- **Ziel < 14 s verfehlt:** −0,3 % gegen dc6702ab. Umordnen trägt B nicht mehr (Entscheid des Koordinators: keine weitere Welle).
- Die letzten Terme laufen bei 15,1–15,3 s zusammen; die letzte Bild-Zusage ist eine Karte, der Haupt-Faden ab Buch zu 92–96 % LongTasks.
- **B braucht den anderen Weg:** Ankunft ohne Bauen, und die Welt-Arbeit auf einem zweiten Faden. Kandidaten sind `_tickImpostorBake`
  (0,76–0,84 s), der Erst-Bau `_loopRender` (2,45–3,00 s) und `_tickFernRing` (0,42–0,53 s).

Status ZWISCHENSTAND + Übergabe: b-blick cc694147 abgeschlossen (sein eigener Lauf 39511373993 brach der Neustart von 39509876996 ab).

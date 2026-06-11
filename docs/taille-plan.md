# DER EWIGKEITS-BOGEN — die gefrorene Taille (Ω)

> **STATUS: GEBAUT — DER BOGEN IST RUND (Ω0–Ω6, V18.137–.141, 11.06.2026).** Die normative
> Wahrheit lebt in `docs/taille-spec.md` (Ω1); die goldenen Dateien in `spec/golden/v1/` sind
> EINGEFROREN (NIE regenerieren — `checkBandTailleGolden` lädt sie für immer). Werkzeuge:
> `scripts/diag-taille.cjs` (Inventur + Konformanz) · `scripts/diag-ledger-cycles.cjs`
> (Perpetuum-Verbot) · `npm run smoke:zeitportal` (der Vorwärts-Beweis). GEMESSEN geheilt:
> alle vier Risse + die Modus-Wäsche (+14/Zyklus → 0) + der Import-portalMeta-Beifang-Riss.
> Offen bleiben NUR die benannten S-Punkte (§5): Klemm-Decken-Review (Erst-Wurf ×2) ·
> Werkzeug-Abnutzung (∞-Katalysator benannt) · Provenance-Cap-16-Politik. Sobald ein
> Alt-Build als git-Tag-Artefakt vorliegt: das ECHTE V18→V19-Zeit-Portal (Ω4-Vollform).
> Dieses Dokument ist ab jetzt HISTORIE des Bogens (die Risse + der Weg).
>
> Analyse-Stand: Branch `claude/admiring-fermat-c0d5ct`, `anazhRealm.js` @ 56'987 Zeilen, 11.06.2026.
> Alle Zeilennummern GEMESSEN gegen diesen Stand (sie wandern — die Symbolnamen sind der Anker).
>
> **FISCHER-VERIFIKATION (V18.136-Stand, 11.06.2026, §6.4-Disziplin „fremde Analysen selbst
> verifizieren"):** Riss 1 ✓ BESTÄTIGT (`_canonicalBlueprint` signiert `role` im Kern) · Riss 3 ✓
> BESTÄTIGT (`importRecipesFromWorld` spreadet `{...bp}` ohne verify/Tainted/Re-Derive) ·
> yieldMult≤1 ✓ BESTÄTIGT · **Riss 2 KORRIGIERT (das Beispiel überclaimte):** die STAT-PIPE
> KLEMMT (computePlayerStats/computeCreatureStats clampen finalTags [0,1] VOR den
> STAT_FROM_TAGS-Formeln; der Readout `_blueprintAbilityStats` deckelt tagsHi=2.5/tagsLo=1.0) —
> die „Gottwaffe" ist strukturell unmöglich. Die ECHTEN ungeklemmten Magnitude-Leser sind die
> ABBAU-WIDERSTANDS-Familie (`_architectureResistance`: rohes `t.härte`/`t.dichte` ×
> resistFrom… → ein härte=10⁶-Material baut die unzerstörbare GOTT-MAUER, fit→0, Mühe→∞) und
> verwandte rohe `computeCompoundTags`-Konsumenten außerhalb der Stat-Pipe. Ω3(b) bleibt damit
> RICHTIG (die Klemme am Leser, MATERIAL_TAG_CEIL), nur die Wunde sitzt woanders — der
> Antikörper-Korpus testet die Mauer, nicht die Klinge.

## §0 — Das Ziel: zwei Sätze frieren ein, alles andere lebt

Das Ultiversum trägt durch Versionen, Jahrzehnte und fremde Engines, wenn — und nur wenn — eine
schmale Taille existiert, die nie bricht. Die Taille ist KEIN Code. Sie ist ein Vertrag:

1. **Der Vektor trifft die Signaturen.** Ein Artefakt reist als deskriptive Substanz
   (Tag-Vektor + Form + Herkunft + Signatur). Die empfangende Welt rechnet jede Bedeutung
   (Rolle, Kraft, Kosten) mit ihren EIGENEN gefrorenen Signaturen neu. Behauptetes ist Metadatum,
   Gemessenes ist Wahrheit. Unbekanntes wird projiziert (ignoriert), nie abgelehnt — und bewahrt,
   nie gestrippt.
2. **Das Werk kostet, der Kreis erhält null.** Jeder Mach-Akt zahlt im Erhaltungs-Ledger als
   reine Funktion der Substanz (nie als Tabelle). Kein Transformations-Zyklus gibt mehr zurück,
   als er verbraucht — das Perpetuum-Verbot ist eine lebende Invariante, keine Hoffnung.

Alles oberhalb (Vokabular, Werkstätten, Engines, Renderer, Modi) und unterhalb (Signatur-Tabellen,
Kosten-Konstante, Lese-Tiefe) darf frei wachsen. Das ist die IP-Sanduhr des Internets, in
Substanz-Sprache.

## §1 — GEMESSEN: was schon steht (mehr als gedacht)

| Baustein | Ort | Befund |
|---|---|---|
| Resonanz-Kern | `_blueprintResonance` (~36269) | Iteriert über die **Signatur**-Achsen → unbekannte Tags projizieren strukturell auf 0. **Must-ignore ist im Lesen schon Physik, keine Konvention.** ✓ |
| Rollen-Klemme | `_blueprintProductVector` (~40158, V17.90) | Material-Tags werden vor jeder Rollen-Resonanz auf [0..1] normalisiert (`PRODUCT_VECTOR_TAG_NORM`). Ein fremdes Material mit härte=10⁶ kann die ROLLE nicht kapern. ✓ (aber siehe Riss 2) |
| Kosten = Gesetz | `computeBuildCost` (~43899) | Reine Funktion der Substanz: Volumen × `HARVEST_VOLUME_TO_UNITS` pro Material. **Keine Preistabelle existiert.** Neuer Inhalt bepreist sich selbst. ✓ |
| Kreis-Symmetrie | `harvestArchitecture` (~44310) + `_harvestFitnessFromResist` (~44813) | Bauen und Abbauen nutzen DIESELBE Konstante k; `yieldMult = min(1, …)` ist hart geklemmt → Bau→Abbau ist intra-Welt nie netto-positiv. ✓ |
| Versionsfeld | `_canonicalBlueprint` (~28187) | Die kanonische Form trägt schon `v: 1`. Die Taille hat ein Versionsfeld — unbenannt. ✓ |
| Protokoll-Version | `p2pSend` (~5677), `PROTO_VERSION = 1` (~56371) | Jede Mesh-Nachricht trägt `pv`; Kommentar deklariert JSON-Toleranz als Design-Wahrheit. ✓ (unbewiesen — siehe Riss 4) |
| Herkunft + Rückruf | `_appendProvenance` (~28458), `_artifactProvenanceTainted`, `_purgeRevokedArtifacts` | Kette + Revokation + Sieben beim Laden stehen (R4). ✓ |
| Souveräne Wand | `_sovereignGesture` in `signBlueprint` (~28234), R2-Disjunktheit | Signieren ist eine Host-Geste außerhalb jedes iframes. ✓ |
| Empfänger zeigt Emergenz | Bibliothek-Karte (~49316/49356) | Die Karte zeigt `computeBuildCost` + `computeBlueprintRole` live — der Empfänger LIEST schon selbst, mindestens im UI. ✓ |
| Unbekanntes überlebt (teilweise) | `importRecipesFromWorld` (~31071) | `{...bp}`-Spread kopiert auch unbekannte Felder mit → must-preserve gilt auf DIESEM Pfad de facto. (unbewiesen, ungetestet) |

**Fazit der Messung:** Die Taille existiert zu ~70 % implizit. Der Bogen baut wenig Neues — er
BENENNT, BEWEIST und schließt vier Risse. (R0-Muster: Verdichtung, kein Anbau.)

## §2 — Die Risse (jeder mit Beleg)

**Riss 1 — die Rolle steckt in der signierten Substanz.**
`_canonicalBlueprint` signiert `{v, role, parts, connections}`. Aber die Rolle ist eine
ABLEITUNG (emergiert via `computeBlueprintRole`, ~40141) bzw. ein Intent-Override
(`roleManual`, ~40320). Folge-Konflikt: würde der Import die Rolle lokal re-deriven (wie die Wand
es verlangt), kippte jede gültige Signatur auf „modified". Behauptung und Substanz sind in der
Taille verschmolzen — sie müssen getrennt reisen.

**Riss 2 — die Stat-Leser klemmen nicht.**
Die Rollen-Resonanz normalisiert (V17.90 ✓), aber die rohe MAGNITUDE lebt weiter in
`computeCompoundTags` → `STAT_FROM_TAGS` (Schaden, Rüstung, Trank-Stärke). Ein via
`importRecipesFromWorld` empfangenes Material reist mit BEHAUPTETEN Tags
(`tags: {...defaults, ...(m.tags||{})}`, ~31145) — härte=10⁶ macht jede lokale Klinge daraus zur
Gottwaffe. Die Welt klemmt die Wirkung fremder Substanz nirgends.

**Riss 3 — der Import re-derived nichts und prüft nichts.**
`importRecipesFromWorld` übernimmt `bp.role`, `bp.roleManual`, Signatur-Felder 1:1. Kein
`_refreshBlueprintRoleEmergent`, kein `verifyBlueprintSignature`, kein Tainted-Check am Eingang
(das Sieben läuft nur beim Laden via `_purgeRevokedArtifacts`). Ein fremder Bauplan kann
`roleManual=true, role="workshop-station"` BEHAUPTEN — fremder Intent wird lokales Gesetz ohne
lokale Geste.

**Riss 4 — drei Versionsfelder, drei Bedeutungen, null Semantik.**
`v:1` (kanonischer Bauplan), `pv:1` (Mesh), `version: currentVersion` (Snapshot = App-Version,
keine Schema-Version). Nirgends steht die REGEL: was darf sich bei minor ändern, was erzwingt
major, was tut ein Leser bei unbekannter Version. Toleranz ist Kommentar, nicht Korpus — kein
goldener Datei-Satz, kein „alter Build liest neuen Bauplan"-Beweis.

**Riss 5 — die Kreise jenseits Bau→Abbau sind unauditiert.**
Sonde A (∞-Trank-Boost) wurde GEMESSEN gefunden und geheilt — durch eine Sonde, nicht durch ein
stehendes Verbot. Offene Kandidaten: schöpfer-baut-gratis → Modus-Wechsel → pfad-erntet
(Materie-Wäsche über die Modus-Achse); Trank-Brau/Konsum-Bilanz; Werkzeug-Abnutzung (existiert
keine → Werkzeuge sind ∞-Katalysatoren, evtl. gewollt); ablesen (Werk→Plan frei — korrekt, ABER
nur solange Werk→Materie nie über Bau-Kosten liegt, was yieldMult≤1 sichert).

## §3 — Die Wellen Ω0–Ω6

Reihenfolge: messen → benennen → bewahren → re-deriven → durch die Zeit beweisen → den Kreis
schließen → wachsen lassen. Ω0–Ω1 sind risikofrei; Ω2–Ω3 berühren Import-Pfade (Invarianten-
gedeckt); Ω4 ist der Beweis-Moment; Ω5–Ω6 sind Antikörper + Doktrin.

### Ω0 — die Inventur (messen, null Risiko)
**Bau:** `scripts/diag-taille.cjs` — dumpt die vier Draht-Artefakte als goldene Dateien nach
`spec/golden/v1/`: (a) ein kanonischer signierter Bauplan (voll: parts/connections/opChain/
provenance/signature), (b) ein Welt-Manifest, (c) ein Snapshot-KOPF (die Schema-relevanten
Felder, nicht der Welt-Inhalt), (d) ein p2p-Umschlag pro Nachrichtentyp. Dazu misst der diag:
welche Import-Pfade rufen `verifyBlueprintSignature`? Überleben injizierte `xZukunft:{…}`-Felder
den Round-Trip auf JEDEM Pfad (Rezepte-Import · Snapshot save/load · Manifest export/import ·
p2p echo)?
**Beweis:** der diag läuft grün und druckt die Round-Trip-Matrix. Die goldenen Dateien sind ab
jetzt EINGEFROREN (git, nie regeneriert — regeneriert wäre der Sinn-Verlust).
**Aufwand:** klein. **LEHRE-Anker:** Miss zuerst, die Zahl führt.

### Ω1 — das Spec-Dokument (benennen)
**Bau:** `docs/taille-spec.md` — normativ, eine Seite pro Artefakt, MUST/MAY-Sprache:
- **Bauplan-Draht-Form:** die `_canonicalBlueprint`-Felder als gefrorener Kern; Substanz =
  parts ⊕ connections (deskriptiv: shape/material/refName/color/position/size/rotation/opChain).
  Tags sind ABGELEITET, reisen nie als Wahrheit. `provenance` + `signature` + `authorPubKey`
  sind unsignierte bzw. selbst-signierende Hülle.
- **Die Versions-Regel (EINE Semantik für v/pv/Schema):** minor = additiv (neue Felder, neue
  Tags, neue Nachrichtentypen) — Leser ignorieren + bewahren; major = Umdeutung eines
  bestehenden Feldes — verboten, außer als NEUE Taille (= neues Universum, bewusste Geburt).
  Eine Achse wird NIE umgedeutet; sie kann nur sterben (Gewicht 0 in allen Signaturen) oder
  geboren werden.
- **Die zwei Lese-Gesetze:** must-ignore (Unbekanntes projiziert auf 0) + must-preserve
  (Unbekanntes überlebt jeden Round-Trip — ein V18-Relay strippt einem V25-Bauplan nicht die
  Zukunft).
- **Das Empfänger-Gesetz:** kein Import-Pfad übernimmt abgeleitete Werte. Rolle, Kosten, Stats,
  Domäne werden lokal gerechnet. Behauptungen (`role`, fremde Tags-Magnituden) sind
  Provenance-Metadaten.
- **Das Ledger-Gesetz:** Mach-Akte zahlen als Funktion der Substanz; kein Zyklus ist
  netto-positiv; Mengen (Inventar) reisen NIE über die Taille — nur Definitionen (Pläne,
  Material-ARTEN, Vokabular). (GEMESSEN erfüllt `importRecipesFromWorld` das schon: es importiert
  Material-Definitionen, keine Stückzahlen — jetzt wird es Gesetz.)
**Beweis:** das Dokument existiert; CLAUDE.md bekommt den Trigger „vor jeder Arbeit an
Bauplan-Serialisierung / Import / p2p-Protokoll / Snapshot-Schema ZUERST lesen".
**Drei-JA-Test:** spec/ + golden/ sind Dokumente/Daten, kein Stamm-Split — keine Verletzung der
Heiligen Lektion; die Taille ist exakt die „bewiesen-schmale, stabile Schnittstelle".
**Aufwand:** klein-mittel (das Denken ist hier; der Text ist kurz).

### Ω2 — must-preserve als Gesetz (bewahren)
**Bau:** jeden Leser/Schreiber-Zwilling auf Round-Trip-Erhalt härten, wo Ω0 Lücken fand
(Kandidaten: Snapshot-Restore, das die Felder selektiv abschreibt; Manifest-Import; p2p-Handler,
die Objekte neu bauen statt durchreichen). Muster: ein `_carryUnknown(src, dst, knownKeys)`-
Helfer als EINE Quelle — kein Per-Pfad-Patch.
**Beweis:** +Invarianten-Band `checkBandTailleOmega2`: injiziertes `xZukunft`-Feld in Bauplan /
Material / Manifest / Snapshot-Kopf → laden → re-exportieren → Feld lebt, bit-gleich.
**Aufwand:** klein, mechanisch nach der Ω0-Matrix.

### Ω3 — die Re-Derive-Wand (der Empfänger ist souverän)
**Bau (drei Schnitte, EIN Eingang):**
- **(a) Behauptung und Wahrheit trennen:** beim Import wird `bp.role` zu `bp.roleClaimed`
  (Metadatum, reist weiter), `bp.role` wird lokal via `_refreshBlueprintRoleEmergent` gesetzt.
  `roleManual` aus fremder Hand wird VORSCHLAG: die Karte zeigt „behauptet: Werkstatt-Station",
  der lokale Intent-Override braucht die lokale Geste (`setBlueprintAsWorkshopStation` etc. —
  der V17.70-Pfad, jetzt empfänger-seitig). **Damit löst sich Riss 1 ohne Signatur-Bruch:** die
  Signatur deckt weiter die GEREISTE Form (inkl. roleClaimed an Stelle des alten role-Felds in
  der kanonischen v1-Prüfung — `verifyBlueprintSignature` liest beim Prüfen `roleClaimed ?? role`,
  rückwärts-kompatibel, kein v2 nötig).
- **(b) die Stat-Klemme am LESER, nicht am Artefakt:** `computeCompoundTags`-Konsumenten der
  rohen Magnitude (STAT_FROM_TAGS-Familie) klemmen pro Achse auf den lokalen Wertebereich
  (`MATERIAL_TAG_CEIL` pro Achse, frozen, aus den Built-in-Materialien GEMESSEN abgeleitet ×
  Headroom). Lese-seitig statt import-seitig, weil: die Substanz bleibt unangetastet (eine
  zukünftige Welt mit höherer Decke liest die volle Pracht), und es deckt JEDEN Eintrittsweg
  (auch künftige) per Konstruktion. Das ist der Spannungsregler — das Item ist nicht kaputt, es
  ist hier nur so stark, wie diese Welt trägt.
- **(c) der EINE Import-Eingang:** `importRecipesFromWorld` (und jeder künftige Artefakt-Import)
  läuft durch `_admitForeignArtifact(artifact)`: verifiziert Signatur (Status ans Artefakt),
  prüft Tainted (Rückruf-Sieb AM EINGANG, nicht erst beim Laden), hängt Provenance an
  („über dich"), trennt Behauptung/Wahrheit (a). Verdichtung, kein Parallel-Pfad.
**Beweis:** +Antikörper-Korpus „der lügende Bauplan" (R5-Stil): ein Artefakt behauptet
role=soul/workshop-station + härte=10⁶ + revozierten Kettenglied → Import: Rolle emergiert lokal,
Stats geklemmt, Tainted fällt. +Invarianten: kein Import-Pfad schreibt `role` ohne Re-Derive
(grep-Invariante über die Aufrufer, V17.31-KONSUM-Stil).
**Aufwand:** mittel. **S-Gate:** die Klemm-Decken (Zahlen) sind Schöpfer-Review (wie die
E2-Budget-Größen).

### Ω4 — der Konformanz-Korpus + das Zeit-Portal (der Beweis)
**Bau:**
- **Rückwärts:** Playtest-Band `checkBandTailleGolden` lädt die eingefrorenen
  `spec/golden/v1/*`-Dateien — für immer, jede Version. (Bricht es, hat jemand die Taille
  verletzt — das Band IST die Wand.)
- **Vorwärts (das Zeit-Portal):** auf der F1-Infrastruktur (`smoke:selfboot`, null-origin-
  iframe, localStorage-Schatten): der AKTUELLE Build empfängt einen ZUKUNFTS-Bauplan
  (synthetisch: unbekannte Tags, unbekannte Felder, `v: 2`-Hülle mit v1-Kern) über den
  Taille-Pfad → bootet, importiert, degradiert sichtbar-graceful (Rolle emergiert aus den
  bekannten Achsen), 0 page-errors. Sobald ein ALTER Build als Artefakt vorliegt (git-Tag →
  gebündeltes dist), läuft derselbe Test echt: V18-iframe empfängt V19-Bauplan.
**Beweis:** `npm run smoke:zeitportal` grün = der Satz „das Portal trägt durch die Zeit" ist
GEMESSEN, nicht behauptet.
**Aufwand:** klein-mittel (die Sonde-Infrastruktur steht; das Bündeln eines Alt-Builds ist der
neue Teil).

### Ω5 — das Perpetuum-Verbot als lebende Invariante (der Kreis)
**Bau:** `scripts/diag-ledger-cycles.cjs` — enumeriert die Transformations-Kanten als Graph
(Quelle→Materie [Ernte, yieldMult≤1 ✓] · Materie→Werk [Mach-Tor] · Werk→Materie [Abbau] ·
Werk→Plan [ablesen, frei ✓ korrekt] · Plan→Werk [fertigen, zahlt] · Trank brau/konsum ·
Modus-Wechsel) und random-walkt N Zyklen headless: Assertion **kein Zyklus netto-positiv** in
irgendeiner Währung (Materie/Mana/Stamina). Bekannte Kandidaten zuerst gezielt: die
Modus-Wäsche (schöpfer baut gratis → pfad erntet) — Heilung, falls GEMESSEN positiv:
schöpfer-gebaute Einträge tragen `freeBorn=true` und ernten zu 0 (Herkunft entscheidet den
Ertrag — dieselbe Provenance-Idee eine Ebene tiefer). Der Korpus wird Playtest-Band
(Antikörper, impft bei jedem Push — R5-Muster).
**Beweis:** Band grün; jeder künftig gefundene positive Zyklus wird ein neuer Korpus-Eintrag
(das Immunsystem lernt).
**Aufwand:** mittel. **S-Gate:** ob Werkzeug-Abnutzung gewollt fehlt (∞-Katalysator als
Design-Entscheid) — benennen, nicht heimlich einbauen.

### Ω6 — Namensraum + Wachstumsregel (die Doktrin)
**Bau:** in der Spec + Code-Konstante: nackte Tags = der anazh-Kern (`MATERIAL_TAG_KEYS` +
Form-Achsen — ihre BEDEUTUNG ist ab jetzt eingefroren, nie umgedeutet); präfixierte Tags
(`x:…` / `<welt>:…`) = fremdes Vokabular, reist mit (must-preserve), resoniert lokal nur, wenn
eine lokale Signatur die Achse führt (must-ignore macht das gratis — GEMESSEN trägt
`_blueprintResonance` das schon). Neue Kern-Achsen sind ADDITIV mit Default 0 (alte Artefakte
bleiben gültig per Konstruktion). Die Signatur-TABELLEN (FORM_ROLE/WORKSHOP_DOMAIN/…) werden
explizit als WELT-LOKAL deklariert — sie sind die Lesart, nie die Taille; eine Welt darf sie
forken, ohne irgendwas zu brechen.
**Beweis:** +Invariante: ein `x:fremd`-Tag reist durch alle vier Pfade und beeinflusst keine
Kern-Resonanz; Doku-Trigger in CLAUDE.md.
**Aufwand:** klein.

## §4 — Was NICHT gefriert (Anti-Scope, gegen die Dogma-Falle)

Frei wandelbar bleiben: alle Signatur-Tabellen und ihre Gewichte (pro Welt!), die Kosten-
Konstante k und künftige Kosten-Terme (Komplexität/opChain-Tiefe — additiv erlaubt), Werkstatt-
Mechanik, Render, Modi-Regeln, das gesamte Vokabular oberhalb des Kerns, die Engine selbst.
Die Taille ist EINE Seite Spec + vier goldene Dateien + fünf Gesetze. Wächst sie darüber hinaus,
ist das der Geruch des Fehlers (die IP-Taille des Internets ist seit 1981 im Kern stabil, WEIL
sie winzig ist).

## §5 — Schöpfer-Entscheide (S-Gates, vor Ω3/Ω5)

1. **Klemm-Decken** (`MATERIAL_TAG_CEIL` pro Achse): mein Erst-Wurf wäre max(Built-ins)×2 —
   Review wie E2-Budgets.
2. **roleManual aus fremder Hand:** Vorschlag-mit-lokaler-Geste (mein Vorschlag, wahrt R2-Geist)
   vs. stilles Verwerfen vs. Vertrauen-bei-gültiger-Signatur (verwirft den Wand-Gedanken — rate
   ich ab).
3. **Werkzeug-Abnutzung:** fehlt heute strukturell. Als ∞-Katalysator benennen (gewollt) oder
   als Mühe-Senke einführen (Ledger-Vollständigkeit)? Beides taille-konform — aber es muss ein
   ENTSCHEID sein.
4. **Provenance-Kette cap 16:** jenseits 16 fallen NEUE Glieder still (alte bewahrt). Für ein
   Ultiversum mit langen Reise-Ketten evtl. zu klein bzw. das stille Fallen unehrlich —
   Alternativen: cap heben / ältestes-zwischen-Glied komprimieren („… 9 weitere …") / so lassen
   und dokumentieren.

## §6 — Reihenfolge + Einbettung in den gigant-plan

Ω0→Ω1 sofort möglich (risikofrei, parallel zum laufenden S-Browser-Audit). Ω2–Ω3 als eigene
Wellen danach (Invarianten-gedeckt, Import-Pfade sind selten berührt → kleines Konflikt-
Fenster). Ω4 sobald der nächste git-Tag ein bündelbares Alt-Artefakt liefert. Ω5–Ω6 schließen
den Bogen. Im gigant-plan ist Ω die Vollendung der Säulen „Rekursion" + „sich-speisendes Netz"
+ R-Bogen eine Ebene höher: F1 bewies, dass die Welt sich selbst LÄDT — Ω beweist, dass sie
sich selbst über die ZEIT versteht.

**Die eine Zeile für CLAUDE.md nach Ω1:** „DIE TAILLE (`docs/taille-spec.md` + `spec/golden/`) —
vor jeder Arbeit an Bauplan-Serialisierung / Import / p2p-Protokoll / Snapshot-Schema ZUERST
lesen; die goldenen Dateien werden NIE regeneriert."

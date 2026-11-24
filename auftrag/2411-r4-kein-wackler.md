# Korrektur 24.11. 15:05 — Mensch-Anatomie R4 ist KEIN Wackler (ersetzt den R4-Teil von auftrag/2411-wackler-vorrang.md)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

## Befund

- Wo der Selbsttest der Linse LÄUFT, ist R4 rot: ort-ausstattung 4 (4612f450) dreimal in Folge, main a8dd22b5, fahrzeug-gattung.
- Der „grüne“ Lauf an cf7deb94 (Job 138467454301) druckt „R6 ruht: node scripts/diag-mensch-anatomie.cjs --selftest — 15 Dateien,
  19 Glieder, 124 Zeilen“: der Selbsttest lief dort nicht. „Wackler“ war die Fehl-Lesart des Koordinators aus Ruhe gegen Lauf.
- GTX 1050, lokal an a8dd22b5, 4 von 4 Läufen, Node 20 und 24 bit-gleich: der Täter der Mutante (Kopie der Anlage, lage 0) misst
  durch 0 an allen fünf Körpern — seit mensch-nah 85aec8c18 legt `__hautUnterStoff` (foundry-core 6556, Ruf 11168) die verdeckte Haut
  nach der Anlage 24,000 mE unter ihren Stoff und liest die Lage an `userData.__lage` der Hülle; die Mutante nullt nur die Kopie.
- mensch-nah 85aec8c18 änderte nur foundry-core.js (+254) und ein Golden und landete grün (z712).

## Bestellt bei GTX 1050 — EIN pflückbarer Commit `anatomie-r4-heil` über main 499f8b57

1. Die Mutante R4 greift an der EINEN Quelle der Lage, auf einer Bühne mit Haut in der Mulde; Soll dutzende Ecken je Körper weit
   über der Schwelle 4 mE; Mutante und Soll bleiben.
2. Der Ruhe-Schlüssel (scripts/lib/ci-klasse.cjs, die 15 Dateien der Linse): gehört foundry-core.js nicht dazu, schlief der Selbsttest,
   während sein echter Leser sich änderte — dann kommt jeder Kern, durch den die Linse baut, in den Schlüssel, mit Selbsttest des
   Ruhe-Gesetzes (Mutante: foundry-core ändert sich, der Selbsttest ruht → ROT).
3. „Vorprüfung … [ci voll]“, SHA sofort nach dem Push an den Koordinator.

## Folge für die Abgaben

ort-ausstattung (OMEN, Vorprüfung 5), fahrzeug-gattung (Radeon-Arbeiter) und sport-regeln 3 pflücken den Heil-SHA wie zuvor die Ratsche
und mischen main 499f8b57 ein (main trägt die Ratsche selbst). Neuläufe an R4 sind gestrichen.

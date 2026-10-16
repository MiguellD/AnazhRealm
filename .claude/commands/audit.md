---
description: Umfassende Code-Prüfung des AnazhRealm-Projekts
---

Führe eine umfassende Prüfung des Projekts durch. Arbeite die folgenden Schritte ab und melde das Ergebnis als kompakten Bericht mit Schweregraden (🔴 kritisch / 🟡 mittel / 🟢 hinweis).

## 1. Repo-Hygiene
- `git status` und `git log -5 --oneline`
- Branch: sind wir auf `claude/check-github-files-1MqpQ` oder einem Feature-Branch?
- Ungestagte Änderungen vorhanden?

## 2. Syntax & Statik
- `node scripts/diag-atlas.cjs --check` — der Stamm (`stamm/<modul>[-<teil>].js` nach spec/stamm/modul-karte.json, die Liste = die Tags in index.html): Syntax je Datei, Marker, jedes Glied in der Datei seines Moduls, Ratsche
- `node --check save-server.js`
- Zeilenzählung (`wc -l *.js stamm/*.js`) – Wachstum nennenswert seit letztem Audit?

## 2.5 Strict-Audit-Suite (V8.23+)
Falls noch nicht im pre-push-Workflow:
- `npm run audit:strict` — drei generische Audit-Schichten (~13 s):
  - **CSS-Variable-Audit**: `var(--X)` ohne Fallback muss definiert sein
  - **Soft-Default-Audit**: Hardcoded „Grok"/„Schöpfer" Limits
  - **State-Field-Audit**: `this.state.X.Y` reads vs init() + Lazy-Set-Whitelist
  - (entfernt V18.274: der „Public-Method-Smoke" — unsound für diesen Codebase, nur False-Positives; die Methoden-Wahrheit trägt der Playtest)
- Erwartung: 0 Failures, 0 Warnings.

## 3. Bekannte Anti-Pattern (Grep-Scans)
Suche nach Pattern, die schon einmal Bugs verursacht haben:

```
# Duplikate Methodendefinitionen (B1-Pattern): die AST-Zwillinge über alle Stamm-Dateien
node scripts/diag-atlas.cjs --check

# Single-Quote-Template-Strings in Funktionsaufrufen (B2-Pattern)
grep -nE "\(\s*'[^']*\\\$\{[^}]+\}[^']*'\s*[,)]" stamm/*.js

# Code-Injection-Stellen
grep -nE "(eval\(|new Function\()" stamm/*.js

# XSS-Vektoren
grep -nE "innerHTML\s*\+?=" stamm/*.js

# Ammo-Memory-Leak-Indikator: btVector3 vs destroy-Verhältnis
echo "btVector3-Allokationen: $(cat stamm/*.js | grep -c 'new Ammo.btVector3')"
echo "Ammo.destroy-Aufrufe: $(cat stamm/*.js | grep -c 'Ammo.destroy')"

# TODO/FIXME/XXX/HACK
grep -nE "(TODO|FIXME|XXX|HACK|TBD)" stamm/*.js save-server.js

# Mixed Indentation (B25): Mische 4er- und 8er-Einrückung
awk '/^        [a-zA-Z]/ {eight++} /^    [a-zA-Z]/ {four++} END {print "4-Space-Methoden:", four, "/ 8-Space-Methoden:", eight}' stamm/*.js
```

## 4. State-Datei (`anazhRealmState.json`)
- Größe und Top-Level-Keys via `python3 -c "import json; d=json.load(open('anazhRealmState.json')); print({k: (len(v) if hasattr(v,'__len__') else v) for k,v in d.items()})"`
- Sind `selfAwareness.weaknesses` oder `learningData` ungewöhnlich gewachsen (Ringpuffer-Verletzung)?

## 5. Roadmap-Abgleich (CLAUDE.md)
- Welche `[ ]`-Einträge aus der Roadmap in `CLAUDE.md` sind seit dem letzten Audit erledigbar geworden?
- Gibt es neue Probleme, die in die Roadmap aufgenommen werden sollten?

## 6. Diff zu `main`
- `git diff main...HEAD --stat`
- Kurze Risikoeinschätzung der Änderungen

## 7. Berichtsformat
Liefere am Ende **einen** Block:

```
## Audit-Bericht <YYYY-MM-DD>

### 🔴 Kritisch (sofort)
- …

### 🟡 Mittel (bald)
- …

### 🟢 Hinweis
- …

### Status
- Syntax: ✅/❌
- Roadmap-Fortschritt: X von Y Quick-Wins erledigt
- Branch: …
```

**Wichtig:**
- Wenn alles grün ist: explizit „nichts Auffälliges" melden, nicht erfinden.
- Keine Spekulation – nur was die Befehle tatsächlich zeigen.
- Keine Code-Änderungen während des Audits, nur Diagnose.

# Notbremse und Übergabe (Schöpfer 12.10.: „bei 98 % alles sichern, alle Agenten stoppen, für einen anderen Agenten perfektionieren“)

Auslöser: Wochenlimit (get_usage „Weekly · all models“) ≥ 98 %. Bis dahin VOLLGAS — keine Drosselung, Karten und Spikes starten bis zum Schluss (Schöpfer 14.10. + 16.10.).

1. **Anhalten:** jeden laufenden Workflow per TaskStop. Die Liste steht in der Übergabe-Notiz unter „LÄUFT“, die Task-IDs in der Sitzung.
   - Ein Workflow-Lauf ist über die Sitzung hinaus NICHT fortsetzbar (resumeFromRunId gilt nur in derselben Sitzung). Der Stand lebt in den Worktrees und auf den Branches.
2. **Sichern:** `bash artifacts/profiband/werkzeug/notbremse.sh`.
   - Jeder Worktree mit geänderten verfolgten Dateien wird WIP-Commit `[skip ci]` und auf seinen Branch gepusht.
   - Unverfolgte Dateien werden nur gelistet, x-*/tmp-* werden nie committet.
   - Vorher `--trocken`.
3. **OMEN:** eine Nachricht an die RC-Sitzung: WIP pushen und `bericht/<auftrag>-uebergabe.md` schreiben (Branch, Kopf, nächster Schritt, offene Linse). Der OMEN arbeitet im Ordner koordination; ein neuer OMEN-Agent liest dort `auftrag/` und `bericht/`.
4. **Übergabe schreiben:** `koordination/UEBERGABE-<datum>.md`, eine Tabelle je Branch: Branch · Kopf · Zustand (merge-reif / in Arbeit / pausiert) · nächster Schritt · Notiz-Datei. Dazu:
   - main und integ-probe (Köpfe, CI)
   - die Integrations-Notizen (`artifacts/profiband/integ-notizen-v1854x.md`, die Wahrheit je Zweig)
   - die Vorlagen (`workflows/karte.js`, `workflows/integ.js` mit args, `werkzeug/ereignis-warte.sh`, `werkzeug/ci-lesen.sh`)
   - der Nordstern, die Gangtafel, die Architektur-Antwort
5. **Gedächtnis:** `memory/uebergabe-stand.md` auf diesen Stand, den Index-Eintrag nachziehen. Eine neue Sitzung im Ordner AnazhRealm-profiband liest MEMORY.md automatisch und findet von dort die Übergabe.
6. **Fortsetzen (neue Sitzung):**
   - Übergabe lesen.
   - Für jeden Zweig „in Arbeit“ karte.js neu starten, mit `wt` = bestehender Worktree und dem nächsten Schritt als Auftrag. Der Bauer sichtet WIP selbst.
   - Integrationen mit integ.js und args.
   - Die Wache mit ereignis-warte.sh.

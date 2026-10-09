# Auftrag 0910-S: den OMEN vor dem Kontowechsel verlustfrei sichern (VORRANG vor allem anderen)

Der Schöpfer wechselt auf beiden PCs das Konto; verknüpft werden nur die lokalen Ordner. Alles, was nur auf dem OMEN liegt,
muss danach auf GitHub (origin) ODER im Ordner `C:\Users\micha\Desktop\AnazhRealm-OMEN` stehen. NIE git stash, nie löschen,
nie `reset --hard`, nie force-push.

## 1. Git — jeder Worktree des Mess-Klons
Im Mess-Klon `C:\Users\micha\Desktop\AnazhRealm-OMEN\AnazhRealm-mess`: `git worktree list`, dann je Worktree
`git status --short`, `git branch --show-current`, `git log --oneline -1`, und ob der Kopf auf origin liegt
(`git ls-remote origin <branch>` — nie den lokalen origin/-Zeiger glauben).
- **Benannter Branch mit Änderungen oder ungepushten Commits** (vor allem `welle-m-schatten`, Auftrag 0710-12):
  `git add -A` → `git commit -m "Zwischenstand-Sicherung <branch> vor dem Kontowechsel 09.10. - UNGEPRUEFT"` →
  `git push origin <branch>`. Commit-Messages ohne Siegel-Wörter (fertig, RUND, vollendet, vollzogen, Schluss, SCOPE ZU, Runden, fertigen).
- **Detached HEAD mit Änderungen** (Mess-Worktrees mess-*, kand*, …): `git switch -c sicherung/omen-0910-<worktree-name>` →
  commit wie oben → `git push origin sicherung/omen-0910-<worktree-name>`.
- **Sauber und auf origin**: nichts tun, nur in die Tabelle.
- Ignorierte Dateien, die Arbeit tragen (Berichte, Mess-JSON, Bilder unter `artifacts/`): nach
  `kontext/omen-sicherung-0910/<worktree>/` auf diesem Branch `koordination` kopieren (Bilder nur die Beweisbilder, < 50 MB gesamt).

## 2. Außerhalb von git
- `C:\Users\micha\Desktop\AnazhRealm-OMEN\UEBERGABE-OMEN-*.md` und alle Bericht-/Notiz-Dateien direkt im Ordner
  `AnazhRealm-OMEN` → nach `kontext/omen-sicherung-0910/ordner/` kopieren.
- Dein Gedächtnis `C:\Users\micha\.claude\projects\C--Users-micha-Desktop-AnazhRealm-OMEN\memory\` (alle .md) → zweifach:
  nach `C:\Users\micha\Desktop\AnazhRealm-OMEN\gedaechtnis-0910\` (der verknüpfte Ordner) UND nach
  `kontext/omen-sicherung-0910/gedaechtnis/`.
- Eigene Werkzeug-Skripte außerhalb des Klons (Scratch, `%TEMP%\claude\…`), die eine laufende Messfolge braucht → ebenso nach
  `AnazhRealm-OMEN\werkzeug-0910\` und `kontext/omen-sicherung-0910/werkzeug/`.

## 3. Übergabe für die neue OMEN-Sitzung
Schreibe `C:\Users\micha\Desktop\AnazhRealm-OMEN\UEBERGABE-OMEN-0910.md` (Kopie nach `kontext/omen-sicherung-0910/`):
Stand je Auftrag 0710-1..12 (Kopf, offen, nächster Schritt), die Worktree-Tabelle aus §1 (Pfad · Branch · SHA · auf origin ja),
wo die Mess-Instrumente liegen, und wie die neue Sitzung ihr Gedächtnis aus `gedaechtnis-0910\` zurückkopiert, falls es fehlt.

## 4. Ruhe
Verwaiste Prozesse dieses Projekts beenden (node save-server, Chrome der Linsen auf den Ports 7900–7909 / 3000 / 4312);
ein GPU-Schloss `%TEMP%\claude\gpu-schloss` nur lösen, wenn `besitzer.txt` deinen Namen trägt.

## 5. Bericht
`bericht/0910-omen-sicherung.md` auf `koordination` pushen: die Tabelle (Worktree · Branch · SHA · gepusht), die Liste der
kopierten Nicht-git-Dateien, offene Prozesse = 0. Dann dem Koordinator per SendMessage (an das `from` dieser Nachricht) die
Tabelle in Kurzform melden. Danach erst `auftrag/0910-omen-uebergabe.md` (0710-12 fortsetzen) — oder ruhen, falls der
Schöpfer gleich wechselt.

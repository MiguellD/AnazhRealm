# Übergabe 09.10. an die NEUE OMEN-Sitzung (Kontowechsel nach dem Wochenlimit)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md (Mess-Klon) und dein Gedächtnis + `UEBERGABE-OMEN-*.md` in deinem Arbeitsordner.
Die alte OMEN-Sitzung endete am 08.10. abends am Wochenlimit mitten in Auftrag 0710-12. Du bist Messplatz UND Werkplatz:
Messaufträge haben Vorrang (WIP sichern, Ruhe herstellen, messen), dazwischen Werkplatz-Aufträge in eigenen Worktrees
(Ports 7900–7909). Kanal: dieser Branch `koordination` (`auftrag/` schreibt der Koordinator, `bericht/` du).

## Sofort
1. **Sichern:** im Mess-Klon `C:\Users\micha\Desktop\AnazhRealm-OMEN\AnazhRealm-mess` jeden Worktree sichten
   (`git worktree list`, je `git status`, `git log --oneline -5`). Der Worktree von **`welle-m-schatten`** (Auftrag 0710-12,
   Basis main 76c9624d) trägt vermutlich unfertige Arbeit: als „Zwischenstand-Sicherung … UNGEPRUEFT" committen und
   `git push origin welle-m-schatten`. NIE git stash. Verwaiste Prozesse (node, Chrome, save-server) beenden.
2. **Melden:** per `ListAgents` den Koordinator finden (Radeon-PC, Sitzung im Ordner `C:\Users\micha\AnazhRealm-profiband`)
   und kurz den Stand nennen; dazu `bericht/0910-omen-stand.md` hier pushen (je Auftrag 0710-1..12: Stand, Köpfe, offen).

## Stand der Linie (09.10., per ls-remote)
- main = **76c9624d = V18.536** (deine ABAB 0710-9: nicht langsamer).
- Deine Zweige: welle-m-boosts **cce9da43** (trägt welle-m-brennglas 3da7e286) — beide gegengeprüft **merge-reif: ja**, noch
  nicht integriert (der Integrator der neuen Koordinator-Sitzung merget sie zuerst für V18.537). welle-m-nexus dc877d19,
  welle-m-impuls 35ba704c, host-vram, welle-m-fahren — alle schon in main.
- Offen bei dir: **0710-12 Schatten-Bias** (`auftrag/0710-12-omen-schatten-bias.md`) — fortsetzen.

## Danach (in dieser Reihenfolge, sobald der Koordinator es sagt)
- Messauftrag V18.537 gegen main (ABABABAB, 4 Boots je Seite, EIN Instrument aus B: omen-messfolge + werkbank + lib,
  Tier-Zähler, je Seite zerlegen + band genesis) — Vorlage auftrag/0710-9.
- Benannte Kandidaten für deinen Werkplatz: `_loopAutoSave` (Spitze 11,9 ms an der Wiese), die render-Wanduhr (CPU-Zustand).

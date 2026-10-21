---
name: notbremse
description: "EINE Regel: bis 98 % Wochenlimit VOLLGAS (volle Parallelität, keine Drosselung, keine „nichts Neues mehr“-Sätze); erst bei 98 % TaskStop + notbremse.sh + Übergabe — Ablauf in artifacts/profiband/werkzeug/notbremse.md"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6fa51df3-2aff-4c17-ad6e-f72b9a955836
  modified: 2026-10-16T09:07:49.263Z
---

**Die Regel (Schöpfer 12.10., 14.10. zweimal, 16.10. erneut):** Bis 98 % läuft Vollgas — volle Parallelität ergebnistragender Karten
und Spikes, starten bis zum Schluss (lieber Spikes und kleine Karten, die vor 98 % fertig werden). KEINE Drosselung darunter, kein
„ab jetzt keine Karte mehr“. Erst bei 98 %: TaskStop aller Workflows/Agenten → `bash artifacts/profiband/werkzeug/notbremse.sh`
(WIP-Commit + Push je Worktree) → `artifacts/profiband/werkzeug/aufraeumen.ps1` (Port 4312 des Schöpfers NIE) → GPU-Schloss prüfen →
OMEN-Nachricht → koordination `UEBERGABE-<datum>.md` → [[uebergabe-stand]].

**Why:** Ich habe am 14.10. (bei ~90 %) und am 16.10. (bei ~92–95 %) früh gebremst. Der Schöpfer: „du hast die bremse wieder vor der
notbremse gezogen … statt bis 98 % mit vollgas und dann zu sichern“. Die Wurzel war diese Datei selbst: sie trug noch die alte Zeile
„ab 92 % nichts Neues, ab 95 % TaskStop“ neben den Korrekturen — ein widersprüchliches Gesetz (Gebot 4). Sie trägt jetzt nur noch EINE Regel.
**How to apply:** get_usage ab 85 % bei jedem Wecken lesen; die Übergabe läuft nebenher laufend mit, damit die Bremse nur Minuten kostet.
TaskStop beendet nicht die Prozesse der Arbeiter — darum aufraeumen.ps1.

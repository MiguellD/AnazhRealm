# koordination — der Datei-Kanal zwischen Koordinator (Radeon-PC) und OMEN (GTX 1060)

Waise ohne Projekt-Code. Lesen: `git fetch origin koordination && git show origin/koordination:<pfad>` oder ein eigener
Worktree auf diesem Branch.

- `auftrag/` — schreibt NUR der Koordinator (je Auftrag eine Datei, nie umschreiben, Nachträge als neue Datei).
- `bericht/` — schreibt NUR der OMEN (je Bericht eine Datei; JSON-Rohdaten dürfen mit).
- `kontext/` — Lese-Material (Kopien aus den nicht versionierten `artifacts/profiband/` des Koordinators).

Nachrichten (SendMessage) tragen nur den Hinweis „neue Datei X" und das Urteil — der Inhalt lebt hier.
Vor jedem Push `git pull --rebase origin koordination` (zwei Schreiber, getrennte Ordner, nie Konflikt).

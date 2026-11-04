# cloud-post — die Post des Koordinators an die Cloud-Sitzungen

Cloud-Sitzungen erhalten Nachrichten aus anderen Sitzungen nur nach einer Freigabe im Terminal (anderer Berechtigungsmodus,
04.11.). Darum geht die Post per git: je Sitzung EINE Datei `cloud-post/<zweig>.md`, die neueste Nachricht oben, mit Zeitstempel.

Jede Cloud-Sitzung liest ihre Datei alle ~30 min und vor jedem Push:

    git fetch -q origin koordination && git show origin/koordination:cloud-post/<zweig>.md

Gemeinsam für alle: `alle.md`.

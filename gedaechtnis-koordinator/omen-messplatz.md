---
name: omen-messplatz
description: "Zweiter Messplatz OMEN (GTX 1060, i7-8750H) per Remote-Control-Sitzung — wie ansprechen, Hardware, Regeln, tragende Befunde (GPU-Kosten sind Pixel-Arbeit)"
metadata:
  node_type: memory
  type: reference
  originSessionId: bd24003f-04f9-42c3-b62b-aa42986e5cb8
  modified: 2026-10-18T08:39:47.321Z
---

Der Schöpfer stellte am 06.10.2026 seinen OMEN-Laptop als ruhigen Mess- und Werkplatz bereit.
- **Ansprechen:**
  - Der Name der Remote-Control-Sitzung wechselt je Sitzung. Am 13.10. hieß sie „Lokaler Ordner Sicherung“
    (bridge:session_01NUxuyk3y4hiZSDytqydoBT). Per ListAgents die Remote-Control-Zeile suchen, dann SendMessage an den Namen.
  - Die OMEN-KI hat ein eigenes Gedächtnis (C:\Users\micha\.claude\projects\C--Users-micha-Desktop-AnazhRealm-OMEN\memory\) und eine
    Übergabe im Startordner C:\Users\micha\Desktop\AnazhRealm-OMEN. Sie antwortet per cross-session-message.
  - Mess-Klon: AnazhRealm-mess mit Worktrees je Stand.
- **Hardware:** LAPTOP-4BN3RL0L, i7-8750H 6C/12T, GeForce GTX 1060 (Pascal), 15,9 GB, 1920×1080. Chrome --echt bekommt nvidia/pascal/timestamp-query.
- **Was er kann und nicht kann:** keine CI-Reruns und keine CI-Logs (kein Token), das macht der Koordinator per API. Keine Commits außer
  Bericht-Dateien und eigenen Werk-Zweigen.
- **Tragende Befunde:**
  - Die GPU-Zeit ist Pixel-Arbeit, kein fester Sockel (~9 ms/MP).
  - Die Pass-Stempel sehen < 5 % der Fragment-Arbeit; die Wahrheit ist `werkbank gpu-bank` / `zerlegen`.
  - Die GTX 1060 drosselt unter Last (Leistungs-Deckel ~70 W, 1680–1710 MHz). Darum trägt jedes ms-Urteil Takt + Drossel.
  - Durchbruch 07.10.: gpu-bank Wiese 24,85 → 14,70 ms (Welle G + c-sicht); V18.543 Wiese ~12 ms.
  - Berichte liegen in koordination/bericht/.
- **Der OMEN ist auch der CI-Läufer `echt`** (geplante Aufgabe „OMEN actions-runner“, kein Dienst). 18.10.: ein `npm ci` des
  B5-Schneiders ohne Schloss machte den echt-Job zweimal rot (Ego-Schatten, Foundry-Impostor) — auf der GTX 7/7 grün nachgestellt.
  Seitdem `cpu_ruhe` (p3/gpu-schloss.sh): schwere CPU-Arbeit wartet, solange ein CI-Job das Schloss hält. Ein echt-Rot erst
  nachstellen, bevor eine Karte daraus wird.
- **How to apply:**
  - Zeit-A/B nur auf dem OMEN, nie mit Radeon-Zahlen mischen.
  - Kandidaten als Branch pushen, Auftrag mit exakter Befehlsfolge.
  - Arbeiter-Prompts verlangen nie ein Ruhe-Fenster auf der Radeon.
  - Siehe [[gpu-mess-lehren]], [[dirigieren]], [[profiband-merge]].

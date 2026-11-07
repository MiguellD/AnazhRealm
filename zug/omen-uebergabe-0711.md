# OMEN-Übergabe 07.11. 16:15 (GTX 1060, Notbremse 98 %)

1. **Skripte:** Alles liegt in `C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/n0611/`.
   - `zug.sh <name> <sha40> '<liste>'` misst einen Zug-Kandidaten. Es wartet auf das echt-Ende in `C:/actions-runner/hooks/hook.log`, fährt erst die Liste (`--nur`, Teile ≤ 9) und danach die Ernte `--offen`; lod.K1#1 kommt zuletzt allein. `ALLEIN=` fährt Stationen vor der Liste je allein, `NACHHER=` nach der Liste.
   - `kandidat.sh` fährt die Teile. `KOPF=<sha>` misst einen festen Kopf, `EINZELN=1` eine Station je Sitzung. Ein Teil, der in `p3/messplatz/dienst.log` eine VERDRÄNGT-Zeile bekommt, wird nicht gepusht und nach dem nächsten echt-Ende neu gefahren.
   - `punkte-offen.cjs lauf|push <sha40>` (Env `NUR`, `TEIL`) ist ein einzelner Lauf und Push. Das Protokoll steht in `kette-0711.log`.
2. **Messung starten:** `cd p3/n0611 && bash zug.sh z295 <sha40> '<liste>'` im Hintergrund.
   - Der Worktree `n0611-pm` ist ein detached Checkout von punkte-maschine. Jeder Lauf zieht ihn frisch.
   - Das GPU-Schloss nimmt `p3/gpu-lauf.sh`: Sperrordner `%TEMP%/claude/gpu-schloss`, Besitzer in `besitzer.txt`. Ein wartender CI-echt-Job verdrängt den Lauf.
   - Nach einem Abbruch die Kette per Prozess-Kill beenden (`taskkill /T`). Ein Schloss `omen-punkte*` mit totem pid räumen (`stopp-ernte.ps1` zeigt das Muster). Ein CI-Schloss nie anfassen.
3. **GTX-Dauer-Wächter:** Er steht auf HALT, seit 06.11. 20:26 auf Koordinator-Befehl.
   - Lösen: `p3/n0611/gtx-dauer/HALT` löschen und `node p3/n0611/gtx-dauer.cjs` starten (Plan `gtx-dauer/scheiben.json`).
4. **Offen:**
   - Am 95ba6fd6 ungemessen (Deckel): siedlung.K4#2 (90 s im Schritt BILD), leib.K1#2 (LATENZ1), leib.K4#2, mensch.K1#1/K2#2/K5#1. lod.K1#1 reißt 45 s im Schritt „gang“.
   - Die Voll-Ernte am 95ba6fd6 ist nicht gefahren (111 offen). z295 ef5863a3 ist nicht gemessen.
   - Der letzte Stand liegt in punkte-maschine 81467f0c; `zug/erledigt.txt` b700a42b.

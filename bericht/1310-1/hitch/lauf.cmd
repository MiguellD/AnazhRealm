@echo off
rem 1310-1 Gruppe 3: gate:hitch-telemetrie gedrosselt (Affinität 2 logische Kerne, die Kinder erben sie) — lauf.cmd <worktree> <log>
cd /d %1
start "" /b /wait /affinity 3 cmd /c "node scripts\diag-hitch-telemetrie.cjs > %2 2>&1"
echo EXIT=%ERRORLEVEL% >> %2

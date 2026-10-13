@echo off
rem 1310-1 Gruppe 3: gate:hitch-telemetrie UNGEDROSSELT mit Bau-Liste — lauf3.cmd <worktree> <log> <bauliste>
cd /d %1
set HITCH_BAULISTE=%3
node scripts\diag-hitch-telemetrie.cjs > %2 2>&1
echo EXIT=%ERRORLEVEL% >> %2

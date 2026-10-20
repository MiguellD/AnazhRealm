# 2010 (1) B-Wald im Lauf: beendet NUR die eigenen Prozesse dieser Serie (Messer omen-2010):
#  - jede node-Werkbank mit --port 4490 samt dem Lauscher auf 4490/4489,
#  - jeden save-server, der mit dem absoluten Pfad eines der beiden Bäume gestartet wurde (n1910-f1b / n1910-integ);
#    ein fremder Lauscher auf 4312 (CI-Playtest: „node save-server.js" ohne Baum-Pfad) bleibt stehen,
#  - jedes Chrome mit dem Profil werkbank-profil-4490.
# Muster stehen in dieser Datei, nie in der Kommandozeile des Aufrufers (Lehre 14.10./16.10.: Selbst-Treffer).
$ErrorActionPreference = 'SilentlyContinue'
$ids = @()
foreach ($p in 4490, 4489) {
    $ids += (Get-NetTCPConnection -LocalPort $p -State Listen | Select-Object -ExpandProperty OwningProcess)
}
$node = Get-CimInstance Win32_Process -Filter "Name='node.exe'"
foreach ($n in $node) {
    $c = [string]$n.CommandLine
    if ($c -match 'actions-runner') { continue }
    if ($c -match 'werkbank\.cjs.*--port 4490' -or $c -match 'n1910-(f1b|integ)[\\/]save-server\.js') { $ids += $n.ProcessId }
}
$chrome = Get-CimInstance Win32_Process -Filter "Name='chrome.exe'"
foreach ($c in $chrome) { if ([string]$c.CommandLine -match 'werkbank-profil-4490') { $ids += $c.ProcessId } }
$ids = $ids | Where-Object { $_ -and $_ -ne 0 -and $_ -ne $PID } | Sort-Object -Unique
foreach ($i in $ids) { Stop-Process -Id $i -Force }
Write-Output ((Get-Date -Format 'HH:mm:ss') + " gestoppt: " + ($ids -join ' '))

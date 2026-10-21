# 2110 Ring-Kalt (bbc97d8b gegen 57a9f2ab): beendet NUR die eigenen Prozesse dieses Laufs (Messer omen-2010):
#  - den Kalt-Lauf (diag-boot-stage, Port 7903) samt Lauscher, jedes diag-boot-stage mit Ausgabe nach p3/n2110/ringkalt,
#  - jedes Chrome mit einem Kalt-Profil unter p3/n2110/ringkalt/prof.
# Muster stehen in dieser Datei, nie in der Kommandozeile des Aufrufers (Lehre 14.10./16.10.: Selbst-Treffer).
$ErrorActionPreference = 'SilentlyContinue'
$ids = @()
foreach ($p in 7903) {
    $ids += (Get-NetTCPConnection -LocalPort $p -State Listen | Select-Object -ExpandProperty OwningProcess)
}
$node = Get-CimInstance Win32_Process -Filter "Name='node.exe'"
foreach ($n in $node) {
    $c = [string]$n.CommandLine
    if ($c -match 'actions-runner') { continue }
    if ($c -match 'diag-boot-stage.*n2110[\\/]ringkalt') { $ids += $n.ProcessId }
}
$chrome = Get-CimInstance Win32_Process -Filter "Name='chrome.exe'"
foreach ($c in $chrome) { if ([string]$c.CommandLine -match 'n2110[\\/]ringkalt[\\/]prof') { $ids += $c.ProcessId } }
$ids = $ids | Where-Object { $_ -and $_ -ne 0 -and $_ -ne $PID } | Sort-Object -Unique
foreach ($i in $ids) { Stop-Process -Id $i -Force }
Write-Output ((Get-Date -Format 'HH:mm:ss') + " gestoppt: " + ($ids -join ' '))

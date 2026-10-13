# 1310-1 Gruppe 3: der GPU-Prozess des Puppeteer-Chrome (swiftshader kompiliert dort) setzt seine Affinität selbst auf alle
# Kerne zurück — der Wächter zwingt jeden Puppeteer-Chrome und jedes node der Linse jede Sekunde auf die Maske 3 (2 Kerne).
# Ende: die Datei p3\hitch\drossel.stop anlegen.
$stop = Join-Path $PSScriptRoot "drossel.stop"
$log = Join-Path $PSScriptRoot "drossel.log"
while (-not (Test-Path $stop)) {
    $ps = Get-CimInstance Win32_Process -Filter "Name='chrome.exe' OR Name='node.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match 'puppeteer|diag-hitch' }
    foreach ($p in $ps) {
        try {
            $proc = Get-Process -Id $p.ProcessId -ErrorAction Stop
            if ([int64]$proc.ProcessorAffinity -ne 3) {
                $proc.ProcessorAffinity = 3
                Add-Content -Path $log -Value ("{0} gesetzt {1} {2}" -f (Get-Date -Format HH:mm:ss), $p.ProcessId, $p.Name)
            }
        } catch {}
    }
    Start-Sleep -Milliseconds 1000
}

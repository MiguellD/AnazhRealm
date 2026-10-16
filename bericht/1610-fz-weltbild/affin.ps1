# affin.ps1 — hält jeden Chrome-Prozess des Kalt-Laufs (Profil kalt-zeile-*) auf der Affinität 0xF (4 Kerne), auch den GPU-Prozess,
# der sie beim Start zurücksetzt. Läuft bis zur Frist (s); Protokoll je Setzung.
param([int]$frist = 900)
$ende = (Get-Date).AddSeconds($frist)
while ((Get-Date) -lt $ende) {
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'kalt-zeile' } | ForEach-Object {
    $p = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
    if ($p -and $p.ProcessorAffinity -ne 15) { try { $p.ProcessorAffinity = 15; "$(Get-Date -Format HH:mm:ss.fff) gesetzt $($_.ProcessId)" } catch {} }
  }
  Start-Sleep -Milliseconds 250
}

# Probe 3: die CPU-Zeit (Sekunden) je Chrome-Prozess des Werkbank-Profils, nach Typ (renderer, gpu-process, utility, browser).
# Ausgabe je Zeile: <typ> <pid> <cpu-sekunden>
$ps = Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'werkbank-profil' }
foreach ($p in $ps) {
    $typ = 'browser'
    if ($p.CommandLine -match '--type=([a-z-]+)') { $typ = $Matches[1] }
    $g = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
    if ($g) { '{0} {1} {2}' -f $typ, $p.ProcessId, $g.TotalProcessorTime.TotalSeconds.ToString([Globalization.CultureInfo]::InvariantCulture) }
}

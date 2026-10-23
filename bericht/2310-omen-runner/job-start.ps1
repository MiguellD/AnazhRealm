# OMEN-Runner (Label omen-gpu), Job-Start-Hook (ACTIONS_RUNNER_HOOK_JOB_STARTED in C:\actions-runner\.env).
# 1) Vertrauens-Wand: nur Repo MiguellD/AnazhRealm, nur Ereignis push oder schedule (der Nachtlauf der Echt-Gruppe, K65; er
#    kommt nur aus dem Repo selbst, nie aus einem Fork), nur Actor MiguellD - sonst endet der Job, bevor
#    ein Schritt laeuft (zweite Wand neben der Fork-Freigabe "all_external_contributors"; das Repo ist oeffentlich).
# 2) Messplatz-Schutz: wartet, bis das GPU-Schloss frei ist, und nimmt es als "ci-runner <run-id>" - dieselbe Konvention
#    wie p3/gpu-schloss.sh: atomar mkdir (scheitert, wenn es steht), darin besitzer.txt (Zeile 1 der Name, Zeile 2 `pid=<PID>`
#    des haltenden Windows-Prozesses, hier der Runner.Worker). Verwaist und beim Namen geloest wird ein Schloss, wenn
#    - es ein ci-runner haelt (ein einziger Runner auf der Maschine: der Ende-Hook lief nicht),
#    - die pid seines Halters nicht lebt (23.10., Pruefer des Radeon-Runners), oder
#    - besitzer.txt seit $schweigt min unveraendert steht (ein Halter ohne pid; p3/gpu-lauf.sh frischt alle 5 min auf).
#    Geloest wird nur, wenn ein erneutes Lesen DENSELBEN Besitzer zeigt. Hoechstens $frist min Warten, dann ROT mit Namen
#    (der Job-Deckel von 45 min zaehlt ab Job-Start; eine laengere Frist schlueg nie, der Deckel kappte ohne Namen).
# 3) ROT heisst ROT: jeder Abbruch des Hooks - Abweisung, Frist, ein unerwarteter Fehler - raeumt zuerst den Arbeitsordner,
#    nennt den Grund und BEENDET den eigenen Runner.Worker (23.10.: ein Exit 1 faerbt den Job nur rot, die `always()`- und
#    `!cancelled()`-Schritte und die pre-Schritte fremder Actions liefen weiter; Lauf 39807843752 lief so 57 min ueber dem alten
#    Baum). Die Notiz scheitert nie (Wiederholung, sonst die eigene Datei des Laufs).
$ErrorActionPreference = 'Stop'
$schloss = 'C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss'
$log = 'C:\actions-runner\hooks\hook.log'
$werk = 'C:\actions-runner\_work'
$schweigt = 30
$frist = 25
$ich = "ci-runner $env:GITHUB_RUN_ID/$env:GITHUB_RUN_ATTEMPT $env:GITHUB_JOB"
function Notiz($t) {
    $z = "{0:yyyy-MM-dd HH:mm:ss} start {1}: {2}`r`n" -f (Get-Date), $ich, $t
    for ($i = 0; $i -lt 20; $i++) {
        try { [System.IO.File]::AppendAllText($log, $z, [System.Text.UTF8Encoding]::new($false)); return } catch { Start-Sleep -Milliseconds 250 }
    }
    try { [System.IO.File]::AppendAllText("$log.$env:GITHUB_RUN_ID", $z, [System.Text.UTF8Encoding]::new($false)) } catch { }
}
function WorkerBeenden {
    Stop-Process -Name Runner.Worker -Force -ErrorAction SilentlyContinue
}
function Rot($grund) {
    $ws = $env:GITHUB_WORKSPACE
    if ($ws -and (Test-Path $ws) -and ([System.IO.Path]::GetFullPath($ws)).StartsWith($werk, [System.StringComparison]::OrdinalIgnoreCase)) {
        Get-ChildItem $ws -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        $grund = "$grund - Arbeitsordner geraeumt ($ws)"
    }
    Notiz "ROT: $grund - Runner.Worker beendet"
    Write-Host "OMEN-Runner: ROT - $grund"
    WorkerBeenden
    exit 1
}
function Besitzer {
    try { return @((Get-Content "$schloss\besitzer.txt" -ErrorAction Stop) | Where-Object { $_ -ne '' }) } catch { return @() }
}
function Loesen($wer, $warum) {
    # nur, wenn ein erneutes Lesen denselben Besitzer zeigt (ein anderer kann das Schloss inzwischen neu genommen haben)
    $jetzt = @(Besitzer)  # @(): eine Zeile kaeme sonst als String zurueck, [0] waere ihr erster Buchstabe
    if ($jetzt.Count -and $jetzt[0] -eq $wer) {
        Notiz "verwaistes Schloss '$wer' geloest - $warum"
        Remove-Item $schloss -Recurse -Force -ErrorAction SilentlyContinue
    }
}

try {
    $repo = $env:GITHUB_REPOSITORY; $ereignis = $env:GITHUB_EVENT_NAME; $actor = $env:GITHUB_ACTOR
    if ($repo -ne 'MiguellD/AnazhRealm' -or @('push', 'schedule') -notcontains $ereignis -or $actor -ne 'MiguellD') {
        Rot "ABGEWIESEN repo=$repo ereignis=$ereignis actor=$actor ref=$env:GITHUB_REF (nur push oder schedule von MiguellD auf MiguellD/AnazhRealm)"
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $schloss) | Out-Null
    $bis = (Get-Date).AddMinutes($frist); $gemeldet = $false
    while ($true) {
        $genommen = $false
        try { New-Item -ItemType Directory -Path $schloss -ErrorAction Stop | Out-Null; $genommen = $true } catch { }
        if ($genommen) {
            $w = @(Get-Process -Name Runner.Worker -ErrorAction SilentlyContinue)
            $inhalt = if ($w.Count) { "$ich`npid=$($w[0].Id)" } else { $ich }
            [System.IO.File]::WriteAllText("$schloss\besitzer.txt", $inhalt)  # ohne BOM, LF: bash-Leser vergleichen Zeile 1 byte-genau
            Notiz "Schloss genommen ($env:GITHUB_REF $env:GITHUB_SHA ws=$env:GITHUB_WORKSPACE)"
            Write-Host "OMEN-Runner: GPU-Schloss genommen als '$ich'."
            exit 0
        }
        $b = @(Besitzer)
        $wer = if ($b.Count) { $b[0] } else { '' }
        $hpid = ($b | Where-Object { $_ -match '^pid=\d+$' } | Select-Object -First 1)
        if ($wer -like 'ci-runner *') { Loesen $wer 'ein ci-runner haelt es (der Ende-Hook lief nicht)'; continue }
        # aelter als der Systemstart (24.10.): die pid kann nach dem Neustart neu vergeben sein und "lebte" sonst
        $start = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
        $bt = $null; try { $bt = (Get-Item "$schloss\besitzer.txt" -ErrorAction Stop).LastWriteTime } catch { }
        if ($bt -and $bt -lt $start) { Loesen $wer 'aelter als der Systemstart'; continue }
        if ($hpid) {
            $p = [int]($hpid -replace '^pid=', '')
            if (-not (Get-Process -Id $p -ErrorAction SilentlyContinue)) { Loesen $wer "sein Halter pid $p lebt nicht"; continue }
        } else {
            $seit = $null
            try { $seit = (Get-Item "$schloss\besitzer.txt" -ErrorAction Stop).LastWriteTime } catch { try { $seit = (Get-Item $schloss -ErrorAction Stop).LastWriteTime } catch { } }
            if ($seit -and ((Get-Date) - $seit).TotalMinutes -gt $schweigt) { Loesen $wer ("es schweigt seit {0:N0} min" -f ((Get-Date) - $seit).TotalMinutes); continue }
        }
        if (-not $gemeldet) { Notiz "wartet auf Schloss von '$wer'"; Write-Host "OMEN-Runner: GPU-Schloss haelt '$wer' - warte (max. $frist min)."; $gemeldet = $true }
        if ((Get-Date) -gt $bis) { Rot "$frist min gewartet, Schloss haelt '$wer'" }
        Start-Sleep -Seconds 15
    }
} catch {
    Rot "Hook-Fehler: $($_.Exception.Message)"
}

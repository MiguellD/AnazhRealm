# OMEN-Runner (Label omen-gpu), Job-Start-Hook (ACTIONS_RUNNER_HOOK_JOB_STARTED in C:\actions-runner\.env).
# 1) Vertrauens-Wand: nur Repo MiguellD/AnazhRealm, nur Ereignis push oder schedule (der Nachtlauf der Echt-Gruppe, K65; er
#    kommt nur aus dem Repo selbst, nie aus einem Fork), nur Actor MiguellD - sonst endet der Job, bevor
#    ein Schritt laeuft (zweite Wand neben der Fork-Freigabe "all_external_contributors"; das Repo ist oeffentlich).
# 2) Messplatz-Schutz: wartet, bis das GPU-Schloss frei ist, und nimmt es als "ci-runner <run-id>" - dieselbe Konvention
#    wie werkbank --echt und die OMEN-ABAB: atomar mkdir (scheitert, wenn es steht), darin besitzer.txt. Ein
#    ci-runner-Schloss beim Start ist verwaist (ein einziger Runner auf der Maschine; der Ende-Hook lief nicht) und wird
#    geloest; ein fremdes Schloss, dessen besitzer.txt seit $schweigt min unveraendert steht (eine OMEN-Serie haelt es je
#    Boot, hoechstens ~12 min), ist verwaist und wird beim Namen geloest. Hoechstens 120 min Warten, dann ROT mit Namen.
# 3) ROT heisst ROT (22.10.: ein `tail -F` hielt hook.log offen, die Notiz warf, der Hook brach mit Exit 1, Checkout und
#    npm ci liefen nicht, und die Gate-Schritte (`if: !cancelled()`) urteilten im Arbeitsordner des vorigen Laufs ueber den
#    ALTEN Baum): die Notiz scheitert nie (Wiederholung, sonst die eigene Datei des Laufs); jeder Abbruch des Hooks - Abweisung,
#    Frist, ein unerwarteter Fehler - raeumt zuerst den Arbeitsordner und nennt den Grund.
$ErrorActionPreference = 'Stop'
$schloss = 'C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss'
$log = 'C:\actions-runner\hooks\hook.log'
$werk = 'C:\actions-runner\_work'
$schweigt = 30
$ich = "ci-runner $env:GITHUB_RUN_ID/$env:GITHUB_RUN_ATTEMPT $env:GITHUB_JOB"
function Notiz($t) {
    $z = "{0:yyyy-MM-dd HH:mm:ss} start {1}: {2}`r`n" -f (Get-Date), $ich, $t
    for ($i = 0; $i -lt 20; $i++) {
        try { [System.IO.File]::AppendAllText($log, $z, [System.Text.UTF8Encoding]::new($false)); return } catch { Start-Sleep -Milliseconds 250 }
    }
    try { [System.IO.File]::AppendAllText("$log.$env:GITHUB_RUN_ID", $z, [System.Text.UTF8Encoding]::new($false)) } catch { }
}
function Rot($grund) {
    $ws = $env:GITHUB_WORKSPACE
    if ($ws -and (Test-Path $ws) -and ([System.IO.Path]::GetFullPath($ws)).StartsWith($werk, [System.StringComparison]::OrdinalIgnoreCase)) {
        Get-ChildItem $ws -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        $grund = "$grund - Arbeitsordner geraeumt ($ws)"
    }
    Notiz "ROT: $grund"
    Write-Host "OMEN-Runner: ROT - $grund"
    exit 1
}

try {
    $repo = $env:GITHUB_REPOSITORY; $ereignis = $env:GITHUB_EVENT_NAME; $actor = $env:GITHUB_ACTOR
    if ($repo -ne 'MiguellD/AnazhRealm' -or @('push', 'schedule') -notcontains $ereignis -or $actor -ne 'MiguellD') {
        Rot "ABGEWIESEN repo=$repo ereignis=$ereignis actor=$actor ref=$env:GITHUB_REF (nur push oder schedule von MiguellD auf MiguellD/AnazhRealm)"
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $schloss) | Out-Null
    $bis = (Get-Date).AddMinutes(120); $gemeldet = $false
    while ($true) {
        $genommen = $false
        try { New-Item -ItemType Directory -Path $schloss -ErrorAction Stop | Out-Null; $genommen = $true } catch { }
        if ($genommen) {
            [System.IO.File]::WriteAllText("$schloss\besitzer.txt", $ich)  # ohne BOM: bash-Leser vergleichen byte-genau
            Notiz "Schloss genommen ($env:GITHUB_REF $env:GITHUB_SHA ws=$env:GITHUB_WORKSPACE)"
            Write-Host "OMEN-Runner: GPU-Schloss genommen als '$ich'."
            exit 0
        }
        $wer = ''
        try { $wer = (Get-Content "$schloss\besitzer.txt" -Raw -ErrorAction Stop).Trim() } catch { }
        if ($wer -like 'ci-runner *') {
            Notiz "verwaistes Schloss '$wer' geloest"
            Remove-Item $schloss -Recurse -Force -ErrorAction SilentlyContinue
            continue
        }
        $seit = $null
        try { $seit = (Get-Item "$schloss\besitzer.txt" -ErrorAction Stop).LastWriteTime } catch { try { $seit = (Get-Item $schloss -ErrorAction Stop).LastWriteTime } catch { } }
        if ($seit -and ((Get-Date) - $seit).TotalMinutes -gt $schweigt) {
            Notiz ("verwaistes Schloss '{0}' geloest - es schweigt seit {1:N0} min" -f $wer, ((Get-Date) - $seit).TotalMinutes)
            Remove-Item $schloss -Recurse -Force -ErrorAction SilentlyContinue
            continue
        }
        if (-not $gemeldet) { Notiz "wartet auf Schloss von '$wer'"; Write-Host "OMEN-Runner: GPU-Schloss haelt '$wer' - warte (max. 120 min)."; $gemeldet = $true }
        if ((Get-Date) -gt $bis) { Rot "120 min gewartet, Schloss haelt '$wer'" }
        Start-Sleep -Seconds 15
    }
} catch {
    Rot "Hook-Fehler: $($_.Exception.Message)"
}

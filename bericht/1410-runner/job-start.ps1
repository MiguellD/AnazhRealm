# OMEN-Runner (Label omen-gpu), Job-Start-Hook (ACTIONS_RUNNER_HOOK_JOB_STARTED in C:\actions-runner\.env).
# 1) Vertrauens-Wand: nur Repo MiguellD/AnazhRealm, nur Ereignis push, nur Actor MiguellD - sonst endet der Job, bevor
#    ein Schritt laeuft (zweite Wand neben der Fork-Freigabe "all_external_contributors"; das Repo ist oeffentlich).
# 2) Messplatz-Schutz: wartet, bis das GPU-Schloss frei ist, und nimmt es als "ci-runner <run-id>" - dieselbe Konvention
#    wie werkbank --echt und die OMEN-ABAB: atomar mkdir (scheitert, wenn es steht), darin besitzer.txt. Ein
#    ci-runner-Schloss beim Start ist verwaist (ein einziger Runner auf der Maschine; der Ende-Hook lief nicht) und wird
#    geloest. Hoechstens 120 min Warten, dann ROT mit Namen.
$ErrorActionPreference = 'Stop'
$schloss = 'C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss'
$log = 'C:\actions-runner\hooks\hook.log'
$ich = "ci-runner $env:GITHUB_RUN_ID/$env:GITHUB_RUN_ATTEMPT $env:GITHUB_JOB"
function Notiz($t) { Add-Content -Path $log -Value ("{0:yyyy-MM-dd HH:mm:ss} start {1}: {2}" -f (Get-Date), $ich, $t) -Encoding utf8 }

$repo = $env:GITHUB_REPOSITORY; $ereignis = $env:GITHUB_EVENT_NAME; $actor = $env:GITHUB_ACTOR
if ($repo -ne 'MiguellD/AnazhRealm' -or $ereignis -ne 'push' -or $actor -ne 'MiguellD') {
    Notiz "ABGEWIESEN repo=$repo ereignis=$ereignis actor=$actor ref=$env:GITHUB_REF"
    Write-Host "OMEN-Runner: abgewiesen (repo=$repo, ereignis=$ereignis, actor=$actor). Nur push von MiguellD auf MiguellD/AnazhRealm."
    exit 1
}

New-Item -ItemType Directory -Force -Path (Split-Path $schloss) | Out-Null
$bis = (Get-Date).AddMinutes(120); $gemeldet = $false
while ($true) {
    $genommen = $false
    try { New-Item -ItemType Directory -Path $schloss -ErrorAction Stop | Out-Null; $genommen = $true } catch { }
    if ($genommen) {
        [System.IO.File]::WriteAllText("$schloss\besitzer.txt", $ich)  # ohne BOM: bash-Leser vergleichen byte-genau
        Notiz "Schloss genommen ($env:GITHUB_REF $env:GITHUB_SHA)"
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
    if (-not $gemeldet) { Notiz "wartet auf Schloss von '$wer'"; Write-Host "OMEN-Runner: GPU-Schloss haelt '$wer' - warte (max. 120 min)."; $gemeldet = $true }
    if ((Get-Date) -gt $bis) { Notiz "ROT: 120 min gewartet, Schloss haelt '$wer'"; Write-Host "OMEN-Runner: ROT - Schloss nach 120 min noch bei '$wer'."; exit 1 }
    Start-Sleep -Seconds 15
}

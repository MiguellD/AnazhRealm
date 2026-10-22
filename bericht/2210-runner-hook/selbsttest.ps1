# Selbsttest der Runner-Hooks ohne GitHub: spielt die Faelle mit gesetzten GITHUB_*-Variablen durch, an einem
# Test-Schloss-Pfad (die Hooks werden mit ersetztem Pfad in eine Kopie geschrieben, das echte Schloss bleibt unberuehrt).
# powershell -NoProfile -File C:\actions-runner\hooks\selbsttest.ps1  -> Exit 0 = gruen.
$ErrorActionPreference = 'Stop'
$h = 'C:\actions-runner\hooks'; $t = Join-Path $env:TEMP 'omen-runner-selbsttest'
Remove-Item $t -Recurse -Force -ErrorAction SilentlyContinue; New-Item -ItemType Directory $t | Out-Null
$sch = "$t\gpu-schloss"
foreach ($n in 'job-start', 'job-ende') {
    (Get-Content "$h\$n.ps1" -Raw).Replace('C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss', $sch).Replace('C:\actions-runner\hooks\hook.log', "$t\hook.log").Replace('AddMinutes(120)', 'AddSeconds(20)').Replace('Start-Sleep -Seconds 15', 'Start-Sleep -Seconds 2').Replace('C:\actions-runner\_work', "$t\work") | Set-Content "$t\$n.ps1" -Encoding utf8
}
$fehler = @()
function Lauf($hook, $vars) {
    $alt = @{}
    foreach ($k in $vars.Keys) { $alt[$k] = [Environment]::GetEnvironmentVariable($k); [Environment]::SetEnvironmentVariable($k, $vars[$k]) }
    & powershell -NoProfile -ExecutionPolicy Bypass -File "$t\$hook.ps1" | Out-Null; $c = $LASTEXITCODE
    foreach ($k in $vars.Keys) { [Environment]::SetEnvironmentVariable($k, $alt[$k]) }
    return $c
}
$gut = @{ GITHUB_REPOSITORY = 'MiguellD/AnazhRealm'; GITHUB_EVENT_NAME = 'push'; GITHUB_ACTOR = 'MiguellD'; GITHUB_RUN_ID = '111'; GITHUB_RUN_ATTEMPT = '1'; GITHUB_JOB = 'gpu'; GITHUB_WORKSPACE = "$t\work\AnazhRealm\AnazhRealm" }
$ws = $gut.GITHUB_WORKSPACE
function Mit($a, $b) { $r = @{}; foreach ($k in $a.Keys) { $r[$k] = $a[$k] }; foreach ($k in $b.Keys) { $r[$k] = $b[$k] }; return $r }
# S1: pull_request, workflow_dispatch, fremder Actor, fremdes Repo -> abgewiesen, Schloss unberuehrt; S8: schedule (der
# Nachtlauf, K65) nimmt und loest das Schloss wie push
if ((Lauf 'job-start' (Mit $gut @{ GITHUB_EVENT_NAME = 'pull_request' })) -ne 1) { $fehler += 'S1a pull_request nicht abgewiesen' }
if ((Lauf 'job-start' (Mit $gut @{ GITHUB_EVENT_NAME = 'workflow_dispatch' })) -ne 1) { $fehler += 'S1d workflow_dispatch nicht abgewiesen' }
if ((Lauf 'job-start' (Mit $gut @{ GITHUB_EVENT_NAME = 'schedule'; GITHUB_RUN_ID = '333' })) -ne 0) { $fehler += 'S8 schedule nicht angenommen' }
Lauf 'job-ende' (Mit $gut @{ GITHUB_EVENT_NAME = 'schedule'; GITHUB_RUN_ID = '333' }) | Out-Null
if (Test-Path $sch) { $fehler += 'S8 Schloss des Nachtlaufs nicht geloest' }
if ((Lauf 'job-start' (Mit $gut @{ GITHUB_ACTOR = 'fremd' })) -ne 1) { $fehler += 'S1b fremder Actor nicht abgewiesen' }
if ((Lauf 'job-start' (Mit $gut @{ GITHUB_REPOSITORY = 'fremd/AnazhRealm' })) -ne 1) { $fehler += 'S1c fremdes Repo nicht abgewiesen' }
if (Test-Path $sch) { $fehler += 'S1 Schloss nach Abweisung vorhanden' }
# S2: push -> nimmt das Schloss, besitzer.txt traegt den Job
if ((Lauf 'job-start' $gut) -ne 0) { $fehler += 'S2 push nicht angenommen' }
if (-not (Test-Path "$sch\besitzer.txt") -or (Get-Content "$sch\besitzer.txt" -Raw).Trim() -ne 'ci-runner 111/1 gpu') { $fehler += 'S2 besitzer.txt falsch' }
# S3: Ende eines ANDEREN Jobs loest nicht
Lauf 'job-ende' (Mit $gut @{ GITHUB_RUN_ID = '222' }) | Out-Null
if (-not (Test-Path $sch)) { $fehler += 'S3 fremder Ende-Hook loeste das Schloss' }
# S4: eigenes Ende loest
Lauf 'job-ende' $gut | Out-Null
if (Test-Path $sch) { $fehler += 'S4 eigener Ende-Hook loeste nicht' }
# S5: ABAB haelt das Schloss -> Start wartet und wird nach der Frist ROT, Schloss bleibt der ABAB
New-Item -ItemType Directory $sch | Out-Null; Set-Content "$sch\besitzer.txt" 'omen-abab k1410k' -Encoding utf8
if ((Lauf 'job-start' $gut) -ne 1) { $fehler += 'S5 wartete nicht / nicht ROT nach Frist' }
if ((Get-Content "$sch\besitzer.txt" -Raw).Trim() -ne 'omen-abab k1410k') { $fehler += 'S5 fremdes Schloss veraendert' }
# S6: verwaistes ci-runner-Schloss -> uebernommen
Set-Content "$sch\besitzer.txt" 'ci-runner 99/1 alt' -Encoding utf8
if ((Lauf 'job-start' $gut) -ne 0 -or (Get-Content "$sch\besitzer.txt" -Raw).Trim() -ne 'ci-runner 111/1 gpu') { $fehler += 'S6 verwaistes Schloss nicht uebernommen' }
Lauf 'job-ende' $gut | Out-Null
# S7: Schloss frei wird, waehrend der Start wartet -> er nimmt es
New-Item -ItemType Directory $sch | Out-Null; Set-Content "$sch\besitzer.txt" 'omen-abab k1410k' -Encoding utf8
$j = Start-Job { param($s) Start-Sleep 5; Remove-Item $s -Recurse -Force } -ArgumentList $sch
if ((Lauf 'job-start' $gut) -ne 0) { $fehler += 'S7 nahm das frei gewordene Schloss nicht' }
Receive-Job $j -Wait | Out-Null; Lauf 'job-ende' $gut | Out-Null
# S9: hook.log gesperrt (ein Leser haelt ihn exklusiv, 22.10.: ein `tail -F`) -> der Start nimmt das Schloss trotzdem, die Notiz
# landet in der Datei des Laufs
$fs = [System.IO.File]::Open("$t\hook.log", 'OpenOrCreate', 'Read', 'None')
$c9 = Lauf 'job-start' $gut; $fs.Close()
if ($c9 -ne 0 -or -not (Test-Path "$t\hook.log.111")) { $fehler += "S9 gesperrtes hook.log brach den Start (Exit $c9)" }
Lauf 'job-ende' $gut | Out-Null
# S10: ein fremdes Schloss schweigt seit 31 min -> beim Namen geloest und genommen
New-Item -ItemType Directory $sch | Out-Null; Set-Content "$sch\besitzer.txt" 'omen-2210-tot' -Encoding utf8
(Get-Item "$sch\besitzer.txt").LastWriteTime = (Get-Date).AddMinutes(-31)
if ((Lauf 'job-start' $gut) -ne 0 -or -not ((Get-Content "$t\hook.log" -Raw) -match "verwaistes Schloss 'omen-2210-tot' geloest - es schweigt seit 31")) { $fehler += 'S10 schweigendes Schloss nicht beim Namen geloest' }
Lauf 'job-ende' $gut | Out-Null
# S11: ein Abbruch des Hooks (hier die Abweisung) raeumt zuerst den Arbeitsordner - nie urteilt ein alter Baum
New-Item -ItemType Directory -Force "$ws\scripts" | Out-Null; Set-Content "$ws\package.json" '{"version":"alt"}'
if ((Lauf 'job-start' (Mit $gut @{ GITHUB_EVENT_NAME = 'pull_request' })) -ne 1 -or @(Get-ChildItem $ws -Force).Count) { $fehler += 'S11 der Abbruch raeumte den Arbeitsordner nicht' }
Write-Host (Get-Content "$t\hook.log" -Raw)
if ($fehler.Count) { Write-Host "SELBSTTEST ROT:"; $fehler | ForEach-Object { Write-Host " - $_" }; exit 1 }
Write-Host 'SELBSTTEST GRUEN (S1a-d, S2-S11)'; Remove-Item $t -Recurse -Force; exit 0

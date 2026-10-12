param([string]$pfadA, [string]$pfadB, [string]$aus, [int]$schwelle = 24)
Add-Type -AssemblyName System.Drawing
$bildA = New-Object System.Drawing.Bitmap $pfadA
$bildB = New-Object System.Drawing.Bitmap $pfadB
$w = $bildA.Width; $h = $bildA.Height
$ziel = New-Object System.Drawing.Bitmap $w, $h
$n = 0; $summe = 0
for ($y = 0; $y -lt $h; $y++) { for ($x = 0; $x -lt $w; $x++) {
  $p = $bildA.GetPixel($x, $y); $q = $bildB.GetPixel($x, $y)
  $d = [Math]::Max([Math]::Abs($p.R - $q.R), [Math]::Max([Math]::Abs($p.G - $q.G), [Math]::Abs($p.B - $q.B)))
  $summe += $d
  if ($d -gt $schwelle) { $n++; $ziel.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 0, 0)) } else { $g = [int](($p.R + $p.G + $p.B) / 6); $ziel.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $g, $g, $g)) }
} }
$ziel.Save($aus)
"anders " + $n + " von " + ($w * $h) + " (" + [Math]::Round(100.0 * $n / ($w * $h), 2) + " %) · mittlere Abweichung " + [Math]::Round($summe / ($w * $h), 2)
$bildA.Dispose(); $bildB.Dispose(); $ziel.Dispose()

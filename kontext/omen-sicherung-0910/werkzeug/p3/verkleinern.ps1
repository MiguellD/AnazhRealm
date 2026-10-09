# verkleinern.ps1 -Von <png> -Nach <jpg> [-Breite 1280] — Bericht-Bild: proportional verkleinert, JPEG Qualitaet 85
param([string]$Von, [string]$Nach, [int]$Breite = 1280)
Add-Type -AssemblyName System.Drawing
$q = [System.Drawing.Image]::FromFile($Von)
try {
    $h = [int]([double]$q.Height * $Breite / $q.Width)
    if ($q.Width -le $Breite) { $Breite = $q.Width; $h = $q.Height }
    $z = New-Object System.Drawing.Bitmap $Breite, $h
    $g = [System.Drawing.Graphics]::FromImage($z)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($q, 0, 0, $Breite, $h)
    $g.Dispose()
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $p = New-Object System.Drawing.Imaging.EncoderParameters 1
    $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]85)
    $z.Save($Nach, $enc, $p)
    $z.Dispose()
} finally { $q.Dispose() }

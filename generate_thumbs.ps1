Add-Type -AssemblyName System.Drawing
$sourceDir = "d:\projeto site\images\gallery"
$thumbDir = "d:\projeto site\images\gallery\thumbs"

if (-not (Test-Path $thumbDir)) {
    New-Item -ItemType Directory -Force -Path $thumbDir | Out-Null
}

$images = Get-ChildItem -Path $sourceDir -Filter "*.jpg" -File
foreach ($img in $images) {
    try {
        $bmp = [System.Drawing.Image]::FromFile($img.FullName)
        $ratio = 400.0 / $bmp.Width
        $newWidth = 400
        $newHeight = [math]::Round($bmp.Height * $ratio)
        
        $thumb = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $g = [System.Drawing.Graphics]::FromImage($thumb)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($bmp, 0, 0, $newWidth, $newHeight)
        
        $thumbPath = Join-Path $thumbDir $img.Name
        $thumb.Save($thumbPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        
        $g.Dispose()
        $thumb.Dispose()
        $bmp.Dispose()
        Write-Host "Generated thumbnail for $($img.Name)"
    } catch {
        Write-Host "Error processing $($img.Name): $_"
    }
}

# Generate gallery.json for the frontend
$fileNames = $images | Select-Object -ExpandProperty Name
$jsonPath = Join-Path $sourceDir "gallery.json"
$fileNames | ConvertTo-Json | Out-File -FilePath $jsonPath -Encoding utf8
Write-Host "Generated gallery.json with $($fileNames.Count) images"

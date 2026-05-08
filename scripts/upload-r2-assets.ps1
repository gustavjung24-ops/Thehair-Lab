param(
  [string]$Bucket = "the-hair-lab"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ImageRoot = Join-Path $ProjectRoot "public/image"

if (-not (Test-Path $ImageRoot)) {
  throw "Image folder not found: $ImageRoot"
}

if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
  throw "wrangler CLI not found. Install first: npm install -g wrangler"
}

function Test-R2ObjectExists {
  param(
    [Parameter(Mandatory = $true)][string]$BucketName,
    [Parameter(Mandatory = $true)][string]$ObjectKey
  )

  $tmpFile = Join-Path $env:TEMP ("thl-r2-check-" + [guid]::NewGuid().ToString() + ".tmp")
  try {
    & wrangler r2 object get "$BucketName/$ObjectKey" --remote --file "$tmpFile" 1>$null 2>$null
    return ($LASTEXITCODE -eq 0)
  }
  finally {
    if (Test-Path $tmpFile) {
      Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
    }
  }
}

function Add-UploadTask {
  param(
    [System.Collections.Generic.List[object]]$Tasks,
    [string]$LocalPath,
    [string]$Key,
    [bool]$Required,
    [bool]$SkipIfRemoteExists
  )

  $Tasks.Add([pscustomobject]@{
      localPath = $LocalPath
      key = $Key
      required = $Required
      skipIfRemoteExists = $SkipIfRemoteExists
    }) | Out-Null
}

$tasks = New-Object 'System.Collections.Generic.List[object]'

Add-UploadTask -Tasks $tasks -LocalPath (Join-Path $ImageRoot "hien-thi-tim-kiem.png") -Key "site/hien-thi-tim-kiem.png" -Required $true -SkipIfRemoteExists $false
Add-UploadTask -Tasks $tasks -LocalPath (Join-Path $ImageRoot "thehairlab-hero-product-lineup.png") -Key "site/thehairlab-hero-product-lineup.png" -Required $true -SkipIfRemoteExists $false

$salonPngFiles = Get-ChildItem -Path $ImageRoot -Filter "salon-mau-01-*.png" -File | Sort-Object Name
foreach ($file in $salonPngFiles) {
  Add-UploadTask -Tasks $tasks -LocalPath $file.FullName -Key ("salon/mau-01/{0}" -f $file.Name) -Required $false -SkipIfRemoteExists $false
}

$dvPngFiles = Get-ChildItem -Path $ImageRoot -Filter "dv-*.png" -File | Sort-Object Name
foreach ($file in $dvPngFiles) {
  $normalizedName = "salon-mau-01-" + $file.Name
  $targetKey = "salon/mau-01/$normalizedName"
  Add-UploadTask -Tasks $tasks -LocalPath $file.FullName -Key $targetKey -Required $false -SkipIfRemoteExists $true
}

$seen = @{}
$uniqueTasks = New-Object 'System.Collections.Generic.List[object]'
foreach ($task in $tasks) {
  if ($seen.ContainsKey($task.key)) {
    continue
  }
  $seen[$task.key] = $true
  $uniqueTasks.Add($task) | Out-Null
}

$uploaded = 0
$skipped = 0
$missing = 0
$keyPrefix = "thehairlab"

Write-Host "== Uploading The Hair Lab assets to R2 =="
Write-Host "Bucket: $Bucket"
Write-Host "Image root: $ImageRoot"

foreach ($task in $uniqueTasks) {
  $remoteKey = "$keyPrefix/$($task.key)"

  if (-not (Test-Path $task.localPath)) {
    $missing++
    if ($task.required) {
      Write-Host "[MISSING][REQUIRED] $($task.localPath) -> $remoteKey" -ForegroundColor Red
    }
    else {
      Write-Host "[MISSING] $($task.localPath) -> $remoteKey" -ForegroundColor Yellow
    }
    continue
  }

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($task.localPath)
  $pngPeer = Join-Path ([System.IO.Path]::GetDirectoryName($task.localPath)) ($baseName + ".png")
  if ([System.IO.Path]::GetExtension($task.localPath).ToLowerInvariant() -eq ".jpg" -and (Test-Path $pngPeer)) {
    $skipped++
    Write-Host "[SKIP] JPG has PNG pair: $($task.localPath)"
    continue
  }

  if ($task.skipIfRemoteExists) {
    $exists = Test-R2ObjectExists -BucketName $Bucket -ObjectKey $remoteKey
    if ($exists) {
      $skipped++
      Write-Host "[SKIP] Remote exists: $remoteKey"
      continue
    }
  }

  & wrangler r2 object put "$Bucket/$remoteKey" --remote --file "$($task.localPath)"
  if ($LASTEXITCODE -ne 0) {
    throw "Upload failed: $($task.localPath) -> $remoteKey"
  }

  $uploaded++
  Write-Host "[OK] $($task.localPath) -> $remoteKey" -ForegroundColor Green
}

Write-Host ""
Write-Host "Summary: uploaded=$uploaded, skipped=$skipped, missing=$missing"

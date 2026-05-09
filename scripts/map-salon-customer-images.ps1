param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]
    [string]$Slug,

    [Parameter(Mandatory = $true)]
    [string]$SourceDir,

    [string]$CdnBase = "https://cdn.thehairlab.top/thehairlab",

    [string]$OutputManifest = "content_exports/customer-image-manifest-{slug}.json",

    [switch]$AllowMissing
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ResolvedSourceDir = (Resolve-Path -LiteralPath $SourceDir -ErrorAction Stop).Path

if (-not (Test-Path -LiteralPath $ResolvedSourceDir -PathType Container)) {
    throw "SourceDir must be an existing folder: $SourceDir"
}

$AllowedExtensions = @(".jpg", ".jpeg", ".png", ".webp", ".avif")
$RequiredKeys = @(
    "hero",
    "hero-02",
    "consultation",
    "color-service",
    "styling-service",
    "treatment-service",
    "space-01",
    "space-02",
    "space-03",
    "experience",
    "dv-cat-tao-kieu",
    "dv-mau-toc",
    "dv-nhuom-thoi-trang",
    "dv-uon-setting",
    "dv-duoi-phuc-hoi",
    "dv-cham-soc-phuc-hoi",
    "products"
)

$OutputManifestResolved = $OutputManifest.Replace("{slug}", $Slug)
if (-not [System.IO.Path]::IsPathRooted($OutputManifestResolved)) {
    $OutputManifestResolved = Join-Path $ProjectRoot $OutputManifestResolved
}

$foundByKey = @{}
$extraFiles = New-Object System.Collections.Generic.List[string]
$invalidExtensionFiles = New-Object System.Collections.Generic.List[string]

$allFiles = Get-ChildItem -LiteralPath $ResolvedSourceDir -File | Sort-Object Name
foreach ($file in $allFiles) {
    $ext = [System.IO.Path]::GetExtension($file.Name).ToLowerInvariant()
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToLowerInvariant()

    if ($AllowedExtensions -notcontains $ext) {
        $invalidExtensionFiles.Add($file.Name) | Out-Null
        $extraFiles.Add($file.Name) | Out-Null
        continue
    }

    if ($RequiredKeys -contains $baseName) {
        if (-not $foundByKey.ContainsKey($baseName)) {
            $foundByKey[$baseName] = New-Object System.Collections.Generic.List[object]
        }
        $foundByKey[$baseName].Add([pscustomobject]@{
                name = $file.Name
                fullPath = $file.FullName
                ext = $ext
            }) | Out-Null
    }
    else {
        $extraFiles.Add($file.Name) | Out-Null
    }
}

$missingKeys = New-Object System.Collections.Generic.List[string]
$duplicateKeys = New-Object System.Collections.Generic.List[object]

foreach ($key in $RequiredKeys) {
    if (-not $foundByKey.ContainsKey($key)) {
        $missingKeys.Add($key) | Out-Null
        continue
    }

    if ($foundByKey[$key].Count -gt 1) {
        $duplicateKeys.Add([pscustomobject]@{
                key = $key
                files = @($foundByKey[$key] | ForEach-Object { $_.name })
            }) | Out-Null
    }
}

$hasBlockingValidationError = ($extraFiles.Count -gt 0) -or ($duplicateKeys.Count -gt 0)
$hasMissingValidationError = ($missingKeys.Count -gt 0) -and (-not $AllowMissing)
$hasValidationError = $hasBlockingValidationError -or $hasMissingValidationError

Write-Host ""
Write-Host "=== Validation Summary ===" -ForegroundColor Cyan
Write-Host "Slug: $Slug"
Write-Host "SourceDir: $ResolvedSourceDir"
Write-Host "Required keys: $($RequiredKeys.Count)"
Write-Host "Files found: $($allFiles.Count)"
Write-Host "Missing keys: $($missingKeys.Count)"
Write-Host "Duplicate keys: $($duplicateKeys.Count)"
Write-Host "Extra files: $($extraFiles.Count)"

if ($missingKeys.Count -gt 0) {
    Write-Host "\n[MISSING KEYS]" -ForegroundColor Yellow
    $missingKeys | ForEach-Object { Write-Host " - $_" }
}

if ($duplicateKeys.Count -gt 0) {
    Write-Host "\n[DUPLICATE KEYS]" -ForegroundColor Yellow
    foreach ($dup in $duplicateKeys) {
        Write-Host " - $($dup.key): $([string]::Join(', ', $dup.files))"
    }
}

if ($extraFiles.Count -gt 0) {
    Write-Host "\n[EXTRA FILES]" -ForegroundColor Yellow
    $extraFiles | Sort-Object -Unique | ForEach-Object { Write-Host " - $_" }
}

if ($invalidExtensionFiles.Count -gt 0) {
    Write-Host "\n[INVALID EXTENSION FILES]" -ForegroundColor Yellow
    $invalidExtensionFiles | Sort-Object -Unique | ForEach-Object { Write-Host " - $_" }
}

if ($hasValidationError) {
    throw "Validation failed. Fix missing/duplicate/extra files before generating manifest."
}

if ($missingKeys.Count -gt 0 -and $AllowMissing) {
    Write-Host "\n[ALLOW MISSING] Continue generating partial manifest." -ForegroundColor Yellow
}

function Get-CdnUrl {
    param(
        [Parameter(Mandatory = $true)][string]$FileName
    )

    $cleanBase = $CdnBase.TrimEnd('/')
    return "$cleanBase/salon/customers/$Slug/$FileName"
}

function Get-KeyFileName {
    param(
        [Parameter(Mandatory = $true)][string]$Key
    )

    return $foundByKey[$Key][0].name
}

function Has-KeyFile {
    param(
        [Parameter(Mandatory = $true)][string]$Key
    )

    return $foundByKey.ContainsKey($Key) -and $foundByKey[$Key].Count -gt 0
}

function Add-ImageIfPresent {
    param(
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Target,
        [Parameter(Mandatory = $true)][string]$TargetKey,
        [Parameter(Mandatory = $true)][string]$SourceKey
    )

    if (Has-KeyFile -Key $SourceKey) {
        $Target[$TargetKey] = (Get-CdnUrl -FileName (Get-KeyFileName -Key $SourceKey))
    }
}

$images = [ordered]@{}

Add-ImageIfPresent -Target $images -TargetKey "hero" -SourceKey "hero"
Add-ImageIfPresent -Target $images -TargetKey "hero02" -SourceKey "hero-02"
Add-ImageIfPresent -Target $images -TargetKey "consultation" -SourceKey "consultation"
Add-ImageIfPresent -Target $images -TargetKey "colorService" -SourceKey "color-service"
Add-ImageIfPresent -Target $images -TargetKey "stylingService" -SourceKey "styling-service"
Add-ImageIfPresent -Target $images -TargetKey "treatmentService" -SourceKey "treatment-service"
Add-ImageIfPresent -Target $images -TargetKey "space01" -SourceKey "space-01"
Add-ImageIfPresent -Target $images -TargetKey "space02" -SourceKey "space-02"
Add-ImageIfPresent -Target $images -TargetKey "space03" -SourceKey "space-03"
Add-ImageIfPresent -Target $images -TargetKey "experience" -SourceKey "experience"
Add-ImageIfPresent -Target $images -TargetKey "products" -SourceKey "products"

$services = [ordered]@{}
Add-ImageIfPresent -Target $services -TargetKey "cut" -SourceKey "dv-cat-tao-kieu"
Add-ImageIfPresent -Target $services -TargetKey "color" -SourceKey "dv-mau-toc"
Add-ImageIfPresent -Target $services -TargetKey "fashionColor" -SourceKey "dv-nhuom-thoi-trang"
Add-ImageIfPresent -Target $services -TargetKey "perm" -SourceKey "dv-uon-setting"
Add-ImageIfPresent -Target $services -TargetKey "straight" -SourceKey "dv-duoi-phuc-hoi"
Add-ImageIfPresent -Target $services -TargetKey "treatment" -SourceKey "dv-cham-soc-phuc-hoi"

if ($services.Count -gt 0) {
    $images["services"] = $services
}

$manifest = [ordered]@{
    slug = $Slug
    cdnBase = $CdnBase
    missingKeys = @($missingKeys)
    images = $images
}

$outputDir = Split-Path -Parent $OutputManifestResolved
if (-not (Test-Path -LiteralPath $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$manifestJson = $manifest | ConvertTo-Json -Depth 8
Set-Content -LiteralPath $OutputManifestResolved -Value $manifestJson -Encoding UTF8

Write-Host "\nManifest created: $OutputManifestResolved" -ForegroundColor Green
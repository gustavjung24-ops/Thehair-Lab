param(
	[string]$Bucket = "the-hair-lab",
	[string]$Prefix = "thehairlab",
	[string]$ExternalRoot,
	[switch]$SkipUpload
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ManifestOutput = Join-Path $ProjectRoot "assets\cdn-salon-manifest-02-05.json"
$cdnBase = "https://cdn.thehairlab.top/thehairlab"

if (-not $ExternalRoot) {
	$diskRoot = "F:\1_A_Disk_D"
	$candidateParent = Get-ChildItem -Path $diskRoot -Directory | Where-Object {
		Test-Path (Join-Path $_.FullName "the-hair-lab\public\image")
	} | Select-Object -First 1

	if ($candidateParent) {
		$ExternalRoot = Join-Path $candidateParent.FullName "the-hair-lab\public\image"
	}
}

if (-not (Test-Path $ExternalRoot)) {
	throw "External image root not found: $ExternalRoot"
}

if (-not $SkipUpload -and -not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
	throw "wrangler CLI not found. Install first: npm install -g wrangler"
}

$requiredBasenames = @(
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

$extensionPriority = @("png", "jpg", "jpeg", "webp")

$templates = @(
	[pscustomobject]@{ id = 2; externalFolder = "salon-test-mau-02"; keyPrefix = "salon.mau02"; r2Folder = "salon/mau-02" },
	[pscustomobject]@{ id = 3; externalFolder = "salon-test-mau-03"; keyPrefix = "salon.mau03"; r2Folder = "salon/mau-03" },
	[pscustomobject]@{ id = 4; externalFolder = "salon-test-mau-04"; keyPrefix = "salon.mau04"; r2Folder = "salon/mau-04" },
	[pscustomobject]@{ id = 5; externalFolder = "salon-test-mau-05"; keyPrefix = "salon.mau05"; r2Folder = "salon/mau-05" }
)

$assetKeyByBasename = @{
	"hero" = "hero"
	"hero-02" = "hero02"
	"consultation" = "consultation"
	"color-service" = "colorService"
	"styling-service" = "stylingService"
	"treatment-service" = "treatmentService"
	"space-01" = "space01"
	"space-02" = "space02"
	"space-03" = "space03"
	"experience" = "experience"
	"products" = "products"
	"dv-cat-tao-kieu" = "services.cut"
	"dv-mau-toc" = "services.color"
	"dv-nhuom-thoi-trang" = "services.fashionColor"
	"dv-uon-setting" = "services.perm"
	"dv-duoi-phuc-hoi" = "services.straight"
	"dv-cham-soc-phuc-hoi" = "services.treatment"
}

function Find-SourceFile {
	param(
		[Parameter(Mandatory = $true)][string]$Folder,
		[Parameter(Mandatory = $true)][string]$BaseName
	)

	foreach ($ext in $extensionPriority) {
		$candidate = Join-Path $Folder "$BaseName.$ext"
		if (Test-Path -LiteralPath $candidate) {
			return $candidate
		}
	}

	return $null
}

$manifest = [ordered]@{}
$report = New-Object "System.Collections.Generic.List[object]"

$uploaded = 0
$missing = 0
$skippedUpload = 0

foreach ($template in $templates) {
	$templateFolder = Join-Path $ExternalRoot $template.externalFolder
	if (-not (Test-Path -LiteralPath $templateFolder)) {
		throw "Template source folder not found: $templateFolder"
	}

	Write-Host ""
	Write-Host "===== salon-test-mau-$('{0:D2}' -f $template.id) =====" -ForegroundColor Cyan

	foreach ($basename in $requiredBasenames) {
		$sourceBase = "salon-mau-$('{0:D2}' -f $template.id)-$basename"
		$sourceFile = Find-SourceFile -Folder $templateFolder -BaseName $sourceBase
		$assetKeySuffix = $assetKeyByBasename[$basename]
		$assetKey = "$($template.keyPrefix).$assetKeySuffix"

		if (-not $sourceFile) {
			$missing++
			$report.Add([pscustomobject]@{
					template = $template.id
					basename = $basename
					status = "missing"
					source = ""
					key = $assetKey
					url = ""
				}) | Out-Null
			Write-Host "[MISSING] $sourceBase" -ForegroundColor Yellow
			continue
		}

		$filename = [System.IO.Path]::GetFileName($sourceFile)
		$objectKey = "$Prefix/$($template.r2Folder)/$filename"
		$cdnUrl = "$cdnBase/$($template.r2Folder)/$filename"

		if ($SkipUpload) {
			$skippedUpload++
			Write-Host "[MAP-ONLY] $filename -> $assetKey"
		}
		else {
			& wrangler r2 object put "$Bucket/$objectKey" --remote --file "$sourceFile"
			if ($LASTEXITCODE -ne 0) {
				throw "Upload failed: $sourceFile -> $objectKey"
			}
			$uploaded++
			Write-Host "[OK] $filename -> $objectKey" -ForegroundColor Green
		}

		$manifest[$assetKey] = $cdnUrl
		$report.Add([pscustomobject]@{
				template = $template.id
				basename = $basename
				status = "ok"
				source = $sourceFile
				key = $assetKey
				url = $cdnUrl
			}) | Out-Null
	}
}

$json = [ordered]@{
	generatedAt = (Get-Date).ToString("o")
	bucket = $Bucket
	prefix = $Prefix
	cdnBase = $cdnBase
	uploadSkipped = [bool]$SkipUpload
	summary = [ordered]@{
		uploaded = $uploaded
		mapOnly = $skippedUpload
		missing = $missing
		totalMapped = $manifest.Count
	}
	assets = $manifest
	report = $report
} | ConvertTo-Json -Depth 8

Set-Content -Path $ManifestOutput -Value $json -Encoding UTF8

Write-Host ""
Write-Host "Manifest written: $ManifestOutput" -ForegroundColor Cyan
Write-Host "Summary: uploaded=$uploaded, mapOnly=$skippedUpload, missing=$missing, totalMapped=$($manifest.Count)"

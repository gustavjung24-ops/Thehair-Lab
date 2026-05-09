<#
.SYNOPSIS
    Clone a salon template (01-05) into a new customer salon folder.

.EXAMPLE
    .\scripts\create-salon-customer.ps1 `
      -TemplateNumber "02" `
      -Slug "salon-hung-saigon" `
      -SalonName "Salon Hung Saigon" `
      -Phone "0902 964 685" `
      -Zalo "0902 964 685" `
      -Address "Tan An, Long An" `
      -Description "Salon toc chuyen tu van kieu toc phu hop guong mat."
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet("01","02","03","04","05")]
    [string]$TemplateNumber,

    [Parameter(Mandatory)]
    [string]$Slug,

    [Parameter(Mandatory)]
    [string]$SalonName,

    [Parameter(Mandatory)]
    [string]$Phone,

    [Parameter(Mandatory)]
    [string]$Zalo,

    [Parameter(Mandatory)]
    [string]$Address,

    [string]$Description = ""
)

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

function Write-Utf8NoBom {
    param([string]$Path, [string]$Content)
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

function Read-Utf8 {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

# Escape $ -> $$ for use in .NET regex REPLACEMENT strings (not pattern side)
function EscapeReplacement([string]$Value) {
    return $Value.Replace('$', '$$')
}

# Escape JS string special chars
function EscapeJs([string]$Value) {
    return $Value.Replace('\', '\\').Replace('"', '\"')
}

# ---------------------------------------------------------------------------
# Validate slug: lowercase letters, numbers, hyphens only; no leading/trailing hyphen
# ---------------------------------------------------------------------------

if ($Slug -notmatch '^[a-z0-9][a-z0-9-]*[a-z0-9]$') {
    Write-Error "Invalid slug: '$Slug'. Use lowercase letters, numbers, hyphens only. E.g.: salon-hung-saigon"
    exit 1
}

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

$Root      = Split-Path -Parent $PSScriptRoot
$SourceDir = Join-Path $Root "s\salon-test-mau-$TemplateNumber"
$TargetDir = Join-Path $Root "s\$Slug"

if (-not (Test-Path $SourceDir)) {
    Write-Error "Source template folder not found: $SourceDir"
    exit 1
}

if (Test-Path $TargetDir) {
    Write-Error "Slug already exists, will not overwrite: s/$Slug"
    exit 1
}

$SourcePub   = Join-Path $SourceDir "index.html"
$SourceAdmin = Join-Path $SourceDir "admin\index.html"
if (-not (Test-Path $SourcePub))   { Write-Error "Not found: $SourcePub";   exit 1 }
if (-not (Test-Path $SourceAdmin)) { Write-Error "Not found: $SourceAdmin"; exit 1 }

# ---------------------------------------------------------------------------
# Config maps
# ---------------------------------------------------------------------------

$ThemeNames = @{
    "01" = "Lavender Beauty"
    "02" = "Green Natural"
    "03" = "Black Gold Luxury"
    "04" = "Spring Fresh"
    "05" = "Gold Luxury Professional"
}

$TemplateSalonNames = @{
    "01" = "Salon Test Mau 01 - Lavender Beauty"
    "02" = "Salon Test Mau 02 - Green Natural"
    "03" = "Salon Test Mau 03 - Black Gold Luxury"
    "04" = "Salon Test Mau 04 - Spring Fresh"
    "05" = "Salon Test Mau 05 - Gold Luxury Professional"
}

$ThemeName          = $ThemeNames[$TemplateNumber]
$PhoneNorm          = $Phone -replace '\s+', ''
$ZaloNorm           = $Zalo  -replace '\s+', ''
$ZaloUrl            = "https://zalo.me/$ZaloNorm"

$DescFull  = if ($Description -ne "") { $Description } else { "Dat lich tu van mien phi kieu toc phu hop guong mat tai $SalonName." }
$DescShort = if ($Description -ne "") { $Description } else { "$SalonName — salon toc chuyen nghiep." }

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  The Hair Lab -- Clone Salon From Template" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Template :  No.$TemplateNumber ($ThemeName)" -ForegroundColor White
Write-Host "  Slug     :  $Slug" -ForegroundColor White
Write-Host "  Name     :  $SalonName" -ForegroundColor White
Write-Host "  Phone    :  $Phone  =>  login=$PhoneNorm" -ForegroundColor White
Write-Host "  Address  :  $Address" -ForegroundColor White
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 1 -- Copy template folder
# ---------------------------------------------------------------------------

Write-Host "[1/4] Copying template $TemplateNumber to s/$Slug ..." -ForegroundColor Yellow
Copy-Item -Path $SourceDir -Destination $TargetDir -Recurse
Write-Host "      OK: $TargetDir" -ForegroundColor Green

# ---------------------------------------------------------------------------
# STEP 2 -- Patch public index.html (meta tags)
# ---------------------------------------------------------------------------

Write-Host "[2/4] Patching public index.html ..." -ForegroundColor Yellow

$PubPath = Join-Path $TargetDir "index.html"
$pub = Read-Utf8 $PubPath

$titleFull = "$SalonName | Tu van kieu toc phu hop"

# title tag (lookbehind/lookahead -> no capture group issue)
$pub = [regex]::Replace($pub, '(?<=<title>)[^<]*(?=</title>)', (EscapeReplacement $titleFull))

# canonical + og:url: plain string replace (template URL -> new slug URL)
$pub = $pub.Replace(
    "https://www.thehairlab.top/s/salon-test-mau-$TemplateNumber",
    "https://www.thehairlab.top/s/$Slug"
)

# meta description id="salon-description" (lookbehind matches across newlines, \s+ matches \n)
$pub = [regex]::Replace($pub, '(?<=id="salon-description"\s+name="description"\s+content=")[^"]*', (EscapeReplacement $DescFull))

# og:title
$pub = [regex]::Replace($pub, '(?<=property="og:title"\s+content=")[^"]*', (EscapeReplacement $titleFull))

# og:description
$pub = [regex]::Replace($pub, '(?<=property="og:description"\s+content=")[^"]*', (EscapeReplacement $DescShort))

# twitter:title
$pub = [regex]::Replace($pub, '(?<=name="twitter:title"\s+content=")[^"]*', (EscapeReplacement $titleFull))

# twitter:description
$pub = [regex]::Replace($pub, '(?<=name="twitter:description"\s+content=")[^"]*', (EscapeReplacement $DescShort))

Write-Utf8NoBom $PubPath $pub
Write-Host "      OK" -ForegroundColor Green

# ---------------------------------------------------------------------------
# STEP 3 -- Patch admin/index.html DEFAULT_ADMIN_DATA
# ---------------------------------------------------------------------------

Write-Host "[3/4] Patching admin/index.html ..." -ForegroundColor Yellow

$AdminPath = Join-Path $TargetDir "admin\index.html"
$adm = Read-Utf8 $AdminPath

# 3a. Replace salon.name -- detect template name using Vietnamese map at runtime
#     We look up the name from the SOURCE admin file itself (first match of the pattern)
#     to handle any Vietnamese casing correctly.
$namePattern  = [regex]::new('(?<=name:\s*")[^"]+(?=",\s*\r?\n\s*logoText)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$currentName  = $namePattern.Match($adm).Value
if ($currentName -ne "") {
    $adm = $adm.Replace("""$currentName""", """$SalonName""")
} else {
    # Fallback: try ASCII-only map
    $asciiOldName = $TemplateSalonNames[$TemplateNumber]
    if ($adm.Contains($asciiOldName)) {
        $adm = $adm.Replace($asciiOldName, $SalonName)
    }
}

# 3b-3d. Replace phone/zalo/address in DEFAULT_ADMIN_DATA.salon block
#   Use lookbehind to avoid capture group + digit collision ($10digits...)
#   .NET supports variable-length lookbehind so [^}]*? inside is valid.
$singleLine = [System.Text.RegularExpressions.RegexOptions]::Singleline

$adm = [regex]::Replace($adm, '(?<=version:\s*3,\s*salon:\s*\{[^}]*?phone:\s*")[^"]*',   (EscapeReplacement $PhoneNorm), $singleLine)
$adm = [regex]::Replace($adm, '(?<=version:\s*3,\s*salon:\s*\{[^}]*?zalo:\s*")[^"]*',    (EscapeReplacement $ZaloNorm),  $singleLine)
$adm = [regex]::Replace($adm, '(?<=version:\s*3,\s*salon:\s*\{[^}]*?address:\s*")[^"]*', (EscapeReplacement $Address),   $singleLine)

# 3e. Replace hero.description if custom Description provided
if ($Description -ne "") {
    $adm = [regex]::Replace($adm, '(?<=hero\s*:\s*\{[^}]*?description\s*:\s*")[^"]*', (EscapeReplacement (EscapeJs $Description)), $singleLine)
}

Write-Utf8NoBom $AdminPath $adm
Write-Host "      OK" -ForegroundColor Green

# ---------------------------------------------------------------------------
# STEP 4 -- Add entry to TEMPLATE_SALON_OVERRIDES in salon.js
# ---------------------------------------------------------------------------

Write-Host "[4/4] Adding slug to salon.js TEMPLATE_SALON_OVERRIDES ..." -ForegroundColor Yellow

$SalonJsPath = Join-Path $Root "salon.js"
$js = Read-Utf8 $SalonJsPath

if ($js.Contains("""$Slug""")) {
    Write-Host "      SKIP: '$Slug' already exists in salon.js" -ForegroundColor DarkYellow
} else {
    $nl = if ($js.Contains("`r`n")) { "`r`n" } else { "`n" }

    $descJs = EscapeJs $DescFull
    $entry  = "  `"$Slug`": {${nl}"
    $entry += "    slug: `"$Slug`",${nl}"
    $entry += "    templateId: `"$TemplateNumber`",${nl}"
    $entry += "    salon_name: `"$(EscapeJs $SalonName)`",${nl}"
    $entry += "    status: `"active`",${nl}"
    $entry += "    themeName: `"$ThemeName`",${nl}"
    $entry += "    phone: `"$Phone`",${nl}"
    $entry += "    zalo_url: `"$ZaloUrl`",${nl}"
    $entry += "    address: `"$(EscapeJs $Address)`",${nl}"
    $entry += "    description: `"$descJs`",${nl}"
    $entry += "  },${nl}"

    $anchor = "};${nl}${nl}const DEFAULT_SALON = {"
    if (-not $js.Contains($anchor)) {
        Write-Error "Anchor not found in salon.js. Check file structure."
        exit 1
    }

    $js = $js.Replace($anchor, "${entry}};${nl}${nl}const DEFAULT_SALON = {")
    Write-Utf8NoBom $SalonJsPath $js
    Write-Host "      OK: '$Slug' added to salon.js" -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# DONE -- Summary
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  SUCCESS: Salon customer created!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Template  : No.$TemplateNumber ($ThemeName)" -ForegroundColor White
Write-Host "  Slug      : $Slug" -ForegroundColor White
Write-Host "  Salon     : $SalonName" -ForegroundColor White
Write-Host ""
Write-Host "  [Local] Public URL:" -ForegroundColor Cyan
Write-Host "    http://127.0.0.1:5200/s/$Slug/" -ForegroundColor Cyan
Write-Host "  [Local] Admin URL:" -ForegroundColor Cyan
Write-Host "    http://127.0.0.1:5200/s/$Slug/admin/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Login phone : $Phone" -ForegroundColor Yellow
Write-Host "  Password    : admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Storage keys (auto from URL slug):" -ForegroundColor DarkGray
Write-Host "    thehairlab.admin.$Slug" -ForegroundColor DarkGray
Write-Host "    thehairlab.admin.session.$Slug" -ForegroundColor DarkGray
Write-Host "    thehairlab.admin.credentials.$Slug" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Files created/updated:" -ForegroundColor DarkGray
Write-Host "    s/$Slug/index.html" -ForegroundColor DarkGray
Write-Host "    s/$Slug/admin/index.html" -ForegroundColor DarkGray
Write-Host "    salon.js  (TEMPLATE_SALON_OVERRIDES)" -ForegroundColor DarkGray
Write-Host ""
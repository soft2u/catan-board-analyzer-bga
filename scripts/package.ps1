$ErrorActionPreference = "Stop"

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$manifestPath = Join-Path $repositoryRoot "manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$version = [string]$manifest.version

if ($version -notmatch '^\d+\.\d+\.\d+(?:\.\d+)?$') {
    throw "manifest.json contains an invalid extension version: $version"
}

$runtimeFiles = @(
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "import.html",
    "import.js"
)

$resolvedFiles = foreach ($relativePath in $runtimeFiles) {
    $candidate = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        throw "Required runtime file is missing: $relativePath"
    }

    (Resolve-Path -LiteralPath $candidate).Path
}

$distPath = Join-Path $repositoryRoot "dist"
if (-not (Test-Path -LiteralPath $distPath)) {
    New-Item -ItemType Directory -Path $distPath | Out-Null
}

$archivePath = Join-Path $distPath "catan-bga-analyzer-v$version.zip"
$resolvedDistPath = (Resolve-Path -LiteralPath $distPath).Path
$archiveParent = [System.IO.Path]::GetDirectoryName(
    [System.IO.Path]::GetFullPath($archivePath)
)

if ($archiveParent -ne $resolvedDistPath) {
    throw "Refusing to write the release archive outside the dist directory."
}

if (Test-Path -LiteralPath $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
}

Compress-Archive -LiteralPath $resolvedFiles -DestinationPath $archivePath
Write-Output "Created $archivePath"

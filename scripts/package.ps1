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
    "import.js",
    "icons/icon-16.png",
    "icons/icon-32.png",
    "icons/icon-48.png",
    "icons/icon-128.png"
)

$resolvedFiles = foreach ($relativePath in $runtimeFiles) {
    $candidate = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        throw "Required runtime file is missing: $relativePath"
    }

    [PSCustomObject]@{
        SourcePath = (Resolve-Path -LiteralPath $candidate).Path
        EntryName = $relativePath
    }
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

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# Explicit entry names retain icons/ paths while excluding store artwork, tests,
# documentation, and any other files added to the source directory.
$temporaryArchivePath = Join-Path $resolvedDistPath ([Guid]::NewGuid().ToString("N") + ".zip.tmp")
try {
    $archive = [System.IO.Compression.ZipFile]::Open(
        $temporaryArchivePath,
        [System.IO.Compression.ZipArchiveMode]::Create
    )
    try {
        foreach ($file in $resolvedFiles) {
            $entry = $archive.CreateEntry(
                $file.EntryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            )
            # Set the fixed timestamp before opening an entry in Create mode.
            $entry.LastWriteTime = [DateTimeOffset]::Parse("2000-01-01T00:00:00Z")
            $sourceStream = [System.IO.File]::OpenRead($file.SourcePath)
            try {
                $entryStream = $entry.Open()
                try {
                    $sourceStream.CopyTo($entryStream)
                }
                finally {
                    $entryStream.Dispose()
                }
            }
            finally {
                $sourceStream.Dispose()
            }
        }
    }
    finally {
        $archive.Dispose()
    }
    # Replace the previous release only after the complete archive is closed.
    Move-Item -LiteralPath $temporaryArchivePath -Destination $archivePath -Force
}
finally {
    if (Test-Path -LiteralPath $temporaryArchivePath) {
        Remove-Item -LiteralPath $temporaryArchivePath -Force
    }
}
Write-Output "Created $archivePath"

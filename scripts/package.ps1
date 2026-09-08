$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$releaseDir = Join-Path $projectRoot 'releases'
New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
$releaseId = Get-Date -Format 'yyyyMMdd-HHmmss-fff'

function Get-PackageFiles([string]$RelativeDirectory) {
    $directory = Join-Path $projectRoot $RelativeDirectory
    $items = Get-ChildItem -LiteralPath $directory -Recurse -Force
    if ($items | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) {
        throw "Package directories must not contain symbolic links: $RelativeDirectory"
    }
    $items | Where-Object { -not $_.PSIsContainer }
}

function Write-Package([string]$ArchiveName, [object[]]$Files, [string]$BaseDirectory) {
    $archivePath = Join-Path $releaseDir $ArchiveName
    $archive = [IO.Compression.ZipFile]::Open($archivePath, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $Files) {
            $absolute = [IO.Path]::GetFullPath($file.FullName)
            $prefix = $BaseDirectory.TrimEnd('\') + '\'
            if (-not $absolute.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Package file is outside the allowed directory.' }
            $entry = $absolute.Substring($prefix.Length).Replace('\', '/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $absolute, $entry, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $archive.Dispose() }
    [PSCustomObject]@{ File = $archivePath; Files = $Files.Count; Bytes = (Get-Item -LiteralPath $archivePath).Length }
}

$staticFiles = @(Get-PackageFiles 'docs')
foreach ($file in $staticFiles) {
    if ($file.Name -ne '.nojekyll' -and $file.Extension -notin @('.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff', '.woff2', '.pdf')) {
        throw "Unexpected file in public website: $($file.Name)"
    }
}
$sourceFiles = @($staticFiles)
foreach ($folder in @('scripts', 'tests', '.github')) { $sourceFiles += @(Get-PackageFiles $folder) }
# Explicit server allowlist: no database, outbox, log files, or local environment.
$sourceFiles += @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'server') -File -Force | Where-Object { $_.Extension -eq '.mjs' -or $_.Name -eq '.env.example' })
foreach ($name in @('package.json', 'package-lock.json', 'README.md', 'QUICKSTART.md', '.gitignore', 'start-local.cmd')) {
    $sourceFiles += Get-Item -LiteralPath (Join-Path $projectRoot $name) -Force
}
Write-Package "mypublic-pages-$releaseId.zip" $staticFiles (Join-Path $projectRoot 'docs')
Write-Package "mypublic-source-$releaseId.zip" $sourceFiles $projectRoot

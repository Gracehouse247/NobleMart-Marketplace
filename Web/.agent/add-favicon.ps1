# Add Favicon to All HTML Pages
$faviconLinks = @"
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/img/favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/img/favicon.png">
    <link rel="shortcut icon" href="assets/img/favicon.png">
"@

$files = @(
    "login.html",
    "register.html",
    "shop\cart.html",
    "shop\category.html",
    "shop\checkout.html",
    "shop\product.html",
    "customer\index.html",
    "customer\orders.html",
    "seller\index.html",
    "seller\login.html",
    "seller\register_vendor.html",
    "admin\index.html",
    "blog\index.html",
    "blog\post.html",
    "properties\index.html",
    "properties\listing.html"
)

foreach ($file in $files) {
    $filePath = "c:\Projects\NobleMart\Web\$file"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Check if favicon is already added
        if ($content -notmatch 'favicon\.png') {
            # Find the </title> tag and add favicon links after it
            if ($content -match '(<title>.*?</title>)') {
                $newContent = $content -replace '(<title>.*?</title>)', "`$1$faviconLinks"
                Set-Content -Path $filePath -Value $newContent -NoNewline
                Write-Host "Added favicon to: $file"
            } else {
                Write-Host "No title tag found in: $file"
            }
        } else {
            Write-Host "Favicon already exists in: $file"
        }
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host ""
Write-Host "Favicon update complete!"

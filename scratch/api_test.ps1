# ─────────────────────────────────────────────────────────────────────────────
# ScoutPrice – REST API Integration & Verification Test Suite
# Runs sequentially against localhost:5000 using native PowerShell cmdlets
# ─────────────────────────────────────────────────────────────────────────────

$baseUrl = "http://localhost:5000/api"
$healthUrl = "http://localhost:5000/health"
$headers = @{ "Content-Type" = "application/json" }
$testEmail = "verification-tester-" + (Get-Random) + "@scoutprice.com"
$testPassword = "SecuredPassword123!"
$jwtToken = ""
$testProductId = ""

Write-Host "🚀 Starting ScoutPrice REST API Verification Suite..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor White

# ── 1. Verify Health Endpoint ────────────────────────────────────────────────
Write-Host "[TEST 1/12] GET /health (Health & Status)..." -NoNewline
try {
    $res = Invoke-RestMethod -Uri $healthUrl -Method Get
    if ($res.status -eq "healthy") {
        Write-Host " PASSED ✅" -ForegroundColor Green
    } else {
        Write-Host " FAILED ❌ (Invalid status response)" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌ (Cannot connect. Is server running?)" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor DarkGray
    exit
}

# ── 2. Register Test User ────────────────────────────────────────────────────
Write-Host "[TEST 2/12] POST /users/register (User Registration)..." -NoNewline
$registerBody = @{
    name = "Integration Test User"
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/users/register" -Method Post -Body $registerBody -Headers $headers
    if ($res.success -eq $true -and $res.token) {
        Write-Host " PASSED ✅" -ForegroundColor Green
        $jwtToken = $res.token
        $headers.Add("Authorization", "Bearer $jwtToken")
    } else {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor DarkGray
}

# ── 3. Login Test User ───────────────────────────────────────────────────────
Write-Host "[TEST 3/12] POST /users/login (Authentication Gate)..." -NoNewline
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -Body $loginBody -Headers $headers
    if ($res.success -eq $true -and $res.token) {
        Write-Host " PASSED ✅" -ForegroundColor Green
    } else {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌" -ForegroundColor Red
}

# ── 4. Query Catalog Products ───────────────────────────────────────────────
Write-Host "[TEST 4/12] GET /products (Listing Catalog)..." -NoNewline
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
    if ($res.success -eq $true) {
        Write-Host " PASSED ✅" -ForegroundColor Green
        # Grab first seeded product ID for subsequent tests if available
        if ($res.products.Count -gt 0) {
            $testProductId = $res.products[0]._id
        }
    } else {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌" -ForegroundColor Red
}

# ── 5. Trigger Scraper (Dual-Mode & Fallback test) ───────────────────────────
Write-Host "[TEST 5/12] POST /products/search (Scraping Trigger)..." -NoNewline
$scrapeBody = @{
    url = "https://www.flipkart.com/apple-iphone-15-pro-max-256-gb/p/itm12345"
    store = "flipkart"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/products/search" -Method Post -Body $scrapeBody -Headers $headers
    if ($res.success -eq $true -and $res.product) {
        Write-Host " PASSED ✅" -ForegroundColor Green
        if (-not $testProductId) {
            $testProductId = $res.product._id
        }
    } else {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌" -ForegroundColor Red
}

# ── 6. Get Product Details ───────────────────────────────────────────────────
Write-Host "[TEST 6/12] GET /products/:id (Fetch Product Details)..." -NoNewline
if ($testProductId) {
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/products/$testProductId" -Method Get
        if ($res.success -eq $true -and $res.product) {
            Write-Host " PASSED ✅" -ForegroundColor Green
        } else {
            Write-Host " FAILED ❌" -ForegroundColor Red
        }
    } catch {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} else {
    Write-Host " SKIPPED ⚠️ (No product available to query)" -ForegroundColor Yellow
}

# ── 7. Get Price History ─────────────────────────────────────────────────────
Write-Host "[TEST 7/12] GET /products/:id/history (Fetch Price History Logs)..." -NoNewline
if ($testProductId) {
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/products/$testProductId/history" -Method Get
        if ($res.success -eq $true) {
            Write-Host " PASSED ✅" -ForegroundColor Green
        } else {
            Write-Host " FAILED ❌" -ForegroundColor Red
        }
    } catch {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} else {
    Write-Host " SKIPPED ⚠️" -ForegroundColor Yellow
}

# ── 8. Add Product to Watchlist (Auth Guards check) ──────────────────────────
Write-Host "[TEST 8/12] POST /users/watchlist/:productId (Modify Watchlist)..." -NoNewline
if ($testProductId -and $jwtToken) {
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/users/watchlist/$testProductId" -Method Post -Headers $headers
        if ($res.success -eq $true) {
            Write-Host " PASSED ✅" -ForegroundColor Green
        } else {
            Write-Host " FAILED ❌" -ForegroundColor Red
        }
    } catch {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} else {
    Write-Host " SKIPPED ⚠️" -ForegroundColor Yellow
}

# ── 9. Configure Price Drop Alert ────────────────────────────────────────────
Write-Host "[TEST 9/12] POST /alerts (Add Price Alert Trigger)..." -NoNewline
if ($testProductId -and $jwtToken) {
    $alertBody = @{
        productId = $testProductId
        targetPrice = 69999
        notificationChannel = "email"
    } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/alerts" -Method Post -Body $alertBody -Headers $headers
        if ($res.success -eq $true) {
            Write-Host " PASSED ✅" -ForegroundColor Green
        } else {
            Write-Host " FAILED ❌" -ForegroundColor Red
        }
    } catch {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} else {
    Write-Host " SKIPPED ⚠️" -ForegroundColor Yellow
}

# ── 10. Fetch Coupon Codes ───────────────────────────────────────────────────
Write-Host "[TEST 10/12] GET /coupons (List Promo Vouchers)..." -NoNewline
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/coupons" -Method Get
    if ($res.success -eq $true) {
        Write-Host " PASSED ✅" -ForegroundColor Green
    } else {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌" -ForegroundColor Red
}

# ── 11. Cross-Platform Compare Matrix ────────────────────────────────────────
Write-Host "[TEST 11/12] POST /products/compare (Compare Store Matrix)..." -NoNewline
$compareBody = @{
    title = "Apple iPhone 15 Pro Max"
    category = "Electronics"
} | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/products/compare" -Method Post -Body $compareBody -Headers $headers
    if ($res.success -eq $true -and $res.comparison) {
        Write-Host " PASSED ✅" -ForegroundColor Green
    } else {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌" -ForegroundColor Red
}

# ── 12. AI Shopping Chatbot Agent ────────────────────────────────────────────
Write-Host "[TEST 12/12] POST /ai/chat (AI Assistant Inference)..." -NoNewline
$chatBody = @{
    message = "Is the current price of iPhone 15 a good deal?"
    productId = $testProductId
} | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/ai/chat" -Method Post -Body $chatBody -Headers $headers
    if ($res.success -eq $true) {
        Write-Host " PASSED ✅" -ForegroundColor Green
    } else {
        Write-Host " FAILED ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " FAILED ❌" -ForegroundColor Red
}

Write-Host "--------------------------------------------------------" -ForegroundColor White
Write-Host "🎉 ScoutPrice Verification Suite Finished!" -ForegroundColor Cyan

#!/usr/bin/env pwsh

Write-Host "🧪 Test Diagnóstico - Actualización de Stock" -ForegroundColor Cyan
Write-Host "=" * 60

# Login
Write-Host "`n[1] Iniciando sesión..." -ForegroundColor Yellow
$loginBody = @{
    email = "admincoder@coder.com"
    password = "adminCod3r123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod "http://localhost:8080/api/sessions/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginBody

$userId = $loginResponse.payload._id
$token = $loginResponse.token
Write-Host "✅ Login exitoso" -ForegroundColor Green

# Crear producto de prueba
Write-Host "`n[2] Creando producto de prueba..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmssffff"
$productData = @{
    title = "Test Stock Update"
    description = "Producto para diagnóstico de stock"
    price = 399.99
    stock = 15
    category = "diagnostic"
    code = "DIAG-$timestamp"
} | ConvertTo-Json

$productResponse = Invoke-RestMethod "http://localhost:8080/api/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $productData

$productId = $productResponse.product._id
$initialStock = $productResponse.product.stock
Write-Host "✅ Producto creado" -ForegroundColor Green
Write-Host "   ID: $productId" -ForegroundColor Cyan
Write-Host "   Stock inicial: $initialStock" -ForegroundColor Cyan

# Verificar stock antes de compra
Write-Host "`n[3] Verificando stock ANTES de compra..." -ForegroundColor Yellow
$stockBefore = Invoke-RestMethod "http://localhost:8080/api/products/$productId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

Write-Host "   Stock en BD: $($stockBefore.product.stock)" -ForegroundColor Cyan

# Agregar al carrito
Write-Host "`n[4] Agregando al carrito (cantidad: 5)..." -ForegroundColor Yellow
$cartData = @{
    productId = $productId
    quantity = 5
    price = 399.99
    name = "Test Stock Update"
} | ConvertTo-Json

$cartResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $cartData

Write-Host "✅ Agregado al carrito" -ForegroundColor Green

# Procesar compra
Write-Host "`n[5] Procesando compra..." -ForegroundColor Yellow
try {
    $purchaseResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/purchase" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }

    Write-Host "✅ Compra procesada" -ForegroundColor Green
    Write-Host "   Código: $($purchaseResponse.ticket.code)" -ForegroundColor Cyan
    Write-Host "   Monto: $($purchaseResponse.ticket.amount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error en compra: $_" -ForegroundColor Red
    exit 1
}

# Esperar un poco para que se procese
Start-Sleep -Seconds 1

# Verificar stock DESPUÉS de compra
Write-Host "`n[6] Verificando stock DESPUÉS de compra..." -ForegroundColor Yellow
$stockAfter = Invoke-RestMethod "http://localhost:8080/api/products/$productId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

$finalStock = $stockAfter.product.stock
$expectedStock = $initialStock - 5

Write-Host "   Stock ANTES: $initialStock" -ForegroundColor Cyan
Write-Host "   Stock DESPUÉS: $finalStock" -ForegroundColor Cyan
Write-Host "   Stock ESPERADO: $expectedStock" -ForegroundColor Cyan

if ($finalStock -eq $expectedStock) {
    Write-Host "✅ STOCK ACTUALIZADO CORRECTAMENTE" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Stock no se actualizó" -ForegroundColor Red
    Write-Host "   DIFERENCIA: $($finalStock - $expectedStock)" -ForegroundColor Red
}

# Test 2: Agregar más y procesar otra compra
Write-Host "`n[7] Segunda compra (cantidad: 3)..." -ForegroundColor Yellow
$cartData2 = @{
    productId = $productId
    quantity = 3
    price = 399.99
    name = "Test Stock Update"
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:8080/api/carts/$userId/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $cartData2 | Out-Null

try {
    $purchaseResponse2 = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/purchase" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }

    Write-Host "✅ Segunda compra procesada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en segunda compra: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Verificar stock final
Write-Host "`n[8] Verificando stock final..." -ForegroundColor Yellow
$stockFinal = Invoke-RestMethod "http://localhost:8080/api/products/$productId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

$finalFinalStock = $stockFinal.product.stock
$totalExpectedStock = $initialStock - 5 - 3

Write-Host "   Stock después 1era compra: $finalStock" -ForegroundColor Cyan
Write-Host "   Stock después 2da compra: $finalFinalStock" -ForegroundColor Cyan
Write-Host "   Stock total esperado: $totalExpectedStock" -ForegroundColor Cyan

if ($finalFinalStock -eq $totalExpectedStock) {
    Write-Host "✅ STOCK CORRECTO DESPUÉS DE MÚLTIPLES COMPRAS" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Stock incorrecto al final" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "Test finalizado" -ForegroundColor Green
Write-Host "=" * 60

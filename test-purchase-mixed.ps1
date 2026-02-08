#!/usr/bin/env pwsh

Write-Host "🧪 Test Compra Mixta - Productos Reales y Simples" -ForegroundColor Cyan
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

# Crear un producto real en BD
Write-Host "`n[2] Creando producto real en BD..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$productData = @{
    title = "Producto Real Mixto"
    description = "Producto para test de compra mixta"
    price = 499.99
    stock = 20
    category = "test-mixto"
    code = "MIXTO-$timestamp"
} | ConvertTo-Json

$productResponse = Invoke-RestMethod "http://localhost:8080/api/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $productData

$realProductId = $productResponse.product._id
Write-Host "✅ Producto real creado" -ForegroundColor Green
Write-Host "   ID: $realProductId (ObjectId)" -ForegroundColor Cyan
Write-Host "   Stock inicial: $($productResponse.product.stock)" -ForegroundColor Cyan

# Agregar producto REAL al carrito
Write-Host "`n[3] Agregando producto real al carrito..." -ForegroundColor Yellow
$cartData1 = @{
    productId = $realProductId
    quantity = 3
    price = 499.99
    name = "Producto Real Mixto"
} | ConvertTo-Json

$cartResponse1 = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $cartData1

Write-Host "✅ Producto real agregado" -ForegroundColor Green
Write-Host "   Cantidad: 3" -ForegroundColor Cyan

# Agregar producto SIMPLE al carrito
Write-Host "`n[4] Agregando producto simple al carrito..." -ForegroundColor Yellow
$cartData2 = @{
    productId = "demo-simple"
    quantity = 2
    price = 199.99
    name = "Producto Demo Simple"
} | ConvertTo-Json

$cartResponse2 = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $cartData2

Write-Host "✅ Producto simple agregado" -ForegroundColor Green
Write-Host "   Cantidad: 2" -ForegroundColor Cyan

# Ver carrito
Write-Host "`n[5] Visualizando carrito completo..." -ForegroundColor Yellow
$cartViewResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

Write-Host "✅ Carrito con $($cartViewResponse.cart.products.Count) productos" -ForegroundColor Green
Write-Host "   Total: $($cartViewResponse.cart.totalPrice)" -ForegroundColor Cyan
foreach ($product in $cartViewResponse.cart.products) {
    Write-Host "   - $($product.name): $($product.quantity) x $($product.price)" -ForegroundColor Gray
}

# Procesar compra
Write-Host "`n[6] Procesando compra mixta..." -ForegroundColor Yellow
try {
    $purchaseResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/purchase" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }

    Write-Host "✅ Compra procesada exitosamente" -ForegroundColor Green
    Write-Host "   Código: $($purchaseResponse.ticket.code)" -ForegroundColor Cyan
    Write-Host "   Monto: $($purchaseResponse.ticket.amount)" -ForegroundColor Cyan
    Write-Host "   Productos: $($purchaseResponse.ticket.products.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al procesar compra: $_" -ForegroundColor Red
    exit 1
}

# Verificar stock del producto real
Write-Host "`n[7] Verificando stock del producto real..." -ForegroundColor Yellow
$productCheckResponse = Invoke-RestMethod "http://localhost:8080/api/products/$realProductId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

$finalStock = $productCheckResponse.product.stock
$expectedStock = 20 - 3

Write-Host "   Stock antes: 20 unidades" -ForegroundColor Cyan
Write-Host "   Cantidad comprada: 3 unidades" -ForegroundColor Cyan
Write-Host "   Stock después: $finalStock unidades" -ForegroundColor Cyan
Write-Host "   Stock esperado: $expectedStock unidades" -ForegroundColor Cyan

if ($finalStock -eq $expectedStock) {
    Write-Host "✅ Stock actualizado correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Stock incorrecto" -ForegroundColor Red
}

# Verificar carrito vacío
Write-Host "`n[8] Verificando carrito vacío..." -ForegroundColor Yellow
$cartCheckResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

if ($cartCheckResponse.cart.products.Count -eq 0) {
    Write-Host "✅ Carrito vaciado correctamente después de compra" -ForegroundColor Green
} else {
    Write-Host "❌ Carrito aún tiene productos" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ Test de compra mixta finalizado exitosamente" -ForegroundColor Green
Write-Host "=" * 60

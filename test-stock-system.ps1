#!/usr/bin/env pwsh

Write-Host "🧪 Test Sistema de Stock - Compras y Inventario" -ForegroundColor Cyan
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
Write-Host "   User ID: $userId"
Write-Host "   Token: $($token.Substring(0, 20))..."

# Crear un nuevo producto
Write-Host "`n[2] Creando nuevo producto..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$productData = @{
    title = "Producto Test Stock"
    description = "Producto para probar el sistema de stock"
    price = 599.99
    stock = 10
    category = "test"
    code = "TEST-STOCK-$timestamp"
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
Write-Host "   Producto ID: $productId"
Write-Host "   Stock inicial: $initialStock unidades"

# Agregar producto al carrito
Write-Host "`n[3] Agregando producto al carrito..." -ForegroundColor Yellow
$cartData = @{
    productId = $productId
    quantity = 3
    price = 599.99
    name = "Producto Test Stock"
} | ConvertTo-Json

$cartResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $cartData

Write-Host "✅ Producto agregado al carrito" -ForegroundColor Green
Write-Host "   Cantidad en carrito: 3 unidades"
Write-Host "   Total carrito: $($cartResponse.cart.totalPrice)"

# Ver carrito
Write-Host "`n[4] Visualizando carrito..." -ForegroundColor Yellow
$cartViewResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

Write-Host "✅ Carrito visualizado" -ForegroundColor Green
Write-Host "   Productos: $($cartViewResponse.cart.products.Count)"
Write-Host "   Total: $($cartViewResponse.cart.totalPrice)"

# Procesar compra (debe restar stock)
Write-Host "`n[5] Procesando compra..." -ForegroundColor Yellow
$purchaseResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/purchase" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }

$ticketCode = $purchaseResponse.ticket.code
Write-Host "✅ Compra procesada" -ForegroundColor Green
Write-Host "   Código de ticket: $ticketCode"
Write-Host "   Monto: $($purchaseResponse.ticket.amount)"

# Verificar stock del producto
Write-Host "`n[6] Verificando stock del producto..." -ForegroundColor Yellow
$productCheckResponse = Invoke-RestMethod "http://localhost:8080/api/products/$productId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

$finalStock = $productCheckResponse.product.stock
$expectedStock = $initialStock - 3

Write-Host "   Stock inicial: $initialStock unidades" -ForegroundColor Cyan
Write-Host "   Cantidad comprada: 3 unidades" -ForegroundColor Cyan
Write-Host "   Stock final (B.D.): $finalStock unidades" -ForegroundColor Cyan
Write-Host "   Stock esperado: $expectedStock unidades" -ForegroundColor Cyan

if ($finalStock -eq $expectedStock) {
    Write-Host "✅ Stock actualizado correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Stock no coincide" -ForegroundColor Red
}

# Verificar compras del usuario
Write-Host "`n[7] Verificando historial de compras..." -ForegroundColor Yellow
$ticketsResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/tickets" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

Write-Host "✅ Historial de compras" -ForegroundColor Green
Write-Host "   Total de compras: $($ticketsResponse.total)"
Write-Host "   Última compra: Código $ticketCode"

# Agregar más productos al carrito y procesar otra compra
Write-Host "`n[8] Realizando segunda compra..." -ForegroundColor Yellow
$cartData2 = @{
    productId = $productId
    quantity = 2
    price = 599.99
    name = "Producto Test Stock"
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:8080/api/carts/$userId/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $cartData2 | Out-Null

$purchaseResponse2 = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/purchase" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }

Write-Host "✅ Segunda compra procesada" -ForegroundColor Green

# Verificar stock final
Write-Host "`n[9] Verificando stock final..." -ForegroundColor Yellow
$productFinalResponse = Invoke-RestMethod "http://localhost:8080/api/products/$productId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

$finalStockAfterSecondPurchase = $productFinalResponse.product.stock
$totalExpectedStock = $initialStock - 3 - 2

Write-Host "   Stock después de primera compra: $expectedStock unidades"
Write-Host "   Stock después de segunda compra: $finalStockAfterSecondPurchase unidades"
Write-Host "   Stock total esperado: $totalExpectedStock unidades"

if ($finalStockAfterSecondPurchase -eq $totalExpectedStock) {
    Write-Host "✅ Stock correcto después de múltiples compras" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Stock no coincide" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ Test finalizado exitosamente" -ForegroundColor Green
Write-Host "=" * 60

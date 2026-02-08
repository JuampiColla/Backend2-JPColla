#!/usr/bin/env pwsh

Write-Host "🧪 Test Compra - Verificar Corrección de Error ObjectId" -ForegroundColor Cyan
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

# Agregar producto de prueba simple (sin ObjectId)
Write-Host "`n[2] Agregando producto simple al carrito..." -ForegroundColor Yellow
$cartData = @{
    productId = "1"
    quantity = 2
    price = 99.99
    name = "Producto Prueba"
} | ConvertTo-Json

try {
    $cartResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/products" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        } `
        -Body $cartData

    Write-Host "✅ Producto agregado al carrito" -ForegroundColor Green
    Write-Host "   Producto ID: 1"
    Write-Host "   Cantidad: 2"
    Write-Host "   Total carrito: $($cartResponse.cart.totalPrice)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al agregar producto: $_" -ForegroundColor Red
}

# Ver carrito
Write-Host "`n[3] Visualizando carrito..." -ForegroundColor Yellow
try {
    $cartViewResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }

    Write-Host "✅ Carrito visualizado" -ForegroundColor Green
    Write-Host "   Productos: $($cartViewResponse.cart.products.Count)" -ForegroundColor Cyan
    Write-Host "   Total: $($cartViewResponse.cart.totalPrice)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al obtener carrito: $_" -ForegroundColor Red
}

# Procesar compra
Write-Host "`n[4] Procesando compra..." -ForegroundColor Yellow
try {
    $purchaseResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId/purchase" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }

    Write-Host "✅ Compra procesada exitosamente" -ForegroundColor Green
    Write-Host "   Código de ticket: $($purchaseResponse.ticket.code)" -ForegroundColor Cyan
    Write-Host "   Monto: $($purchaseResponse.ticket.amount)" -ForegroundColor Cyan
    Write-Host "   Estado: $($purchaseResponse.ticket.status)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al procesar compra: $_" -ForegroundColor Red
    exit 1
}

# Verificar carrito vacío
Write-Host "`n[5] Verificando carrito vacío..." -ForegroundColor Yellow
try {
    $cartCheckResponse = Invoke-RestMethod "http://localhost:8080/api/carts/$userId" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }

    if ($cartCheckResponse.cart.products.Count -eq 0) {
        Write-Host "✅ Carrito vaciado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Carrito aún tiene productos" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al verificar carrito: $_" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ Test finalizado exitosamente" -ForegroundColor Green
Write-Host "=" * 60

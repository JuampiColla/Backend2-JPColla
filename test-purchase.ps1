# Script de prueba: Procesar compra simulada
$baseUrl = "http://localhost:8080"
$email = "admincoder@coder.com"
$password = "adminCod3r123"

Write-Host ""
Write-Host "==== INICIANDO PRUEBA DE COMPRA ====" -ForegroundColor Cyan

# 1. LOGIN
Write-Host ""
Write-Host "[1] Iniciando sesion..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod "$baseUrl/api/users/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body (ConvertTo-Json @{email=$email; password=$password})

if ($loginResponse.status -eq "success") {
    $token = $loginResponse.token
    $userId = $loginResponse.user._id
    Write-Host "[OK] Login exitoso" -ForegroundColor Green
    Write-Host "    Usuario: $($loginResponse.user.email)"
    Write-Host "    ID: $userId"
} else {
    Write-Host "[ERROR] Error en login" -ForegroundColor Red
    exit 1
}

# 2. AGREGAR PRODUCTOS AL CARRITO
Write-Host ""
Write-Host "[2] Agregando productos al carrito..." -ForegroundColor Yellow
$products = @(
    @{productId="1"; name="Laptop"; price=1000; quantity=1},
    @{productId="2"; name="Mouse"; price=50; quantity=2},
    @{productId="3"; name="Teclado"; price=150; quantity=1}
)

$totalPrice = 0
foreach ($product in $products) {
    $addRes = Invoke-RestMethod "$baseUrl/api/carts/$userId/products" -Method POST `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $token"
        } `
        -Body (ConvertTo-Json $product)
    
    if ($addRes.status -eq "success") {
        $itemTotal = $product.price * $product.quantity
        $totalPrice += $itemTotal
        Write-Host "    [OK] $($product.name) x$($product.quantity) = `$$itemTotal" -ForegroundColor Green
    }
}

# 3. VER CARRITO
Write-Host ""
Write-Host "[3] Consultando carrito..." -ForegroundColor Yellow
$cartRes = Invoke-RestMethod "$baseUrl/api/carts/$userId" -Method GET `
    -Headers @{"Authorization"="Bearer $token"}

if ($cartRes.status -eq "success") {
    Write-Host "    [OK] Carrito obtenido" -ForegroundColor Green
    Write-Host "    Productos: $($cartRes.cart.products.Count)"
    Write-Host "    Total: `$$($cartRes.cart.totalPrice)"
}

# 4. PROCESAR COMPRA
Write-Host ""
Write-Host "[4] Procesando compra..." -ForegroundColor Yellow
$purchaseRes = Invoke-RestMethod "$baseUrl/api/carts/$userId/purchase" -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $token"
    } `
    -Body "{}"

if ($purchaseRes.status -eq "success") {
    Write-Host ""
    Write-Host "[OK] COMPRA PROCESADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "    Codigo de Ticket: $($purchaseRes.ticket.code)"
    Write-Host "    Monto Total: `$$($purchaseRes.ticket.amount)"
    Write-Host "    Estado: $($purchaseRes.ticket.status)"
    Write-Host ""
    Write-Host "    Productos comprados:"
    foreach ($prod in $purchaseRes.ticket.products) {
        $subtotal = $prod.price * $prod.quantity
        Write-Host "    - $($prod.name) x$($prod.quantity) = `$$subtotal"
    }
} else {
    Write-Host "[ERROR] $($purchaseRes.message)" -ForegroundColor Red
    exit 1
}

# 5. VERIFICAR CARRITO VACIO
Write-Host ""
Write-Host "[5] Verificando carrito..." -ForegroundColor Yellow
$emptyCartRes = Invoke-RestMethod "$baseUrl/api/carts/$userId" -Method GET `
    -Headers @{"Authorization"="Bearer $token"}

if ($emptyCartRes.cart.products.Count -eq 0) {
    Write-Host "    [OK] Carrito vaciado correctamente" -ForegroundColor Green
}

# 6. OBTENER TICKETS
Write-Host ""
Write-Host "[6] Consultando tickets del usuario..." -ForegroundColor Yellow
$ticketsRes = Invoke-RestMethod "$baseUrl/api/carts/$userId/tickets" -Method GET `
    -Headers @{"Authorization"="Bearer $token"}

if ($ticketsRes.status -eq "success") {
    Write-Host "    [OK] Total de tickets: $($ticketsRes.total)" -ForegroundColor Green
}

Write-Host ""
Write-Host "==== PRUEBA COMPLETADA ===" -ForegroundColor Green
Write-Host ""

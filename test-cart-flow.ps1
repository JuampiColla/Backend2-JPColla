Write-Host "PRUEBA DE FLUJO DEL CARRITO`n"

try {
    Write-Host "1. Iniciando sesion..."
    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/sessions/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admincoder@coder.com","password":"adminCod3r123"}'
    
    $userId = $loginRes.payload._id
    $token = $loginRes.token
    Write-Host "[OK] Usuario: $userId`n"

    Write-Host "2. Agregando Producto 1..."
    $add1 = Invoke-RestMethod -Uri "http://localhost:8080/api/carts/$userId/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body '{"productId":"1","quantity":2,"price":100,"name":"Producto 1"}'
    Write-Host "[OK] Productos: $($add1.cart.products.Length), Total: $($add1.cart.totalPrice)`n"

    Write-Host "3. Agregando Producto 2..."
    $add2 = Invoke-RestMethod -Uri "http://localhost:8080/api/carts/$userId/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body '{"productId":"2","quantity":1,"price":200,"name":"Producto 2"}'
    Write-Host "[OK] Productos: $($add2.cart.products.Length), Total: $($add2.cart.totalPrice)`n"

    Write-Host "4. Agregando Producto 3..."
    $add3 = Invoke-RestMethod -Uri "http://localhost:8080/api/carts/$userId/products" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body '{"productId":"3","quantity":3,"price":150,"name":"Producto 3"}'
    Write-Host "[OK] Productos: $($add3.cart.products.Length), Total: $($add3.cart.totalPrice)`n"

    Write-Host "5. Obteniendo carrito completo..."
    $cart = Invoke-RestMethod -Uri "http://localhost:8080/api/carts/$userId" -Method GET -Headers @{"Authorization"="Bearer $token"}
    
    Write-Host "[OK] Productos: $($cart.cart.products.Length)`n"
    
    foreach ($item in $cart.cart.products) {
        Write-Host "  - $($item.name)"
        Write-Host "    Precio: $($item.price) | Cantidad: $($item.quantity) | Subtotal: $($item.price * $item.quantity)"
    }
    
    Write-Host "`nCARRITO TOTAL: $($cart.cart.totalPrice)`n"
    Write-Host "[EXITO] PRUEBA COMPLETADA SIN ERRORES"

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Respuesta: $body"
    }
}

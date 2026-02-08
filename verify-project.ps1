# Script de verificacion del proyecto Backend2-JPColla (PowerShell)

Write-Host "VERIFICACION DEL PROYECTO Backend2-JPColla" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""

$PASS = 0
$FAIL = 0
$WARN = 0

function Check {
    param(
        [string]$Message,
        [bool]$Success
    )
    
    if ($Success) {
        Write-Host "[OK] $Message" -ForegroundColor Green
        $script:PASS++
    } else {
        Write-Host "[FAIL] $Message" -ForegroundColor Red
        $script:FAIL++
    }
}

function Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
    $script:WARN++
}

function FileContains {
    param(
        [string]$FilePath,
        [string]$Pattern
    )
    
    if ((Test-Path $FilePath) -eq $false) {
        return $false
    }
    
    $content = Get-Content $FilePath -Raw
    return $content -match $Pattern
}

# CRITERIO 1: Modelo de Usuario y bcrypt
Write-Host ""
Write-Host "CRITERIO 1: Modelo de Usuario y bcrypt" -ForegroundColor Cyan
Write-Host "----------------------------------------"

if (Test-Path "models/user.model.js") {
    Check "models/user.model.js existe" $true
    
    if (FileContains "models/user.model.js" "cart") {
        Check "Campo 'cart' encontrado" $true
    } else {
        Check "Campo 'cart' encontrado" $false
    }
    
    if (FileContains "models/user.model.js" "role.*default") {
        Check "Campo 'role' con default" $true
    } else {
        Warn "Campo 'role' sin default 'user'"
    }
} else {
    Check "models/user.model.js existe" $false
}

if (Test-Path "models/cart.model.js") {
    Check "models/cart.model.js existe" $true
} else {
    Check "models/cart.model.js existe" $false
}

if (Test-Path "config/passport.config.js") {
    if (FileContains "config/passport.config.js" "hashSync") {
        Check "bcrypt.hashSync implementado" $true
    } else {
        Check "bcrypt.hashSync implementado" $false
    }
    
    if (FileContains "config/passport.config.js" "compareSync") {
        Check "bcrypt.compareSync implementado" $true
    } else {
        Check "bcrypt.compareSync implementado" $false
    }
}

Write-Host ""
Write-Host "CRITERIO 2: Estrategias de Passport" -ForegroundColor Cyan
Write-Host "--------------------------------------"

if (Test-Path "config/passport.config.js") {
    Check "config/passport.config.js existe" $true
    
    if (FileContains "config/passport.config.js" "passport.use.*'register'") {
        Check "Estrategia 'register' encontrada" $true
    } else {
        Check "Estrategia 'register' encontrada" $false
    }
    
    if (FileContains "config/passport.config.js" "passport.use.*'login'") {
        Check "Estrategia 'login' encontrada" $true
    } else {
        Check "Estrategia 'login' encontrada" $false
    }
    
    if (FileContains "config/passport.config.js" "passport.use.*'current'") {
        Check "Estrategia JWT 'current' encontrada [CRITICO]" $true
    } else {
        Check "Estrategia JWT 'current' encontrada [CRITICO]" $false
    }
    
    if (FileContains "config/passport.config.js" "JwtStrategy|passport-jwt") {
        Check "Import de passport-jwt/JwtStrategy" $true
    } else {
        Warn "Import de passport-jwt NO encontrado"
    }
} else {
    Check "config/passport.config.js existe" $false
}

Write-Host ""
Write-Host "CRITERIO 3: Sistema de Login y JWT" -ForegroundColor Cyan
Write-Host "-------------------------------------"

if (Test-Path "utils/jwt.utils.js") {
    Check "utils/jwt.utils.js existe" $true
    
    if (FileContains "utils/jwt.utils.js" "generateToken") {
        Check "Función generateToken existe" $true
    }
    
    if (FileContains "utils/jwt.utils.js" "jwt.sign") {
        Check "jwt.sign implementado" $true
    }
    
    if (FileContains "utils/jwt.utils.js" "httpOnly.*true") {
        Check "Cookie HttpOnly configurada" $true
    }
    
    if (FileContains "utils/jwt.utils.js" "signed.*true") {
        Check "Cookie firmada configurada" $true
    }
} else {
    Warn "utils/jwt.utils.js NO existe"
}

Write-Host ""
Write-Host "CRITERIO 4: Endpoint /api/sessions/current" -ForegroundColor Cyan
Write-Host "---------------------------------------------"

$SESSION_ROUTE = $null
if (Test-Path "routes/api/sessions.routes.js") {
    $SESSION_ROUTE = "routes/api/sessions.routes.js"
} elseif (Test-Path "routes/sessions.routes.js") {
    $SESSION_ROUTE = "routes/sessions.routes.js"
} elseif (Test-Path "routes/api/users.routes.js") {
    $SESSION_ROUTE = "routes/api/users.routes.js"
}

if ($SESSION_ROUTE) {
    Check "Archivo de rutas encontrado: $SESSION_ROUTE" $true
    
    if (FileContains $SESSION_ROUTE "'/current'|""/current""") {
        Check "Ruta '/current' encontrada [CRITICO]" $true
        
        if (FileContains $SESSION_ROUTE "passport.authenticate\('current'\)") {
            Check "Usa passport.authenticate('current') [CRITICO]" $true
        } else {
            Check "Usa passport.authenticate('current') [CRITICO]" $false
        }
        
        if (FileContains $SESSION_ROUTE "router.get.*'/current'") {
            Check "Metodo GET para /current" $true
        } else {
            Warn "Verificar que /current sea metodo GET"
        }
    } else {
        Check "Ruta '/current' encontrada [CRITICO]" $false
    }
} else {
    Check "Archivo de rutas de sesiones encontrado" $false
}

Write-Host ""
Write-Host "DEPENDENCIAS" -ForegroundColor Cyan
Write-Host "--------------"

if (Test-Path "package.json") {
    Check "package.json existe" $true
    
    $packageJson = Get-Content "package.json" -Raw
    
    if ($packageJson -match '"passport-jwt"') {
        Check "passport-jwt en package.json" $true
    } else {
        Check "passport-jwt en package.json" $false
    }
    
    if ($packageJson -match '"bcrypt"') {
        Check "bcrypt en package.json" $true
    }
    
    if ($packageJson -match '"jsonwebtoken"') {
        Check "jsonwebtoken en package.json" $true
    }
    
    if ($packageJson -match '"passport"') {
        Check "passport en package.json" $true
    }
    
    if ($packageJson -match '"passport-local"') {
        Check "passport-local en package.json" $true
    }
    
    if ($packageJson -match '"mongoose"') {
        Check "mongoose en package.json" $true
    }
}

Write-Host ""
Write-Host "=============================================="
Write-Host "RESULTADOS DE LA VERIFICACION" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host "OK (Aprobadas): $PASS" -ForegroundColor Green
Write-Host "FAIL (Fallidas): $FAIL" -ForegroundColor Red
Write-Host "WARN (Advertencias): $WARN" -ForegroundColor Yellow
Write-Host ""

if ($FAIL -eq 0) {
    Write-Host "FELICITACIONES! El proyecto cumple con todos los criterios" -ForegroundColor Green
    exit 0
} else {
    Write-Host "El proyecto tiene $FAIL verificaciones fallidas" -ForegroundColor Red
    Write-Host ""
    Write-Host "Acciones recomendadas:"
    Write-Host "1. Revisar los [FAIL] en rojo arriba"
    Write-Host "2. Consultar EVALUACION_PROYECTO.md para mas detalles"
    Write-Host "3. Usar los archivos proporcionados para completar lo faltante"
    exit 1
}

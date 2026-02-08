#!/bin/bash

echo "🔍 VERIFICACIÓN DEL PROYECTO Backend2-JPColla"
echo "=============================================="
echo ""

PASS=0
FAIL=0
WARN=0

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAIL++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARN++))
}

echo "📋 CRITERIO 1: Modelo de Usuario y bcrypt"
echo "----------------------------------------"

# Verificar archivo user.model.js existe
if [ -f "models/user.model.js" ]; then
    check "models/user.model.js existe"
    
    # Verificar campo cart
    if grep -q "cart.*ObjectId" models/user.model.js; then
        check "Campo 'cart' con ObjectId encontrado"
    else
        echo -e "${RED}❌ Campo 'cart' NO encontrado o sin ObjectId${NC}"
        ((FAIL++))
    fi
    
    # Verificar campo role con default
    if grep -q "role.*default.*user" models/user.model.js; then
        check "Campo 'role' con default 'user'"
    else
        warn "Campo 'role' sin default 'user'"
    fi
else
    echo -e "${RED}❌ models/user.model.js NO existe${NC}"
    ((FAIL++))
fi

# Verificar modelo Cart
if [ -f "models/cart.model.js" ]; then
    check "models/cart.model.js existe"
else
    echo -e "${RED}❌ models/cart.model.js NO existe${NC}"
    ((FAIL++))
fi

# Verificar bcrypt.hashSync
if [ -f "config/passport.config.js" ]; then
    if grep -q "hashSync" config/passport.config.js; then
        check "bcrypt.hashSync implementado"
    else
        echo -e "${RED}❌ bcrypt.hashSync NO encontrado${NC}"
        ((FAIL++))
    fi
    
    if grep -q "compareSync" config/passport.config.js; then
        check "bcrypt.compareSync implementado"
    else
        echo -e "${RED}❌ bcrypt.compareSync NO encontrado${NC}"
        ((FAIL++))
    fi
fi

echo ""
echo "📋 CRITERIO 2: Estrategias de Passport"
echo "--------------------------------------"

if [ -f "config/passport.config.js" ]; then
    check "config/passport.config.js existe"
    
    # Verificar estrategia register
    if grep -q "passport.use.*'register'" config/passport.config.js; then
        check "Estrategia 'register' encontrada"
    else
        echo -e "${RED}❌ Estrategia 'register' NO encontrada${NC}"
        ((FAIL++))
    fi
    
    # Verificar estrategia login
    if grep -q "passport.use.*'login'" config/passport.config.js; then
        check "Estrategia 'login' encontrada"
    else
        echo -e "${RED}❌ Estrategia 'login' NO encontrada${NC}"
        ((FAIL++))
    fi
    
    # Verificar estrategia current (CRÍTICO)
    if grep -q "passport.use.*'current'" config/passport.config.js; then
        check "Estrategia JWT 'current' encontrada ⭐"
    else
        echo -e "${RED}❌ Estrategia JWT 'current' NO encontrada ⭐ CRÍTICO${NC}"
        ((FAIL++))
    fi
    
    # Verificar import de JwtStrategy
    if grep -q "passport-jwt\|JwtStrategy" config/passport.config.js; then
        check "Import de passport-jwt/JwtStrategy"
    else
        warn "Import de passport-jwt NO encontrado"
    fi
else
    echo -e "${RED}❌ config/passport.config.js NO existe${NC}"
    ((FAIL++))
fi

echo ""
echo "📋 CRITERIO 3: Sistema de Login y JWT"
echo "-------------------------------------"

# Verificar jwt.utils.js
if [ -f "utils/jwt.utils.js" ]; then
    check "utils/jwt.utils.js existe"
    
    if grep -q "generateToken" utils/jwt.utils.js; then
        check "Función generateToken existe"
    fi
    
    if grep -q "jwt.sign" utils/jwt.utils.js; then
        check "jwt.sign implementado"
    fi
    
    if grep -q "httpOnly.*true" utils/jwt.utils.js; then
        check "Cookie HttpOnly configurada"
    fi
    
    if grep -q "signed.*true" utils/jwt.utils.js; then
        check "Cookie firmada configurada"
    fi
else
    warn "utils/jwt.utils.js NO existe"
fi

echo ""
echo "📋 CRITERIO 4: Endpoint /api/sessions/current"
echo "---------------------------------------------"

# Buscar archivo de rutas de sesiones
SESSION_ROUTE=""
if [ -f "routes/api/sessions.routes.js" ]; then
    SESSION_ROUTE="routes/api/sessions.routes.js"
elif [ -f "routes/sessions.routes.js" ]; then
    SESSION_ROUTE="routes/sessions.routes.js"
elif [ -f "routes/api/users.routes.js" ]; then
    SESSION_ROUTE="routes/api/users.routes.js"
fi

if [ -n "$SESSION_ROUTE" ]; then
    check "Archivo de rutas de sesiones encontrado: $SESSION_ROUTE"
    
    # Verificar ruta /current
    if grep -q "'/current'" "$SESSION_ROUTE" || grep -q '"/current"' "$SESSION_ROUTE"; then
        check "Ruta '/current' encontrada ⭐"
        
        # Verificar que usa passport.authenticate
        if grep -q "passport.authenticate.*'current'" "$SESSION_ROUTE"; then
            check "Usa passport.authenticate('current') ⭐"
        else
            echo -e "${RED}❌ NO usa passport.authenticate('current') ⭐ CRÍTICO${NC}"
            ((FAIL++))
        fi
        
        # Verificar que es GET
        if grep -q "router.get.*'/current'" "$SESSION_ROUTE"; then
            check "Método GET para /current"
        else
            warn "Verificar que /current sea método GET"
        fi
    else
        echo -e "${RED}❌ Ruta '/current' NO encontrada ⭐ CRÍTICO${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ Archivo de rutas de sesiones NO encontrado${NC}"
    ((FAIL++))
fi

echo ""
echo "📦 DEPENDENCIAS"
echo "--------------"

# Verificar package.json
if [ -f "package.json" ]; then
    check "package.json existe"
    
    # Verificar dependencias críticas
    if grep -q '"passport-jwt"' package.json; then
        check "passport-jwt en package.json"
    else
        echo -e "${RED}❌ passport-jwt NO está en package.json${NC}"
        ((FAIL++))
    fi
    
    if grep -q '"bcrypt"' package.json; then
        check "bcrypt en package.json"
    fi
    
    if grep -q '"jsonwebtoken"' package.json; then
        check "jsonwebtoken en package.json"
    fi
    
    if grep -q '"passport"' package.json; then
        check "passport en package.json"
    fi
    
    if grep -q '"passport-local"' package.json; then
        check "passport-local en package.json"
    fi
    
    if grep -q '"mongoose"' package.json; then
        check "mongoose en package.json"
    fi
fi

# Verificar si están instaladas
echo ""
echo "Verificando instalación de dependencias..."
if npm list passport-jwt > /dev/null 2>&1; then
    check "passport-jwt INSTALADO"
else
    echo -e "${RED}❌ passport-jwt NO INSTALADO (ejecutar: npm install passport-jwt)${NC}"
    ((FAIL++))
fi

echo ""
echo "=============================================="
echo "📊 RESULTADOS DE LA VERIFICACIÓN"
echo "=============================================="
echo -e "${GREEN}✅ Aprobadas: $PASS${NC}"
echo -e "${RED}❌ Fallidas: $FAIL${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡FELICITACIONES! El proyecto cumple con todos los criterios${NC}"
    exit 0
else
    echo -e "${RED}⚠️  El proyecto tiene $FAIL verificaciones fallidas${NC}"
    echo ""
    echo "Acciones recomendadas:"
    echo "1. Revisar los ❌ en rojo arriba"
    echo "2. Consultar EVALUACION_PROYECTO.md para más detalles"
    echo "3. Usar los archivos proporcionados para completar lo faltante"
    exit 1
fi
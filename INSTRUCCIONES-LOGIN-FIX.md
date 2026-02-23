## Instrucciones para Agregar el Modal de Autenticación

El archivo `web-app.html` ya tiene un modal de login pero le faltan las funciones JavaScript para manejarlo correctamente.

### Problema Identificado:
1. El modal existe en la línea 16170 pero usa `onsubmit="handleLogin(event)"` que NO está definido
2. Las funciones `showAuthModal()` y `hideAuthModal()` existen pero no funcionan con el login de email/password
3. Cuando inicias sesión con Google SI funciona porque usa un flujo diferente

### Solución:
Necesitas agregar estas funciones JavaScript justo antes de la línea 16210 (antes del `<script>`):

```javascript
// Variables globales para el modal de auth
let isRegisterMode = false;

// Función para mostrar el modal de auth
function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Función para ocultar el modal de auth  
function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para manejar el login con email/password
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const button = document.getElementById('loginButton');
    const errorDiv = document.getElementById('authError');
    
    // Deshabilitar botón
    button.disabled = true;
    button.textContent = 'Iniciando sesión...';
    
    try {
        // Llamar a la función signInUser que ya existe
        const result = await signInUser(email, password);
        
        if (result.success) {
            // Cerrar el modal
            hideAuthModal();
            // La UI se actualizará automáticamente por el listener onAuthStateChanged
        } else {
            // Mostrar error
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        // Rehabilitar botón
        button.disabled = false;
        button.textContent = 'Iniciar Sesión';
    }
}

// Cerrar modal si se hace clic fuera de él
window.addEventListener('click', (event) => {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        hideAuthModal();
    }
});
```

### Alternativa Rápida (RECOMENDADO):
Modifica la línea 16180 en `web-app.html` para que use una función inline:

**CAMBIA:**
```html
<form id="loginForm" onsubmit="handleLogin(event); return false;">
```

**POR:**
```html
<form id="loginForm" onsubmit="event.preventDefault(); document.getElementById('loginButton').disabled=true; signInUser(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value).then(r => { if(r.success) document.getElementById('authModal').style.display='none'; else { document.getElementById('authError').textContent=r.error; document.getElementById('authError').style.display='block'; } document.getElementById('loginButton').disabled=false; }); return false;">
```

Esto hará que el login funcione inmediatamente sin agregar más código.

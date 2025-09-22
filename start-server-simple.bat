@echo off
echo Iniciando servidor web para MultiTrack Player...
echo.
echo Tu app estara disponible en:
echo http://localhost:8000
echo http://192.168.1.173:8000
echo.
echo Abre tu navegador y ve a esa direccion
echo.

REM Intentar con diferentes opciones de Python
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    echo Python no encontrado, intentando con py...
    py -m http.server 8000 2>nul
    if %errorlevel% neq 0 (
        echo py no encontrado, intentando con python3...
        python3 -m http.server 8000 2>nul
        if %errorlevel% neq 0 (
            echo Ninguna version de Python encontrada.
            echo.
            echo SOLUCIONES:
            echo 1. Instala Python desde https://python.org
            echo 2. O usa Live Server en VS Code
            echo 3. O abre web-app.html directamente en el navegador
            echo.
            pause
            exit /b 1
        )
    )
)

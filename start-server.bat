@echo off
echo Iniciando servidor web para MultiTrack Player...
echo.
echo Tu app estara disponible en:
echo http://192.168.1.173:8000
echo.
echo Abre Safari en tu iPad y ve a esa direccion
echo.
python -m http.server 8000
pause


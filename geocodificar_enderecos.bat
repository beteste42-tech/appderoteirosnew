@echo off
echo Verificando se Python está instalado...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python não encontrado no sistema.
    echo Instalando Python...
    winget install Python.Python.3.11 --silent
    if %ERRORLEVEL% NEQ 0 (
        echo Falha ao instalar Python. Por favor, instale manualmente a partir de python.org
        pause
        exit /b 1
    )
    echo Python instalado com sucesso!
    echo Por favor, reinicie o terminal e execute este script novamente.
    pause
    exit /b 0
)

echo Python encontrado.
echo Verificando bibliotecas necessárias...
python -m pip install pandas requests

echo Iniciando processamento do arquivo CSV...
python geocodificar_enderecos.py

pause

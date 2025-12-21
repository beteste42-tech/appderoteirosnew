# Script para instalar Python usando o Chocolatey ou Baixar Diretamente

Write-Host "Verificando se Python está instalado..." -ForegroundColor Yellow

# Verifica se Python está no PATH
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python não encontrado no sistema." -ForegroundColor Red
    
    # Verifica se Chocolatey está instalado
    try {
        $chocoVersion = choco --version
        Write-Host "Chocolatey encontrado: $chocoVersion" -ForegroundColor Green
        Write-Host "Instalando Python via Chocolatey..." -ForegroundColor Yellow
        choco install python3 -y
    } catch {
        Write-Host "Chocolatey não encontrado. Baixando e instalando Python diretamente..." -ForegroundColor Yellow
        
        # Baixar o instalador do Python
        $url = "https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe"
        $output = "$env:TEMP\python-installer.exe"
        
        Write-Host "Baixando Python de $url..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $url -OutFile $output
        
        Write-Host "Instalando Python..." -ForegroundColor Yellow
        Start-Process -FilePath $output -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        
        # Limpar o instalador
        Remove-Item $output
    }
    
    Write-Host "Python instalado com sucesso!" -ForegroundColor Green
    Write-Host "Por favor, feche e reabra o PowerShell para que as alterações no PATH tenham efeito." -ForegroundColor Cyan
    exit 0
}

# Instalar bibliotecas necessárias
Write-Host "Instalando bibliotecas necessárias..." -ForegroundColor Yellow
python -m pip install pandas requests

# Executar o script de geocodificação
Write-Host "Iniciando processamento do arquivo CSV..." -ForegroundColor Yellow
python geocodificar_enderecos.py

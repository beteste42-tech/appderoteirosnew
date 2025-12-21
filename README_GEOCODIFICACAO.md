# Geocodificação de Endereços

Este documento explica como preencher as colunas de latitude e longitude no arquivo CSV de clientes usando os scripts fornecidos.

## Scripts Disponíveis

### 1. geocodificar_enderecos.py
Script principal para geocodificar endereços usando a API Nominatim do OpenStreetMap.

### 2. geocodificar_alternativo.py
Versão alternativa que pode ser executada em ambientes online como Google Colab ou Jupyter.

### 3. geocodificar_enderecos.bat
Script batch para Windows que verifica e instala o Python se necessário.

### 4. install_python.ps1
Script PowerShell para instalar o Python e as dependências.

## Como Usar

### Método 1: Online (Recomendado para Usuários Sem Python)

1. Acesse um ambiente Python online como [Google Colab](https://colab.research.google.com/).
2. Crie um novo notebook.
3. Copie e cole o conteúdo do arquivo `geocodificar_alternativo.py` em uma célula.
4. Execute a célula.
5. Faça o download do arquivo gerado "enderecos-com-coordenadas.csv".
6. Substitua o arquivo original ou crie uma cópia com o novo nome.

### Método 2: Local (Requer Python Instalado)

1. Verifique se você tem o Python instalado:
   ```
   python --version
   ```

2. Se não tiver, instale o Python usando um dos métodos:
   
   a. Execute o script PowerShell:
   ```
   powershell -ExecutionPolicy Bypass -File install_python.ps1
   ```
   
   b. Execute o script batch:
   ```
   geocodificar_enderecos.bat
   ```
   
   c. Manualmente:
   - Baixe o instalador do Python em https://www.python.org/downloads/
   - Execute o instalador com as opções padrão

3. Instale as dependências:
   ```
   python -m pip install pandas requests
   ```

4. Execute o script principal:
   ```
   python geocodificar_enderecos.py
   ```

### Método 3: Manual (Alternativa Rápida)

Se você tiver acesso a uma planilha com função de geocodificação (como Google Sheets):

1. Importe o CSV para a planilha.
2. Use uma fórmula como:
   ```
   =GEOCODE(A2 & ", " & B2 & ", " & C2)
   ```
   Onde A2, B2, C2 são as colunas de endereço, cidade e estado, respectivamente.
3. Arraste a fórmula para todas as linhas.
4. Exporte a planilha como CSV.

## Observações

- O processo de geocodificação pode demorar, pois precisa fazer uma requisição para cada endereço.
- A API do OpenStreetMap tem limites de uso (aproximadamente 1 requisição por segundo).
- Alguns endereços podem não ser encontrados ou retornar coordenadas imprecisas.
- Verifique os resultados manualmente para endereços críticos.

## Problemas Comuns

### Python não encontrado

Se você receber uma mensagem "Python não encontrado", siga as instruções do Método 2 para instalar o Python.

### Erros de conexão

Se ocorrerem erros de conexão durante a geocodificação:
- Verifique sua conexão com a internet
- Tente executar novamente mais tarde (pode ser um problema temporário da API)
- Considere usar uma API alternativa (como Google Maps API - requer chave)

### Requisição bloqueada

Se receber mensagens de "Too Many Requests":
- Aumente o valor da variável REQUEST_DELAY nos scripts (recomendado: 2-3 segundos)
- Use uma API diferente ou uma chave de API comercial

## Arquivos Gerados

- `enderecos-com-coordenadas.csv` - Arquivo com latitude e longitude preenchidos
- `ARQUIVOS/enderecos-clientes-com-coordenadas.csv` - Versão com coordenadas na pasta original

## Dica Adicional

Para uma geocodificação mais precisa e em maior escala, considere:
1. Usar APIs pagas como Google Maps Geocoding API
2. Contratar serviços especializados em geocodificação de endereços brasileiros

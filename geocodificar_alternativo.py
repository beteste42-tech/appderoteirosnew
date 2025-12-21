"""
Script alternativo para geocodificação sem dependências externas.
Este script pode ser executado online em um notebook Jupyter ou em um ambiente Python online.
"""

# Código para ser executado em um ambiente online (como Google Colab, Jupyter, etc.)
# ou após instalar as dependências necessárias localmente

import pandas as pd
import requests
import time
import json
from typing import Tuple, Optional

# Configuração da API de geocodificação (Nominatim do OpenStreetMap)
API_BASE_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    'User-Agent': 'RoteirizacaoApp/1.0 (educational purpose; contact@example.com)'
}

# Intervalo entre requisições para respeitar os limites da API
REQUEST_DELAY = 1  # 1 segundo entre cada requisição

def geocodificar_endereco(endereco: str, cidade: str, uf: str, cep: str = None) -> Tuple[Optional[float], Optional[float]]:
    """
    Função para obter latitude e longitude de um endereço usando a API Nominatim.
    
    Args:
        endereco: Endereço completo
        cidade: Nome da cidade
        uf: Sigla do estado
        cep: CEP (opcional)
    
    Returns:
        Tuple com (latitude, longitude) ou (None, None) se não encontrado
    """
    # Montar o endereço completo para consulta
    query_parts = [endereco, cidade, uf]
    if cep and len(cep) > 0:
        query_parts.insert(0, cep)
    
    query = ", ".join(query_parts)
    
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'addressdetails': 1
    }
    
    try:
        response = requests.get(API_BASE_URL, params=params, headers=HEADERS)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                latitude = float(data[0]['lat'])
                longitude = float(data[0]['lon'])
                return latitude, longitude
        
        print(f"Não foi possível geocodificar: {query}")
        return None, None
    
    except Exception as e:
        print(f"Erro ao geocodificar {query}: {str(e)}")
        return None, None

# Carregar dados do CSV diretamente (para ambiente online)
# Para uso local, substitua o caminho do arquivo
url_csv = "https://raw.githubusercontent.com/seu-usuario/roteirizacao/main/ARQUIVOS/enderecos-clientesCSV.csv"  # Substitua com a URL real

try:
    df = pd.read_csv(url_csv, sep=';')
except:
    # Se falhar o carregamento via URL, crie um DataFrame de exemplo
    print("Não foi possível carregar o arquivo da URL. Usando dados de exemplo...")
    df = pd.DataFrame({
        'codigo': [1, 2],
        'loja': [1, 2],
        'nome': ['CLIENTE EXEMPLO 1', 'CLIENTE EXEMPLO 2'],
        'endereco': ['Rua Exemplo 123', 'Avenida Exemplo 456'],
        'complemento': ['', 'Apto 101'],
        'bairro': ['Centro', 'Bairro Novo'],
        'uf': ['BA', 'SP'],
        'municipio': ['Salvador', 'São Paulo'],
        'cep': ['40000-000', '01000-000'],
        'latitude': [None, None],
        'longitude': [None, None]
    })

print(f"Processando {len(df)} endereços...")
geocodificados = 0

# Para cada linha, tenta obter as coordenadas
for index, row in df.iterrows():
    # Verifica se já possui coordenadas
    if pd.notna(row['latitude']) and pd.notna(row['longitude']):
        print(f"Linha {index+1}: Coordenadas já existem. Pulando...")
        geocodificados += 1
        continue
    
    # Constrói o endereço completo
    endereco = f"{row['endereco']}"
    if pd.notna(row['complemento']) and len(str(row['complemento']).strip()) > 0:
        endereco += f", {row['complemento']}"
    
    cidade = row['municipio']
    uf = row['uf']
    cep = str(row['cep']) if pd.notna(row['cep']) else None
    
    print(f"Processando linha {index+1}: {endereco}, {cidade}/{uf}")
    
    # Obtém as coordenadas
    latitude, longitude = geocodificar_endereco(endereco, cidade, uf, cep)
    
    # Atualiza o DataFrame
    df.at[index, 'latitude'] = latitude
    df.at[index, 'longitude'] = longitude
    
    if latitude is not None and longitude is not None:
        geocodificados += 1
    
    # Mostra o progresso
    if index % 10 == 0:
        print(f"Progresso: {index+1}/{len(df)} ({(index+1)/len(df)*100:.1f}%)")
    
    # Respeita o limite de requisições por segundo
    time.sleep(REQUEST_DELAY)

print(f"Processo concluído! {geocodificados}/{len(df)} endereços geocodificados com sucesso.")

# Salva o resultado em um novo arquivo CSV
df.to_csv("enderecos-com-coordenadas.csv", sep=';', index=False)
print("Arquivo salvo em: enderecos-com-coordenadas.csv")

# Exibe os primeiros resultados como exemplo
print("\nPrimeiros 10 resultados:")
print(df.head(10).to_string())

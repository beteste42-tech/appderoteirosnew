import pandas as pd
import requests
import time
import os
from typing import Tuple, Optional

# Configuração da API de geocodificação (Nominatim do OpenStreetMap)
# Alternativamente, você pode usar Google Maps API, Here Maps, etc.
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

def processar_arquivo_csv(input_file: str, output_file: str = None) -> None:
    """
    Processa o arquivo CSV, adicionando latitude e longitude para cada endereço.
    
    Args:
        input_file: Caminho do arquivo CSV de entrada
        output_file: Caminho do arquivo CSV de saída (opcional)
    """
    # Se não for especificado arquivo de saída, cria um com sufixo "_com_coords"
    if not output_file:
        base, ext = os.path.splitext(input_file)
        output_file = f"{base}_com_coords{ext}"
    
    # Lê o arquivo CSV
    df = pd.read_csv(input_file, sep=';')
    
    print(f"Processando {len(df)} endereços...")
    
    # Para cada linha, tenta obter as coordenadas
    for index, row in df.iterrows():
        # Verifica se já possui coordenadas
        if pd.notna(row['latitude']) and pd.notna(row['longitude']):
            print(f"Linha {index+1}: Coordenadas já existem. Pulando...")
            continue
        
        # Constrói o endereço completo
        endereco = f"{row['endereco']}"
        if pd.notna(row['complemento']) and len(row['complemento'].strip()) > 0:
            endereco += f", {row['complemento']}"
        
        cidade = row['municipio']
        uf = row['uf']
        cep = row['cep']
        
        print(f"Processando linha {index+1}: {endereco}, {cidade}/{uf}")
        
        # Obtém as coordenadas
        latitude, longitude = geocodificar_endereco(endereco, cidade, uf, cep)
        
        # Atualiza o DataFrame
        df.at[index, 'latitude'] = latitude
        df.at[index, 'longitude'] = longitude
        
        # Mostra o progresso
        if index % 10 == 0:
            print(f"Progresso: {index+1}/{len(df)} ({(index+1)/len(df)*100:.1f}%)")
        
        # Respeita o limite de requisições por segundo
        time.sleep(REQUEST_DELAY)
    
    # Salva o resultado
    df.to_csv(output_file, sep=';', index=False)
    print(f"Arquivo salvo em: {output_file}")

if __name__ == "__main__":
    # Arquivo de entrada
    arquivo_entrada = "ARQUIVOS/enderecos-clientesCSV.csv"
    
    # Arquivo de saída (opcional)
    arquivo_saida = "ARQUIVOS/enderecos-clientes-com-coordenadas.csv"
    
    # Processa o arquivo
    processar_arquivo_csv(arquivo_entrada, arquivo_saida)

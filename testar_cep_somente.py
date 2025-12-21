"""
Script para testar geocodificação usando apenas o CEP como fallback
"""

import pandas as pd
import requests
import time
import os
import urllib.parse
from typing import Tuple, Optional

# Configuração da API de geocodificação
API_BASE_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    'User-Agent': 'RoteirizacaoApp/1.0 (educational purpose; contact@example.com)'
}

# Intervalo entre requisições
REQUEST_DELAY = 2  # 2 segundos entre cada requisição

def geocodificar_completo(endereco: str, cidade: str, uf: str, cep: str = None) -> Tuple[Optional[float], Optional[float]]:
    """
    Tenta geocodificar com endereço completo, e falhando, usa apenas o CEP
    """
    # Primeiro tentativa: com endereço completo
    sucesso = geocodificar_endereco(endereco, cidade, uf, cep)
    if sucesso[0] is not None:
        return sucesso
    
    # Segunda tentativa: apenas com cidade e estado
    if cidade and uf:
        print(f"  Tentando com cidade e estado apenas...")
        params_cidade = {
            'q': f"{cidade}, {uf}, Brazil",
            'format': 'json',
            'limit': 1,
            'countrycodes': 'br',
            'addressdetails': 1
        }
        
        try:
            response = requests.get(API_BASE_URL, params=params_cidade, headers=HEADERS)
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    latitude = float(data[0]['lat'])
                    longitude = float(data[0]['lon'])
                    print(f"  ✓ Encontrado pela cidade: {latitude}, {longitude}")
                    return latitude, longitude
        except Exception as e:
            print(f"  ✗ Erro ao geocodificar por cidade: {str(e)}")
    
    # Terceira tentativa: apenas com CEP
    if cep and len(cep.strip()) > 0:
        print(f"  Tentando com CEP apenas: {cep}")
        params_cep = {
            'q': f"{cep}, Brazil",
            'format': 'json',
            'limit': 1,
            'countrycodes': 'br',
            'addressdetails': 1
        }
        
        try:
            response_cep = requests.get(API_BASE_URL, params=params_cep, headers=HEADERS)
            if response_cep.status_code == 200:
                data_cep = response_cep.json()
                if data_cep and len(data_cep) > 0:
                    latitude = float(data_cep[0]['lat'])
                    longitude = float(data_cep[0]['lon'])
                    print(f"  ✓ Encontrado pelo CEP: {latitude}, {longitude}")
                    return latitude, longitude
        except Exception as e:
            print(f"  ✗ Erro ao geocodificar por CEP: {str(e)}")
    
    print(f"  ✗ Não foi possível geocodificar por nenhum método.")
    return None, None

def geocodificar_endereco(endereco: str, cidade: str, uf: str, cep: str = None) -> Tuple[Optional[float], Optional[float]]:
    """
    Função para obter latitude e longitude de um endereço usando a API Nominatim.
    """
    # Montar o endereço completo para consulta
    query_parts = []
    
    if endereco and len(endereco.strip()) > 0:
        query_parts.append(endereco)
    
    if cidade and len(cidade.strip()) > 0:
        query_parts.append(cidade)
    
    if uf and len(uf.strip()) > 0:
        query_parts.append(uf)
    
    # Montar a query como endereços brasileiros costumam funcionar melhor
    query = ", ".join(query_parts)
    
    # Codificar a URL para caracteres especiais
    query_encoded = urllib.parse.quote(query)
    
    params = {
        'q': query_encoded,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'br',  # Limitar a busca ao Brasil
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
        
        return None, None
    
    except Exception as e:
        return None, None

def processar_arquivo_csv(input_file: str, output_file: str = None, start_line: int = 0, max_lines: int = None) -> None:
    """
    Processa o arquivo CSV, adicionando latitude e longitude para cada endereço.
    """
    if not output_file:
        base, ext = os.path.splitext(input_file)
        output_file = f"{base}_com_coords_v3{ext}"
    
    df = pd.read_csv(input_file, sep=';')
    
    if max_lines and max_lines < len(df):
        df = df.head(max_lines)
        print(f"Limitando processamento às primeiras {max_lines} linhas para teste.")
    
    print(f"Processando {len(df)} endereços a partir da linha {start_line+1}...")
    
    sucesso = 0
    falha = 0
    
    for index, row in df.iterrows():
        if index < start_line:
            continue
        
        if pd.notna(row['latitude']) and pd.notna(row['longitude']):
            print(f"Linha {index+1}: Coordenadas já existem. Pulando...")
            continue
        
        endereco = str(row['endereco']).strip()
        if pd.notna(row['complemento']) and len(str(row['complemento']).strip()) > 0:
            endereco += f", {str(row['complemento']).strip()}"
        
        cidade = str(row['municipio']).strip()
        uf = str(row['uf']).strip()
        cep = str(row['cep']).strip()
        
        print(f"Processando linha {index+1}: {endereco}, {cidade}/{uf}")
        
        latitude, longitude = geocodificar_completo(endereco, cidade, uf, cep)
        
        df.at[index, 'latitude'] = latitude
        df.at[index, 'longitude'] = longitude
        
        if latitude is not None and longitude is not None:
            sucesso += 1
        else:
            falha += 1
        
        print(f"Progresso: {index+1-start_line}/{len(df)-start_line} ({(index+1-start_line)/(len(df)-start_line)*100:.1f}%) - Sucesso: {sucesso}, Falha: {falha}")
        
        if (index - start_line + 1) % 5 == 0:
            df.to_csv(output_file, sep=';', index=False)
            print(f"Progresso salvo em: {output_file}")
        
        time.sleep(REQUEST_DELAY)
    
    df.to_csv(output_file, sep=';', index=False)
    print(f"\nArquivo final salvo em: {output_file}")
    print(f"Resumo: {sucesso} endereços geocodificados com sucesso, {falha} falhas.")

if __name__ == "__main__":
    arquivo_entrada = "ARQUIVOS/enderecos-clientesCSV.csv"
    arquivo_saida = "ARQUIVOS/enderecos-clientes-com-coordenadas-v3.csv"
    
    # Teste com apenas as primeiras linhas
    max_lines = 10  # Comente esta linha para processar todas as linhas
    
    start_line = 0
    
    processar_arquivo_csv(arquivo_entrada, arquivo_saida, start_line, max_lines)

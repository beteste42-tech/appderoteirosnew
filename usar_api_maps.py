"""
Script para usar a API do Google Maps para geocodificação
Requer uma chave de API do Google Cloud Platform

Para obter uma chave:
1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Habilite a API "Geocoding API"
4. Crie uma chave de API (Credentials)
5. Copie a chave e substitua a variável GOOGLE_API_KEY abaixo
"""

import pandas as pd
import requests
import time
import os
from typing import Tuple, Optional

# Substitua com sua chave de API do Google Maps
GOOGLE_API_KEY = "AIzaSyAYPqweXiFwIA_PP1y1tbmjZiEXgSdqIUE"  # <== COLOQUE SUA CHAVE AQUI

# URL da API de geocodificação do Google
GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"

# Intervalo entre requisições para respeitar os limites da API
REQUEST_DELAY = 0.1  # Google Maps permite mais requisições por segundo

def geocodificar_com_google(endereco: str, cidade: str, uf: str, cep: str = None) -> Tuple[Optional[float], Optional[float]]:
    """
    Função para obter latitude e longitude usando a API do Google Maps.
    
    Args:
        endereco: Endereço completo
        cidade: Nome da cidade
        uf: Sigla do estado
        cep: CEP (opcional)
    
    Returns:
        Tuple com (latitude, longitude) ou (None, None) se não encontrado
    """
    # Montar o endereço completo para consulta
    query_parts = []
    
    if endereco and len(endereco.strip()) > 0:
        query_parts.append(endereco)
    
    if cidade and len(cidade.strip()) > 0:
        query_parts.append(cidade)
    
    if uf and len(uf.strip()) > 0:
        query_parts.append(uf)
    
    if cep and len(cep.strip()) > 0:
        query_parts.append(cep)
    
    # Montar a query
    query = ", ".join(query_parts)
    
    params = {
        'address': query,
        'key': GOOGLE_API_KEY,
        'region': 'br',  # Limitar ao Brasil
        'language': 'pt-BR'  # Respostas em português
    }
    
    try:
        print(f"  Consultando: {query}")
        response = requests.get(GOOGLE_API_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'OK' and len(data['results']) > 0:
                location = data['results'][0]['geometry']['location']
                latitude = float(location['lat'])
                longitude = float(location['lng'])
                print(f"  ✓ Encontrado: {latitude}, {longitude}")
                return latitude, longitude
            else:
                status = data.get('status', 'UNKNOWN_ERROR')
                print(f"  ✗ Erro na API: {status}")
                if 'error_message' in data:
                    print(f"  Mensagem: {data['error_message']}")
                return None, None
        else:
            print(f"  ✗ Erro HTTP: {response.status_code}")
            return None, None
    
    except Exception as e:
        print(f"  ✗ Erro ao geocodificar {query}: {str(e)}")
        return None, None

def processar_arquivo_csv_google(input_file: str, output_file: str = None, start_line: int = 0) -> None:
    """
    Processa o arquivo CSV usando a API do Google Maps.
    
    Args:
        input_file: Caminho do arquivo CSV de entrada
        output_file: Caminho do arquivo CSV de saída (opcional)
        start_line: Linha inicial para processar (para retomar processamento)
    """
    # Verificar se a chave de API foi configurada
    if GOOGLE_API_KEY == "SUA_CHAVE_DE_API_AQUI":
        print("ERRO: Você precisa configurar sua chave de API do Google Maps!")
        print("Edite este arquivo e substitua 'SUA_CHAVE_DE_API_AQUI' pela sua chave real.")
        return
    
    # Se não for especificado arquivo de saída, cria um com sufixo "_com_coords"
    if not output_file:
        base, ext = os.path.splitext(input_file)
        output_file = f"{base}_com_coords_google{ext}"
    
    # Lê o arquivo CSV
    df = pd.read_csv(input_file, sep=';')
    
    print(f"Processando {len(df)} endereços a partir da linha {start_line+1}...")
    
    # Contador de sucessos
    sucesso = 0
    falha = 0
    
    # Para cada linha, tenta obter as coordenadas
    for index, row in df.iterrows():
        # Pular linhas anteriores ao ponto de início
        if index < start_line:
            continue
        
        # Verifica se já possui coordenadas
        if pd.notna(row['latitude']) and pd.notna(row['longitude']):
            print(f"Linha {index+1}: Coordenadas já existem. Pulando...")
            continue
        
        # Constrói o endereço completo
        endereco = str(row['endereco']).strip()
        if pd.notna(row['complemento']) and len(str(row['complemento']).strip()) > 0:
            endereco += f", {str(row['complemento']).strip()}"
        
        cidade = str(row['municipio']).strip()
        uf = str(row['uf']).strip()
        cep = str(row['cep']).strip()
        
        print(f"Processando linha {index+1}: {endereco}, {cidade}/{uf}")
        
        # Obtém as coordenadas usando Google Maps
        latitude, longitude = geocodificar_com_google(endereco, cidade, uf, cep)
        
        # Atualiza o DataFrame
        df.at[index, 'latitude'] = latitude
        df.at[index, 'longitude'] = longitude
        
        # Atualiza contador
        if latitude is not None and longitude is not None:
            sucesso += 1
        else:
            falha += 1
        
        # Mostra o progresso
        print(f"Progresso: {index+1-start_line}/{len(df)-start_line} ({(index+1-start_line)/(len(df)-start_line)*100:.1f}%) - Sucesso: {sucesso}, Falha: {falha}")
        
        # Salva progresso a cada 10 linhas
        if (index - start_line + 1) % 10 == 0:
            df.to_csv(output_file, sep=';', index=False)
            print(f"Progresso salvo em: {output_file}")
        
        # Respeita o limite de requisições por segundo
        time.sleep(REQUEST_DELAY)
    
    # Salva o resultado final
    df.to_csv(output_file, sep=';', index=False)
    print(f"\nArquivo final salvo em: {output_file}")
    print(f"Resumo: {sucesso} endereços geocodificados com sucesso, {falha} falhas.")

if __name__ == "__main__":
    # Arquivo de entrada
    arquivo_entrada = "ARQUIVOS/enderecos-clientesCSV.csv"
    
    # Arquivo de saída (opcional)
    arquivo_saida = "ARQUIVOS/enderecos-clientes-com-coordenadas-google.csv"
    
    # Para retomar de onde parou, descomente e ajuste a linha inicial
    start_line = 0  # Ex: 10 para começar da linha 11
    
    # Processa o arquivo
    processar_arquivo_csv_google(arquivo_entrada, arquivo_saida, start_line)

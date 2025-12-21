import pandas as pd
import requests
import time
import os
import urllib.parse
from typing import Tuple, Optional

# Configuração da API de geocodificação (Nominatim do OpenStreetMap)
API_BASE_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    'User-Agent': 'RoteirizacaoApp/1.0 (educational purpose; contact@example.com)'
}

# Intervalo entre requisições para respeitar os limites da API
REQUEST_DELAY = 2  # Aumentado para 2 segundos entre cada requisição

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
    # Formato brasileiro mais natural: Rua/Tipo, número, cidade - estado
    query_parts = []
    
    if endereco and len(endereco.strip()) > 0:
        query_parts.append(endereco)
    
    if cidade and len(cidade.strip()) > 0:
        query_parts.append(cidade)
    
    if uf and len(uf.strip()) > 0:
        query_parts.append(uf)
    
    if cep and len(cep.strip()) > 0:
        query_parts.append(cep)
    
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
        print(f"  Consultando: {query}")
        response = requests.get(API_BASE_URL, params=params, headers=HEADERS)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                latitude = float(data[0]['lat'])
                longitude = float(data[0]['lon'])
                print(f"  ✓ Encontrado: {latitude}, {longitude}")
                return latitude, longitude
            else:
                # Tentar uma abordagem alternativa se a primeira falhar
                if cep and len(cep.strip()) > 0:
                    print(f"  Tentando apenas com CEP: {cep}")
                    params_cep = {
                        'q': f"{cep}, Brazil",
                        'format': 'json',
                        'limit': 1,
                        'countrycodes': 'br',
                        'addressdetails': 1
                    }
                    
                    response_cep = requests.get(API_BASE_URL, params=params_cep, headers=HEADERS)
                    if response_cep.status_code == 200:
                        data_cep = response_cep.json()
                        if data_cep and len(data_cep) > 0:
                            latitude = float(data_cep[0]['lat'])
                            longitude = float(data_cep[0]['lon'])
                            print(f"  ✓ Encontrado pelo CEP: {latitude}, {longitude}")
                            return latitude, longitude
        
        print(f"  ✗ Não foi possível geocodificar: {query}")
        return None, None
    
    except Exception as e:
        print(f"  ✗ Erro ao geocodificar {query}: {str(e)}")
        return None, None

def processar_arquivo_csv(input_file: str, output_file: str = None, start_line: int = 0, max_lines: int = None) -> None:
    """
    Processa o arquivo CSV, adicionando latitude e longitude para cada endereço.
    
    Args:
        input_file: Caminho do arquivo CSV de entrada
        output_file: Caminho do arquivo CSV de saída (opcional)
        start_line: Linha inicial para processar (para retomar processamento)
        max_lines: Número máximo de linhas a processar (para teste)
    """
    # Se não for especificado arquivo de saída, cria um com sufixo "_com_coords"
    if not output_file:
        base, ext = os.path.splitext(input_file)
        output_file = f"{base}_com_coords{ext}"
    
    # Lê o arquivo CSV
    df = pd.read_csv(input_file, sep=';')
    
    # Limitar o número de linhas para teste, se especificado
    if max_lines and max_lines < len(df):
        df = df.head(max_lines)
        print(f"Limitando processamento às primeiras {max_lines} linhas para teste.")
    
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
        
        # Obtém as coordenadas
        latitude, longitude = geocodificar_endereco(endereco, cidade, uf, cep)
        
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
    arquivo_saida = "ARQUIVOS/enderecos-clientes-com-coordenadas.csv"
    
    # Para retomar de onde parou, descomente e ajuste a linha inicial
    start_line = 0  # Ex: 10 para começar da linha 11
    
    # Para testar com poucas linhas, descomente e ajuste o valor
    max_lines = None  # Ex: 10 para processar apenas as 10 primeiras linhas
    
    # Processa o arquivo
    processar_arquivo_csv(arquivo_entrada, arquivo_saida, start_line, max_lines)

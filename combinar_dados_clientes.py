import pandas as pd

def combinar_dados_clientes():
    """
    Combina dados de dois arquivos CSV de clientes, adicionando as colunas 'rede' e 'regiao'
    do arquivo de origem para o arquivo de destino.
    """
    
    # Caminhos dos arquivos
    arquivo_origem = "ARQUIVOS/enderecos-clientes-com-coordenadas-google - Copia2 (recuperado).csv"
    arquivo_destino = "ARQUIVOS/enderecos-clientes-com-coordenadas-google.csv"
    arquivo_saida = "ARQUIVOS/enderecos-clientes-completo.csv"
    
    # Carregar os arquivos CSV
    print("Carregando arquivos...")
    df_origem = pd.read_csv(arquivo_origem, sep=';')
    df_destino = pd.read_csv(arquivo_destino, sep=';')
    
    print(f"Arquivo de origem: {len(df_origem)} registros")
    print(f"Arquivo de destino: {len(df_destino)} registros")
    
    # Verificar se os arquivos têm as colunas necessárias
    if 'codigo' not in df_origem.columns or 'codigo' not in df_destino.columns:
        print("Erro: Ambos os arquivos devem ter a coluna 'codigo' para identificar os registros correspondentes")
        return
    
    if 'rede' not in df_origem.columns or 'regiao' not in df_origem.columns:
        print("Erro: Arquivo de origem não tem as colunas 'rede' e 'regiao'")
        return
    
    # Adicionar colunas 'rede' e 'regiao' ao arquivo de destino
    # Inicializar com valores vazios
    df_destino['rede'] = ''
    df_destino['regiao'] = ''
    
    # Dicionário para mapear código -> rede, regiao
    mapeamento = {}
    
    # Criar mapeamento do arquivo de origem
    for _, row in df_origem.iterrows():
        codigo = str(row['codigo']).strip()
        rede = str(row['rede']).strip() if pd.notna(row['rede']) else ''
        regiao = str(row['regiao']).strip() if pd.notna(row['regiao']) else ''
        
        if codigo:
            mapeamento[codigo] = {'rede': rede, 'regiao': regiao}
    
    print(f"Mapeamento criado com {len(mapeamento)} códigos únicos")
    
    # Aplicar mapeamento ao arquivo de destino
    atualizados = 0
    nao_encontrados = 0
    
    for index, row in df_destino.iterrows():
        codigo = str(row['codigo']).strip()
        
        if codigo in mapeamento:
            df_destino.at[index, 'rede'] = mapeamento[codigo]['rede']
            df_destino.at[index, 'regiao'] = mapeamento[codigo]['regiao']
            atualizados += 1
        else:
            nao_encontrados += 1
    
    print(f"Registros atualizados: {atualizados}")
    print(f"Registros não encontrados no mapeamento: {nao_encontrados}")
    
    # Salvar o resultado
    df_destino.to_csv(arquivo_saida, sep=';', index=False)
    print(f"Arquivo combinado salvo em: {arquivo_saida}")
    
    # Mostrar amostra dos dados combinados
    print("\nAmostra dos dados combinados:")
    print(df_destino[['codigo', 'nome', 'rede', 'regiao']].head(10).to_string(index=False))
    
    return df_destino

if __name__ == "__main__":
    combinar_dados_clientes()

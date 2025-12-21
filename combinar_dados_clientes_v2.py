import pandas as pd

def combinar_dados_clientes():
    """
    Combina dados de dois arquivos CSV de clientes, adicionando as colunas 'rede' e 'regiao'
    do arquivo de origem para o arquivo de destino.
    
    Versão 2: Usa múltiplos identificadores (codigo, loja, nome) para melhor correspondência.
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
    
    # Dicionário para mapear (codigo, loja) -> rede, regiao
    mapeamento_codigo = {}
    mapeamento_nome = {}
    
    # Criar mapeamento do arquivo de origem usando código e loja
    for _, row in df_origem.iterrows():
        codigo = str(row['codigo']).strip()
        loja = str(row['loja']).strip() if pd.notna(row['loja']) else None
        nome = str(row['nome']).strip() if pd.notna(row['nome']) else None
        
        rede = str(row['rede']).strip() if pd.notna(row['rede']) else ''
        regiao = str(row['regiao']).strip() if pd.notna(row['regiao']) else ''
        
        # Mapeamento por código
        if codigo:
            if codigo not in mapeamento_codigo:
                mapeamento_codigo[codigo] = []
            mapeamento_codigo[codigo].append({'rede': rede, 'regiao': regiao, 'loja': loja})
        
        # Mapeamento por nome
        if nome:
            mapeamento_nome[nome] = {'rede': rede, 'regiao': regiao, 'codigo': codigo, 'loja': loja}
    
    print(f"Mapeamento criado com {len(mapeamento_codigo)} códigos únicos")
    print(f"Mapeamento criado com {len(mapeamento_nome)} nomes únicos")
    
    # Aplicar mapeamento ao arquivo de destino
    atualizados_codigo = 0
    atualizados_nome = 0
    nao_encontrados = 0
    
    for index, row in df_destino.iterrows():
        codigo = str(row['codigo']).strip()
        loja = str(row['loja']).strip() if pd.notna(row['loja']) else None
        nome = str(row['nome']).strip() if pd.notna(row['nome']) else None
        
        atualizado = False
        
        # Tentar correspondência por código e loja
        if codigo in mapeamento_codigo:
            if loja:
                # Procurar por combinação código+loja
                for item in mapeamento_codigo[codigo]:
                    if item['loja'] == loja:
                        df_destino.at[index, 'rede'] = item['rede']
                        df_destino.at[index, 'regiao'] = item['regiao']
                        atualizados_codigo += 1
                        atualizado = True
                        break
            
            # Se não encontrou pela loja, usar o primeiro item do código
            if not atualizado and mapeamento_codigo[codigo]:
                item = mapeamento_codigo[codigo][0]
                df_destino.at[index, 'rede'] = item['rede']
                df_destino.at[index, 'regiao'] = item['regiao']
                atualizados_codigo += 1
                atualizado = True
        
        # Tentar correspondência por nome se não encontrou pelo código
        if not atualizado and nome and nome in mapeamento_nome:
            item = mapeamento_nome[nome]
            df_destino.at[index, 'rede'] = item['rede']
            df_destino.at[index, 'regiao'] = item['regiao']
            atualizados_nome += 1
            atualizado = True
        
        if not atualizado:
            nao_encontrados += 1
    
    print(f"Registros atualizados por código: {atualizados_codigo}")
    print(f"Registros atualizados por nome: {atualizados_nome}")
    print(f"Registros não encontrados no mapeamento: {nao_encontrados}")
    
    # Salvar o resultado
    df_destino.to_csv(arquivo_saida, sep=';', index=False)
    print(f"Arquivo combinado salvo em: {arquivo_saida}")
    
    # Mostrar amostra dos dados combinados
    print("\nAmostra dos dados combinados:")
    amostra = df_destino[['codigo', 'nome', 'rede', 'regiao']].head(10)
    print(amostra.to_string(index=False))
    
    # Verificar distribuição de redes
    print("\nDistribuição de redes:")
    rede_counts = df_destino['rede'].value_counts()
    print(rede_counts.head(10).to_string())
    
    return df_destino

if __name__ == "__main__":
    combinar_dados_clientes()

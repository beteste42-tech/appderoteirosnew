#!/usr/bin/env python3
"""
Script para importar clientes do CSV para o Supabase via SQL direto
"""

import csv
import sys
import os
from pathlib import Path

# Caminho do arquivo CSV
csv_path = Path(__file__).parent.parent / 'ARQUIVOS' / 'enderecos-clientesCSV.csv'

def parse_csv():
    """Lê e parseia o arquivo CSV"""
    clientes = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        # Ler CSV com delimitador ponto e vírgula
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            # Extrair dados
            codigo = row.get('Codigo', '').strip() or None
            nome_fantasia = row.get('N Fantasia', '').strip() or row.get('Nome', '').strip() or None
            
            if not nome_fantasia:
                continue  # Pular se não tiver nome
            
            # Mapear colunas
            cliente = {
                'codigo': codigo,
                'nome': nome_fantasia,
                'endereco': row.get('Endereco', '').strip() or None,
                'complemento': row.get('Complemento', '').strip() or None,
                'bairro': row.get('Bairro', '').strip() or None,
                'cidade': row.get('Municipio', '').strip() or None,
                'uf': row.get('Estado', '').strip() or None,
                'cep': row.get('CEP', '').strip() or None,
                'pais': row.get('Pais', '').strip() or None,
                'cnpj_cpf': row.get('CNPJ/CPF', '').strip() or None,
                'ins_estadual': row.get('Ins. Estad.', '').strip() or None,
                'bloqueado': row.get('Bloqueado', '').strip() or None,
                'codigo_municipio': row.get('Cd.Municipio', '').strip() or None,
                'loja': row.get('Loja', '').strip() or None,
                'vendedor': row.get('Vendedores', '').strip() or None,
            }
            
            # Converter latitude e longitude
            lat_str = row.get('Latitude', '').strip()
            lng_str = row.get('Longitude', '').strip()
            
            try:
                if lat_str:
                    lat = float(lat_str.replace(',', '.'))
                    cliente['latitude'] = lat
                else:
                    cliente['latitude'] = None
            except (ValueError, AttributeError):
                cliente['latitude'] = None
            
            try:
                if lng_str:
                    lng = float(lng_str.replace(',', '.'))
                    cliente['longitude'] = lng
                else:
                    cliente['longitude'] = None
            except (ValueError, AttributeError):
                cliente['longitude'] = None
            
            # Inferir rede do nome
            nome_upper = nome_fantasia.upper()
            rede = None
            if 'ATAC' in nome_upper or 'ATACADAO' in nome_upper:
                rede = 'ATACADAO'
            elif 'ASSAI' in nome_upper:
                rede = 'ASSAI'
            elif 'ATAKAREJO' in nome_upper:
                rede = 'ATAKAREJO'
            elif 'GBARBOSA' in nome_upper or 'G BARBOSA' in nome_upper:
                rede = 'G BARBOSA'
            elif 'RMIX' in nome_upper or 'REDEMIX' in nome_upper:
                rede = 'REDE MIX'
            elif 'HIPERIDEAL' in nome_upper or 'SERRANA' in nome_upper:
                rede = 'HIPERIDEAL'
            elif 'MATEUS' in nome_upper:
                rede = 'MATEUS'
            elif 'PERINI' in nome_upper:
                rede = 'PERINI'
            elif 'CBD' in nome_upper:
                rede = 'COMPANHIA BRASILEIRA DE DISTRIBUICAO'
            elif 'SAMS' in nome_upper:
                rede = 'SAMS'
            elif 'CDP' in nome_upper:
                rede = 'COSTA DO PLAZA'
            
            cliente['rede'] = rede
            clientes.append(cliente)
    
    return clientes

def generate_sql(clientes):
    """Gera SQL para inserir/atualizar clientes"""
    sql_statements = []
    
    for cliente in clientes:
        # Escapar aspas simples nos valores
        def escape(value):
            if value is None:
                return 'NULL'
            if isinstance(value, (int, float)):
                return str(value)
            return f"'{str(value).replace(\"'\", \"''\")}'"
        
        # Construir SQL INSERT com ON CONFLICT
        sql = f"""
INSERT INTO public.clientes (
    codigo, nome, endereco, complemento, bairro, cidade, uf, cep, pais,
    cnpj_cpf, ins_estadual, bloqueado, codigo_municipio, loja, vendedor,
    rede, latitude, longitude
) VALUES (
    {escape(cliente['codigo'])},
    {escape(cliente['nome'])},
    {escape(cliente['endereco'])},
    {escape(cliente['complemento'])},
    {escape(cliente['bairro'])},
    {escape(cliente['cidade'])},
    {escape(cliente['uf'])},
    {escape(cliente['cep'])},
    {escape(cliente['pais'])},
    {escape(cliente['cnpj_cpf'])},
    {escape(cliente['ins_estadual'])},
    {escape(cliente['bloqueado'])},
    {escape(cliente['codigo_municipio'])},
    {escape(cliente['loja'])},
    {escape(cliente['vendedor'])},
    {escape(cliente['rede'])},
    {escape(cliente['latitude'])},
    {escape(cliente['longitude'])}
)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    endereco = EXCLUDED.endereco,
    complemento = EXCLUDED.complemento,
    bairro = EXCLUDED.bairro,
    cidade = EXCLUDED.cidade,
    uf = EXCLUDED.uf,
    cep = EXCLUDED.cep,
    pais = EXCLUDED.pais,
    cnpj_cpf = EXCLUDED.cnpj_cpf,
    ins_estadual = EXCLUDED.ins_estadual,
    bloqueado = EXCLUDED.bloqueado,
    codigo_municipio = EXCLUDED.codigo_municipio,
    loja = EXCLUDED.loja,
    vendedor = EXCLUDED.vendedor,
    rede = EXCLUDED.rede,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude;
"""
        sql_statements.append(sql.strip())
    
    return sql_statements

if __name__ == '__main__':
    print('🔄 Processando CSV...')
    clientes = parse_csv()
    print(f'✅ {len(clientes)} clientes encontrados no CSV')
    
    print('📝 Gerando SQL...')
    sql_statements = generate_sql(clientes)
    
    # Salvar SQL em arquivo para execução
    sql_file = Path(__file__).parent.parent / 'scripts' / 'import_clientes.sql'
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write('-- Script gerado automaticamente para importar clientes do CSV\n')
        f.write('-- Execute este script no Supabase SQL Editor\n\n')
        for sql in sql_statements:
            f.write(sql + '\n\n')
    
    print(f'✅ SQL gerado em: {sql_file}')
    print(f'📊 Total de {len(sql_statements)} comandos SQL gerados')
    print('\n💡 Execute o arquivo SQL no Supabase SQL Editor ou use o MCP do Supabase')


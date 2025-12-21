/**
 * Script para importar clientes do CSV para o Supabase
 * Execute: node scripts/import-clientes-csv.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para parsear CSV
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Headers exatos do CSV (com maiúsculas e espaços)
  const headerLine = lines[0];
  const headers = headerLine.split(';').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || null;
    });
    
    data.push(row);
  }
  
  return data;
}

// Função para mapear dados do CSV para o formato do banco
function mapCSVToCliente(row) {
  // Mapear colunas do CSV para o banco (usando nomes exatos do CSV)
  const codigo = row['Codigo'] || null;
  const nome = row['N Fantasia'] || row['Nome'] || null; // N Fantasia é o nome do cliente
  const nomeCompleto = row['Nome'] || null; // Nome completo da empresa
  const endereco = row['Endereco'] || null;
  const complemento = row['Complemento'] || null;
  const bairro = row['Bairro'] || null;
  const cidade = row['Municipio'] || null;
  const uf = row['Estado'] || null;
  const cep = row['CEP'] || null;
  const cnpjCpf = row['CNPJ/CPF'] || null;
  const insEstadual = row['Ins. Estad.'] || null;
  const bloqueado = row['Bloqueado'] || null;
  const codigoMunicipio = row['Cd.Municipio'] || null;
  const pais = row['Pais'] || null;
  const vendedor = row['Vendedores'] || null;
  const loja = row['Loja'] || null;
  
  // Extrair rede do nome (ex: "ATAC BARROS REIS" -> rede pode ser "ATACADAO")
  let rede = null;
  if (nome) {
    if (nome.includes('ATAC') || nome.includes('ATACADAO')) rede = 'ATACADAO';
    else if (nome.includes('ASSAI')) rede = 'ASSAI';
    else if (nome.includes('ATAKAREJO')) rede = 'ATAKAREJO';
    else if (nome.includes('GBARBOSA') || nome.includes('G BARBOSA')) rede = 'G BARBOSA';
    else if (nome.includes('RMIX') || nome.includes('REDEMIX')) rede = 'REDE MIX';
    else if (nome.includes('HIPERIDEAL') || nome.includes('SERRANA')) rede = 'HIPERIDEAL';
    else if (nome.includes('MATEUS')) rede = 'MATEUS';
    else if (nome.includes('PERINI')) rede = 'PERINI';
    else if (nome.includes('CBD')) rede = 'COMPANHIA BRASILEIRA DE DISTRIBUICAO';
    else if (nome.includes('SAMS')) rede = 'SAMS';
    else if (nome.includes('CDP')) rede = 'COSTA DO PLAZA';
  }
  
  // Converter latitude e longitude
  let latitude = null;
  let longitude = null;
  
  if (row['Latitude']) {
    const lat = parseFloat(String(row['Latitude']).replace(/,/g, '.'));
    if (!isNaN(lat)) latitude = lat;
  }
  
  if (row['Longitude']) {
    const lng = parseFloat(String(row['Longitude']).replace(/,/g, '.'));
    if (!isNaN(lng)) longitude = lng;
  }
  
  if (!nome) return null; // Pular se não tiver nome
  
  return {
    codigo,
    nome,
    endereco,
    complemento,
    bairro,
    cidade,
    uf,
    cep,
    cnpj_cpf: cnpjCpf,
    ins_estadual: insEstadual,
    bloqueado,
    codigo_municipio: codigoMunicipio,
    pais,
    loja,
    rede,
    vendedor,
    latitude,
    longitude,
  };
}

// Função principal
async function importarClientes() {
  try {
    console.log('🔄 Iniciando importação de clientes...');
    
    // Ler arquivo CSV
    const csvPath = path.join(__dirname, '../ARQUIVOS/enderecos-clientesCSV.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('📄 Arquivo CSV lido com sucesso');
    
    // Parsear CSV
    const csvData = parseCSV(csvContent);
    console.log(`📊 ${csvData.length} linhas encontradas no CSV`);
    
    // Mapear para formato do banco
    const clientes = csvData
      .map(mapCSVToCliente)
      .filter(c => c !== null);
    
    console.log(`✅ ${clientes.length} clientes válidos para importar`);
    
    // Inserir em lotes de 50
    const batchSize = 50;
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (let i = 0; i < clientes.length; i += batchSize) {
      const batch = clientes.slice(i, i + batchSize);
      
      try {
        // Usar upsert para atualizar se já existir (baseado no codigo que é UNIQUE)
        const { data, error } = await supabase
          .from('clientes')
          .upsert(batch, {
            onConflict: 'codigo',
            ignoreDuplicates: false
          });
        
        if (error) {
          console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, error);
          errors += batch.length;
        } else {
          inserted += batch.length;
          console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} processado: ${batch.length} clientes`);
        }
      } catch (err) {
        console.error(`❌ Erro ao processar lote ${Math.floor(i / batchSize) + 1}:`, err);
        errors += batch.length;
      }
    }
    
    console.log('\n📊 Resumo da importação:');
    console.log(`✅ ${inserted} clientes processados`);
    console.log(`❌ ${errors} erros`);
    console.log('🎉 Importação concluída!');
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

// Executar importação
importarClientes();


// Dados reais extraídos das planilhas fornecidas

// Tipos de Veículos e suas capacidades (kg) e estimativa de paletes/layout
export const VEICULOS_TYPES: Record<string, { capacity: number; pallets: number; layout: string }> = {
  'BONGO': { capacity: 1500, pallets: 3, layout: '2x2' },
  'DELIVERY': { capacity: 2500, pallets: 6, layout: '2x3' },
  '3/4': { capacity: 4500, pallets: 8, layout: '2x4' },
  'TOCO': { capacity: 8000, pallets: 12, layout: '2x6' },
  'TRUCK': { capacity: 14000, pallets: 16, layout: '2x8' }, // Alguns trucks na lista são 16000, usaremos a média ou específico na placa
  'CARRETA': { capacity: 25000, pallets: 26, layout: '2x13' },
};

export const REGIOES = [
  'Salvador', 'Camaçari', 'Feira de Santana', 'Lauro de Freitas', 
  'Simões Filho', 'Alagoinhas', 'Aracaju', 'Petrolina', 
  'Vitória da Conquista', 'Santo Antônio de Jesus', 'Juazeiro'
];

// Lista consolidada de Fretistas baseada na imagem
export const FRETISTAS = [
  { id: 1, nome: 'ALUMIDIA' },
  { id: 2, nome: 'ANDERSON' },
  { id: 3, nome: 'ANDRE' },
  { id: 4, nome: 'CONCEPT' },
  { id: 5, nome: 'DANILO' },
  { id: 6, nome: 'EDEN' },
  { id: 7, nome: 'EDNILSON' },
  { id: 8, nome: 'ELIPAJU' },
  { id: 9, nome: 'GR MORAL' },
  { id: 10, nome: 'IAGO' },
  { id: 11, nome: 'J.M.C' },
  { id: 12, nome: 'JANCLEITON' },
  { id: 13, nome: 'JOSENILSON' },
  { id: 14, nome: 'MAILSON' },
  { id: 15, nome: 'NATANAEL' },
  { id: 16, nome: 'SILVA GUEDES' }
];

// Motoristas (Como a planilha não tem coluna específica de motorista, usaremos nomes genéricos ou o próprio nome do fretista se for pessoa física)
export const MOTORISTAS = [
  'CLAUDIO SANTOS', 'ROBERTO ALMEIDA', 'MARCOS OLIVEIRA', 'ANTONIO SILVA', 
  'PAULO SOUZA', 'FERNANDO COSTA', 'JOSE LIMA', 'CARLOS PEREIRA',
  'ANDERSON SILVA', 'DANILO SANTOS', 'EDEN OLIVEIRA', 'EDNILSON COSTA'
];

// Dados Reais da Planilha de Veículos
export const PLACAS = [
  { placa: 'PJN1652', tipo: '3/4', fretista: 'ALUMIDIA', capacidade: 4500, motoristaPadrao: 'CLAUDIO SANTOS' },
  { placa: 'BRY9A41', tipo: 'DELIVERY', fretista: 'ANDERSON', capacidade: 2500, motoristaPadrao: 'ANDERSON SILVA' },
  { placa: 'LST7H05', tipo: '3/4', fretista: 'ANDRE', capacidade: 4500, motoristaPadrao: 'ANDRE LIMA' },
  { placa: 'OUP3A92', tipo: 'TRUCK', fretista: 'CONCEPT', capacidade: 16000, motoristaPadrao: 'MARCOS OLIVEIRA' },
  { placa: 'PJS5H00', tipo: 'TRUCK', fretista: 'CONCEPT', capacidade: 16000, motoristaPadrao: 'ANTONIO SILVA' },
  { placa: 'PJA3D26', tipo: 'TRUCK', fretista: 'CONCEPT', capacidade: 16000, motoristaPadrao: 'PAULO SOUZA' },
  { placa: 'QKY0D59', tipo: 'DELIVERY', fretista: 'DANILO', capacidade: 2500, motoristaPadrao: 'DANILO SANTOS' },
  { placa: 'JOP0J97', tipo: '3/4', fretista: 'EDEN', capacidade: 4500, motoristaPadrao: 'EDEN OLIVEIRA' },
  { placa: 'PJF6530', tipo: 'BONGO', fretista: 'EDNILSON', capacidade: 1500, motoristaPadrao: 'EDNILSON COSTA' },
  
  // ELIPAJU (Lista Extensa)
  { placa: 'JPX8747', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'FERNANDO COSTA' },
  { placa: 'NVM5109', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'JOSE LIMA' },
  { placa: 'JOU8522', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'CARLOS PEREIRA' },
  { placa: 'NZK8A92', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'ROBERTO ALMEIDA' },
  { placa: 'OKL5405', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'MARCOS OLIVEIRA' },
  { placa: 'ORI2G75', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'ANTONIO SILVA' },
  { placa: 'PEF3B50', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'PAULO SOUZA' },
  { placa: 'PEY9D15', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'FERNANDO COSTA' },
  { placa: 'PJA3D26-2', tipo: '3/4', fretista: 'ELIPAJU', capacidade: 4500, motoristaPadrao: 'JOSE LIMA' }, // Renomeado para evitar duplicidade
  { placa: 'DVA3G04', tipo: 'TOCO', fretista: 'ELIPAJU', capacidade: 8000, motoristaPadrao: 'CARLOS PEREIRA' },
  { placa: 'IAD5528', tipo: 'TOCO', fretista: 'ELIPAJU', capacidade: 8000, motoristaPadrao: 'CLAUDIO SANTOS' },
  { placa: 'JQB8F32', tipo: 'TOCO', fretista: 'ELIPAJU', capacidade: 8000, motoristaPadrao: 'ROBERTO ALMEIDA' },
  { placa: 'PST5A22', tipo: 'TOCO', fretista: 'ELIPAJU', capacidade: 8000, motoristaPadrao: 'MARCOS OLIVEIRA' },

  // GR MORAL
  { placa: 'NYL1B84', tipo: 'TOCO', fretista: 'GR MORAL', capacidade: 8000, motoristaPadrao: 'ANTONIO SILVA' },
  { placa: 'NZY7881', tipo: 'TOCO', fretista: 'GR MORAL', capacidade: 8000, motoristaPadrao: 'PAULO SOUZA' },
  { placa: 'OKV2567', tipo: 'TOCO', fretista: 'GR MORAL', capacidade: 8000, motoristaPadrao: 'FERNANDO COSTA' },

  // OUTROS
  { placa: 'CVP7I47', tipo: '3/4', fretista: 'IAGO', capacidade: 4500, motoristaPadrao: 'IAGO SILVA' },
  { placa: 'OUO2501', tipo: '3/4', fretista: 'J.M.C', capacidade: 4500, motoristaPadrao: 'JOSE MARIA' },
  { placa: 'OEP9E84', tipo: '3/4', fretista: 'J.M.C', capacidade: 4500, motoristaPadrao: 'JOAO CARLOS' },
  { placa: 'OZM8C48', tipo: '3/4', fretista: 'J.M.C', capacidade: 4500, motoristaPadrao: 'JOSE MANUEL' },
  { placa: 'PJU8H76', tipo: '3/4', fretista: 'J.M.C', capacidade: 4500, motoristaPadrao: 'JULIO CESAR' },
  { placa: 'OLA8363', tipo: '3/4', fretista: 'J.M.C', capacidade: 4500, motoristaPadrao: 'JORGE LUIS' },
  { placa: 'OVS8H29', tipo: '3/4', fretista: 'J.M.C', capacidade: 4500, motoristaPadrao: 'JONAS SILVA' },
  
  { placa: 'LRC9H40', tipo: 'DELIVERY', fretista: 'JANCLEITON', capacidade: 2500, motoristaPadrao: 'JANCLEITON SOUZA' },
  { placa: 'PLK2C22', tipo: 'BONGO', fretista: 'JOSENILSON', capacidade: 1500, motoristaPadrao: 'JOSENILSON LIMA' },
  { placa: 'JMS5E44', tipo: '3/4', fretista: 'MAILSON', capacidade: 4500, motoristaPadrao: 'MAILSON COSTA' },
  { placa: 'OSF8808', tipo: 'BONGO', fretista: 'NATANAEL', capacidade: 1500, motoristaPadrao: 'NATANAEL SANTOS' },
  { placa: 'NZC1E62', tipo: 'TRUCK', fretista: 'SILVA GUEDES', capacidade: 14000, motoristaPadrao: 'SILVA GUEDES' },
];

// Dados Reais da Planilha de Clientes
export const CLIENTES = [
  // ASSAI
  { id: 301648, codigo: '301648', nome: 'ASSAI GALICIA', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'BROTAS' },
  { id: 301649, codigo: '301649', nome: 'ASSAI CABULA', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'CABULA' },
  { id: 301650, codigo: '301650', nome: 'ASSAI PARIPE', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'PARIPE' },
  { id: 301660, codigo: '301660', nome: 'ASSAI CAMACARI', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'CAMACARI', uf: 'BA', bairro: 'CENTRO' },
  { id: 301661, codigo: '301661', nome: 'ASSAI FEIRA SOBRADINHO', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'SOBRADINHO' },
  { id: 301662, codigo: '301662', nome: 'ASSAI FEIRA TOMBA', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'TOMBA' },
  { id: 301663, codigo: '301663', nome: 'ASSAI JEQUIE', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'JEQUIE', uf: 'BA', bairro: 'CENTRO' },
  { id: 301664, codigo: '301664', nome: 'ASSAI JUAZEIRO RODOVIA (AREIA)', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'JUAZEIRO', uf: 'BA', bairro: 'RODOVIA' },
  { id: 301665, codigo: '301665', nome: 'ASSAI LAURO DE FREITAS', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'LAURO DE FREITAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 301666, codigo: '301666', nome: 'ASSAI MUSSURUNGA', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'MUSSURUNGA' },
  { id: 301667, codigo: '301667', nome: 'ASSAI N SRA DO SOCORRO', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'NOSSA SENHORA DO SOCORRO', uf: 'SE', bairro: 'CENTRO' },
  { id: 301668, codigo: '301668', nome: 'ASSAI NORTE (JOSE CONRADO)', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'ARACAJU', uf: 'SE', bairro: 'JOSE CONRADO' },
  { id: 301669, codigo: '301669', nome: 'ASSAI PAULO VI', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'PITUBA' },
  { id: 301670, codigo: '301670', nome: 'ASSAI RUA DA LIMA (GOLF)', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'JARDIM DAS MARGARIDAS' },
  { id: 301671, codigo: '301671', nome: 'ASSAI PETROLINA', rede: 'ASSAI', vendedor: 'MIRIAM', cidade: 'PETROLINA', uf: 'PE', bairro: 'CENTRO' },
  
  // ATACADAO
  { id: 300001, codigo: '300001', nome: 'ATAC CAJAZEIRAS', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'CAJAZEIRAS' },
  { id: 300002, codigo: '300002', nome: 'ATAC CAMACARI', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'CAMACARI', uf: 'BA', bairro: 'CENTRO' },
  { id: 300003, codigo: '300003', nome: 'ATAC CAMACARI CENTRO', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'CAMACARI', uf: 'BA', bairro: 'CENTRO' },
  { id: 300004, codigo: '300004', nome: 'ATAC FEIRA SANTANA', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'CENTRO' },
  { id: 300005, codigo: '300005', nome: 'ATAC LAURO FREITAS', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'LAURO DE FREITAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 300006, codigo: '300006', nome: 'ATAC LOBATO', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'LOBATO' },
  { id: 300007, codigo: '300007', nome: 'ATAC SAO CRISTOVAO', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'SAO CRISTOVAO' },
  { id: 300008, codigo: '300008', nome: 'ATACADAO BARROS REIS (ARATU)', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'BARROS REIS' },
  { id: 300009, codigo: '300009', nome: 'ATACADAO CAMINHO DAS ARVORES', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'CAMINHO DAS ARVORES' },
  { id: 300010, codigo: '300010', nome: 'ATACADAO FEIRA MORADA', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'MORADA' },
  { id: 300011, codigo: '300011', nome: 'ATACADAO PARQUE BELA VISTA', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'SALVADOR', uf: 'BA', bairro: 'BELA VISTA' },
  { id: 300012, codigo: '300012', nome: 'ATACADAO PETROLINA', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'PETROLINA', uf: 'PE', bairro: 'CENTRO' },
  { id: 300013, codigo: '300013', nome: 'ATACADAO SIMOES FILHO', rede: 'ATACADAO', vendedor: 'MIRIAM', cidade: 'SIMOES FILHO', uf: 'BA', bairro: 'CENTRO' },

  // ATAKAREJO
  { id: 300014, codigo: '300014', nome: 'ATAKAREJO ALAGOINHAS', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'ALAGOINHAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 300015, codigo: '300015', nome: 'ATAKAREJO ARACAJU ATALAIA', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'ARACAJU', uf: 'SE', bairro: 'ATALAIA' },
  { id: 300016, codigo: '300016', nome: 'ATAKAREJO ARACAJU FAROL', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'ARACAJU', uf: 'SE', bairro: 'FAROL' },
  { id: 300017, codigo: '300017', nome: 'ATAKAREJO BAIXA DO FISCAL', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'BAIXA DO FISCAL' },
  { id: 300018, codigo: '300018', nome: 'ATAKAREJO BOCA DO RIO', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'BOCA DO RIO' },
  { id: 300019, codigo: '300019', nome: 'ATAKAREJO CABULA', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'CABULA' },
  { id: 300020, codigo: '300020', nome: 'ATAKAREJO CAMACARI', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'CAMACARI', uf: 'BA', bairro: 'CENTRO' },
  { id: 300021, codigo: '300021', nome: 'ATAKAREJO CASTELO BRANCO', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'CASTELO BRANCO' },
  { id: 300022, codigo: '300022', nome: 'ATAKAREJO ESTRADA DO COCO', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'LAURO DE FREITAS', uf: 'BA', bairro: 'ESTRADA DO COCO' },
  { id: 300023, codigo: '300023', nome: 'ATAKAREJO FEIRA SANTANA', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'CENTRO' },
  { id: 300024, codigo: '300024', nome: 'ATAKAREJO IGUATEMI', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'IGUATEMI' },
  { id: 300025, codigo: '300025', nome: 'ATAKAREJO ITAPUA', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'ITAPUA' },
  { id: 300026, codigo: '300026', nome: 'ATAKAREJO LOBATO', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'LOBATO' },
  { id: 300027, codigo: '300027', nome: 'ATAKAREJO PARIPE', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PARIPE' },
  { id: 300028, codigo: '300028', nome: 'ATAKAREJO PERIPERI', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PERIPERI' },
  { id: 300029, codigo: '300029', nome: 'ATAKAREJO PIATA', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PIATA' },
  { id: 300030, codigo: '300030', nome: 'ATAKAREJO SAO CRISTOVAO', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'SAO CRISTOVAO' },
  { id: 300031, codigo: '300031', nome: 'ATAKAREJO SIMOES FILHO', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SIMOES FILHO', uf: 'BA', bairro: 'CENTRO' },
  { id: 300032, codigo: '300032', nome: 'ATAKAREJO VASCO DA GAMA', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'VASCO DA GAMA' },
  { id: 300033, codigo: '300033', nome: 'ATAKAREJO VIA REGIONAL', rede: 'ATAKAREJO', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'VIA REGIONAL' },

  // G BARBOSA
  { id: 300070, codigo: '300070', nome: 'G BARBOSA COSTA AZUL', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'COSTA AZUL' },
  { id: 300071, codigo: '300071', nome: 'G BARBOSA FAZENDA GRANDE', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'FAZENDA GRANDE' },
  { id: 300072, codigo: '300072', nome: 'G BARBOSA FEIRA CIDADE NOVA', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'CIDADE NOVA' },
  { id: 300073, codigo: '300073', nome: 'G BARBOSA FEIRA ROD', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'RODOVIARIA' },
  { id: 300074, codigo: '300074', nome: 'G BARBOSA GUARAJUBA', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'CAMACARI', uf: 'BA', bairro: 'GUARAJUBA' },
  { id: 300075, codigo: '300075', nome: 'G BARBOSA HORTO BELA VISTA', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'HORTO BELA VISTA' },
  { id: 300076, codigo: '300076', nome: 'G BARBOSA IGUATEMI', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'IGUATEMI' },
  { id: 300077, codigo: '300077', nome: 'G BARBOSA JARDIM CRUZEIRO', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'JARDIM CRUZEIRO' },
  { id: 300078, codigo: '300078', nome: 'G BARBOSA LAURO DE FREITAS', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'LAURO DE FREITAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 300079, codigo: '300079', nome: 'G BARBOSA PAU DA LIMA', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PAU DA LIMA' },
  { id: 300080, codigo: '300080', nome: 'G BARBOSA SAN MARTIN', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'SAN MARTIN' },
  { id: 300081, codigo: '300081', nome: 'G BARBOSA VITORIA DA CONQUISTA', rede: 'G BARBOSA', vendedor: 'VINICIUS', cidade: 'VITORIA DA CONQUISTA', uf: 'BA', bairro: 'CENTRO' },

  // HIPERIDEAL
  { id: 301010, codigo: '301010', nome: 'HIPERIDEAL APIPEMA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'APIPEMA' },
  { id: 301011, codigo: '301011', nome: 'HIPERIDEAL ARMACO', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'ARMACO' },
  { id: 301012, codigo: '301012', nome: 'HIPERIDEAL BARRA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'BARRA' },
  { id: 301013, codigo: '301013', nome: 'HIPERIDEAL BUSCA VIDA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'CAMACARI', uf: 'BA', bairro: 'BUSCA VIDA' },
  { id: 301014, codigo: '301014', nome: 'HIPERIDEAL CANELA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'CANELA' },
  { id: 301015, codigo: '301015', nome: 'HIPERIDEAL COSTA AZUL', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'COSTA AZUL' },
  { id: 301016, codigo: '301016', nome: 'HIPERIDEAL GRAÇA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'GRAÇA' },
  { id: 301017, codigo: '301017', nome: 'HIPERIDEAL ITAIGARA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'ITAIGARA' },
  { id: 301018, codigo: '301018', nome: 'HIPERIDEAL LITORAL NORTE', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'LAURO DE FREITAS', uf: 'BA', bairro: 'LITORAL NORTE' },
  { id: 301019, codigo: '301019', nome: 'HIPERIDEAL MATA DE SAO JOAO', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'MATA DE SAO JOAO', uf: 'BA', bairro: 'CENTRO' },
  { id: 301020, codigo: '301020', nome: 'HIPERIDEAL ORLANDO GOMES', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PIATA' },
  { id: 301021, codigo: '301021', nome: 'HIPERIDEAL PARALELA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PARALELA' },
  { id: 301022, codigo: '301022', nome: 'HIPERIDEAL PATAMARES', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PATAMARES' },
  { id: 301023, codigo: '301023', nome: 'HIPERIDEAL PIATA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PIATA' },
  { id: 301024, codigo: '301024', nome: 'HIPERIDEAL PITUBA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PITUBA' },
  { id: 301025, codigo: '301025', nome: 'HIPERIDEAL STELLA MARIS', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'STELLA MARIS' },
  { id: 301026, codigo: '301026', nome: 'HIPERIDEAL VITORIA', rede: 'HIPERIDEAL', vendedor: 'RICARDO SANTOS', cidade: 'SALVADOR', uf: 'BA', bairro: 'VITORIA' },

  // REDE MIX
  { id: 300100, codigo: '300100', nome: 'REDE MIX CAMINHO DAS ARVORES', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'CAMINHO DAS ARVORES' },
  { id: 300101, codigo: '300101', nome: 'REDE MIX CHAME CHAME', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'CHAME CHAME' },
  { id: 300102, codigo: '300102', nome: 'REDE MIX IMBUI', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'IMBUI' },
  { id: 300103, codigo: '300103', nome: 'REDE MIX ITAPUA', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'ITAPUA' },
  { id: 300104, codigo: '300104', nome: 'REDE MIX JARDIM ARMAÇÃO', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'JARDIM ARMAÇÃO' },
  { id: 300105, codigo: '300105', nome: 'REDE MIX LAURO DE FREITAS', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'LAURO DE FREITAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 300106, codigo: '300106', nome: 'REDE MIX PARALELA', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PARALELA' },
  { id: 300107, codigo: '300107', nome: 'REDE MIX PITUBA', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PITUBA' },
  { id: 300108, codigo: '300108', nome: 'REDE MIX RIO VERMELHO', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'RIO VERMELHO' },
  { id: 300109, codigo: '300109', nome: 'REDE MIX SALVADOR SHOPPING', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'CAMINHO DAS ARVORES' },
  { id: 300110, codigo: '300110', nome: 'REDE MIX VILA LAURA', rede: 'REDE MIX', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'VILA LAURA' },

  // OUTROS / MISTOS
  { id: 304245, codigo: '304245', nome: 'CDP ALAGOINHAS LOJA', rede: 'COSTA DO PLAZA', vendedor: 'MIRIAM', cidade: 'ALAGOINHAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 304246, codigo: '304246', nome: 'CDP CAMACARI SHOP LOJA', rede: 'COSTA DO PLAZA', vendedor: 'MIRIAM', cidade: 'CAMACARI', uf: 'BA', bairro: 'CENTRO' },
  { id: 304375, codigo: '304375', nome: 'COMPRE BEM ALAGOINHAS', rede: 'COMPRE BEM', vendedor: 'MIRIAM', cidade: 'ALAGOINHAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 305001, codigo: '305001', nome: 'EL-EL SAO ROQUE CENTRO', rede: 'EL-EL SAO ROQUE', vendedor: 'MIRIAM', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'CENTRO' },
  { id: 306040, codigo: '306040', nome: 'ECONOMART FEIRA DE SANTANA', rede: 'ECONOMART', vendedor: 'MIRIAM', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'CENTRO' },
  { id: 306041, codigo: '306041', nome: 'ECONOMART JEQUIE', rede: 'ECONOMART', vendedor: 'MIRIAM', cidade: 'JEQUIE', uf: 'BA', bairro: 'CENTRO' },
  { id: 306043, codigo: '306043', nome: 'ECONOMART VITORIA DA CONQUISTA', rede: 'ECONOMART', vendedor: 'MIRIAM', cidade: 'VITORIA DA CONQUISTA', uf: 'BA', bairro: 'CENTRO' },
  { id: 307450, codigo: '307450', nome: 'MATEUS EUNAPOLIS', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'EUNAPOLIS', uf: 'BA', bairro: 'CENTRO' },
  { id: 307451, codigo: '307451', nome: 'MATEUS FEIRA DE SANTANA', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'FEIRA DE SANTANA', uf: 'BA', bairro: 'CENTRO' },
  { id: 307452, codigo: '307452', nome: 'MATEUS JACOBINA', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'JACOBINA', uf: 'BA', bairro: 'CENTRO' },
  { id: 307453, codigo: '307453', nome: 'MATEUS JUAZEIRO', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'JUAZEIRO', uf: 'BA', bairro: 'CENTRO' },
  { id: 307454, codigo: '307454', nome: 'MATEUS PETROLINA', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'PETROLINA', uf: 'PE', bairro: 'CENTRO' },
  { id: 307455, codigo: '307455', nome: 'MATEUS PORTO SEGURO', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'PORTO SEGURO', uf: 'BA', bairro: 'CENTRO' },
  { id: 307456, codigo: '307456', nome: 'MATEUS TEIXEIRA DE FREITAS', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'TEIXEIRA DE FREITAS', uf: 'BA', bairro: 'CENTRO' },
  { id: 307457, codigo: '307457', nome: 'MATEUS VITORIA DA CONQUISTA', rede: 'MATEUS', vendedor: 'RICARDO SANTOS', cidade: 'VITORIA DA CONQUISTA', uf: 'BA', bairro: 'CENTRO' },
  { id: 308001, codigo: '308001', nome: 'PERINI GRAÇA', rede: 'PERINI', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'GRAÇA' },
  { id: 308002, codigo: '308002', nome: 'PERINI PITUBA', rede: 'PERINI', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'PITUBA' },
  { id: 308003, codigo: '308003', nome: 'PERINI VASCO DA GAMA', rede: 'PERINI', vendedor: 'VINICIUS', cidade: 'SALVADOR', uf: 'BA', bairro: 'VASCO DA GAMA' },
  { id: 309001, codigo: '309001', nome: 'ROCHA CARNES ARACAJU', rede: 'ROCHA CARNES', vendedor: 'VINICIUS', cidade: 'ARACAJU', uf: 'SE', bairro: 'CENTRO' },
  { id: 309002, codigo: '309002', nome: 'ROCHA CARNES BARRA DOS COQUEIROS', rede: 'ROCHA CARNES', vendedor: 'VINICIUS', cidade: 'BARRA DOS COQUEIROS', uf: 'SE', bairro: 'CENTRO' },
];

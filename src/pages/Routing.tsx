import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Save, Calculator, Truck, MapPin, Package } from 'lucide-react';
import { cn } from '../lib/utils';

const Routing = () => {
  const { addRota, clientes, veiculos, fretistas, motoristas, regioes, veiculosTypes } = useApp();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    dataEntrega: new Date().toISOString().split('T')[0],
    regiao: '',
    numeroCarga: '',
    fretista: '',
    placa: '',
    motorista: '',
    tipoVeiculo: '',
    pesoCarga: '',
    qtdPaletes: '',
    observacoes: ''
  });

  const [clientesRota, setClientesRota] = useState<(string | null)[]>(Array(10).fill(null));
  const [taxaOcupacao, setTaxaOcupacao] = useState(0);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill logic
    if (name === 'placa') {
      const placaData = veiculos.find(p => p.placa === value);
      if (placaData) {
        setFormData(prev => ({
          ...prev,
          placa: value,
          tipoVeiculo: placaData.tipo,
          motorista: placaData.motoristaPadrao,
          fretista: placaData.fretista
        }));
      }
    }
  };

  const handleClienteChange = (index: number, value: string) => {
    const newClientes = [...clientesRota];
    newClientes[index] = value === "" ? null : value;
    setClientesRota(newClientes);
  };

  // Calculation Effect
  useEffect(() => {
    if (formData.tipoVeiculo && formData.pesoCarga) {
      const placaSelecionada = veiculos.find(p => p.placa === formData.placa);
      const capacidadePlaca = placaSelecionada?.capacidade;
      // @ts-ignore
      const capacidadeTipo = veiculosTypes[formData.tipoVeiculo]?.capacity || 0;
      const capacidadeFinal = capacidadePlaca || capacidadeTipo;

      if (capacidadeFinal > 0) {
        const peso = parseFloat(formData.pesoCarga);
        const ocupacao = (peso / capacidadeFinal) * 100;
        setTaxaOcupacao(ocupacao);
      }
    } else {
      setTaxaOcupacao(0);
    }
  }, [formData.tipoVeiculo, formData.pesoCarga, formData.placa, veiculosTypes, veiculos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.regiao) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    const novaRota = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      ...formData,
      pesoCarga: parseFloat(formData.pesoCarga) || 0,
      qtdPaletes: parseInt(formData.qtdPaletes) || 0,
      taxaOcupacao,
      clientes: clientesRota,
      status: 'Criada' as const
    };

    addRota(novaRota);
    alert("Rota Salva com Sucesso!");
    navigate('/rotas');
  };

  const inputClass = "w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-gray-900 dark:text-white";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Roteiriza GDM</h1>
          <p className="text-gray-500 dark:text-gray-400">Criação de novas rotas</p>
        </div>
        <button 
          onClick={handleSubmit}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 font-bold transition-all transform hover:scale-105"
        >
          <Save size={20} />
          SALVAR ROTA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 e 2: Formulário */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dados da Carga */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-primary px-6 py-3 flex items-center gap-2">
              <Package className="text-white" size={20} />
              <h2 className="text-white font-bold">1º PARTE – DADOS DA CARGA</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Data da Entrega</label>
                <input type="date" name="dataEntrega" value={formData.dataEntrega} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Região</label>
                <select name="regiao" value={formData.regiao} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  {regioes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nº Carga (Opcional)</label>
                <input type="text" name="numeroCarga" value={formData.numeroCarga} onChange={handleChange} className={inputClass} placeholder="000000" />
              </div>
            </div>
          </section>

          {/* Dados do Veículo */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-primary px-6 py-3 flex items-center gap-2">
              <Truck className="text-white" size={20} />
              <h2 className="text-white font-bold">2º PARTE – DADOS DO VEÍCULO</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
                <label className={labelClass}>Placa</label>
                <select name="placa" value={formData.placa} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  {veiculos.map(p => <option key={p.placa} value={p.placa}>{p.placa} - {p.tipo}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-2 lg:col-span-1">
                <label className={labelClass}>Tipo de Veículo</label>
                <input type="text" name="tipoVeiculo" value={formData.tipoVeiculo} readOnly className={cn(inputClass, "bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-300 cursor-not-allowed")} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Fretista</label>
                <select name="fretista" value={formData.fretista} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  {fretistas.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Motorista</label>
                <select name="motorista" value={formData.motorista} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  {motoristas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className={labelClass}>Peso Carga (kg)</label>
                <input type="number" name="pesoCarga" value={formData.pesoCarga} onChange={handleChange} className={inputClass} placeholder="0.00" />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className={labelClass}>Qtd. Paletes</label>
                <input type="number" name="qtdPaletes" value={formData.qtdPaletes} onChange={handleChange} className={inputClass} placeholder="0" />
              </div>

              <div className="md:col-span-4 lg:col-span-2 bg-blue-50 dark:bg-slate-700/50 p-3 rounded-lg border border-blue-100 dark:border-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary dark:text-blue-300 font-medium">
                  <Calculator size={18} />
                  <span>Taxa de Ocupação:</span>
                </div>
                <span className={cn("text-xl font-bold", taxaOcupacao > 100 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")}>
                  {taxaOcupacao.toFixed(2)}%
                </span>
              </div>
            </div>
          </section>

          {/* Informações Complementares */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gray-100 dark:bg-slate-700 px-6 py-3 border-b border-gray-200 dark:border-slate-600">
              <h2 className="text-gray-700 dark:text-gray-300 font-bold text-sm uppercase">4º Parte – Informações Complementares</h2>
            </div>
            <div className="p-6">
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="Observações da rota..."
              ></textarea>
            </div>
          </section>
        </div>

        {/* Coluna 3: Sequência da Rota */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden h-full">
            <div className="bg-primary px-6 py-3 flex items-center gap-2">
              <MapPin className="text-white" size={20} />
              <h2 className="text-white font-bold">3º PARTE – SEQUÊNCIA</h2>
            </div>
            <div className="p-6 space-y-3 max-h-[800px] overflow-y-auto">
              {clientesRota.map((cliente, index) => (
                <div key={index} className="relative">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">
                    Cliente Entrega {index + 1}
                  </label>
                  <select
                    value={cliente || ""}
                    onChange={(e) => handleClienteChange(index, e.target.value)}
                    className={cn(inputClass, "text-sm py-2")}
                  >
                    <option value="">-- Selecione o Cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.nome}>
                        {c.codigo} - {c.nome} - {c.cidade}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-8 text-xs text-gray-400 pointer-events-none">
                    {index === 0 ? '1ª Entrega' : index === clientesRota.length - 1 ? 'Última' : ''}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Routing;

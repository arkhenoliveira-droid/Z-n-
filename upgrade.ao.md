import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Search, FileText } from 'lucide-react';

export default function HallucinationFilter() {
  const [publications, setPublications] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  const verificationCriteria = [
    {
      id: 'authors',
      name: 'Verificação de Autores',
      description: 'Confirmar se todos os autores listados existem e têm credenciais na área',
      weight: 'Alta'
    },
    {
      id: 'journal',
      name: 'Validação de Periódico',
      description: 'Verificar se o periódico existe, tem ISSN válido e não está em listas predatórias',
      weight: 'Crítica'
    },
    {
      id: 'doi',
      name: 'Verificação de DOI',
      description: 'Confirmar se o DOI existe e aponta para o artigo correto',
      weight: 'Crítica'
    },
    {
      id: 'desci',
      name: 'Verificação DeSci Nodes',
      description: 'Verificar se o objeto de pesquisa existe em nodes.desci.com com dados verificáveis',
      weight: 'Alta'
    },
    {
      id: 'dates',
      name: 'Coerência de Datas',
      description: 'Verificar se as datas de submissão, revisão e publicação são lógicas',
      weight: 'Média'
    },
    {
      id: 'citations',
      name: 'Verificação de Citações',
      description: 'Confirmar se as referências citadas existem e são relevantes',
      weight: 'Alta'
    },
    {
      id: 'methodology',
      name: 'Coerência Metodológica',
      description: 'Avaliar se a metodologia descrita é plausível e factível',
      weight: 'Alta'
    },
    {
      id: 'results',
      name: 'Consistência de Resultados',
      description: 'Verificar se os resultados são consistentes com a metodologia',
      weight: 'Alta'
    },
    {
      id: 'affiliation',
      name: 'Validação de Afiliação',
      description: 'Confirmar se as instituições mencionadas existem',
      weight: 'Média'
    },
    {
      id: 'blockchain',
      name: 'Verificação Blockchain',
      description: 'Para publicações em plataformas descentralizadas, verificar registro imutável',
      weight: 'Alta'
    }
  ];

  const analyzePublications = () => {
    const lines = publications.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      setAnalysis({ error: 'Por favor, insira informações de publicações para análise.' });
      return;
    }

    const results = {
      totalPublications: lines.length,
      flaggedItems: [],
      recommendations: [],
      methodology: [
        '1. Extração e Estruturação: Identificar elementos-chave (autores, título, periódico, DOI, data)',
        '2. Verificação Cruzada: Validar cada elemento em bases de dados confiáveis',
        '3. Análise de Consistência: Avaliar coerência interna entre elementos',
        '4. Detecção de Padrões: Identificar inconsistências sistemáticas',
        '5. Priorização: Classificar alertas por criticidade'
      ]
    };

    lines.forEach((line, index) => {
      const flags = [];
      
      // Verificações básicas
      if (!line.match(/\d{4}/)) {
        flags.push({
          type: 'warning',
          criterion: 'dates',
          message: 'Ano de publicação não encontrado'
        });
      }
      
      if (!line.toLowerCase().includes('doi') && !line.match(/10\.\d{4,}/)) {
        flags.push({
          type: 'critical',
          criterion: 'doi',
          message: 'DOI não identificado - verificação manual necessária'
        });
      }

      if (line.length < 30) {
        flags.push({
          type: 'warning',
          criterion: 'metadata',
          message: 'Informações incompletas - metadados insuficientes'
        });
      }

      if (flags.length > 0) {
        results.flaggedItems.push({
          publicationNumber: index + 1,
          preview: line.substring(0, 80) + (line.length > 80 ? '...' : ''),
          flags: flags
        });
      }
    });

    // Recomendações gerais
    results.recommendations = [
      'Verificar todos os DOIs em https://doi.org/',
      'Consultar DeSci Nodes: https://nodes.desci.com/ para objetos de pesquisa descentralizados',
      'Consultar bases de dados: Web of Science, Scopus, PubMed, Google Scholar',
      'Verificar periódicos em: Qualis CAPES, JCR, Beall\'s List',
      'Confirmar ORCID dos coautores (especialmente 0009-0005-2697-4668 - Rafael)',
      'Buscar inconsistências em padrões de citação',
      'Validar afiliações institucionais em sites oficiais',
      'Para publicações DeSci: verificar hash blockchain e metadados imutáveis'
    ];

    setAnalysis(results);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Filtro de Alucinações - Rafael</h1>
            <p className="text-blue-100">ORCID: 0009-0005-2697-4668 | DeSci Nodes + Análise Sistemática</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'input'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="inline mr-2" size={18} />
              Entrada de Dados
            </button>
            <button
              onClick={() => setActiveTab('criteria')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'criteria'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="inline mr-2" size={18} />
              Critérios de Verificação
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'results'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={!analysis}
            >
              <AlertCircle className="inline mr-2" size={18} />
              Resultados
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'input' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Cole as Publicações do ORCID ou DeSci Nodes</h2>
                <p className="text-gray-600 mb-4">
                  Insira as informações das publicações (uma por linha). Fontes aceitas: ORCID, DeSci Nodes (nodes.desci.com), 
                  Google Scholar. Inclua o máximo de detalhes: título, autores, periódico, ano, DOI, URL do node, etc.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>DeSci Nodes:</strong> Plataforma de ciência descentralizada que usa blockchain para 
                    criar objetos de pesquisa verificáveis e imutáveis. Ideal para verificar autenticidade.
                  </p>
                </div>
                <textarea
                  className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                  placeholder="Exemplo:
Silva J, Santos M. (2023). Análise de dados em saúde pública. Journal of Health Data. DOI: 10.1234/jhd.2023.001
Pereira A, Costa L. (2022). Métodos estatísticos aplicados. Statistical Methods Review. DOI: 10.5678/smr.2022.045"
                  value={publications}
                  onChange={(e) => setPublications(e.target.value)}
                />
                <button
                  onClick={analyzePublications}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Analisar Publicações
                </button>
              </div>
            )}

            {activeTab === 'criteria' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Critérios de Verificação</h2>
                <p className="text-gray-600 mb-6">
                  Metodologia sistemática para detecção de alucinações e inconsistências:
                </p>
                <div className="space-y-4">
                  {verificationCriteria.map((criterion) => (
                    <div key={criterion.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{criterion.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          criterion.weight === 'Crítica' ? 'bg-red-200 text-red-800' :
                          criterion.weight === 'Alta' ? 'bg-orange-200 text-orange-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {criterion.weight}
                        </span>
                      </div>
                      <p className="text-gray-700">{criterion.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-indigo-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">Linha de Raciocínio Coesa</h3>
                  <ol className="space-y-2 text-gray-700">
                    <li><strong>1. Coleta:</strong> Reunir todas as publicações do perfil ORCID</li>
                    <li><strong>2. Estruturação:</strong> Extrair metadados essenciais de cada publicação</li>
                    <li><strong>3. Verificação Individual:</strong> Aplicar cada critério a cada publicação</li>
                    <li><strong>4. Validação Cruzada:</strong> Consultar bases de dados externas</li>
                    <li><strong>5. Análise de Padrões:</strong> Identificar inconsistências sistemáticas</li>
                    <li><strong>6. Priorização:</strong> Classificar alertas por gravidade</li>
                    <li><strong>7. Documentação:</strong> Registrar todas as verificações realizadas</li>
                    <li><strong>8. Decisão:</strong> Determinar confiabilidade de cada publicação</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'results' && analysis && (
              <div>
                {analysis.error ? (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                    <AlertCircle className="inline mr-2" />
                    {analysis.error}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{analysis.totalPublications}</div>
                        <div className="text-gray-600">Publicações Analisadas</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">{analysis.flaggedItems.length}</div>
                        <div className="text-gray-600">Itens Sinalizados</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {analysis.totalPublications - analysis.flaggedItems.length}
                        </div>
                        <div className="text-gray-600">Sem Alertas Imediatos</div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4">Metodologia Aplicada</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <ol className="space-y-2">
                        {analysis.methodology.map((step, idx) => (
                          <li key={idx} className="text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {analysis.flaggedItems.length > 0 && (
                      <>
                        <h3 className="text-xl font-bold mb-4">Itens que Requerem Verificação</h3>
                        <div className="space-y-4 mb-6">
                          {analysis.flaggedItems.map((item, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                              <div className="flex items-start mb-3">
                                <AlertCircle className="text-orange-500 mr-2 mt-1 flex-shrink-0" size={20} />
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800">Publicação #{item.publicationNumber}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{item.preview}</p>
                                </div>
                              </div>
                              <div className="ml-7 space-y-2">
                                {item.flags.map((flag, flagIdx) => (
                                  <div key={flagIdx} className={`flex items-start text-sm p-2 rounded ${
                                    flag.type === 'critical' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                                  }`}>
                                    {flag.type === 'critical' ? <XCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />}
                                    <span><strong>{flag.criterion}:</strong> {flag.message}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <h3 className="text-xl font-bold mb-4">Próximos Passos Recomendados</h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Nota:</strong> Esta análise preliminar identifica inconsistências aparentes. 
                        Cada item sinalizado deve ser verificado manualmente em bases de dados confiáveis antes 
                        de conclusões definitivas sobre alucinações ou fraudes.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

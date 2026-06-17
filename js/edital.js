// ─────────────────────────────────────────────────────────────
// Módulo do Edital — matérias, tópicos e administração editável
// ─────────────────────────────────────────────────────────────
import { getDocument, setDocument } from './firebase-config.js';

// Base inicial — Edital nº 1/2022-RFB (FGV). Usada apenas na primeira
// inicialização do banco; depois disso, tudo vem do Firestore e pode
// ser editado livremente pela aba Administração.
export const EDITAL_INICIAL = {
  ultimaAtualizacao: "17/06/2026",
  revisado: true,
  materias: {
    "Língua Portuguesa": { dificil: false, topicos: [
      "Gêneros textuais e interpretação de texto","Semântica: sentido e emprego de vocábulos",
      "Emprego de tempos e modos verbais","Morfologia: classes gramaticais",
      "Processos de formação de palavras","Flexão de nomes e verbos",
      "Sintaxe: frase, oração e período","Termos da oração","Coordenação e subordinação",
      "Concordância nominal e verbal","Transitividade e regência (nomes e verbos)",
      "Colocação pronominal","Mecanismos de coesão textual","Ortografia","Acentuação gráfica",
      "Emprego do sinal de crase","Pontuação","Reescrita de frases: substituição e paralelismo",
      "Variação linguística e norma culta"
    ]},
    "Língua Inglesa": { dificil: true, topicos: [
      "Compreensão e interpretação de textos em inglês","Vocabulário e estrutura da língua inglesa",
      "Ideias principais e secundárias (explícitas e implícitas)","Relações intratextuais e intertextuais",
      "Itens gramaticais relevantes para compreensão","Palavras e expressões equivalentes",
      "Elementos de referência textual"
    ]},
    "Raciocínio Lógico": { dificil: true, topicos: [
      "Lógica: proposições e conectivos","Equivalências lógicas e quantificadores","Conjuntos e diagramas",
      "Números inteiros, racionais e reais — operações","Porcentagem e juros",
      "Proporcionalidade direta e inversa","Medidas: comprimento, área, volume, massa, tempo",
      "Relações arbitrárias: dedução e avaliação de condições","Raciocínio verbal e raciocínio matemático",
      "Raciocínio sequencial e orientação espacial","Interpretação de gráficos e tabelas",
      "Problemas aritméticos, geométricos e matriciais","Contagem e noções de probabilidade",
      "Geometria básica: ângulos, triângulos, polígonos","Perímetro, área e proporcionalidade geométrica",
      "Estatística básica: média, moda, mediana, desvio padrão","Plano cartesiano e distâncias",
      "Problemas de lógica e raciocínio"
    ]},
    "Estatística": { dificil: true, topicos: [
      "Estatística descritiva","Probabilidade e distribuições de probabilidade",
      "Estimação pontual e intervalar","Testes de hipóteses","Séries temporais",
      "Regressão linear simples e múltipla","Regressão logística"
    ]},
    "Economia": { dificil: true, topicos: [
      "Conceitos básicos de microeconomia e fluxos econômicos","Demanda, oferta e deslocamentos de curvas",
      "Elasticidades da oferta e da demanda","Teoria do consumidor: restrição orçamentária e utilidade",
      "Índices de Laspeyres e Paasche — efeito renda e substituição","Escolha sob incerteza e preferências ao risco",
      "Produção: fatores, custos, isoquantas e rendimentos","Mercados competitivos e maximização de lucros",
      "Poder de mercado: monopólio, monopsônio e oligopólio","Teoria dos jogos e equilíbrio de Nash",
      "Eficiência econômica, livre comércio e vantagem comparativa","Falhas de mercado: externalidades, assimetria, bens públicos",
      "Economia comportamental: aversão à perda e manada","Contas Nacionais e agregados macroeconômicos",
      "Balanço de pagamentos, câmbio e importações/exportações","Inflação e índices de preços",
      "Política monetária e taxas de juros","Política fiscal: tributos e gastos do governo",
      "Ciclos econômicos e modelo IS-LM","Planos de estabilização no Brasil e Plano Real",
      "Déficit orçamentário, dívida pública e teto de gastos","Globalização, G20 e organismos internacionais",
      "Funções econômicas do Estado: alocativa, distributiva, estabilizadora",
      "Orçamento público e parâmetros da política fiscal no Brasil","Responsabilidade fiscal e regras fiscais",
      "Ingressos públicos: conceito, classificação, tipos","Tributação: eficiência econômica e incidência tributária",
      "Carga tributária: conceito, composição e evolução no Brasil","Descentralização fiscal e transferências intergovernamentais"
    ]},
    "Administração Geral": { dificil: false, topicos: [
      "Teoria da administração e das organizações","Funções administrativas: planejamento, organização, direção, controle",
      "Papéis e habilidades do administrador","Planejamento estratégico: conceitos, etapas, métodos e ferramentas",
      "Planejamento tático e operacional","Administração por objetivos","Estrutura organizacional e departamentalização",
      "Centralização e descentralização","Processo decisório: tipos, heurísticas e ferramentas","Cultura organizacional",
      "Motivação, liderança e comunicação","Equipes de trabalho","Balanced Scorecard",
      "Gestão de pessoas: evolução, conceitos e abordagem estratégica","Recrutamento e seleção de pessoas",
      "Análise e descrição de cargos","Treinamento, desenvolvimento e avaliação de programas",
      "Gestão do desempenho e gestão por competências","Gestão da qualidade: teóricos e ferramentas",
      "Gestão de projetos: modelos, etapas e técnicas","Gestão de processos e BPM",
      "Mapeamento, análise e melhoria de processos","Administração financeira e planejamento de curto/longo prazo",
      "Análise de balanços e demonstrações financeiras","Indicadores de desempenho: tipos, variáveis e princípios"
    ]},
    "Administração Pública": { dificil: false, topicos: [
      "Reformas administrativas e redefinição do papel do Estado","Modelos de administração pública: patrimonial, burocrático, gerencial",
      "Processos participativos: conselhos de gestão e orçamento participativo","Governo eletrônico, transparência e accountability",
      "Gestão por resultados em serviços públicos","Comunicação e redes organizacionais na gestão pública",
      "Administração de pessoal","Compras governamentais e gerenciamento de materiais e estoques",
      "Lei de Licitações nº 8.666/1993","Nova Lei de Licitações nº 14.133/2021","Sustentabilidade das contratações",
      "Organizações sociais, OSCIP, agências reguladoras e executivas","Consórcios públicos",
      "Formulação, implementação e avaliação de programas e projetos","Análise custo-benefício e custo-efetividade",
      "Governança Pública: conceitos, princípios, diretrizes e práticas","Gestão de Riscos: princípios, modelos nacionais e internacionais",
      "Processo de Gestão de Riscos: identificação, análise e tratamento","Políticas públicas: construção de agenda e implementação",
      "Descentralização, participação e controle social","Lei de Acesso à Informação — Lei nº 12.527/2011",
      "Lei da Transparência — LC nº 131/2009"
    ]},
    "Contabilidade Geral": { dificil: true, topicos: [
      "Conceito, objeto, campo de atuação e usuários da contabilidade","Princípios e Normas Brasileiras de Contabilidade (CFC)",
      "Atos e fatos administrativos","Livros contábeis obrigatórios e documentação contábil",
      "Variação do PL: receita, despesa, ganhos e perdas","Regimes de apuração: caixa e competência","Apuração dos resultados",
      "Escrituração contábil e lançamentos","Fatos contábeis: permutativos, modificativos e mistos",
      "Ativo: conteúdo, avaliação e classificação","Passivo: conteúdo, avaliação e classificação",
      "Patrimônio Líquido: estrutura e variações","Balanço Patrimonial (BP)","Demonstração do Resultado do Exercício (DRE)",
      "Demonstração de Lucros ou Prejuízos Acumulados (DLPA)","Demonstração das Mutações do Patrimônio Líquido (DMPL)",
      "Demonstração dos Fluxos de Caixa (DFC)","Demonstração do Valor Adicionado (DVA)",
      "Notas explicativas: conteúdo e exigências legais","Estoques: inventários, critérios e métodos de avaliação (PEPS, CM)",
      "Apuração do CMV e tributos em compras e vendas","Lei nº 11.638/2007 e Lei nº 11.941/2009: ajustes e avaliações"
    ]},
    "Contabilidade Avançada": { dificil: true, topicos: [
      "CPC 01 — Redução ao Valor Recuperável (Impairment)","CPC 02 — Efeitos de Mudanças nas Taxas de Câmbio",
      "CPC 03 — Demonstração dos Fluxos de Caixa","CPC 04 — Ativo Intangível","CPC 06 — Arrendamentos (IFRS 16)",
      "CPC 07 — Subvenção e Assistência Governamentais","CPC 09 — Demonstração do Valor Adicionado",
      "CPC 10 — Pagamento Baseado em Ações","CPC 12 — Ajuste a Valor Presente","CPC 13 — Adoção Inicial",
      "CPC 15 — Combinações de Negócios","CPC 16 — Estoques","CPC 17 — Contratos de Construção",
      "CPC 18 — Investimento em Coligada e Controlada (MEP)","CPC 19 — Negócios em Conjunto","CPC 20 — Custos de Empréstimos",
      "CPC 21 — Demonstrações Intermediárias","CPC 22 — Informações por Segmento","CPC 23 — Políticas Contábeis, Mudanças e Erros",
      "CPC 24 — Eventos Subsequentes","CPC 25 — Provisões, Passivos e Ativos Contingentes",
      "CPC 26 — Apresentação das Demonstrações Contábeis","CPC 27 — Ativo Imobilizado","CPC 28 — Propriedade para Investimento",
      "CPC 29 — Ativo Biológico e Produto Agrícola","CPC 30 — Receitas (IFRS 15)","CPC 32 — Tributos sobre o Lucro",
      "CPC 33 — Benefícios a Empregados","CPC 36 — Demonstrações Consolidadas","CPC 37/39 — Instrumentos Financeiros (IFRS 9)",
      "CPC 40 — Instrumentos Financeiros: Evidenciação","CPC 41 — Resultado por Ação",
      "CPC 45 — Divulgação de Participações em Outras Entidades","CPC 46 — Mensuração do Valor Justo",
      "CPC 47 — Receita de Contrato com Cliente","CPC 48 — Instrumentos Financeiros (classificação e mensuração)"
    ]},
    "Contabilidade de Custos": { dificil: true, topicos: [
      "Conceitos básicos: terminologia e classificação de custos","Custos diretos e indiretos","Custos fixos e variáveis",
      "Departamentalização de custos","Custeio por absorção","Custeio variável (direto)","Custeio baseado em atividades (ABC)",
      "Margem de contribuição","Ponto de equilíbrio (contábil, econômico, financeiro)","Alavancagem operacional",
      "Custo-padrão e análise de variações","Sistemas de acumulação: custeio por ordem e por processo",
      "Custo de transformação e custo de produção","Perdas normais e anormais","Subprodutos e sucatas",
      "Análise custo-volume-lucro"
    ]},
    "Contabilidade Setor Público": { dificil: true, topicos: [
      "NBC TSP Estrutura Conceitual: objetivos e usuários do RCPG","Accountability, tomada de decisão e continuidade das entidades",
      "Características qualitativas fundamentais e de melhoria","Elementos das demonstrações contábeis do setor público",
      "Reconhecimento e mensuração nas demonstrações públicas","Demonstrações contábeis conforme Lei nº 4.320/1964",
      "Demonstrações contábeis conforme NBC T SP 11 e MCASP","Plano de Contas Aplicado ao Setor Público (PCASP)",
      "Escrituração contábil pública: partidas dobradas","Procedimentos Contábeis Orçamentários (MCASP)",
      "Procedimentos Contábeis Patrimoniais (MCASP 9ª ed.)","Empenho, liquidação e pagamento — Lei nº 4.320/1964",
      "Restos a pagar","LC nº 101/2000 — Lei de Responsabilidade Fiscal","Dívida pública e restos a pagar (LRF)",
      "Relatório Resumido da Execução Orçamentária (RREO)","Relatório de Gestão Fiscal (RGF)",
      "Apresentação de informação orçamentária — NBC TSP 13","IPSAS: Normas Internacionais de Contabilidade Pública",
      "Sistema de Informação de Custos — NBC T 16.11","Manual de Informações de Custos do Governo Federal",
      "Trabalho de asseguração — NBC TA Estrutura Conceitual"
    ]},
    "Fluência em Dados": { dificil: true, topicos: [
      "Conceitos, atributos e métricas de dados","Transformação de dados","Análise de dados e agrupamentos",
      "Tendências e projeções","Conceitos de Analytics","Aprendizado de Máquina (Machine Learning)",
      "Inteligência Artificial: conceitos e aplicações","Processamento de Linguagem Natural (PLN)",
      "Governança de Dados: centralizada, compartilhada e colegiada","Big Data: conceito e importância da informação",
      "Ciência de Dados: ciclo de vida e papéis dos envolvidos","Computação em nuvem: modelos de entrega e distribuição",
      "Arquitetura de Big Data","Linguagem Python aplicada a ciência de dados","Linguagem R aplicada a ciência de dados",
      "Bancos de dados NoSQL: modelos e principais SGBDs","Estatística descritiva aplicada a dados",
      "Probabilidade e distribuições aplicadas a dados","Séries temporais e predição",
      "Regressão linear simples e múltipla aplicada a dados","Regressão logística aplicada a dados"
    ]},
    "Auditoria": { dificil: false, topicos: [
      "Normas Brasileiras de Contabilidade de Auditoria — NBC TA e NBC PA","Amostragem em auditoria — NBC TA 530",
      "Testes de observância e testes substantivos","Testes para subavaliação e superavaliação","Evidências de auditoria",
      "Procedimentos de auditoria","Identificação de fraudes na escrita contábil",
      "Auditoria no ativo circulante e recomposição do fluxo de caixa","Identificação de saldo credor em caixa por falta de documentos fiscais",
      "Suprimento de disponibilidades sem comprovação de entrega","Aquisições não contabilizadas e sem comprovação de origem",
      "Baixa fictícia de títulos não recebidos","Cotejamento de recebíveis com registros de receitas",
      "Auditoria no ativo não circulante e superavaliação de estoques","Auditoria no ativo realizável a longo prazo",
      "Auditoria em investimentos e no ativo imobilizado","Ativos ocultos e alienação fictícia de bens",
      "Auditoria no ativo intangível","Auditoria no passivo circulante e não circulante",
      "Passivos fictícios e passivos pagos e não baixados","Auditoria no patrimônio líquido e aumento de capital sem comprovação",
      "Contabilização de reservas e subvenções","Auditoria em contas de resultado: receitas e despesas",
      "Ocultação de receitas e superavaliação de custos","Auditoria na EFD e NF-e",
      "Identificação de divergências fiscais com SGBD e EFD","Crédito indevido de ICMS e verificação de alíquotas",
      "Auditoria em operações de importação","Lei Complementar nº 105/2001 — Sigilo de operações financeiras"
    ]},
    "Direito Constitucional": { dificil: false, topicos: [
      "Teoria Geral do Estado e funções dos poderes","Teoria geral da Constituição: conceito, origens, estrutura, classificação",
      "Supremacia da Constituição e tipos de constituição","Poder constituinte","Princípios constitucionais",
      "Controle de constitucionalidade: interpretação, competência e efeitos","Emenda, reforma e revisão constitucional",
      "Hierarquia das normas jurídicas","Princípios fundamentais da CRFB/88","Direitos e garantias fundamentais",
      "Organização político-administrativa do Estado","Administração Pública na CF/88","Servidores públicos civis (art. 37 a 41 CF/88)",
      "Poder Legislativo: fiscalização e controle externo","Tribunal de Contas da União (TCU)","Controles interno e externo (CF/88)",
      "Poder Executivo: Presidente, Vice, atribuições e responsabilidade","Poder Judiciário: STF e STJ","Ministério Público",
      "Defesa do Estado e instituições democráticas","Sistema Tributário Nacional (arts. 145 a 162 CF/88)",
      "Finanças públicas e orçamento (arts. 163 a 169 CF/88)","Ordem econômica e financeira","Ordem social",
      "Disposições gerais e ADCT"
    ]},
    "Direito Administrativo": { dificil: false, topicos: [
      "Princípios básicos da administração pública (LIMPE)","Poder hierárquico e poder disciplinar","Poder regulamentar e poder de polícia",
      "Uso e abuso do poder","Ato administrativo: conceito, requisitos e atributos","Anulação, revogação e convalidação do ato administrativo",
      "Discricionariedade e vinculação","Organização administrativa: administração direta e indireta",
      "Autarquias, fundações, empresas públicas e SEM","Consórcios públicos — Lei nº 11.107/2005","Órgãos públicos: conceito, natureza e classificação",
      "Regime Jurídico dos Servidores — Lei nº 8.112/1990","Provimento, vacância, remoção, redistribuição e substituição",
      "Direitos e vantagens dos servidores (vencimento, férias, licenças)","Regime disciplinar: deveres, proibições e penalidades",
      "Processo Administrativo Disciplinar (PAD)","Processo administrativo federal — Lei nº 9.784/1999",
      "Controle administrativo, judicial e legislativo da administração","Responsabilidade extracontratual do Estado",
      "Improbidade Administrativa — Lei nº 8.429/1992","Carreira tributária — Lei nº 11.416/2006",
      "Nova Lei de Licitações — Lei nº 14.133/2021","Serviços públicos: conceito, regime jurídico e delegação",
      "Bens públicos: regime, classificação e utilização por terceiros","Intervenção do Estado na propriedade (desapropriação, tombamento etc.)",
      "Terceiro Setor e entes paraestatais"
    ]},
    "Direito Tributário": { dificil: false, topicos: [
      "Sistema Tributário Nacional: princípios e limitações constitucionais","Competência tributária: privativa, comum, residual e extraordinária",
      "Impostos da União (art. 153 CF) e partilha das receitas","Impostos dos Estados e Municípios",
      "Vigência, aplicação e interpretação da legislação tributária","Integração da legislação tributária: analogia e equidade",
      "Obrigação tributária principal e acessória","Fato gerador: definição e ocorrência","Sujeito ativo e sujeito passivo da obrigação",
      "Contribuinte e responsável tributário","Solidariedade e capacidade tributária passiva","Domicílio tributário",
      "Responsabilidade tributária dos sucessores","Responsabilidade tributária de terceiros","Responsabilidade por infrações tributárias",
      "Crédito tributário: constituição pelo lançamento","Modalidades de lançamento (de ofício, por declaração, homologação)",
      "Suspensão do crédito tributário","Extinção do crédito tributário (pagamento, compensação, prescrição etc.)",
      "Exclusão do crédito tributário: isenção e anistia","Garantias e privilégios do crédito tributário",
      "Administração tributária: fiscalização e dívida ativa","Certidões negativas de débito","Processo administrativo tributário federal",
      "Execução fiscal e processo judicial tributário","Simples Nacional — LC nº 123/2006","Elisão, evasão e planejamento tributário",
      "Abuso de formas e interpretação econômica do Direito Tributário"
    ]},
    "Legislação Tributária": { dificil: false, topicos: [
      "IRPF — Contribuintes, responsáveis e domicílio fiscal (RIR arts. 1-31)","IRPF — Rendimento bruto (RIR arts. 33-65)",
      "IRPF — Deduções (RIR arts. 66-75)","IRPF — Base de cálculo e cálculo do imposto (RIR arts. 76-77)",
      "IRPF — Recolhimento mensal obrigatório e carnê-leão (RIR arts. 118-127)","IRPF — Tributação definitiva e exclusiva na fonte",
      "IRPJ — Tributação das pessoas jurídicas: visão geral","IRPJ — Lucro real: apuração, adições e exclusões",
      "IRPJ — Lucro presumido: cálculo e abrangência","IRPJ — Lucro arbitrado","IRPJ — Deduções, incentivos fiscais e isenções",
      "IRPJ — Juros sobre capital próprio","CSLL — Contribuição Social sobre o Lucro Líquido","IPI — Fato gerador, contribuintes e responsáveis",
      "IPI — Base de cálculo e alíquotas","IPI — Não incidência, isenções e imunidades","IPI — Créditos do IPI e obrigações acessórias",
      "PIS/COFINS — Regime cumulativo","PIS/COFINS — Regime não cumulativo: créditos e apuração",
      "PIS/COFINS — Exclusões da base de cálculo e substituição tributária","IOF — Imposto sobre Operações Financeiras",
      "ITR — Imposto Territorial Rural","Simples Nacional: regras gerais, cálculo e exclusão",
      "Processo Administrativo Fiscal federal (Decreto nº 70.235/1972)","Obrigações acessórias federais e penalidades",
      "SPED: ECD, ECF, EFD-Contribuições e NF-e"
    ]},
    "Direito Previdenciário": { dificil: false, topicos: [
      "Conceito e aspectos teóricos da Seguridade Social","Origem e evolução da previdência social no Brasil",
      "Organização e princípios constitucionais da Seguridade (arts. 194-204 CF)","Fontes e aplicação das normas previdenciárias",
      "Vigência, hierarquia, interpretação e integração","Orientação dos tribunais superiores em matéria previdenciária",
      "RGPS: princípios, objetivos e Conselho Nacional (CNPS)","Lei nº 8.212/1991 — Custeio da Seguridade Social",
      "Contribuições: empregado, empregador doméstico e empresa","Contribuições sobre folha de pagamento e 13º salário",
      "Contribuições de terceiros e entidades beneficentes","Lei nº 8.213/1991 — Plano de Benefícios da Previdência",
      "Beneficiários: segurados obrigatórios e facultativos","Espécies de benefícios e prestações previdenciárias","Períodos de carência",
      "Salário de benefício e renda mensal do benefício","Reajuste dos benefícios previdenciários",
      "Manutenção, perda e restabelecimento da qualidade de segurado","Previdência dos servidores públicos — RPPS"
    ]},
    "Direito Financeiro": { dificil: false, topicos: [
      "Lei de Responsabilidade Fiscal — LC nº 101/2000","Orçamento público: conceito, natureza e princípios orçamentários",
      "Plano Plurianual (PPA)","Lei de Diretrizes Orçamentárias (LDO)","Lei Orçamentária Anual (LOA)",
      "Ciclo orçamentário e execução do orçamento","Receita pública: conceito, classificação e estágios",
      "Despesa pública: conceito, classificação e estágios","Créditos adicionais: suplementares, especiais e extraordinários",
      "Dívida pública: consolidada e mobiliária","Controle externo das finanças públicas (TCU)",
      "Controle interno e responsabilização fiscal"
    ]},
    "Direito Penal Tributário": { dificil: false, topicos: [
      "Crimes contra a ordem tributária — Lei nº 8.137/1990","Crimes praticados por particulares (arts. 1º e 2º da Lei 8.137/90)",
      "Crimes praticados por funcionários públicos (art. 3º da Lei 8.137/90)","Penas e causas de aumento nos crimes tributários",
      "Extinção da punibilidade pelo pagamento integral","Parcelamento e suspensão da punibilidade",
      "Responsabilidade penal da pessoa jurídica em crimes tributários","Crimes de descaminho e contrabando (CP arts. 334 e 334-A)",
      "Lavagem de capitais de origem tributária","Aplicação da lei penal tributária no tempo e no espaço"
    ]},
    "Comércio Internacional": { dificil: false, topicos: [
      "Conceitos gerais de comércio internacional","Organismos internacionais: OMC, UNCTAD e ALADI",
      "Acordos comerciais preferenciais e blocos econômicos","Mercosul: estrutura, objetivos e funcionamento",
      "Zona de Livre Comércio e União Aduaneira","Modalidades de exportação: direta, indireta e por conta e ordem",
      "Modalidades de importação: direta e por encomenda","Operadores logísticos internacionais",
      "Classificação Fiscal de Mercadorias — NCM/SH","Tarifa Externa Comum (TEC) do Mercosul","Regime de Origem do Mercosul (ROO)",
      "Aspectos tributários do comércio exterior (II, IE, IPI, PIS/COFINS)","Drawback: suspensão e isenção",
      "Câmbio em operações de comércio exterior","Incoterms: modalidades e distribuição de responsabilidades",
      "Meios de pagamento internacionais"
    ]},
    "Legislação Aduaneira": { dificil: false, topicos: [
      "Regulamento Aduaneiro — Decreto nº 6.759/2009","Imposto de Importação: fato gerador, contribuinte, base de cálculo",
      "Alíquotas do II e regimes de tributação","Imposto de Exportação: fato gerador e aplicação",
      "Despacho aduaneiro de importação: etapas e canais","Despacho aduaneiro de exportação",
      "Valor aduaneiro: Acordo de Valoração Aduaneira (AVA-GATT)","Métodos de valoração aduaneira (1º ao 6º método)",
      "Admissão temporária: modalidades e condições","Entreposto aduaneiro: modalidades e controle",
      "Drawback: suspensão, isenção e restituição","Zona Franca de Manaus e áreas de livre comércio",
      "Controle aduaneiro de viajantes","Descaminho e contrabando na legislação aduaneira","Infrações e penalidades aduaneiras",
      "Trânsito aduaneiro nacional e internacional","Bagagem acompanhada e desacompanhada",
      "Remessas postais e expressas internacionais","SISCOMEX: sistema integrado de comércio exterior"
    ]}
  }
};

export const META_PADRAO = 89;
export const META_DIFICIL = 92;

let _cacheEdital = null;

// Busca o edital do Firestore. Se não existir ainda (primeiro uso),
// grava a base inicial completa e devolve ela.
export async function carregarEdital() {
  if (_cacheEdital) return _cacheEdital;
  let doc = await getDocument('edital', 'config');
  if (!doc) {
    await setDocument('edital', 'config', EDITAL_INICIAL);
    doc = { id: 'config', ...EDITAL_INICIAL };
  }
  _cacheEdital = doc;
  return doc;
}

export function invalidarCacheEdital() {
  _cacheEdital = null;
}

export async function salvarEdital(novoEdital) {
  await setDocument('edital', 'config', novoEdital);
  _cacheEdital = { id: 'config', ...novoEdital };
  return _cacheEdital;
}

export function getMeta(edital, materia) {
  const m = edital.materias[materia];
  return (m && m.dificil) ? META_DIFICIL : META_PADRAO;
}

function isAtiva(dados) {
  // Matérias antigas (criadas antes desta função existir) não têm o campo
  // "ativa" definido — tratamos a ausência do campo como ativa por padrão.
  return dados.ativa !== false;
}

// Lista apenas matérias ativas — usada em Registrar Sessão, Painel Geral,
// Histórico, Relatório Semanal e nos avisos de tópico fraco.
export function listaMaterias(edital) {
  return Object.keys(edital.materias)
    .filter(nome => isAtiva(edital.materias[nome]))
    .sort();
}

// Lista todas as matérias, ativas e inativas — usada na aba Administração.
export function listaTodasMaterias(edital) {
  return Object.keys(edital.materias).sort();
}

export function materiaEstaAtiva(edital, materia) {
  const m = edital.materias[materia];
  return m ? isAtiva(m) : false;
}

export function contarMateriasInativas(edital) {
  return Object.values(edital.materias).filter(d => !isAtiva(d)).length;
}

export function listaTopicos(edital, materia) {
  return (edital.materias[materia] && edital.materias[materia].topicos) || [];
}

// ─── Operações de administração (CRUD) ───

export async function adicionarMateria(edital, nome, dificil = false) {
  if (edital.materias[nome]) throw new Error('Matéria já existe.');
  edital.materias[nome] = { dificil, ativa: true, topicos: [] };
  return salvarEdital(edital);
}

export async function inativarMateria(edital, nome) {
  if (!edital.materias[nome]) throw new Error('Matéria não encontrada.');
  edital.materias[nome].ativa = false;
  return salvarEdital(edital);
}

export async function reativarMateria(edital, nome) {
  if (!edital.materias[nome]) throw new Error('Matéria não encontrada.');
  edital.materias[nome].ativa = true;
  return salvarEdital(edital);
}

export async function removerMateria(edital, nome) {
  delete edital.materias[nome];
  return salvarEdital(edital);
}

export async function editarMateria(edital, nomeAntigo, nomeNovo, dificil) {
  const dados = edital.materias[nomeAntigo];
  if (!dados) throw new Error('Matéria não encontrada.');
  if (nomeNovo !== nomeAntigo) {
    delete edital.materias[nomeAntigo];
  }
  edital.materias[nomeNovo] = { dificil, ativa: isAtiva(dados), topicos: dados.topicos };
  return salvarEdital(edital);
}

export async function adicionarTopico(edital, materia, topico) {
  if (!edital.materias[materia]) throw new Error('Matéria não encontrada.');
  edital.materias[materia].topicos.push(topico);
  return salvarEdital(edital);
}

export async function editarTopico(edital, materia, indice, novoTexto) {
  edital.materias[materia].topicos[indice] = novoTexto;
  return salvarEdital(edital);
}

export async function removerTopico(edital, materia, indice) {
  edital.materias[materia].topicos.splice(indice, 1);
  return salvarEdital(edital);
}

export async function marcarRevisado(edital) {
  edital.revisado = true;
  edital.ultimaAtualizacao = new Date().toLocaleDateString('pt-BR');
  return salvarEdital(edital);
}

export async function marcarDesatualizado(edital) {
  edital.revisado = false;
  return salvarEdital(edital);
}

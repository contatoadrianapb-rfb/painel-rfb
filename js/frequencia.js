// ─────────────────────────────────────────────────────────────
// Módulo de Frequência de Cobrança — dados extraídos do Tec Concursos
// por tópico, banca examinadora, percentual e quantidade de questões
// ─────────────────────────────────────────────────────────────
import { getDocument, setDocument } from './firebase-config.js';

export const BANCAS = ['Cebraspe', 'FGV', 'FCC', 'Cesgranrio', 'IBFC', 'IDECAN', 'Outra'];

const FREQUENCIA_INICIAL = {
  // Estrutura: { "Matéria::Tópico": { "Cebraspe": { pct: 12, questoes: 23 }, "FGV": { pct: 18, questoes: 31 } } }
  dados: {},
  // Bancas atualmente selecionadas como referência para os cálculos (vazio = considera todas as cadastradas)
  bancasAtivas: []
};

let _cacheFrequencia = null;

export async function carregarFrequencia() {
  if (_cacheFrequencia) return _cacheFrequencia;
  let doc = await getDocument('frequencia', 'config');
  if (!doc) {
    await setDocument('frequencia', 'config', FREQUENCIA_INICIAL);
    doc = { id: 'config', ...FREQUENCIA_INICIAL };
  }
  _cacheFrequencia = doc;
  return doc;
}

export function invalidarCacheFrequencia() {
  _cacheFrequencia = null;
}

export async function salvarFrequencia(novaFrequencia) {
  await setDocument('frequencia', 'config', novaFrequencia);
  _cacheFrequencia = { id: 'config', ...novaFrequencia };
  return _cacheFrequencia;
}

function chave(materia, topico) {
  return `${materia}::${topico}`;
}

export async function registrarFrequenciaTopico(frequencia, materia, topico, banca, pct, questoes) {
  const k = chave(materia, topico);
  if (!frequencia.dados[k]) frequencia.dados[k] = {};
  frequencia.dados[k][banca] = { pct: Number(pct) || 0, questoes: Number(questoes) || 0 };
  return salvarFrequencia(frequencia);
}

export async function removerFrequenciaTopicoBanca(frequencia, materia, topico, banca) {
  const k = chave(materia, topico);
  if (frequencia.dados[k]) delete frequencia.dados[k][banca];
  return salvarFrequencia(frequencia);
}

export async function definirBancasAtivas(frequencia, bancas) {
  frequencia.bancasAtivas = bancas;
  return salvarFrequencia(frequencia);
}

export function getBancasCadastradas(frequencia, materia, topico) {
  const k = chave(materia, topico);
  return frequencia.dados[k] ? Object.keys(frequencia.dados[k]) : [];
}

// Combina os dados das bancas selecionadas (ou todas as cadastradas, se
// nenhuma estiver selecionada) em um único valor de percentual por tópico,
// usando média simples entre as bancas consideradas.
export function percentualCombinado(frequencia, materia, topico) {
  const k = chave(materia, topico);
  const registrosTopico = frequencia.dados[k];
  if (!registrosTopico) return null;

  const bancasConsideradas = (frequencia.bancasAtivas && frequencia.bancasAtivas.length)
    ? frequencia.bancasAtivas
    : Object.keys(registrosTopico);

  const valores = bancasConsideradas
    .map(b => registrosTopico[b])
    .filter(Boolean);

  if (!valores.length) return null;

  const somaPct = valores.reduce((a, v) => a + v.pct, 0);
  const somaQuestoes = valores.reduce((a, v) => a + v.questoes, 0);
  return { pct: Math.round((somaPct / valores.length) * 10) / 10, questoes: somaQuestoes };
}

// Gera o ranking de tópicos de uma matéria, ordenado por percentual de
// cobrança combinado (decrescente), com a posição e a régua de estrelas.
export function rankingTopicosMateria(frequencia, materia, topicos) {
  const comDados = topicos.map(topico => {
    const combinado = percentualCombinado(frequencia, materia, topico);
    return { topico, pct: combinado ? combinado.pct : null, questoes: combinado ? combinado.questoes : null, temDados: !!combinado };
  });

  // Tópicos com dados vêm primeiro, ordenados por percentual decrescente;
  // tópicos sem dados cadastrados ficam ao final, sem estrela definida.
  const ordenados = [...comDados].sort((a, b) => {
    if (a.temDados && b.temDados) return b.pct - a.pct;
    if (a.temDados) return -1;
    if (b.temDados) return 1;
    return 0;
  });

  let posicao = 0;
  return ordenados.map(item => {
    if (!item.temDados) return { ...item, posicao: null, estrelas: null };
    posicao++;
    return { ...item, posicao, estrelas: estrelasPorPosicao(posicao) };
  });
}

// Régua de estrelas por posição no ranking dentro da matéria:
// 1-5 = 5 estrelas | 6-9 = 4 estrelas | 10-15 = 3 estrelas (fecha o top 15)
// 16-25 = 2 estrelas | 26+ = 1 estrela
export function estrelasPorPosicao(posicao) {
  if (posicao <= 5) return 5;
  if (posicao <= 9) return 4;
  if (posicao <= 15) return 3;
  if (posicao <= 25) return 2;
  return 1;
}

export function renderEstrelas(n) {
  if (n === null || n === undefined) return '';
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// Pontuação de prioridade derivada da frequência, usada como fator extra
// no cálculo de cronograma (ver cronograma.js). Tópicos sem dados
// cadastrados recebem pontuação neutra (3, equivalente a 3 estrelas).
export function pontuacaoFrequenciaTopico(frequencia, materia, topico) {
  const combinado = percentualCombinado(frequencia, materia, topico);
  if (!combinado) return 3;
  // Aproximação direta: cada 5 pontos percentuais de cobrança ~ 1 ponto de prioridade,
  // limitado a um máximo de 5 para não distorcer demais a fórmula combinada do cronograma.
  return Math.min(5, Math.max(1, Math.round(combinado.pct / 5) || 1));
}

// Pontuação média de frequência de uma matéria inteira (média das
// pontuações de seus tópicos), usada como fator adicional no cronograma.
export function pontuacaoFrequenciaMateria(frequencia, materia, topicos) {
  if (!topicos.length) return 3;
  const soma = topicos.reduce((a, t) => a + pontuacaoFrequenciaTopico(frequencia, materia, t), 0);
  return soma / topicos.length;
}

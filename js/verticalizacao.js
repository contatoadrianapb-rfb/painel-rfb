// ─────────────────────────────────────────────────────────────
// Módulo de Edital Verticalizado — status de progresso, links e
// evolução de desempenho por tópico, usando os dados de sessões já
// registrados em Registrar Sessão (sem duplicar entrada de dados).
// ─────────────────────────────────────────────────────────────
import { getDocument, setDocument } from './firebase-config.js';
import { getMeta } from './edital.js';
import { agregarPorTopico, historicoTopico } from './sessoes.js';

export const STATUS_TOPICO = [
  { key: 'nao_iniciado', label: 'Não iniciado', cor: '#888780' },
  { key: 'em_andamento', label: 'Em andamento', cor: '#BA7517' },
  { key: 'concluido', label: 'Concluído', cor: '#1D9E75' },
  { key: 'revisado', label: 'Revisado', cor: '#7F77DD' }
];

const VERTICALIZACAO_INICIAL = {
  // Estrutura: { "Matéria::Tópico": { status: 'em_andamento', links: [{nome:'Caderno de questões', url:'...'}] } }
  topicos: {}
};

let _cache = null;

export async function carregarVerticalizacao() {
  if (_cache) return _cache;
  let doc = await getDocument('verticalizacao', 'config');
  if (!doc) {
    await setDocument('verticalizacao', 'config', VERTICALIZACAO_INICIAL);
    doc = { id: 'config', ...VERTICALIZACAO_INICIAL };
  }
  _cache = doc;
  return doc;
}

export function invalidarCacheVerticalizacao() {
  _cache = null;
}

export async function salvarVerticalizacao(novaVerticalizacao) {
  await setDocument('verticalizacao', 'config', novaVerticalizacao);
  _cache = { id: 'config', ...novaVerticalizacao };
  return _cache;
}

function chave(materia, topico) {
  return `${materia}::${topico}`;
}

function getRegistro(vert, materia, topico) {
  const k = chave(materia, topico);
  if (!vert.topicos[k]) {
    vert.topicos[k] = { status: 'nao_iniciado', links: [] };
  }
  return vert.topicos[k];
}

export function getStatusTopico(vert, materia, topico) {
  const k = chave(materia, topico);
  return (vert.topicos[k] && vert.topicos[k].status) || 'nao_iniciado';
}

export async function definirStatusTopico(vert, materia, topico, status) {
  const reg = getRegistro(vert, materia, topico);
  reg.status = status;
  return salvarVerticalizacao(vert);
}

export function getLinksTopico(vert, materia, topico) {
  const k = chave(materia, topico);
  return (vert.topicos[k] && vert.topicos[k].links) || [];
}

export async function adicionarLinkTopico(vert, materia, topico, nome, url) {
  const reg = getRegistro(vert, materia, topico);
  reg.links.push({ nome: nome || 'Caderno', url });
  return salvarVerticalizacao(vert);
}

export async function removerLinkTopico(vert, materia, topico, indice) {
  const reg = getRegistro(vert, materia, topico);
  reg.links.splice(indice, 1);
  return salvarVerticalizacao(vert);
}

export async function editarLinkTopico(vert, materia, topico, indice, nome, url) {
  const reg = getRegistro(vert, materia, topico);
  if (!reg.links[indice]) throw new Error('Link não encontrado.');
  reg.links[indice] = { nome: nome || 'Caderno', url };
  return salvarVerticalizacao(vert);
}

export function getStatusInfo(statusKey) {
  return STATUS_TOPICO.find(s => s.key === statusKey) || STATUS_TOPICO[0];
}

// Combina dados de progresso (status, links) com o desempenho real
// (agregado das sessões de questões) e o histórico cronológico de
// evolução, para exibir tudo junto na aba Edital Verticalizado.
export function montarDadosTopico(vert, edital, sessoes, materia, topico) {
  const agregado = agregarPorTopico(sessoes);
  const k = chave(materia, topico);
  const dadosAgregados = agregado[k];
  const meta = getMeta(edital, materia);

  let pct = null, total = 0, acertos = 0, temDados = false;
  if (dadosAgregados && dadosAgregados.total > 0) {
    total = dadosAgregados.total;
    acertos = dadosAgregados.acertos;
    pct = Math.round((acertos / total) * 100);
    temDados = true;
  }

  const historico = historicoTopico(sessoes, materia, topico);

  return {
    materia, topico, meta,
    status: getStatusTopico(vert, materia, topico),
    links: getLinksTopico(vert, materia, topico),
    pct, total, acertos, temDados,
    gap: temDados ? Math.max(meta - pct, 0) : null,
    historico // array cronológico de sessões {pct, total, acertos, data}, para evolução
  };
}

// Conta quantos tópicos de uma matéria estão em cada status, para a
// barra de progresso visual no cabeçalho de cada matéria expandida.
export function contarStatusMateria(vert, materia, topicos) {
  const contagem = { nao_iniciado: 0, em_andamento: 0, concluido: 0, revisado: 0 };
  topicos.forEach(t => {
    const s = getStatusTopico(vert, materia, t);
    contagem[s] = (contagem[s] || 0) + 1;
  });
  return contagem;
}

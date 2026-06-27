// ─────────────────────────────────────────────────────────────
// Módulo de Sessões — registro de questões, histórico, agregações
// ─────────────────────────────────────────────────────────────
import { getAllDocs, addDocument, deleteDocument, updateDocument } from './firebase-config.js';
import { getMeta, materiaEstaAtiva } from './edital.js';

function hojeBR() {
  const d = new Date();
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + String(d.getFullYear()).slice(2);
}

function semanaISO(dataBR) {
  const p = dataBR.split('/');
  if (p.length < 3) return 'sem-data';
  const d = new Date('20'+p[2]+'-'+p[1]+'-'+p[0]);
  if (isNaN(d)) return 'sem-data';
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const wk = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return d.getFullYear() + '-W' + String(wk).padStart(2, '0');
}

export const TIPOS_MATERIAL = ['Videoaula', 'Leitura de lei', 'Resumo', 'Revisão', 'Outro'];

export async function listarSessoes() {
  const sessoes = await getAllDocs('sessoes');
  // ordenado por ordem de criação (assumindo IDs crescentes do Firestore não garantem ordem;
  // por isso guardamos timestamp local como número crescente)
  return sessoes.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

// Sessão de questões (Tec Concursos) — comportamento original, com aproveitamento %
export async function registrarSessao({ materia, topico, total, acertos, data }) {
  const dataFinal = data || hojeBR();
  const pct = Math.round((acertos / total) * 100);
  const sessao = {
    tipo: 'questoes',
    materia, topico, total, acertos, pct,
    data: dataFinal,
    semana: semanaISO(dataFinal),
    ordem: Date.now()
  };
  return addDocument('sessoes', sessao);
}

// Sessão de teoria/revisão — sem questões nem aproveitamento, registra tempo dedicado
export async function registrarSessaoTeoria({ materia, topico, tipoMaterial, horas, minutos, data }) {
  const dataFinal = data || hojeBR();
  const duracaoMin = (Number(horas) || 0) * 60 + (Number(minutos) || 0);
  const sessao = {
    tipo: 'teoria',
    materia, topico,
    tipoMaterial: tipoMaterial || 'Outro',
    duracaoMin,
    data: dataFinal,
    semana: semanaISO(dataFinal),
    ordem: Date.now()
  };
  return addDocument('sessoes', sessao);
}

export async function excluirSessao(id) {
  return deleteDocument('sessoes', id);
}

// Edita uma sessão de questões já registrada (matéria, tópico, total,
// acertos, data), recalculando o percentual e a semana automaticamente.
export async function editarSessaoQuestoes(id, { materia, topico, total, acertos, data }) {
  const pct = Math.round((acertos / total) * 100);
  const dados = {
    materia, topico, total, acertos, pct,
    data, semana: semanaISO(data)
  };
  return updateDocument('sessoes', id, dados);
}

// Edita uma sessão de teoria/revisão já registrada.
export async function editarSessaoTeoria(id, { materia, topico, tipoMaterial, horas, minutos, data }) {
  const duracaoMin = (Number(horas) || 0) * 60 + (Number(minutos) || 0);
  const dados = {
    materia, topico, tipoMaterial: tipoMaterial || 'Outro', duracaoMin,
    data, semana: semanaISO(data)
  };
  return updateDocument('sessoes', id, dados);
}

// Sessões antigas não têm o campo "tipo" — tratamos a ausência como 'questoes'
// para manter compatibilidade com todo o histórico já registrado.
export function ehSessaoQuestoes(s) { return (s.tipo || 'questoes') === 'questoes'; }
export function ehSessaoTeoria(s) { return s.tipo === 'teoria'; }

export function sessoesQuestoes(sessoes) { return sessoes.filter(ehSessaoQuestoes); }
export function sessoesTeoria(sessoes) { return sessoes.filter(ehSessaoTeoria); }

export function formatarDuracao(min) {
  if (!min || min <= 0) return '0min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}min`;
}

export function totalMinutosTeoria(sessoesDeTeoria) {
  return sessoesDeTeoria.reduce((a, s) => a + (s.duracaoMin || 0), 0);
}

export function sessoesDoDia(sessoes, dataBR) {
  return sessoes.filter(s => s.data === dataBR);
}

export function sessoesHoje(sessoes) {
  return sessoesDoDia(sessoes, hojeBR());
}

export function agregarPorMateria(sessoes) {
  const mats = {};
  sessoesQuestoes(sessoes).forEach(s => {
    if (!mats[s.materia]) mats[s.materia] = { total: 0, acertos: 0 };
    mats[s.materia].total += s.total;
    mats[s.materia].acertos += s.acertos;
  });
  return mats;
}

// Agrega minutos de teoria/revisão por matéria — usado no Painel Geral e
// no Relatório Semanal, exibido separado das métricas de questões.
export function agregarTeoriaPorMateria(sessoes) {
  const mats = {};
  sessoesTeoria(sessoes).forEach(s => {
    if (!mats[s.materia]) mats[s.materia] = { minutos: 0, sessoes: 0 };
    mats[s.materia].minutos += (s.duracaoMin || 0);
    mats[s.materia].sessoes += 1;
  });
  return mats;
}

export function agregarPorTopico(sessoes) {
  const tops = {};
  sessoesQuestoes(sessoes).forEach(s => {
    if (!s.topico || s.topico.includes('não selecionado')) return;
    const chave = s.materia + '::' + s.topico;
    if (!tops[chave]) tops[chave] = { materia: s.materia, topico: s.topico, total: 0, acertos: 0 };
    tops[chave].total += s.total;
    tops[chave].acertos += s.acertos;
  });
  return tops;
}

// Retorna lista de tópicos cujo aproveitamento agregado está abaixo da meta
// da matéria correspondente — usado para disparar o aviso de flashcard.
export function topicosFracos(sessoes, edital) {
  const tops = agregarPorTopico(sessoes);
  const fracos = [];
  Object.values(tops).forEach(t => {
    if (!materiaEstaAtiva(edital, t.materia)) return; // ignora matérias inativas
    const pct = Math.round((t.acertos / t.total) * 100);
    const meta = getMeta(edital, t.materia);
    if (pct < meta) {
      fracos.push({ ...t, pct, meta, gap: meta - pct });
    }
  });
  return fracos.sort((a, b) => a.pct - b.pct);
}

// Histórico cronológico de sessões de questões de um tópico específico,
// usado na aba Edital Verticalizado para mostrar a evolução do desempenho
// (ex: 5/15 numa semana, 13/15 na semana seguinte).
export function historicoTopico(sessoes, materia, topico) {
  return sessoesQuestoes(sessoes)
    .filter(s => s.materia === materia && s.topico === topico)
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

export function getSemanasDisponiveis(sessoes) {
  return [...new Set(sessoes.map(s => s.semana))].sort();
}

export function filtrarPorSemana(sessoes, semana) {
  return semana === 'all' ? sessoes : sessoes.filter(s => s.semana === semana);
}

// Remove sessões cuja matéria está inativada no edital. Usada antes de
// qualquer agregação exibida em Painel Geral, Histórico e Relatório Semanal,
// para que matérias inativas fiquem completamente fora dessas visões.
export function filtrarSessoesAtivas(sessoes, edital) {
  return sessoes.filter(s => materiaEstaAtiva(edital, s.materia));
}

export { hojeBR, semanaISO };

// ─────────────────────────────────────────────────────────────
// Módulo de Sessões — registro de questões, histórico, agregações
// ─────────────────────────────────────────────────────────────
import { getAllDocs, addDocument, deleteDocument } from './firebase-config.js';
import { getMeta } from './edital.js';

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

export async function listarSessoes() {
  const sessoes = await getAllDocs('sessoes');
  // ordenado por ordem de criação (assumindo IDs crescentes do Firestore não garantem ordem;
  // por isso guardamos timestamp local como número crescente)
  return sessoes.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

export async function registrarSessao({ materia, topico, total, acertos, data }) {
  const dataFinal = data || hojeBR();
  const pct = Math.round((acertos / total) * 100);
  const sessao = {
    materia, topico, total, acertos, pct,
    data: dataFinal,
    semana: semanaISO(dataFinal),
    ordem: Date.now()
  };
  return addDocument('sessoes', sessao);
}

export async function excluirSessao(id) {
  return deleteDocument('sessoes', id);
}

export function sessoesDoDia(sessoes, dataBR) {
  return sessoes.filter(s => s.data === dataBR);
}

export function sessoesHoje(sessoes) {
  return sessoesDoDia(sessoes, hojeBR());
}

export function agregarPorMateria(sessoes) {
  const mats = {};
  sessoes.forEach(s => {
    if (!mats[s.materia]) mats[s.materia] = { total: 0, acertos: 0 };
    mats[s.materia].total += s.total;
    mats[s.materia].acertos += s.acertos;
  });
  return mats;
}

export function agregarPorTopico(sessoes) {
  const tops = {};
  sessoes.forEach(s => {
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
    const pct = Math.round((t.acertos / t.total) * 100);
    const meta = getMeta(edital, t.materia);
    if (pct < meta) {
      fracos.push({ ...t, pct, meta, gap: meta - pct });
    }
  });
  return fracos.sort((a, b) => a.pct - b.pct);
}

export function getSemanasDisponiveis(sessoes) {
  return [...new Set(sessoes.map(s => s.semana))].sort();
}

export function filtrarPorSemana(sessoes, semana) {
  return semana === 'all' ? sessoes : sessoes.filter(s => s.semana === semana);
}

export { hojeBR, semanaISO };

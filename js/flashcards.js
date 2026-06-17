// ─────────────────────────────────────────────────────────────
// Módulo de Flashcards — criação, listagem e repetição espaçada
// ─────────────────────────────────────────────────────────────
import { getAllDocs, addDocument, updateDocument, deleteDocument } from './firebase-config.js';

const SEQUENCIA_INTERVALOS = [1, 3, 7, 15, 30]; // dias

function hojeISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // yyyy-mm-dd, comparável com string
}

function somarDias(dataISO, dias) {
  const d = new Date(dataISO + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function formatarDataBR(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

export async function listarFlashcards() {
  return getAllDocs('flashcards');
}

export async function criarFlashcard({ materia, topico, pergunta, resposta, explicacao, link }) {
  const hoje = hojeISO();
  const card = {
    materia, topico, pergunta, resposta,
    explicacao: explicacao || '',
    link: link || '',
    intervalo: 1,
    repeticoes: 0,
    proximaRevisao: hoje, // novo cartão já entra disponível para revisão hoje
    status: 'novo',
    criadoEm: hoje,
    ultimaRevisao: null
  };
  return addDocument('flashcards', card);
}

export async function excluirFlashcard(id) {
  return deleteDocument('flashcards', id);
}

// Algoritmo de repetição espaçada (SM-2 simplificado)
export async function processarRevisao(card, acertou) {
  const hoje = hojeISO();
  let { repeticoes, intervalo, status } = card;

  if (acertou) {
    repeticoes = (repeticoes || 0) + 1;
    const idx = Math.min(repeticoes - 1, SEQUENCIA_INTERVALOS.length - 1);
    intervalo = SEQUENCIA_INTERVALOS[idx];
    status = repeticoes >= 4 ? 'maduro' : 'em_repeticao';
  } else {
    repeticoes = 0;
    intervalo = 1;
    status = 'em_repeticao';
  }

  const proximaRevisao = somarDias(hoje, intervalo);
  const atualizado = { repeticoes, intervalo, status, proximaRevisao, ultimaRevisao: hoje };
  await updateDocument('flashcards', card.id, atualizado);
  return { ...card, ...atualizado };
}

export function flashcardsVencidosHoje(cards, edital = null) {
  const hoje = hojeISO();
  let vencidos = cards.filter(c => c.proximaRevisao <= hoje);
  if (edital) {
    vencidos = vencidos.filter(c => {
      const m = edital.materias[c.materia];
      return !m || m.ativa !== false; // matéria inexistente ou ativa passa; inativa é removida
    });
  }
  return vencidos;
}

export function agruparFlashcardsPorMateria(cards) {
  const grupos = {};
  cards.forEach(c => {
    if (!grupos[c.materia]) grupos[c.materia] = [];
    grupos[c.materia].push(c);
  });
  return grupos;
}

export function contarPorStatus(cards) {
  return {
    novo: cards.filter(c => c.status === 'novo').length,
    em_repeticao: cards.filter(c => c.status === 'em_repeticao').length,
    maduro: cards.filter(c => c.status === 'maduro').length,
    total: cards.length
  };
}

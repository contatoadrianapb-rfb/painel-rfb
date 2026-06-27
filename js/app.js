// ─────────────────────────────────────────────────────────────
// app.js — Orquestrador principal do Painel de Estudos RFB
// ─────────────────────────────────────────────────────────────
import { carregarEdital, invalidarCacheEdital } from './edital.js';
import { listarSessoes } from './sessoes.js';
import { getFlashcardsVencidosHoje, renderFlashcardsTab, renderRevisarHojeTab, initFlashcardsUI, atualizarContexto as atualizarContextoFlashcards } from './flashcards-ui.js';
import { initAdminUI, renderAdminTab, atualizarEditalAdmin } from './admin-ui.js';
import {
  initSessoesUI, atualizarContextoSessoes,
  renderRegistroTab, renderPainelTab, renderHistoricoTab, renderRelatorioTab
} from './sessoes-ui.js';
import { initCronogramaUI, atualizarContextoCronograma, renderCronogramaTab } from './cronograma-ui.js';
import { initFrequenciaUI, atualizarContextoFrequencia, renderFrequenciaTab } from './frequencia-ui.js';
import { initVerticalUI, atualizarContextoVertical, renderVerticalTab } from './verticalizacao-ui.js';

let _edital = null;
let _sessoes = [];

async function carregarTudo() {
  _edital = await carregarEdital();
  _sessoes = await listarSessoes();
}

async function recarregarENotificar() {
  invalidarCacheEdital();
  await carregarTudo();
  atualizarContextoSessoes(_edital, _sessoes);
  atualizarContextoFlashcards(_edital, _sessoes);
  atualizarContextoCronograma(_edital, _sessoes);
  await refreshAbaAtiva();
  await atualizarBadgeRevisarHoje();
  atualizarBannerEdital();
}

async function onAdminChange(novoEdital) {
  _edital = novoEdital;
  atualizarContextoSessoes(_edital, _sessoes);
  atualizarContextoFlashcards(_edital, _sessoes);
  atualizarContextoCronograma(_edital, _sessoes);
  atualizarContextoFrequencia(_edital);
  atualizarContextoVertical(_edital, _sessoes);
  atualizarBannerEdital();
}

function atualizarBannerEdital() {
  const banner = document.getElementById('edital-banner');
  if (_edital && !_edital.revisado) {
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}

async function atualizarBadgeRevisarHoje() {
  const vencidos = await getFlashcardsVencidosHoje();
  const tabBtn = document.querySelector('[data-tab="revisar"]');
  const existing = tabBtn.querySelector('.tab-badge');
  if (vencidos.length > 0) {
    if (existing) {
      existing.textContent = vencidos.length;
    } else {
      const badge = document.createElement('span');
      badge.className = 'tab-badge';
      badge.textContent = vencidos.length;
      tabBtn.appendChild(badge);
    }
  } else if (existing) {
    existing.remove();
  }
  return vencidos.length;
}
window.__refreshRevisarHojeBadge = atualizarBadgeRevisarHoje;

const ABA_RENDERERS = {
  revisar: renderRevisarHojeTab,
  registro: renderRegistroTab,
  flashcards: renderFlashcardsTab,
  cronograma: renderCronogramaTab,
  frequencia: renderFrequenciaTab,
  vertical: renderVerticalTab,
  painel: renderPainelTab,
  historico: renderHistoricoTab,
  relatorio: renderRelatorioTab,
  admin: renderAdminTab
};

let _abaAtiva = 'registro';

async function refreshAbaAtiva() {
  const fn = ABA_RENDERERS[_abaAtiva];
  if (fn) await fn();
}

window.__mudarAba = async function(aba, btnEl) {
  document.querySelectorAll('.view').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
  document.getElementById('view-' + aba).classList.add('active');
  if (btnEl) btnEl.classList.add('active');
  _abaAtiva = aba;
  await refreshAbaAtiva();
};

async function init() {
  await carregarTudo();

  initSessoesUI(_edital, _sessoes, recarregarENotificar);
  initFlashcardsUI(_edital, _sessoes, () => {});
  initAdminUI(_edital, onAdminChange);
  initCronogramaUI(_edital, _sessoes);
  initFrequenciaUI(_edital);
  initVerticalUI(_edital, _sessoes);

  document.getElementById('hdr-data').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  atualizarBannerEdital();
  const vencidosCount = await atualizarBadgeRevisarHoje();

  // Lógica de prioridade: se houver cartões vencidos, abre Revisar Hoje;
  // senão, abre Registrar Sessão (padrão).
  if (vencidosCount > 0) {
    const btn = document.querySelector('[data-tab="revisar"]');
    await window.__mudarAba('revisar', btn);
  } else {
    const btn = document.querySelector('[data-tab="registro"]');
    await window.__mudarAba('registro', btn);
  }
}

document.addEventListener('DOMContentLoaded', init);

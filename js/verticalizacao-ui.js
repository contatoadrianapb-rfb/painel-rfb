// ─────────────────────────────────────────────────────────────
// UI — Edital Verticalizado
// ─────────────────────────────────────────────────────────────
import {
  carregarVerticalizacao, definirStatusTopico, adicionarLinkTopico,
  removerLinkTopico, editarLinkTopico, getLinksTopico, montarDadosTopico, contarStatusMateria,
  getStatusInfo, STATUS_TOPICO
} from './verticalizacao.js';
import { listaMaterias, listaTopicos, getMeta } from './edital.js';
import { historicoMateria } from './sessoes.js';

let _edital = null;
let _sessoes = [];
let _vert = null;
const _openState = {};
const _charts = {}; // instâncias de Chart.js por matéria, para destruir/atualizar sem duplicar

export function initVerticalUI(edital, sessoes) {
  _edital = edital;
  _sessoes = sessoes;
}

export function atualizarContextoVertical(edital, sessoes) {
  _edital = edital;
  _sessoes = sessoes;
}

export async function renderVerticalTab() {
  _vert = await carregarVerticalizacao();
  renderListaMaterias();
}

function slug(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '_'); }
function escapeAttr(s) { return s.replace(/'/g, "\\'"); }

function renderListaMaterias() {
  const container = document.getElementById('vert-lista');
  const materias = listaMaterias(_edital);
  if (!materias.length) {
    container.innerHTML = '<div class="empty">Nenhuma matéria ativa cadastrada.</div>';
    return;
  }

  let html = '';
  materias.forEach(materia => {
    const topicos = listaTopicos(_edital, materia);
    const isOpen = !!_openState[materia];
    const contagem = contarStatusMateria(_vert, materia, topicos);
    const totalTopicos = topicos.length || 1;
    const pctConcluido = Math.round(((contagem.concluido + contagem.revisado) / totalTopicos) * 100);

    html += `
    <div class="admin-materia">
      <div class="admin-materia-header" onclick="window.__vertToggle('${escapeAttr(materia)}')">
        <div class="admin-materia-title" style="flex:1">
          <span class="chevron ${isOpen ? 'open' : ''}">▶</span>
          ${materia} <span style="color:var(--t3);font-weight:400;font-size:11px">(${topicos.length} tópicos)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;min-width:160px">
          <div class="bb" style="flex:1"><div class="bf" style="width:${pctConcluido}%;background:#1D9E75"></div></div>
          <span style="font-size:11px;color:var(--t3);white-space:nowrap">${pctConcluido}%</span>
        </div>
      </div>
      <div class="admin-materia-body ${isOpen ? 'open' : ''}">
        ${isOpen ? `<div class="card" style="margin-bottom:14px">
          <div class="ct">Evolução geral — ${materia}</div>
          <div style="position:relative;width:100%;height:160px">
            <canvas id="vert-chart-${slug(materia)}" role="img" aria-label="Evolução do aproveitamento em ${materia}"></canvas>
          </div>
        </div>` : ''}
        ${topicos.map(t => renderTopicoCard(materia, t)).join('')}
      </div>
    </div>`;
  });
  container.innerHTML = html;

  // Renderiza os gráficos das matérias abertas após o HTML estar no DOM
  materias.forEach(materia => {
    if (_openState[materia]) renderGraficoMateria(materia);
  });
}

function renderGraficoMateria(materia) {
  const ctx = document.getElementById('vert-chart-' + slug(materia));
  if (!ctx) return;
  const historico = historicoMateria(_sessoes, materia);
  const meta = getMeta(_edital, materia);

  if (!historico.length) {
    const parent = ctx.parentElement;
    parent.innerHTML = '<div class="empty" style="height:100%;display:flex;align-items:center;justify-content:center">Sem sessões de questões registradas ainda nesta matéria.</div>';
    return;
  }

  const labels = historico.map(s => s.data);
  const data = historico.map(s => s.pct);

  if (_charts[materia]) {
    _charts[materia].destroy();
  }
  _charts[materia] = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Aproveit.', data, borderColor: '#7F77DD', backgroundColor: 'rgba(127,119,221,0.08)', tension: .3, pointRadius: 3, pointBackgroundColor: '#7F77DD', fill: true },
      { label: 'Meta', data: labels.map(() => meta), borderColor: '#E24B4A', borderDash: [5, 3], pointRadius: 0, borderWidth: 1.5, fill: false }
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 10 } } },
        x: { ticks: { font: { size: 9 }, autoSkip: true, maxRotation: 0 }, grid: { display: false } }
      }
    }
  });
}

function renderTopicoCard(materia, topico) {
  const dados = montarDadosTopico(_vert, _edital, _sessoes, materia, topico);
  const statusInfo = getStatusInfo(dados.status);
  const k = slug(materia + '_' + topico);

  let corPct = 'var(--t3)';
  if (dados.temDados) {
    corPct = dados.pct >= dados.meta ? '#1D9E75' : dados.gap <= 10 ? '#BA7517' : '#E24B4A';
  }

  let evolucaoHtml = '';
  if (dados.historico.length > 0) {
    evolucaoHtml = '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">' +
      dados.historico.map(h => {
        const cor = h.pct >= dados.meta ? '#1D9E75' : '#E24B4A';
        return `<span style="font-size:10px;padding:2px 6px;border-radius:10px;background:${cor}15;color:${cor};border:1px solid ${cor}40">${h.data}: ${h.acertos}/${h.total}</span>`;
      }).join('') + '</div>';
  }

  const linksHtml = dados.links.length
    ? dados.links.map((l, i) => `<span style="display:inline-flex;align-items:center;gap:2px;margin-right:10px">
        <a href="${l.url}" target="_blank" rel="noopener" class="fc-link">${l.nome} →</a>
        <button class="del-btn" style="font-size:12px" onclick="window.__vertEditarLink('${escapeAttr(materia)}','${escapeAttr(topico)}',${i})" title="Editar">✏️</button>
        <button class="del-btn" style="font-size:13px" onclick="window.__vertRemoverLink('${escapeAttr(materia)}','${escapeAttr(topico)}',${i})" title="Excluir">×</button>
      </span>`).join('')
    : '<span style="font-size:11px;color:var(--t3)">Nenhum link cadastrado</span>';

  return `
  <div class="card" style="margin-bottom:10px;padding:14px 16px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        <div style="font-size:13px;font-weight:500">${topico}</div>
        ${dados.temDados
          ? `<div style="font-size:12px;margin-top:4px"><span style="color:${corPct};font-weight:600">${dados.pct}%</span>
             <span style="color:var(--t3)"> (${dados.acertos}/${dados.total}q) · meta ${dados.meta}%</span></div>`
          : '<div style="font-size:11px;color:var(--t3);margin-top:4px">Sem questões registradas ainda</div>'}
        ${evolucaoHtml}
      </div>
      <select onchange="window.__vertMudarStatus('${escapeAttr(materia)}','${escapeAttr(topico)}', this.value)"
        style="width:auto;height:30px;font-size:12px;color:${statusInfo.cor};border-color:${statusInfo.cor}">
        ${STATUS_TOPICO.map(s => `<option value="${s.key}" ${s.key === dados.status ? 'selected' : ''}>${s.label}</option>`).join('')}
      </select>
    </div>
    <div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      ${linksHtml}
    </div>
    <div style="display:flex;gap:6px;margin-top:8px">
      <input type="text" id="vert-link-nome-${k}" placeholder="Nome (ex: Caderno de questões)" style="max-width:200px;height:28px;font-size:12px">
      <input type="text" id="vert-link-url-${k}" placeholder="https://..." style="height:28px;font-size:12px">
      <button class="btn btn-sm" onclick="window.__vertAdicionarLink('${escapeAttr(materia)}','${escapeAttr(topico)}','${k}')">+ Link</button>
    </div>
  </div>`;
}

window.__vertToggle = function(materia) {
  const estavaAberto = _openState[materia];
  _openState[materia] = !estavaAberto;
  if (estavaAberto && _charts[materia]) {
    _charts[materia].destroy();
    delete _charts[materia];
  }
  renderListaMaterias();
};

window.__vertMudarStatus = async function(materia, topico, status) {
  await definirStatusTopico(_vert, materia, topico, status);
  renderListaMaterias();
};

window.__vertAdicionarLink = async function(materia, topico, k) {
  const nomeInput = document.getElementById('vert-link-nome-' + k);
  const urlInput = document.getElementById('vert-link-url-' + k);
  const nome = nomeInput.value.trim() || 'Caderno';
  const url = urlInput.value.trim();
  if (!url) { alert('Cole o link do caderno antes de adicionar.'); return; }
  await adicionarLinkTopico(_vert, materia, topico, nome, url);
  renderListaMaterias();
};

window.__vertRemoverLink = async function(materia, topico, indice) {
  if (!confirm('Remover este link?')) return;
  await removerLinkTopico(_vert, materia, topico, indice);
  renderListaMaterias();
};

window.__vertEditarLink = async function(materia, topico, indice) {
  const linkAtual = getLinksTopico(_vert, materia, topico)[indice];
  if (!linkAtual) return;
  const novoNome = prompt('Nome do link:', linkAtual.nome);
  if (novoNome === null) return;
  const novaUrl = prompt('URL do link:', linkAtual.url);
  if (novaUrl === null) return;
  await editarLinkTopico(_vert, materia, topico, indice, novoNome.trim(), novaUrl.trim());
  renderListaMaterias();
};

// ─────────────────────────────────────────────────────────────
// UI — Registrar Sessão, Painel Geral, Histórico, Relatório Semanal
// ─────────────────────────────────────────────────────────────
import { registrarSessao, excluirSessao, sessoesHoje, agregarPorMateria,
  getSemanasDisponiveis, filtrarPorSemana, agregarPorTopico, hojeBR } from './sessoes.js';
import { getMeta, listaMaterias, listaTopicos } from './edital.js';

let _edital = null;
let _sessoes = [];
let _onChangeCallback = null;
let evolChart = null, swChart = null;

export function initSessoesUI(edital, sessoes, onChange) {
  _edital = edital;
  _sessoes = sessoes;
  _onChangeCallback = onChange;
}

export function atualizarContextoSessoes(edital, sessoes) {
  _edital = edital;
  _sessoes = sessoes;
}

function bc(p, m) { return p >= m ? '#639922' : p >= (m - 10) ? '#BA7517' : '#E24B4A'; }

// ─── Registrar Sessão ───

export function renderRegistroTab() {
  const matSel = document.getElementById('reg-materia');
  matSel.innerHTML = '<option value="">Matéria...</option>';
  listaMaterias(_edital).forEach(m => {
    const o = document.createElement('option');
    o.value = m; o.textContent = m;
    matSel.appendChild(o);
  });
  renderSessoesHoje();
}

window.__regPopularTopicos = function() {
  const mat = document.getElementById('reg-materia').value;
  const sel = document.getElementById('reg-topico');
  sel.innerHTML = '';
  const topicos = listaTopicos(_edital, mat);
  if (!mat || !topicos.length) {
    sel.innerHTML = '<option value="">Selecione a matéria primeiro...</option>';
    sel.disabled = true;
    return;
  }
  sel.innerHTML = '<option value="">Tópico do edital...</option>';
  topicos.forEach((t, i) => {
    const o = document.createElement('option');
    o.value = t; o.textContent = (i + 1) + '. ' + t;
    sel.appendChild(o);
  });
  sel.disabled = false;
};

window.__regAdicionar = async function() {
  const materia = document.getElementById('reg-materia').value;
  if (!materia) { regFlash('alert', 'Selecione uma matéria.'); return; }
  const topico = document.getElementById('reg-topico').value || '(tópico não selecionado)';
  const total = parseInt(document.getElementById('reg-total').value);
  const acertos = parseInt(document.getElementById('reg-acertos').value);
  const data = document.getElementById('reg-data').value.trim() || undefined;

  if (!total || total < 1) { regFlash('alert', 'Informe o total de questões.'); return; }
  if (isNaN(acertos) || acertos < 0) { regFlash('alert', 'Informe o número de acertos.'); return; }
  if (acertos > total) { regFlash('alert', 'Acertos não podem ser maiores que o total.'); return; }

  const pct = Math.round((acertos / total) * 100);
  await registrarSessao({ materia, topico, total, acertos, data });

  document.getElementById('reg-materia').value = '';
  document.getElementById('reg-topico').innerHTML = '<option value="">Selecione a matéria primeiro...</option>';
  document.getElementById('reg-topico').disabled = true;
  document.getElementById('reg-total').value = '';
  document.getElementById('reg-acertos').value = '';
  document.getElementById('reg-data').value = '';

  const meta = getMeta(_edital, materia);
  if (pct < meta) {
    regFlash('alert', `Atenção — ${materia} / ${topico}: ${pct}% está ${meta - pct} pontos abaixo da meta de ${meta}%. Considere criar um flashcard na aba Flashcards.`);
  } else {
    regFlash('success', `${materia} · ${topico}: ${pct}% — acima da meta! Continue assim.`);
  }

  if (_onChangeCallback) await _onChangeCallback();
};

function regFlash(type, msg) {
  const box = document.getElementById(type === 'alert' ? 'reg-alert' : 'reg-success');
  const other = document.getElementById(type === 'alert' ? 'reg-success' : 'reg-alert');
  box.querySelector('p').textContent = msg;
  box.style.display = 'block'; other.style.display = 'none';
  clearTimeout(box._t);
  box._t = setTimeout(() => box.style.display = 'none', 7000);
}

window.__regExcluir = async function(id) {
  if (!confirm('Remover esta sessão?')) return;
  await excluirSessao(id);
  if (_onChangeCallback) await _onChangeCallback();
};

function renderSessoesHoje() {
  const hoje = hojeBR();
  const ts = sessoesHoje(_sessoes);
  const list = document.getElementById('reg-hoje-lista');
  const metricsDiv = document.getElementById('reg-hoje-metricas');
  const now = new Date();
  document.getElementById('reg-hoje-titulo').textContent =
    'Sessões de hoje — ' + now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!ts.length) {
    list.innerHTML = '<div class="empty">Nenhuma sessão registrada hoje ainda.</div>';
    metricsDiv.style.display = 'none';
    return;
  }
  let tT = 0, tC = 0;
  let html = '<div style="overflow-x:auto"><table><thead><tr><th style="width:22%">Matéria</th><th style="width:32%">Tópico</th><th style="width:7%">Total</th><th style="width:7%">Acertos</th><th style="width:26%">Aproveit.</th><th></th></tr></thead><tbody>';
  ts.forEach(s => {
    tT += s.total; tC += s.acertos;
    const meta = getMeta(_edital, s.materia);
    const cor = bc(s.pct, meta);
    html += `<tr><td title="${s.materia}">${s.materia}</td>
      <td title="${s.topico}" style="color:var(--t2);font-size:11px;white-space:normal;line-height:1.3">${s.topico}</td>
      <td>${s.total}</td><td>${s.acertos}</td>
      <td><div class="bw"><div class="bb"><div class="bf" style="width:${s.pct}%;background:${cor}"></div></div><span class="bp" style="color:${cor}">${s.pct}%</span></div></td>
      <td><button class="del-btn" onclick="window.__regExcluir('${s.id}')" aria-label="Remover">×</button></td></tr>`;
  });
  html += '</tbody></table></div>';
  list.innerHTML = html;
  metricsDiv.style.display = 'grid';
  const pH = Math.round((tC / tT) * 100);
  document.getElementById('reg-hoje-total').textContent = tT;
  document.getElementById('reg-hoje-acertos').textContent = tC;
  document.getElementById('reg-hoje-sessoes').textContent = ts.length;
  const pEl = document.getElementById('reg-hoje-pct');
  pEl.textContent = pH + '%'; pEl.style.color = bc(pH, 89);
}

// ─── Painel Geral ───

export function renderPainelTab() {
  if (!_sessoes.length) {
    ['painel-total', 'painel-acertos', 'painel-materias'].forEach(id => document.getElementById(id).textContent = '0');
    document.getElementById('painel-pct').textContent = '—';
    document.getElementById('painel-barras').innerHTML = '<div class="empty">Registre sessões para ver o desempenho por matéria.</div>';
    return;
  }
  const totG = _sessoes.reduce((a, s) => a + s.total, 0);
  const cerG = _sessoes.reduce((a, s) => a + s.acertos, 0);
  const pG = Math.round((cerG / totG) * 100);
  document.getElementById('painel-total').textContent = totG;
  document.getElementById('painel-acertos').textContent = cerG;
  const pEl = document.getElementById('painel-pct'); pEl.textContent = pG + '%'; pEl.style.color = bc(pG, 89);

  const mats = agregarPorMateria(_sessoes);
  document.getElementById('painel-materias').textContent = Object.keys(mats).length;
  const topicosUnicos = new Set(_sessoes.filter(s => s.topico && !s.topico.includes('não selecionado')).map(s => s.materia + '::' + s.topico));
  document.getElementById('painel-topicos').textContent = topicosUnicos.size;

  const sorted = Object.entries(mats).sort((a, b) => Math.round(a[1].acertos / a[1].total * 100) - Math.round(b[1].acertos / b[1].total * 100));
  let bh = '';
  sorted.forEach(([mat, d]) => {
    const pct = Math.round((d.acertos / d.total) * 100);
    const meta = getMeta(_edital, mat);
    const cor = bc(pct, meta);
    bh += `<div class="mr2"><div class="mn">${mat}</div>
      <div class="mb2"><div class="mf" style="width:${pct}%;background:${cor}"></div>
        <div style="position:absolute;top:0;right:${100-meta}%;width:2px;height:100%;background:var(--r);opacity:.5"></div></div>
      <span class="mp" style="color:${cor}">${pct}%</span><span class="mq">${d.total}q</span></div>`;
  });
  document.getElementById('painel-barras').innerHTML = bh;

  const labels = _sessoes.map((_, i) => String(i + 1));
  const data = _sessoes.map(s => s.pct);
  const ctx = document.getElementById('evolChart');
  if (!ctx) return;
  if (!evolChart) {
    evolChart = new Chart(ctx, { type: 'line', data: { labels, datasets: [
      { label: 'Aproveit.', data, borderColor: '#7F77DD', backgroundColor: 'rgba(127,119,221,0.07)', tension: .3, pointRadius: 3, pointBackgroundColor: '#7F77DD', fill: true },
      { label: 'Meta', data: labels.map(() => 89), borderColor: '#E24B4A', borderDash: [5,3], pointRadius: 0, borderWidth: 1.5, fill: false }
    ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 10 } } }, x: { ticks: { font: { size: 10 }, autoSkip: true }, grid: { display: false } } } } });
  } else {
    evolChart.data.labels = labels; evolChart.data.datasets[0].data = data; evolChart.update();
  }
}

// ─── Histórico ───

export function renderHistoricoTab() {
  const tbody = document.getElementById('hist-corpo');
  if (!_sessoes.length) { tbody.innerHTML = '<tr><td colspan="8"><div class="empty">Nenhuma sessão registrada.</div></td></tr>'; return; }
  let html = '';
  [..._sessoes].reverse().forEach(s => {
    const meta = getMeta(_edital, s.materia);
    const ok = s.pct >= meta, warn = s.pct >= (meta - 10);
    const badge = ok ? 'bok' : warn ? 'bwn' : 'bda';
    const label = ok ? 'Na meta' : warn ? 'Atenção' : 'Abaixo';
    const cor = bc(s.pct, meta);
    html += `<tr><td title="${s.materia}">${s.materia}</td>
      <td title="${s.topico}" style="color:var(--t2);font-size:11px;white-space:normal;line-height:1.3">${s.topico}</td>
      <td>${s.data}</td><td>${s.total}</td><td>${s.acertos}</td>
      <td><div class="bw"><div class="bb"><div class="bf" style="width:${s.pct}%;background:${cor}"></div></div><span class="bp" style="color:${cor}">${s.pct}%</span></div></td>
      <td><span class="badge ${badge}">${label}</span></td>
      <td><button class="del-btn" onclick="window.__regExcluir('${s.id}')" aria-label="Remover">×</button></td></tr>`;
  });
  tbody.innerHTML = html;
}

// ─── Relatório Semanal ───

export function renderRelatorioTab() {
  const semanas = getSemanasDisponiveis(_sessoes);
  const sel = document.getElementById('rel-semana');
  const cur = sel.value;
  sel.innerHTML = '<option value="all">Todas as sessões</option>';
  semanas.forEach(w => {
    const o = document.createElement('option'); o.value = w;
    const [yr, wk] = w.split('-W');
    o.textContent = 'Semana ' + wk + ' / 20' + yr.slice(2);
    sel.appendChild(o);
  });
  if (semanas.includes(cur)) sel.value = cur;
  renderRelatorioConteudo();
}

window.__relAtualizar = renderRelatorioConteudo;

function renderRelatorioConteudo() {
  const sel = document.getElementById('rel-semana');
  const sf = filtrarPorSemana(_sessoes, sel ? sel.value : 'all');
  const rc = document.getElementById('rel-conteudo');
  const cd = document.getElementById('rel-cronograma');
  const rm = document.getElementById('rel-metricas');

  if (!sf.length) {
    rm.innerHTML = '';
    rc.innerHTML = '<div class="empty">Sem dados para o período selecionado.</div>';
    cd.innerHTML = '<div class="empty">Sem dados suficientes.</div>';
    if (swChart) { swChart.destroy(); swChart = null; }
    return;
  }

  const mats = {}, topicos = {};
  sf.forEach(s => {
    if (!mats[s.materia]) mats[s.materia] = { total: 0, acertos: 0, topicos: {} };
    mats[s.materia].total += s.total; mats[s.materia].acertos += s.acertos;
    if (s.topico && !s.topico.includes('não selecionado')) {
      if (!mats[s.materia].topicos[s.topico]) mats[s.materia].topicos[s.topico] = { total: 0, acertos: 0 };
      mats[s.materia].topicos[s.topico].total += s.total;
      mats[s.materia].topicos[s.topico].acertos += s.acertos;
      const chave = s.materia + '::' + s.topico;
      if (!topicos[chave]) topicos[chave] = { materia: s.materia, topico: s.topico, total: 0, acertos: 0 };
      topicos[chave].total += s.total; topicos[chave].acertos += s.acertos;
    }
  });

  const mArr = Object.entries(mats).map(([mat, d]) => ({ mat, pct: Math.round(d.acertos / d.total * 100), total: d.total, acertos: d.acertos, meta: getMeta(_edital, mat), topicos: d.topicos }));
  const fracos = mArr.filter(m => m.pct < m.meta).sort((a, b) => a.pct - b.pct);
  const fortes = mArr.filter(m => m.pct >= m.meta).sort((a, b) => b.pct - a.pct);
  const tArr = Object.values(topicos).map(t => ({ ...t, pct: Math.round(t.acertos / t.total * 100), meta: getMeta(_edital, t.materia) }));
  const tFracos = tArr.filter(t => t.pct < t.meta).sort((a, b) => a.pct - b.pct);

  const totF = sf.reduce((a, s) => a + s.total, 0);
  const cerF = sf.reduce((a, s) => a + s.acertos, 0);
  const pF = Math.round((cerF / totF) * 100);

  rm.innerHTML = `<div class="mg">
    <div class="mc"><div class="ml">Questões</div><div class="mv">${totF}</div></div>
    <div class="mc"><div class="ml">Acertos</div><div class="mv">${cerF}</div></div>
    <div class="mc"><div class="ml">Aproveitamento</div><div class="mv" style="color:${bc(pF,89)}">${pF}%</div><div class="ms">Meta: 89%</div></div>
    <div class="mc"><div class="ml">Matérias</div><div class="mv">${mArr.length}</div></div>
    <div class="mc"><div class="ml">Tópicos</div><div class="mv">${Object.keys(topicos).length}</div></div>
  </div>`;

  let html = '';
  if (fracos.length) {
    html += '<div style="margin-bottom:1rem"><div class="rt" style="color:var(--rd)">Pontos fracos — abaixo da meta</div>';
    fracos.forEach(m => {
      const cor = bc(m.pct, m.meta); const gap = m.meta - m.pct;
      const tf = Object.entries(m.topicos).map(([tk, d]) => ({ tk, pct: Math.round(d.acertos / d.total * 100) })).filter(t => t.pct < m.meta).sort((a, b) => a.pct - b.pct);
      html += `<div class="sr"><div style="flex:1"><span style="font-size:13px;font-weight:500">${m.mat}</span>`;
      if (tf.length) html += '<div style="margin-top:5px">' + tf.map(t => `<span class="ttag">${t.tk} (${t.pct}%)</span>`).join('') + '</div>';
      html += `</div><div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span style="font-size:12px;color:var(--t3)">${m.total}q</span>
        <span style="font-size:14px;font-weight:700;color:${cor}">${m.pct}%</span>
        <span class="badge bda">−${gap}pts</span></div></div>`;
    });
    html += '</div><div class="sep"></div>';
  }
  if (fortes.length) {
    html += '<div><div class="rt" style="color:var(--gd)">Pontos fortes — acima da meta</div>';
    fortes.forEach(m => {
      html += `<div class="sr"><span style="font-size:13px;font-weight:500">${m.mat}</span>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span style="font-size:12px;color:var(--t3)">${m.total}q</span>
        <span style="font-size:14px;font-weight:700;color:#639922">${m.pct}%</span>
        <span class="badge bok">+${m.pct - m.meta}pts</span></div></div>`;
    });
    html += '</div>';
  }
  if (!html) html = '<div class="empty">Nenhum dado suficiente para análise ainda.</div>';
  rc.innerHTML = html;

  const swL = mArr.map(m => m.mat.length > 13 ? m.mat.slice(0, 12) + '…' : m.mat);
  if (swChart) { swChart.destroy(); swChart = null; }
  const ctx = document.getElementById('swChart');
  if (ctx) {
    swChart = new Chart(ctx, { type: 'bar', data: { labels: swL, datasets: [
      { label: 'Aproveit.(%)', data: mArr.map(m => m.pct), backgroundColor: mArr.map(m => bc(m.pct, m.meta)), borderRadius: 4, borderSkipped: false },
      { label: 'Meta', data: mArr.map(m => m.meta), type: 'line', borderColor: '#E24B4A', borderDash: [4,3], pointRadius: 0, borderWidth: 1.5, fill: false }
    ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 10 } } }, x: { ticks: { font: { size: 9 }, maxRotation: 40 }, grid: { display: false } } } } });
  }

  const allFracos = tFracos.length ? tFracos : fracos.map(m => ({ mat: m.mat, topico: '(revisão geral)', pct: m.pct, total: m.total, meta: m.meta }));
  if (!allFracos.length) { cd.innerHTML = '<div class="empty" style="color:var(--gd)">Parabéns — sem pontos fracos identificados neste período!</div>'; return; }
  const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  let ch = '';
  allFracos.slice(0, 6).forEach((t, i) => {
    const gap = t.meta - t.pct; const qS = Math.ceil(t.meta / 100 * 30);
    const lbl = (t.topico !== '(revisão geral)') ? `${t.materia || t.mat} — ${t.topico}` : t.mat;
    ch += `<div class="cb2"><div class="cd">${DIAS[i]}</div><div class="ck">${lbl}</div>
      <div class="ci">Resolver ${qS} questões · Meta: ≥${t.meta}% · Gap atual: ${gap} pontos · Foque nos erros do Tec Concursos e considere criar um flashcard na aba Flashcards</div></div>`;
  });
  if (allFracos.length > 6) ch += `<div style="font-size:12px;color:var(--t3);margin-top:8px">+${allFracos.length - 6} tópicos adicionais aguardando a próxima rodada de revisão.</div>`;
  cd.innerHTML = ch;
}

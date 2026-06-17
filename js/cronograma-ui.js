// ─────────────────────────────────────────────────────────────
// UI — Cronograma personalizado
// ─────────────────────────────────────────────────────────────
import {
  carregarCronograma, salvarCronograma, gerarDistribuicao,
  formatarHoras, DIAS_SEMANA, totalHorasSemanais
} from './cronograma.js';
import { listaMaterias } from './edital.js';
import { carregarFrequencia } from './frequencia.js';

let _edital = null;
let _sessoes = [];
let _cronograma = null;
let _frequencia = null;

export function initCronogramaUI(edital, sessoes) {
  _edital = edital;
  _sessoes = sessoes;
}

export function atualizarContextoCronograma(edital, sessoes) {
  _edital = edital;
  _sessoes = sessoes;
}

export async function renderCronogramaTab() {
  _cronograma = await carregarCronograma();
  _frequencia = await carregarFrequencia();
  renderSelecaoMaterias();
  renderDisponibilidade();
  renderResultado();
}

function renderSelecaoMaterias() {
  const container = document.getElementById('cron-materias-lista');
  const todas = listaMaterias(_edital);
  if (!todas.length) {
    container.innerHTML = '<div class="empty">Nenhuma matéria ativa cadastrada.</div>';
    return;
  }
  let html = '';
  todas.forEach(m => {
    const checked = _cronograma.materiasSelecionadas.includes(m) ? 'checked' : '';
    html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--bo)">
      <input type="checkbox" id="cron-mat-${slug(m)}" ${checked} onchange="window.__cronToggleMateria('${escapeAttr(m)}', this.checked)" style="width:auto;height:auto">
      <label style="margin:0;font-size:13px;color:var(--tx);cursor:pointer" for="cron-mat-${slug(m)}">${m}</label>
    </div>`;
  });
  container.innerHTML = html;
}

function slug(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '_'); }
function escapeAttr(s) { return s.replace(/'/g, "\\'"); }

window.__cronToggleMateria = async function(materia, checked) {
  if (checked) {
    if (!_cronograma.materiasSelecionadas.includes(materia)) {
      _cronograma.materiasSelecionadas.push(materia);
    }
  } else {
    _cronograma.materiasSelecionadas = _cronograma.materiasSelecionadas.filter(m => m !== materia);
  }
  await salvarCronograma(_cronograma);
  renderResultado();
};

function renderDisponibilidade() {
  const modoSel = document.getElementById('cron-modo');
  modoSel.value = _cronograma.modoDisponibilidade;

  document.getElementById('cron-horas-semanais').value = _cronograma.horasSemanais || '';

  const diasContainer = document.getElementById('cron-dias-container');
  let html = '';
  DIAS_SEMANA.forEach(d => {
    const valor = (_cronograma.horasPorDia && _cronograma.horasPorDia[d.key]) || '';
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <label style="margin:0;font-size:12px;width:80px;flex-shrink:0">${d.label}</label>
      <input type="number" min="0" step="0.5" value="${valor}" placeholder="0" style="max-width:90px"
        onchange="window.__cronAtualizarDia('${d.key}', this.value)">
      <span style="font-size:11px;color:var(--t3)">horas</span>
    </div>`;
  });
  diasContainer.innerHTML = html;

  atualizarVisibilidadeModo();
}

function atualizarVisibilidadeModo() {
  const modo = _cronograma.modoDisponibilidade;
  document.getElementById('cron-semanal-box').style.display = modo === 'semanal' ? 'block' : 'none';
  document.getElementById('cron-diaria-box').style.display = modo === 'diaria' ? 'block' : 'none';
}

window.__cronMudarModo = async function() {
  const modo = document.getElementById('cron-modo').value;
  _cronograma.modoDisponibilidade = modo;
  await salvarCronograma(_cronograma);
  atualizarVisibilidadeModo();
  renderResultado();
};

window.__cronAtualizarHorasSemanais = async function() {
  const v = parseFloat(document.getElementById('cron-horas-semanais').value) || 0;
  _cronograma.horasSemanais = v;
  await salvarCronograma(_cronograma);
  renderResultado();
};

window.__cronAtualizarDia = async function(dia, valor) {
  if (!_cronograma.horasPorDia) _cronograma.horasPorDia = {};
  _cronograma.horasPorDia[dia] = parseFloat(valor) || 0;
  await salvarCronograma(_cronograma);
  renderResultado();
};

function renderResultado() {
  const container = document.getElementById('cron-resultado');
  const totalH = totalHorasSemanais(_cronograma);

  if (!_cronograma.materiasSelecionadas.length) {
    container.innerHTML = '<div class="empty">Selecione ao menos uma matéria acima para gerar o cronograma.</div>';
    return;
  }
  if (totalH <= 0) {
    container.innerHTML = '<div class="empty">Informe sua disponibilidade de horas para gerar o cronograma.</div>';
    return;
  }

  const distrib = gerarDistribuicao(_cronograma, _edital, _sessoes, _frequencia);
  if (!distrib.length) {
    container.innerHTML = '<div class="empty">Nenhuma das matérias selecionadas está ativa no edital.</div>';
    return;
  }

  let html = `<div class="mg" style="margin-bottom:1rem">
    <div class="mc"><div class="ml">Total semanal</div><div class="mv">${formatarHoras(totalH)}</div></div>
    <div class="mc"><div class="ml">Matérias no plano</div><div class="mv">${distrib.length}</div></div>
  </div>`;

  html += '<div class="rt">Distribuição sugerida por matéria</div>';
  distrib.forEach(d => {
    const corBarra = d.dificil ? '#7F77DD' : '#1D9E75';
    const semDados = !d.temDados ? '<span style="font-size:10px;color:var(--t3)">(sem dados de desempenho ainda)</span>' : '';
    const freqInfo = d.temFrequencia ? '<span style="font-size:10px;color:var(--t3)"> · frequência de cobrança considerada</span>' : '';
    html += `<div class="sr" style="align-items:center">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${d.materia} ${d.dificil ? '<span style="color:var(--p);font-size:11px">⚠ difícil</span>' : ''}
          ${d.pesoEdital >= 2 ? `<span class="badge bwn" style="margin-left:4px">Peso ${d.pesoEdital}</span>` : ''} ${semDados}${freqInfo}</div>
        <div class="bw" style="margin-top:5px;max-width:300px">
          <div class="bb"><div class="bf" style="width:${d.percentual}%;background:${corBarra}"></div></div>
          <span class="bp" style="color:${corBarra}">${d.percentual}%</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div style="font-size:15px;font-weight:700">${formatarHoras(d.horasSemana)}<span style="font-size:11px;color:var(--t3);font-weight:400">/sem</span></div>
        <div style="font-size:12px;color:var(--t3)">${formatarHoras(d.horasDia)}/dia (média)</div>
      </div>
    </div>`;
  });

  html += `<p class="hint" style="margin-top:14px">
    A prioridade considera o peso da matéria no edital, sua dificuldade declarada e o gap entre seu aproveitamento atual
    e a meta. Matérias com pior desempenho recebem proporcionalmente mais horas. Para reforçar a retenção, evite
    concentrar um dia inteiro em uma única matéria — alternar matérias diferentes ao longo da semana tem evidência
    de melhorar o aprendizado de longo prazo.
  </p>`;

  container.innerHTML = html;
}

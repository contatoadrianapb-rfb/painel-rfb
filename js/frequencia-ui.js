// ─────────────────────────────────────────────────────────────
// UI — Frequência de Cobrança por tópico/banca (dados do Tec Concursos)
// O percentual de cobrança é calculado automaticamente pelo sistema a
// partir da quantidade de questões informada pela usuária.
// ─────────────────────────────────────────────────────────────
import {
  carregarFrequencia, salvarFrequencia, registrarFrequenciaTopico,
  adicionarQuestoesFrequencia, removerFrequenciaTopicoBanca,
  getBancasCadastradas, getQuestoesTopicoBanca,
  rankingTopicosMateria, renderEstrelas, BANCAS
} from './frequencia.js';
import { listaMaterias, listaTopicos } from './edital.js';

let _edital = null;
let _frequencia = null;

export function initFrequenciaUI(edital) {
  _edital = edital;
}

export function atualizarContextoFrequencia(edital) {
  _edital = edital;
}

export async function renderFrequenciaTab() {
  _frequencia = await carregarFrequencia();
  renderSeletorBancas();
  renderFormularioEntrada();
  renderRankingMateria();
}

function renderSeletorBancas() {
  const container = document.getElementById('freq-bancas-ativas');
  let html = '<p class="hint" style="margin-bottom:8px">Selecione quais bancas considerar nos cálculos. Nenhuma marcada = considera todas as bancas cadastradas para cada tópico.</p>';
  html += '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:1rem">';
  BANCAS.forEach(b => {
    const checked = (_frequencia.bancasAtivas || []).includes(b) ? 'checked' : '';
    html += `<label style="display:flex;align-items:center;gap:6px;font-size:13px;margin:0;cursor:pointer">
      <input type="checkbox" value="${b}" ${checked} onchange="window.__freqToggleBanca('${b}', this.checked)" style="width:auto;height:auto">
      ${b}
    </label>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

window.__freqToggleBanca = async function(banca, checked) {
  let atuais = _frequencia.bancasAtivas || [];
  if (checked) {
    if (!atuais.includes(banca)) atuais.push(banca);
  } else {
    atuais = atuais.filter(b => b !== banca);
  }
  _frequencia.bancasAtivas = atuais;
  await salvarFrequencia(_frequencia);
  renderRankingMateria();
};

function renderFormularioEntrada() {
  const matSel = document.getElementById('freq-materia');
  if (matSel.options.length <= 1) {
    matSel.innerHTML = '<option value="">Matéria...</option>';
    listaMaterias(_edital).forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = m;
      matSel.appendChild(o);
    });
  }
  const bancaSel = document.getElementById('freq-banca');
  if (bancaSel.options.length <= 1) {
    bancaSel.innerHTML = '<option value="">Banca...</option>';
    BANCAS.forEach(b => {
      const o = document.createElement('option');
      o.value = b; o.textContent = b;
      bancaSel.appendChild(o);
    });
  }
}

window.__freqPopularTopicos = function() {
  const mat = document.getElementById('freq-materia').value;
  const sel = document.getElementById('freq-topico');
  sel.innerHTML = '';
  const topicos = mat ? listaTopicos(_edital, mat) : [];
  if (!mat || !topicos.length) {
    sel.innerHTML = '<option value="">Selecione a matéria primeiro...</option>';
    sel.disabled = true;
    return;
  }
  sel.innerHTML = '<option value="">Tópico...</option>';
  topicos.forEach(t => {
    const o = document.createElement('option');
    o.value = t; o.textContent = t;
    sel.appendChild(o);
  });
  sel.disabled = false;
  renderRankingMateria();
};

// Registra a quantidade de questões informada como o TOTAL daquele
// tópico/banca (substitui o que já havia, se existir). Use o botão
// "+ questões" no ranking para SOMAR a um total já existente, sem
// precisar saber ou recalcular o valor anterior.
window.__freqRegistrar = async function() {
  const materia = document.getElementById('freq-materia').value;
  const topico = document.getElementById('freq-topico').value;
  const banca = document.getElementById('freq-banca').value;
  const questoes = document.getElementById('freq-questoes').value;

  if (!materia || !topico || !banca) { flashMsg('Selecione matéria, tópico e banca.'); return; }
  if (questoes === '' || isNaN(parseInt(questoes)) || parseInt(questoes) < 0) { flashMsg('Informe a quantidade de questões.'); return; }

  await registrarFrequenciaTopico(_frequencia, materia, topico, banca, questoes);

  document.getElementById('freq-questoes').value = '';
  flashMsg(`Registrado: ${banca} — ${questoes} questões em "${topico}". O percentual de cobrança foi recalculado automaticamente.`, true);
  renderRankingMateria();
};

function flashMsg(msg, sucesso = false) {
  const box = document.getElementById('freq-alert');
  box.querySelector('p').textContent = msg;
  box.className = sucesso ? 'succ' : 'alert';
  box.style.display = 'block';
  clearTimeout(box._t);
  box._t = setTimeout(() => box.style.display = 'none', 6000);
}

function renderRankingMateria() {
  const mat = document.getElementById('freq-materia').value;
  const container = document.getElementById('freq-ranking');
  if (!mat) {
    container.innerHTML = '<div class="empty">Selecione uma matéria acima para ver o ranking de tópicos por frequência de cobrança.</div>';
    return;
  }
  const topicos = listaTopicos(_edital, mat);
  if (!topicos.length) {
    container.innerHTML = '<div class="empty">Esta matéria ainda não tem tópicos cadastrados.</div>';
    return;
  }
  const ranking = rankingTopicosMateria(_frequencia, mat, topicos);

  let html = '<div class="rt">Ranking de cobrança — ' + mat + ' <span style="font-weight:400;color:var(--t3)">(percentual calculado automaticamente pelo total de questões da matéria)</span></div>';
  ranking.forEach(r => {
    const bancasCadastradas = getBancasCadastradas(_frequencia, mat, r.topico);
    html += `<div class="sr" style="align-items:flex-start">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${r.posicao ? r.posicao + 'º — ' : ''}${r.topico}</div>
        ${bancasCadastradas.length ? `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:4px">${bancasCadastradas.map(b => {
          const q = getQuestoesTopicoBanca(_frequencia, mat, r.topico, b);
          return `<span class="ttag" style="background:var(--pl);color:var(--pd);display:inline-flex;align-items:center;gap:5px">
            ${b}: ${q}q
            <span style="cursor:pointer" title="Adicionar mais questões" onclick="window.__freqAdicionarQuestoes('${escapeAttr(mat)}','${escapeAttr(r.topico)}','${b}')">✏️</span>
            <span style="cursor:pointer" title="Remover" onclick="window.__freqRemoverBanca('${escapeAttr(mat)}','${escapeAttr(r.topico)}','${b}')">×</span>
          </span>`;
        }).join('')}</div>` : '<div style="font-size:11px;color:var(--t3);margin-top:3px">Sem dados cadastrados ainda</div>'}
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        ${r.estrelas ? `<div style="font-size:14px;color:#BA7517">${renderEstrelas(r.estrelas)}</div>` : ''}
        ${r.pct !== null ? `<div style="font-size:11px;color:var(--t3)">${r.pct}% de cobrança (${r.questoes}q)</div>` : ''}
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function escapeAttr(s) { return s.replace(/'/g, "\\'"); }

window.__freqRemoverBanca = async function(materia, topico, banca) {
  if (!confirm(`Remover o dado de "${banca}" para este tópico?`)) return;
  await removerFrequenciaTopicoBanca(_frequencia, materia, topico, banca);
  renderRankingMateria();
};

// Permite somar questões de uma nova prova ao total já cadastrado,
// ou corrigir o valor diretamente (digitando o total certo).
window.__freqAdicionarQuestoes = async function(materia, topico, banca) {
  const atual = getQuestoesTopicoBanca(_frequencia, materia, topico, banca);
  const resp = prompt(
    `"${topico}" — ${banca}\nTotal de questões já cadastrado: ${atual}\n\nDigite quantas questões NOVAS somar (ex: uma prova nova trouxe 3 questões deste tópico, digite 3):`,
    '0'
  );
  if (resp === null) return;
  const novas = parseInt(resp);
  if (isNaN(novas) || novas < 0) { alert('Digite um número válido.'); return; }
  await adicionarQuestoesFrequencia(_frequencia, materia, topico, banca, novas);
  renderRankingMateria();
};

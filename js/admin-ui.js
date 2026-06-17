// ─────────────────────────────────────────────────────────────
// UI — Administração do Edital
// ─────────────────────────────────────────────────────────────
import {
  adicionarMateria, removerMateria, editarMateria,
  adicionarTopico, editarTopico, removerTopico,
  marcarRevisado, marcarDesatualizado
} from './edital.js';

let _edital = null;
let _onChangeCallback = null;
const _openState = {}; // controla quais matérias estão expandidas

export function initAdminUI(edital, onChange) {
  _edital = edital;
  _onChangeCallback = onChange;
}

export function atualizarEditalAdmin(edital) {
  _edital = edital;
}

async function notificarMudanca() {
  if (_onChangeCallback) await _onChangeCallback(_edital);
}

export function renderAdminTab() {
  renderBannerStatus();
  renderListaMaterias();
}

function renderBannerStatus() {
  const el = document.getElementById('admin-status');
  if (_edital.revisado) {
    el.innerHTML = `<div class="succ" style="display:block">
      <p>Conteúdo do edital revisado e atualizado em ${_edital.ultimaAtualizacao}.</p>
    </div>`;
  } else {
    el.innerHTML = `<div class="warn-box">
      <p><strong>Conteúdo desatualizado.</strong> Revise as matérias e tópicos abaixo conforme o último edital publicado e confirme quando terminar.</p>
      <div class="actions"><button class="btn btn-sm btn-p" onclick="window.__adminConfirmarRevisao()">Confirmar revisão do edital</button></div>
    </div>`;
  }
}

window.__adminConfirmarRevisao = async function() {
  await marcarRevisado(_edital);
  await notificarMudanca();
  renderAdminTab();
  document.getElementById('edital-banner').classList.remove('show');
};

window.__adminMarcarDesatualizado = async function() {
  if (!confirm('Marcar o edital como desatualizado? Isso vai mostrar um aviso em todas as abas até você confirmar a revisão.')) return;
  await marcarDesatualizado(_edital);
  await notificarMudanca();
  renderAdminTab();
  document.getElementById('edital-banner').classList.add('show');
};

function renderListaMaterias() {
  const container = document.getElementById('admin-materias-lista');
  const nomes = Object.keys(_edital.materias).sort();
  if (!nomes.length) {
    container.innerHTML = '<div class="empty">Nenhuma matéria cadastrada.</div>';
    return;
  }
  let html = '';
  nomes.forEach(nome => {
    const dados = _edital.materias[nome];
    const isOpen = !!_openState[nome];
    html += `
    <div class="admin-materia">
      <div class="admin-materia-header" onclick="window.__adminToggle('${escapeAttr(nome)}')">
        <div class="admin-materia-title">
          <span class="chevron ${isOpen ? 'open' : ''}" id="chev-${slug(nome)}">▶</span>
          ${nome} ${dados.dificil ? '<span style="color:var(--p);font-size:11px">⚠ difícil</span>' : ''}
          <span style="color:var(--t3);font-weight:400;font-size:11px">(${dados.topicos.length} tópicos)</span>
        </div>
        <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
          <button class="btn btn-sm" onclick="window.__adminEditarMateria('${escapeAttr(nome)}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="window.__adminRemoverMateria('${escapeAttr(nome)}')">Excluir</button>
        </div>
      </div>
      <div class="admin-materia-body ${isOpen ? 'open' : ''}" id="body-${slug(nome)}">
        <div id="topicos-${slug(nome)}">
          ${dados.topicos.map((t, i) => `
            <div class="admin-topico-row">
              <input type="text" value="${escapeAttr(t)}" onchange="window.__adminEditarTopico('${escapeAttr(nome)}', ${i}, this.value)">
              <button class="del-btn" onclick="window.__adminRemoverTopico('${escapeAttr(nome)}', ${i})" aria-label="Remover tópico">×</button>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <input type="text" id="novo-topico-${slug(nome)}" placeholder="Novo tópico...">
          <button class="btn btn-sm btn-p" onclick="window.__adminAdicionarTopico('${escapeAttr(nome)}')">+ Adicionar</button>
        </div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function slug(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '_');
}
function escapeAttr(s) {
  return s.replace(/'/g, "\\'");
}

window.__adminToggle = function(nome) {
  _openState[nome] = !_openState[nome];
  renderListaMaterias();
};

window.__adminAdicionarMateria = async function() {
  const input = document.getElementById('admin-nova-materia');
  const dificilCheckbox = document.getElementById('admin-nova-dificil');
  const nome = input.value.trim();
  if (!nome) { alert('Digite o nome da matéria.'); return; }
  if (_edital.materias[nome]) { alert('Essa matéria já existe.'); return; }
  await adicionarMateria(_edital, nome, dificilCheckbox.checked);
  input.value = '';
  dificilCheckbox.checked = false;
  await notificarMudanca();
  renderListaMaterias();
};

window.__adminEditarMateria = async function(nomeAntigo) {
  const dados = _edital.materias[nomeAntigo];
  const novoNome = prompt('Novo nome da matéria:', nomeAntigo);
  if (!novoNome) return;
  const dificil = confirm('Esta matéria deve ter meta interna de 92% (dificuldade declarada)?\n\nOK = sim, 92% / Cancelar = não, 89%');
  await editarMateria(_edital, nomeAntigo, novoNome.trim(), dificil);
  await notificarMudanca();
  renderListaMaterias();
};

window.__adminRemoverMateria = async function(nome) {
  if (!confirm(`Excluir a matéria "${nome}" e todos os seus tópicos? Sessões e flashcards já registrados para ela não serão apagados, mas ficarão sem matéria associada no edital.`)) return;
  await removerMateria(_edital, nome);
  await notificarMudanca();
  renderListaMaterias();
};

window.__adminAdicionarTopico = async function(materia) {
  const input = document.getElementById('novo-topico-' + slug(materia));
  const texto = input.value.trim();
  if (!texto) return;
  await adicionarTopico(_edital, materia, texto);
  input.value = '';
  _openState[materia] = true;
  await notificarMudanca();
  renderListaMaterias();
};

window.__adminEditarTopico = async function(materia, indice, novoTexto) {
  await editarTopico(_edital, materia, indice, novoTexto.trim());
  await notificarMudanca();
};

window.__adminRemoverTopico = async function(materia, indice) {
  if (!confirm('Remover este tópico?')) return;
  _openState[materia] = true;
  await removerTopico(_edital, materia, indice);
  await notificarMudanca();
  renderListaMaterias();
};

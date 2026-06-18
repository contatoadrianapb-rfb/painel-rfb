// ─────────────────────────────────────────────────────────────
// UI — Flashcards e Revisar Hoje
// ─────────────────────────────────────────────────────────────
import {
  listarFlashcards, criarFlashcard, excluirFlashcard, processarRevisao,
  flashcardsVencidosHoje, contarPorStatus, formatarDataBR
} from './flashcards.js';
import { topicosFracos } from './sessoes.js';

let _flashcards = [];
let _edital = null;
let _sessoes = [];
let _onChangeCallback = null;

export function initFlashcardsUI(edital, sessoes, onChange) {
  _edital = edital;
  _sessoes = sessoes;
  _onChangeCallback = onChange;
}

export function atualizarContexto(edital, sessoes) {
  _edital = edital;
  _sessoes = sessoes;
}

async function recarregar() {
  _flashcards = await listarFlashcards();
  if (_onChangeCallback) _onChangeCallback(_flashcards);
  return _flashcards;
}

export async function renderFlashcardsTab() {
  await recarregar();
  renderAvisosTopicosFracos();
  renderFormularioCriacao();
  renderListaFlashcards();
}

function renderAvisosTopicosFracos() {
  const container = document.getElementById('fc-avisos');
  const fracos = topicosFracos(_sessoes, _edital);
  // Filtra apenas tópicos que ainda não têm flashcard criado
  const semCard = fracos.filter(f => {
    return !_flashcards.some(c => c.materia === f.materia && c.topico === f.topico);
  });
  if (!semCard.length) {
    container.innerHTML = '';
    return;
  }
  let html = '';
  semCard.slice(0, 5).forEach((f, i) => {
    html += `<div class="warn-box">
      <p><strong>Tópico fraco detectado:</strong> ${f.materia} — ${f.topico} (${f.pct}%, meta ${f.meta}%).
      Quer criar um flashcard para reforçar esse ponto?</p>
      <div class="actions">
        <button class="btn btn-sm btn-p" onclick="window.__fcPreencherAviso('${encodeURIComponent(f.materia)}','${encodeURIComponent(f.topico)}')">Criar flashcard</button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function renderFormularioCriacao() {
  const matSel = document.getElementById('fc-materia');
  if (matSel.options.length <= 1) {
    matSel.innerHTML = '<option value="">Matéria...</option>';
    Object.keys(_edital.materias).sort().forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = m;
      matSel.appendChild(o);
    });
  }
}

window.__fcPopularTopicos = function() {
  const mat = document.getElementById('fc-materia').value;
  const sel = document.getElementById('fc-topico');
  sel.innerHTML = '';
  const topicos = (mat && _edital.materias[mat]) ? _edital.materias[mat].topicos : [];
  if (!mat || !topicos.length) {
    sel.innerHTML = '<option value="">Selecione a matéria primeiro...</option>';
    sel.disabled = true;
    return;
  }
  sel.innerHTML = '<option value="">Tópico do edital...</option>';
  topicos.forEach(t => {
    const o = document.createElement('option');
    o.value = t; o.textContent = t;
    sel.appendChild(o);
  });
  sel.disabled = false;
};

window.__fcPreencherAviso = function(materiaEnc, topicoEnc) {
  const materia = decodeURIComponent(materiaEnc);
  const topico = decodeURIComponent(topicoEnc);
  document.getElementById('fc-materia').value = materia;
  window.__fcPopularTopicos();
  document.getElementById('fc-topico').value = topico;
  document.getElementById('fc-pergunta').focus();
  document.getElementById('fc-form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.__fcCriar = async function() {
  const materia = document.getElementById('fc-materia').value;
  const topico = document.getElementById('fc-topico').value;
  const pergunta = document.getElementById('fc-pergunta').value.trim();
  const resposta = document.getElementById('fc-resposta').value.trim();
  const explicacao = document.getElementById('fc-explicacao').value.trim();
  const link = document.getElementById('fc-link').value.trim();

  if (!materia || !topico) { flashMsg('fc-alert', 'Selecione matéria e tópico.'); return; }
  if (!pergunta || !resposta) { flashMsg('fc-alert', 'Preencha ao menos a pergunta e a resposta.'); return; }

  // Processar imagem opcional
  let imagemBase64 = '';
  const fileInput = document.getElementById('fc-imagem');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    if (file.size > 800000) {
      flashMsg('fc-alert', 'A imagem é muito grande. Use arquivos menores que 800KB (jpg ou png comprimido).');
      return;
    }
    imagemBase64 = await lerArquivoComoBase64(file);
  }

  await criarFlashcard({ materia, topico, pergunta, resposta, explicacao, link, imagemBase64 });

  document.getElementById('fc-materia').value = '';
  document.getElementById('fc-topico').innerHTML = '<option value="">Selecione a matéria primeiro...</option>';
  document.getElementById('fc-topico').disabled = true;
  document.getElementById('fc-pergunta').value = '';
  document.getElementById('fc-resposta').value = '';
  document.getElementById('fc-explicacao').value = '';
  document.getElementById('fc-link').value = '';
  if (fileInput) { fileInput.value = ''; }
  document.getElementById('fc-img-preview').innerHTML = '';

  flashMsg('fc-success', 'Flashcard criado! Ele já está disponível para revisão hoje.');
  await renderFlashcardsTab();
  if (typeof window.__refreshRevisarHojeBadge === 'function') window.__refreshRevisarHojeBadge();
};

function lerArquivoComoBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // inclui o prefixo data:image/...;base64,
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window.__fcPreviewImagem = function() {
  const fileInput = document.getElementById('fc-imagem');
  const preview = document.getElementById('fc-img-preview');
  if (!fileInput.files || !fileInput.files[0]) { preview.innerHTML = ''; return; }
  const file = fileInput.files[0];
  const url = URL.createObjectURL(file);
  preview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:200px;border-radius:8px;margin-top:8px;border:1px solid var(--bo)">
    <div style="font-size:11px;color:var(--t3);margin-top:4px">${(file.size/1024).toFixed(0)}KB — ${file.name}</div>`;
};

function flashMsg(id, msg) {
  const box = document.getElementById(id);
  box.querySelector('p').textContent = msg;
  box.style.display = 'block';
  clearTimeout(box._t);
  box._t = setTimeout(() => box.style.display = 'none', 6000);
}

function renderListaFlashcards() {
  const container = document.getElementById('fc-lista');
  const counts = contarPorStatus(_flashcards);
  document.getElementById('fc-count-total').textContent = counts.total;
  document.getElementById('fc-count-novo').textContent = counts.novo;
  document.getElementById('fc-count-rep').textContent = counts.em_repeticao;
  document.getElementById('fc-count-maduro').textContent = counts.maduro;

  if (!_flashcards.length) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">🗂️</div>Nenhum flashcard criado ainda.</div>';
    return;
  }
  const ordenados = [..._flashcards].sort((a, b) => a.proximaRevisao.localeCompare(b.proximaRevisao));
  let html = '';
  ordenados.forEach(c => {
    html += `<div class="fc-list-item">
      <div class="fc-list-info">
        <div class="fc-list-q">${c.materia} — ${c.pergunta}</div>
        <div class="fc-list-meta">${c.topico} · próxima revisão: ${formatarDataBR(c.proximaRevisao)} ·
          <span class="fc-status-pill status-${c.status}">${c.status.replace('_',' ')}</span>
        </div>
      </div>
      <button class="del-btn" onclick="window.__fcExcluir('${c.id}')" aria-label="Excluir">×</button>
    </div>`;
  });
  container.innerHTML = html;
}

window.__fcExcluir = async function(id) {
  if (!confirm('Excluir este flashcard?')) return;
  await excluirFlashcard(id);
  await renderFlashcardsTab();
  if (typeof window.__refreshRevisarHojeBadge === 'function') window.__refreshRevisarHojeBadge();
};

// ─────────────────────────────────────────────────────────────
// Revisar Hoje
// ─────────────────────────────────────────────────────────────

export async function getFlashcardsVencidosHoje() {
  const cards = await listarFlashcards();
  return flashcardsVencidosHoje(cards, _edital);
}

export async function renderRevisarHojeTab() {
  const vencidos = await getFlashcardsVencidosHoje();
  const container = document.getElementById('revisar-lista');
  const header = document.getElementById('revisar-header-count');
  header.textContent = vencidos.length;

  if (!vencidos.length) {
    container.innerHTML = `<div class="empty">
      <div class="empty-icon">✅</div>
      Nenhum flashcard pendente para hoje. Você está em dia com as revisões!
    </div>`;
    return;
  }

  let html = '';
  vencidos.forEach((c, i) => {
    const imgHtml = c.imagemBase64 ? `<div style="margin-bottom:12px"><img src="${c.imagemBase64}" style="max-width:100%;border-radius:8px;border:1px solid var(--bo)"></div>` : '';
    html += `
    <div class="fc-card" id="rev-card-${c.id}">
      <div class="fc-header">
        <span class="fc-tag">${c.materia}</span>
        <span style="font-size:11px;color:var(--t3)">${c.topico}</span>
      </div>
      <div class="fc-question">${c.pergunta}</div>
      ${imgHtml}
      <button class="btn fc-reveal-btn" onclick="window.__revRevelar('${c.id}')">Mostrar resposta</button>
      <div class="fc-answer" id="rev-answer-${c.id}">
        <div class="fc-answer-label">Resposta</div>
        <div class="fc-answer-text">${c.resposta}</div>
        ${c.explicacao ? `<div class="fc-answer-label">Explicação</div><div class="fc-explain">${c.explicacao}</div>` : ''}
        ${c.link ? `<a class="fc-link" href="${c.link}" target="_blank" rel="noopener">Ver questão no Tec Concursos →</a>` : ''}
        <div class="fc-actions">
          <button class="fc-btn-errei" onclick="window.__revProcessar('${c.id}', false)">Errei</button>
          <button class="fc-btn-acertei" onclick="window.__revProcessar('${c.id}', true)">Acertei</button>
        </div>
      </div>
      <div class="fc-status-row">
        <span>Repetições: ${c.repeticoes || 0}</span>
        <span class="fc-status-pill status-${c.status}">${c.status.replace('_',' ')}</span>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

window.__revRevelar = function(id) {
  document.getElementById('rev-answer-' + id).classList.add('show');
};

window.__revProcessar = async function(id, acertou) {
  const cards = await listarFlashcards();
  const card = cards.find(c => c.id === id);
  if (!card) return;
  await processarRevisao(card, acertou);
  const cardEl = document.getElementById('rev-card-' + id);
  if (cardEl) {
    cardEl.style.opacity = '0.4';
    cardEl.style.pointerEvents = 'none';
  }
  setTimeout(async () => {
    await renderRevisarHojeTab();
    if (typeof window.__refreshRevisarHojeBadge === 'function') window.__refreshRevisarHojeBadge();
  }, 350);
};

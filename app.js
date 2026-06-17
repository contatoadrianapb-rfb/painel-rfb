<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel de Estudos — Auditor Fiscal RFB</title>
<link rel="stylesheet" href="css/style.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
</head>
<body>

<header class="hdr">
  <div class="hl">
    <div class="lm">
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <path d="M3 12L8 4L13 12" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 9H11" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </div>
    <div>
      <div class="ht">Painel de Estudos — Auditor Fiscal RFB</div>
      <div class="hs">Meta: 89% · Matérias difíceis ⚠ meta interna: 92%</div>
    </div>
  </div>
  <div style="font-size:12px;color:var(--t3)" id="hdr-data"></div>
</header>

<div class="edital-banner" id="edital-banner">
  <span>⚠ Conteúdo do edital desatualizado — revise as matérias e tópicos na aba Administração.</span>
  <button onclick="window.__mudarAba('admin', document.querySelector('[data-tab=admin]'))">Revisar agora</button>
</div>

<main class="main">
  <div class="tabs">
    <button class="tab" data-tab="revisar" onclick="window.__mudarAba('revisar', this)">Revisar Hoje</button>
    <button class="tab" data-tab="registro" onclick="window.__mudarAba('registro', this)">Registrar Sessão</button>
    <button class="tab" data-tab="flashcards" onclick="window.__mudarAba('flashcards', this)">Flashcards</button>
    <button class="tab" data-tab="painel" onclick="window.__mudarAba('painel', this)">Painel Geral</button>
    <button class="tab" data-tab="historico" onclick="window.__mudarAba('historico', this)">Histórico</button>
    <button class="tab" data-tab="relatorio" onclick="window.__mudarAba('relatorio', this)">Relatório Semanal</button>
    <button class="tab" data-tab="admin" onclick="window.__mudarAba('admin', this)">Administração</button>
  </div>

  <!-- REVISAR HOJE -->
  <div class="view" id="view-revisar">
    <div class="card">
      <div class="ct">Cartões para revisar hoje (<span id="revisar-header-count">0</span>)</div>
      <p class="hint">Responda mentalmente antes de revelar a resposta. O algoritmo ajusta automaticamente a próxima data de revisão conforme você acerta ou erra.</p>
      <div id="revisar-lista"><div class="empty">Carregando...</div></div>
    </div>
  </div>

  <!-- REGISTRAR SESSÃO -->
  <div class="view" id="view-registro">
    <div class="alert" id="reg-alert"><p></p></div>
    <div class="succ" id="reg-success"><p></p></div>
    <div class="card">
      <div class="ct">Nova sessão — Tec Concursos</div>
      <div class="fr">
        <select id="reg-materia" onchange="window.__regPopularTopicos()">
          <option value="">Matéria...</option>
        </select>
        <select id="reg-topico" disabled><option value="">Selecione a matéria primeiro...</option></select>
        <input type="number" id="reg-total" placeholder="Total q." min="1">
        <input type="number" id="reg-acertos" placeholder="Acertos" min="0">
        <input type="text" id="reg-data" placeholder="dd/mm/aa">
        <button class="btn btn-p" onclick="window.__regAdicionar()">+ Adicionar</button>
      </div>
      <p class="hint">Os tópicos vêm da Administração do Edital. Data preenchida automaticamente se deixada em branco.</p>
    </div>
    <div class="card">
      <div class="ct" id="reg-hoje-titulo">Sessões de hoje</div>
      <div id="reg-hoje-lista"><div class="empty">Nenhuma sessão registrada hoje ainda.</div></div>
      <div class="mg" id="reg-hoje-metricas" style="display:none;margin-top:1rem">
        <div class="mc"><div class="ml">Questões hoje</div><div class="mv" id="reg-hoje-total">0</div></div>
        <div class="mc"><div class="ml">Acertos</div><div class="mv" id="reg-hoje-acertos">0</div></div>
        <div class="mc"><div class="ml">% hoje</div><div class="mv" id="reg-hoje-pct">—</div><div class="ms">Meta: 89%</div></div>
        <div class="mc"><div class="ml">Sessões</div><div class="mv" id="reg-hoje-sessoes">0</div></div>
      </div>
    </div>
  </div>

  <!-- FLASHCARDS -->
  <div class="view" id="view-flashcards">
    <div class="alert" id="fc-alert"><p></p></div>
    <div class="succ" id="fc-success"><p></p></div>

    <div id="fc-avisos"></div>

    <div class="card" id="fc-form-card">
      <div class="ct">Criar flashcard</div>
      <div class="field">
        <label>Matéria</label>
        <select id="fc-materia" onchange="window.__fcPopularTopicos()">
          <option value="">Matéria...</option>
        </select>
      </div>
      <div class="field">
        <label>Tópico</label>
        <select id="fc-topico" disabled><option value="">Selecione a matéria primeiro...</option></select>
      </div>
      <div class="field">
        <label>Pergunta</label>
        <textarea id="fc-pergunta" placeholder="Ex: Qual a diferença entre lançamento de ofício e por homologação?"></textarea>
      </div>
      <div class="field">
        <label>Resposta</label>
        <textarea id="fc-resposta" placeholder="A resposta correta..."></textarea>
      </div>
      <div class="field">
        <label>Explicação (opcional)</label>
        <textarea id="fc-explicacao" placeholder="Por que errei / raciocínio correto..."></textarea>
      </div>
      <div class="field">
        <label>Link da questão no Tec Concursos (opcional)</label>
        <input type="text" id="fc-link" placeholder="https://www.tecconcursos.com.br/...">
      </div>
      <button class="btn btn-p" onclick="window.__fcCriar()">Criar flashcard</button>
    </div>

    <div class="card">
      <div class="ct">Meus flashcards</div>
      <div class="mg">
        <div class="mc"><div class="ml">Total</div><div class="mv" id="fc-count-total">0</div></div>
        <div class="mc"><div class="ml">Novos</div><div class="mv" id="fc-count-novo">0</div></div>
        <div class="mc"><div class="ml">Em repetição</div><div class="mv" id="fc-count-rep">0</div></div>
        <div class="mc"><div class="ml">Maduros</div><div class="mv" id="fc-count-maduro">0</div></div>
      </div>
      <div id="fc-lista"><div class="empty">Nenhum flashcard criado ainda.</div></div>
    </div>
  </div>

  <!-- PAINEL GERAL -->
  <div class="view" id="view-painel">
    <div class="mg">
      <div class="mc"><div class="ml">Total questões</div><div class="mv" id="painel-total">0</div></div>
      <div class="mc"><div class="ml">Acertos</div><div class="mv" id="painel-acertos">0</div></div>
      <div class="mc"><div class="ml">Aproveitamento</div><div class="mv" id="painel-pct">—</div><div class="ms">Meta: 89%</div></div>
      <div class="mc"><div class="ml">Matérias</div><div class="mv" id="painel-materias">0</div></div>
      <div class="mc"><div class="ml">Tópicos</div><div class="mv" id="painel-topicos">0</div></div>
    </div>
    <p class="hint" id="painel-aviso-inativas" style="display:none;cursor:pointer" onclick="window.__mudarAba('admin', document.querySelector('[data-tab=admin]'))"></p>
    <div class="card">
      <div class="ct">Aproveitamento por matéria</div>
      <p class="hint">Linha vermelha = meta — ordenado do mais fraco ao mais forte</p>
      <div id="painel-barras"><div class="empty">Registre sessões para ver o desempenho.</div></div>
    </div>
    <div class="card">
      <div class="ct">Evolução das sessões</div>
      <div style="position:relative;width:100%;height:200px">
        <canvas id="evolChart" role="img" aria-label="Evolução do aproveitamento por sessão"></canvas>
      </div>
    </div>
  </div>

  <!-- HISTÓRICO -->
  <div class="view" id="view-historico">
    <div class="card">
      <div class="ct">Todas as sessões</div>
      <div style="overflow-x:auto">
        <table>
          <thead><tr>
            <th style="width:17%">Matéria</th><th style="width:27%">Tópico</th>
            <th style="width:9%">Data</th><th style="width:6%">Total</th><th style="width:6%">Acertos</th>
            <th style="width:21%">Aproveit.</th><th style="width:8%">Status</th><th style="width:6%"></th>
          </tr></thead>
          <tbody id="hist-corpo"><tr><td colspan="8"><div class="empty">Nenhuma sessão registrada.</div></td></tr></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- RELATÓRIO SEMANAL -->
  <div class="view" id="view-relatorio">
    <div class="wr">
      <span style="font-size:13px;color:var(--t2)">Período:</span>
      <select id="rel-semana" onchange="window.__relAtualizar()"><option value="all">Todas as sessões</option></select>
    </div>
    <div id="rel-metricas" style="margin-bottom:1.2rem"></div>
    <div class="card"><div id="rel-conteudo"><div class="empty">Registre sessões para gerar o relatório.</div></div></div>
    <div class="card">
      <div class="ct">Pontos fortes vs fracos</div>
      <div style="position:relative;width:100%;height:280px">
        <canvas id="swChart" role="img" aria-label="Aproveitamento por matéria vs meta"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="ct">Cronograma de revisões — gerado automaticamente</div>
      <p class="hint">Priorizado pelos tópicos com maior gap em relação à meta.</p>
      <div id="rel-cronograma"><div class="empty">Sem dados suficientes.</div></div>
    </div>
  </div>

  <!-- ADMINISTRAÇÃO -->
  <div class="view" id="view-admin">
    <div id="admin-status"></div>
    <div class="card">
      <div class="ct">Adicionar nova matéria</div>
      <div class="field">
        <label>Nome da matéria</label>
        <input type="text" id="admin-nova-materia" placeholder="Ex: Direito Digital">
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <input type="checkbox" id="admin-nova-dificil" style="width:auto;height:auto">
        <label style="margin:0">Marcar como matéria difícil (meta interna 92%)</label>
      </div>
      <button class="btn btn-p" onclick="window.__adminAdicionarMateria()">+ Adicionar matéria</button>
    </div>
    <div class="card">
      <div class="ct" style="display:flex;justify-content:space-between;align-items:center">
        <span>Matérias e tópicos do edital</span>
        <button class="btn btn-sm" onclick="window.__adminMarcarDesatualizado()">Marcar como desatualizado</button>
      </div>
      <div id="admin-materias-lista"></div>
    </div>
  </div>
</main>

<script type="module" src="js/app.js"></script>
</body>
</html>

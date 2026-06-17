// ─────────────────────────────────────────────────────────────
// Módulo de Cronograma — geração e gestão do plano de estudo personalizado
// ─────────────────────────────────────────────────────────────
import { getDocument, setDocument } from './firebase-config.js';
import { getMeta, getPeso, listaMaterias, listaTopicos } from './edital.js';
import { agregarPorMateria } from './sessoes.js';
import { pontuacaoFrequenciaMateria } from './frequencia.js';

const CRONOGRAMA_INICIAL = {
  periodoInicio: null,
  periodoFim: null,
  modoDisponibilidade: 'semanal', // 'semanal' ou 'diaria'
  horasSemanais: 0,
  horasPorDia: { dom: 0, seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 },
  materiasSelecionadas: [] // nomes das matérias incluídas neste cronograma
};

let _cacheCronograma = null;

export async function carregarCronograma() {
  if (_cacheCronograma) return _cacheCronograma;
  let doc = await getDocument('cronograma', 'config');
  if (!doc) {
    await setDocument('cronograma', 'config', CRONOGRAMA_INICIAL);
    doc = { id: 'config', ...CRONOGRAMA_INICIAL };
  }
  _cacheCronograma = doc;
  return doc;
}

export function invalidarCacheCronograma() {
  _cacheCronograma = null;
}

export async function salvarCronograma(novoCronograma) {
  await setDocument('cronograma', 'config', novoCronograma);
  _cacheCronograma = { id: 'config', ...novoCronograma };
  return _cacheCronograma;
}

export function totalHorasSemanais(cronograma) {
  if (cronograma.modoDisponibilidade === 'semanal') {
    return cronograma.horasSemanais || 0;
  }
  return Object.values(cronograma.horasPorDia || {}).reduce((a, h) => a + (h || 0), 0);
}

// ─── Cálculo de peso/prioridade por matéria ───
//
// Combina três fatores, conforme definido com a usuária:
// 1. Peso editalício (1, 2 ou 3 — 3 = cai na discursiva ou peso muito alto)
// 2. Dificuldade declarada (campo "dificil" do edital — define meta 92% vs 89%)
// 3. Gap de desempenho real (meta - aproveitamento atual). Matérias sem
//    nenhuma sessão registrada ainda recebem peso neutro nesse fator,
//    para não serem penalizadas nem favorecidas por falta de dado.
//
// Pesos relativos dos quatro fatores na soma final:
const PESO_FATOR_EDITAL = 1.0;
const PESO_FATOR_DIFICULDADE = 1.0;
const PESO_FATOR_GAP = 1.5; // o desempenho real tem o maior peso na priorização
const PESO_FATOR_FREQUENCIA = 1.2; // frequência histórica de cobrança (Tec Concursos)

const GAP_NEUTRO = 8; // gap assumido quando não há sessões registradas ainda (~neutro)

export function calcularPrioridades(materiasSelecionadas, edital, sessoes, frequencia = null) {
  const agregado = agregarPorMateria(sessoes);

  const prioridades = materiasSelecionadas.map(materia => {
    const pesoEdital = getPeso(edital, materia); // 1, 2 ou 3
    const meta = getMeta(edital, materia); // 89 ou 92
    const dificil = !!(edital.materias[materia] && edital.materias[materia].dificil);

    let gap;
    let temDados = false;
    if (agregado[materia] && agregado[materia].total > 0) {
      const pct = Math.round((agregado[materia].acertos / agregado[materia].total) * 100);
      gap = Math.max(meta - pct, 0); // gap negativo (acima da meta) tratado como 0
      temDados = true;
    } else {
      gap = GAP_NEUTRO;
    }

    const fatorEdital = pesoEdital; // 1, 2 ou 3
    const fatorDificuldade = dificil ? 1.4 : 1.0;
    const fatorGap = 1 + (gap / 20); // cada 20 pontos de gap dobra o fator

    // Fator de frequência histórica de cobrança (1 a 5, neutro = 3 se sem dados)
    let fatorFrequencia = 3;
    let temFrequencia = false;
    if (frequencia) {
      const topicos = listaTopicos(edital, materia);
      fatorFrequencia = pontuacaoFrequenciaMateria(frequencia, materia, topicos);
      temFrequencia = topicos.some(t => {
        const k = `${materia}::${t}`;
        return frequencia.dados && frequencia.dados[k] && Object.keys(frequencia.dados[k]).length > 0;
      });
    }

    const pontuacao = (fatorEdital * PESO_FATOR_EDITAL)
      + (fatorDificuldade * PESO_FATOR_DIFICULDADE)
      + (fatorGap * PESO_FATOR_GAP)
      + (fatorFrequencia * PESO_FATOR_FREQUENCIA);

    return { materia, pesoEdital, dificil, meta, gap, temDados, fatorFrequencia, temFrequencia, pontuacao };
  });

  return prioridades.sort((a, b) => b.pontuacao - a.pontuacao);
}

// Distribui as horas disponíveis proporcionalmente à pontuação de cada
// matéria. Retorna horas/semana e horas/dia (média simples) por matéria.
export function distribuirHoras(prioridades, horasSemanaisTotais) {
  const somaPontuacoes = prioridades.reduce((a, p) => a + p.pontuacao, 0);
  if (somaPontuacoes <= 0 || horasSemanaisTotais <= 0) {
    return prioridades.map(p => ({ ...p, horasSemana: 0, horasDia: 0, percentual: 0 }));
  }
  return prioridades.map(p => {
    const fracao = p.pontuacao / somaPontuacoes;
    const horasSemana = horasSemanaisTotais * fracao;
    return {
      ...p,
      percentual: Math.round(fracao * 100),
      horasSemana: Math.round(horasSemana * 10) / 10,
      horasDia: Math.round((horasSemana / 7) * 10) / 10
    };
  });
}

export function gerarDistribuicao(cronograma, edital, sessoes, frequencia = null) {
  const materiasValidas = cronograma.materiasSelecionadas.filter(m =>
    listaMaterias(edital).includes(m)
  );
  if (!materiasValidas.length) return [];
  const prioridades = calcularPrioridades(materiasValidas, edital, sessoes, frequencia);
  const totalHoras = totalHorasSemanais(cronograma);
  return distribuirHoras(prioridades, totalHoras);
}

export function formatarHoras(h) {
  if (h <= 0) return '0min';
  const horas = Math.floor(h);
  const minutos = Math.round((h - horas) * 60);
  if (horas === 0) return `${minutos}min`;
  if (minutos === 0) return `${horas}h`;
  return `${horas}h${minutos}min`;
}

export const DIAS_SEMANA = [
  { key: 'seg', label: 'Segunda' }, { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' }, { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' }, { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' }
];

const { calcDesvioPadrao } = require('../utils/lotofacilCalc');

const QUADRANTES_NOMES = ['01–05', '06–10', '11–15', '16–20', '21–25'];
const SOMA_FAIXAS = [
  [152, 165],
  [166, 175],
  [176, 183],
  [184, 190],
  [191, 197],
  [198, 205],
  [206, 215],
  [216, 236],
];
const DP_FAIXAS = [
  { faixa: '< 5.0', min: -Infinity, max: 4.999, label: 'Muito concentrado' },
  { faixa: '5.0-6.0', min: 5.0, max: 5.999, label: 'Concentrado' },
  { faixa: '6.0-7.0', min: 6.0, max: 6.999, label: 'Equilibrado' },
  { faixa: '7.0-8.0', min: 7.0, max: 7.999, label: 'Ótimo' },
  { faixa: '8.0-8.5', min: 8.0, max: 8.499, label: 'Disperso aceitável' },
  { faixa: '8.5-9.6', min: 8.5, max: 9.599, label: 'Muito disperso' },
  { faixa: '> 9.6', min: 9.6, max: Infinity, label: 'Extremamente disperso' },
];

function pct(count, total) {
  return total ? Number(((count / total) * 100).toFixed(3)) : 0;
}

function formatPadraoPares(qtdPares) {
  return `${qtdPares}P/${15 - qtdPares}I`;
}

function calcQuadrantesDeJogo(dezenas) {
  return [
    dezenas.filter(n => n >= 1 && n <= 5).length,
    dezenas.filter(n => n >= 6 && n <= 10).length,
    dezenas.filter(n => n >= 11 && n <= 15).length,
    dezenas.filter(n => n >= 16 && n <= 20).length,
    dezenas.filter(n => n >= 21 && n <= 25).length,
  ];
}

function calcularCiclos(resultados) {
  let ciclo = 1;
  let dezenasVistas = new Set();
  let concursosNoCiclo = 0;
  const resultadoFinal = [];

  for (const concurso of [...resultados].sort((a, b) => a.concurso - b.concurso)) {
    concursosNoCiclo++;
    concurso.dezenas.forEach(d => dezenasVistas.add(d));
    const cicloFechado = dezenasVistas.size === 25;

    resultadoFinal.push({
      ...concurso,
      ciclo,
      concursosNoCiclo,
      cicloFechado,
      faltamParaFechar: 25 - dezenasVistas.size,
      dezenasVistasNoCiclo: Array.from(dezenasVistas).sort((a, b) => a - b),
    });

    if (cicloFechado) {
      ciclo++;
      dezenasVistas = new Set();
      concursosNoCiclo = 0;
    }
  }

  return resultadoFinal;
}

function validarCiclos(resultadosComCiclo) {
  const erros = [];
  let cicloAtual = null;
  let dezenasVistas = new Set();

  for (const r of resultadosComCiclo) {
    if (cicloAtual !== r.ciclo) {
      cicloAtual = r.ciclo;
      dezenasVistas = new Set();
    }

    r.dezenas.forEach(d => dezenasVistas.add(d));

    if (r.cicloFechado && dezenasVistas.size !== 25) {
      erros.push({ concurso: r.concurso, tipo: 'FECHAMENTO_INVALIDO', dezenasVistas: dezenasVistas.size });
    }
    if (!r.cicloFechado && dezenasVistas.size === 25) {
      erros.push({ concurso: r.concurso, tipo: 'FECHAMENTO_NAO_MARCADO' });
    }
    if (r.cicloFechado) {
      dezenasVistas = new Set();
    }
  }

  return { valido: erros.length === 0, erros };
}

function gerarAlertaValidacao(validacao) {
  if (validacao.valido) {
    return { status: 'OK', mensagem: 'Ciclos consistentes', nivel: 'sucesso' };
  }
  return {
    status: 'ERRO',
    mensagem: 'Inconsistência detectada nos ciclos',
    nivel: 'critico',
    detalhes: validacao.erros,
  };
}

function calcAusenciaAtual(resultados, par) {
  let streak = 0;
  for (let i = resultados.length - 1; i >= 0; i--) {
    const ok = par.every(d => resultados[i].dezenas.includes(d));
    if (ok) break;
    streak++;
  }
  return streak;
}

function calcJanelaStats(resultados, par) {
  const total = resultados.length;
  const concursosComPar = resultados.filter(r => par.every(d => r.dezenas.includes(d))).length;
  const frequencia = pct(concursosComPar, total);
  const probBase = 35; // combinação aleatória de 15 dezenas contendo um par específico
  const ganhoProbabilidadePct = Number((((frequencia / probBase) - 1) * 100).toFixed(3));

  return {
    frequencia,
    ausenteHa: calcAusenciaAtual(resultados, par),
    ganhoProbabilidadePct,
    probBase,
  };
}

function getHistorico(resultados) {
  const total = resultados.length;
  const comCiclos = calcularCiclos(resultados);
  const ultimo = comCiclos[comCiclos.length - 1] ?? null;
  const penultimo = comCiclos[comCiclos.length - 2] ?? null;

  const somaValores = resultados.map(r => r.dezenas.reduce((acc, n) => acc + n, 0));
  const somaMedia = Number((somaValores.reduce((a, b) => a + b, 0) / total).toFixed(1));
  const somaMin = Math.min(...somaValores);
  const somaMax = Math.max(...somaValores);
  const somaFaixas = SOMA_FAIXAS.map(([min, max]) => ({
    faixa: `${min}-${max}`,
    pct: pct(somaValores.filter(s => s >= min && s <= max).length, total),
  }));

  const paresCounter = new Map();
  resultados.forEach(r => {
    const pares = r.dezenas.filter(n => n % 2 === 0).length;
    paresCounter.set(pares, (paresCounter.get(pares) ?? 0) + 1);
  });
  const paresDistribuicao = [...paresCounter.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([pares, count]) => ({ padrao: formatPadraoPares(pares), pct: pct(count, total) }));

  const freq = {};
  for (let d = 1; d <= 25; d++) {
    const count = resultados.filter(r => r.dezenas.includes(d)).length;
    freq[d] = Number(((count / total) * 100).toFixed(1));
  }

  const atrasoAtual = {};
  for (let d = 1; d <= 25; d++) {
    let atraso = 0;
    for (let i = resultados.length - 1; i >= 0; i--) {
      if (resultados[i].dezenas.includes(d)) break;
      atraso++;
    }
    atrasoAtual[d] = atraso;
  }

  let recicTotal = 0;
  for (let i = 1; i < resultados.length; i++) {
    recicTotal += resultados[i].dezenas.filter(d => resultados[i - 1].dezenas.includes(d)).length;
  }
  const reciclagemMedia = Number((recicTotal / Math.max(1, resultados.length - 1)).toFixed(1));

  const quadrantesMap = new Map();
  resultados.forEach(r => {
    const padrao = calcQuadrantesDeJogo(r.dezenas).join('-');
    quadrantesMap.set(padrao, (quadrantesMap.get(padrao) ?? 0) + 1);
  });
  const quadrantesOrdenados = [...quadrantesMap.entries()].sort((a, b) => b[1] - a[1]);
  const topQuadrantes = quadrantesOrdenados.slice(0, 5).map(([padrao, count]) => ({ padrao, pct: pct(count, total) }));
  const outrosCount = quadrantesOrdenados.slice(5).reduce((acc, [, count]) => acc + count, 0);
  const quadrantesDistribuicao = outrosCount > 0 ? [...topQuadrantes, { padrao: 'outros', pct: pct(outrosCount, total) }] : topQuadrantes;

  const dps = resultados.map(r => calcDesvioPadrao(r.dezenas));
  const desvioPadraoMedio = Number((dps.reduce((a, b) => a + b, 0) / total).toFixed(2));
  const entropiaDistribuicao = DP_FAIXAS.map(item => ({
    faixa: item.faixa,
    pct: pct(dps.filter(dp => dp >= item.min && dp <= item.max).length, total),
    label: item.label,
  }));

  const ciclosCompletos = [...new Set(comCiclos.filter(r => r.cicloFechado).map(r => r.ciclo))].length;
  const cicloAtual = ultimo?.ciclo ?? 1;
  const cicloAnterior = ultimo?.cicloFechado ? ultimo.ciclo : Math.max(0, cicloAtual - 1);
  const dezenasFaltantesCiclo = ultimo?.cicloFechado
    ? Array.from({ length: 25 }, (_, i) => i + 1)
    : Array.from({ length: 25 }, (_, i) => i + 1).filter(d => !(ultimo?.dezenasVistasNoCiclo ?? []).includes(d));
  const tamanhoCicloMedio = Number((total / Math.max(1, ciclosCompletos)).toFixed(1));

  const janelas = {
    '01+04': calcJanelaStats(resultados, [1, 4]),
    '01+05': calcJanelaStats(resultados, [1, 5]),
  };

  const janelaAtual = ultimo
    ? ([1, 4].every(d => ultimo.dezenas.includes(d))
        ? { tipo: '01-04', ...janelas['01+04'] }
        : [1, 5].every(d => ultimo.dezenas.includes(d))
          ? { tipo: '01-05', ...janelas['01+05'] }
          : null)
    : null;

  return {
    totalConcursos: total,
    cicloAnterior,
    cicloAtual,
    ciclosCompletos,
    tamanhoCicloMedio,
    dezenasFaltantesCiclo,
    somaMedia,
    somaMin,
    somaMax,
    somaFaixas,
    paresDistribuicao,
    frequenciaDezenas: freq,
    atrasoAtual,
    reciclagemMedia,
    janelas,
    janelaAtual,
    quadrantesNomes: QUADRANTES_NOMES,
    quadrantesDistribuicao,
    desvioPadraoMedio,
    desvioPadraoIdeal: { min: 6.0, max: 8.5 },
    entropiaDistribuicao,
    ultimoResultado: ultimo,
    penultimoResultado: penultimo,
    ciclos: comCiclos,
  };
}

function buildDashboard(resultados) {
  const historico = getHistorico(resultados);
  const validacaoCiclos = validarCiclos(historico.ciclos);
  const alertaCiclos = gerarAlertaValidacao(validacaoCiclos);

  return {
    meta: {
      totalConcursos: historico.totalConcursos,
      cicloAtual: historico.cicloAtual,
      cicloAnterior: historico.cicloAnterior,
      tamanhoCicloMedio: historico.tamanhoCicloMedio,
    },
    ciclo: {
      atual: historico.cicloAtual,
      anterior: historico.cicloAnterior,
      dezenasFaltantes: historico.dezenasFaltantesCiclo,
      tamanhoMedio: historico.tamanhoCicloMedio,
    },
    soma: {
      media: historico.somaMedia,
      min: historico.somaMin,
      max: historico.somaMax,
      faixas: historico.somaFaixas,
    },
    pares: { distribuicao: historico.paresDistribuicao },
    frequencias: historico.frequenciaDezenas,
    atrasos: historico.atrasoAtual,
    reciclagem: {
      media: historico.reciclagemMedia,
      ultimas: historico.ultimoResultado?.dezenas ?? [],
    },
    janelas: historico.janelas,
    janelaAtual: historico.janelaAtual,
    quadrantes: {
      nomes: historico.quadrantesNomes,
      distribuicao: historico.quadrantesDistribuicao,
    },
    entropia: {
      media: historico.desvioPadraoMedio,
      ideal: historico.desvioPadraoIdeal,
      distribuicao: historico.entropiaDistribuicao,
    },
    ultimoResultado: historico.ultimoResultado ?? null,
    validacaoCiclos,
    alertaCiclos,
  };
}

module.exports = {
  calcularCiclos,
  validarCiclos,
  gerarAlertaValidacao,
  getHistorico,
  buildDashboard,
};

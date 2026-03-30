const { calcDesvioPadrao, calcSoma, calcPares, calcQuadrantes } = require('../utils/lotofacilCalc');

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
  return total ? Number(((count / total) * 100).toFixed(2)) : 0;
}

function media(values, decimals = 2) {
  if (!values.length) return 0;
  return Number((values.reduce((acc, value) => acc + value, 0) / values.length).toFixed(decimals));
}

function formatPadraoPares(qtdPares) {
  return `${qtdPares}P/${15 - qtdPares}I`;
}

function rangeToLabel([min, max]) {
  return `${min}-${max}`;
}

function calcQuadrantesDeJogo(dezenas) {
  return calcQuadrantes(dezenas);
}

function calcularCiclos(resultados) {
  const concursosOrdenados = [...resultados].sort((a, b) => a.concurso - b.concurso);
  let numeroCiclo = 1;
  let vistasNoCiclo = new Set();
  let concursosNoCiclo = 0;
  const ciclos = [];

  for (const concurso of concursosOrdenados) {
    concursosNoCiclo += 1;
    concurso.dezenas.forEach(dezena => vistasNoCiclo.add(dezena));

    const dezenasVistasNoCiclo = Array.from(vistasNoCiclo).sort((a, b) => a - b);
    const dezenasFaltantes = Array.from({ length: 25 }, (_, index) => index + 1)
      .filter(dezena => !vistasNoCiclo.has(dezena));
    const cicloFechado = dezenasFaltantes.length === 0;

    ciclos.push({
      ...concurso,
      ciclo: numeroCiclo,
      concursosNoCiclo,
      cicloFechado,
      dezenasVistasNoCiclo,
      dezenasFaltantesNoCiclo: dezenasFaltantes,
      faltamParaFechar: dezenasFaltantes.length,
    });

    if (cicloFechado) {
      numeroCiclo += 1;
      vistasNoCiclo = new Set();
      concursosNoCiclo = 0;
    }
  }

  return ciclos;
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
  for (let index = resultados.length - 1; index >= 0; index -= 1) {
    const aparece = par.every(dezena => resultados[index].dezenas.includes(dezena));
    if (aparece) break;
    streak += 1;
  }
  return streak;
}

function calcJanelaStats(resultados, par) {
  const total = resultados.length;
  const concursosComPar = resultados.filter(resultado => par.every(dezena => resultado.dezenas.includes(dezena))).length;
  const frequencia = pct(concursosComPar, total);
  const probBase = 35;
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
  const concursosOrdenados = [...resultados].sort((a, b) => a.concurso - b.concurso);
  const comCiclos = calcularCiclos(concursosOrdenados);
  const ultimoConcursoProcessado = comCiclos[comCiclos.length - 1] ?? null;
  const ultimoResultado = concursosOrdenados[concursosOrdenados.length - 1] ?? null;
  const penultimoResultado = concursosOrdenados[concursosOrdenados.length - 2] ?? null;

  const ciclosFechados = comCiclos.filter(item => item.cicloFechado);
  const ciclosCompletos = ciclosFechados.length;
  const ultimoCicloFechado = ciclosFechados[ciclosFechados.length - 1] ?? null;
  const numeroCicloAtual = ultimoConcursoProcessado?.cicloFechado
    ? (ultimoConcursoProcessado.ciclo + 1)
    : (ultimoConcursoProcessado?.ciclo ?? 1);

  const dezenasJaSairamNoCicloAtual = ultimoConcursoProcessado?.cicloFechado
    ? []
    : (ultimoConcursoProcessado?.dezenasVistasNoCiclo ?? []);
  const dezenasFaltantesCiclo = ultimoConcursoProcessado?.cicloFechado
    ? Array.from({ length: 25 }, (_, index) => index + 1)
    : (ultimoConcursoProcessado?.dezenasFaltantesNoCiclo ?? Array.from({ length: 25 }, (_, index) => index + 1));
  const concursosNoCicloAtual = ultimoConcursoProcessado?.cicloFechado ? 0 : (ultimoConcursoProcessado?.concursosNoCiclo ?? 0);

  const somaValores = concursosOrdenados.map(resultado => calcSoma(resultado.dezenas));
  const paresPorConcurso = concursosOrdenados.map(resultado => calcPares(resultado.dezenas));
  const imparesPorConcurso = paresPorConcurso.map(pares => 15 - pares);
  const dps = concursosOrdenados.map(resultado => calcDesvioPadrao(resultado.dezenas));

  const somaFaixas = SOMA_FAIXAS.map(range => {
    const [min, max] = range;
    const count = somaValores.filter(soma => soma >= min && soma <= max).length;
    return { faixa: rangeToLabel(range), pct: pct(count, total), ocorrencias: count };
  });
  const somaFaixaMaisRecorrente = [...somaFaixas].sort((a, b) => b.ocorrencias - a.ocorrencias)[0] ?? null;

  const paresCounter = new Map();
  paresPorConcurso.forEach(qtdPares => {
    paresCounter.set(qtdPares, (paresCounter.get(qtdPares) ?? 0) + 1);
  });
  const paresDistribuicao = [...paresCounter.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([pares, count]) => ({
      pares,
      impares: 15 - pares,
      padrao: formatPadraoPares(pares),
      pct: pct(count, total),
      ocorrencias: count,
    }));
  const padraoParesMaisRecorrente = [...paresDistribuicao].sort((a, b) => b.ocorrencias - a.ocorrencias)[0] ?? null;

  const frequenciaDezenas = {};
  const topFrequentes = [];
  for (let dezena = 1; dezena <= 25; dezena += 1) {
    const count = concursosOrdenados.filter(resultado => resultado.dezenas.includes(dezena)).length;
    const percentual = Number(((count / total) * 100).toFixed(2));
    frequenciaDezenas[dezena] = percentual;
    topFrequentes.push({ dezena, ocorrencias: count, pct: percentual });
  }
  topFrequentes.sort((a, b) => b.ocorrencias - a.ocorrencias || a.dezena - b.dezena);

  const atrasoAtual = {};
  for (let dezena = 1; dezena <= 25; dezena += 1) {
    let atraso = 0;
    for (let index = concursosOrdenados.length - 1; index >= 0; index -= 1) {
      if (concursosOrdenados[index].dezenas.includes(dezena)) break;
      atraso += 1;
    }
    atrasoAtual[dezena] = atraso;
  }

  let recicTotal = 0;
  for (let index = 1; index < concursosOrdenados.length; index += 1) {
    recicTotal += concursosOrdenados[index].dezenas.filter(dezena => concursosOrdenados[index - 1].dezenas.includes(dezena)).length;
  }
  const reciclagemMedia = Number((recicTotal / Math.max(1, concursosOrdenados.length - 1)).toFixed(1));

  const quadrantesMap = new Map();
  concursosOrdenados.forEach(resultado => {
    const padrao = calcQuadrantesDeJogo(resultado.dezenas).join('-');
    quadrantesMap.set(padrao, (quadrantesMap.get(padrao) ?? 0) + 1);
  });
  const quadrantesOrdenados = [...quadrantesMap.entries()].sort((a, b) => b[1] - a[1]);
  const topQuadrantes = quadrantesOrdenados.slice(0, 5).map(([padrao, count]) => ({ padrao, pct: pct(count, total), ocorrencias: count }));
  const outrosCount = quadrantesOrdenados.slice(5).reduce((acc, [, count]) => acc + count, 0);
  const quadrantesDistribuicao = outrosCount > 0
    ? [...topQuadrantes, { padrao: 'outros', pct: pct(outrosCount, total), ocorrencias: outrosCount }]
    : topQuadrantes;

  const desvioPadraoMedio = media(dps, 2);
  const entropiaDistribuicao = DP_FAIXAS.map(item => ({
    faixa: item.faixa,
    pct: pct(dps.filter(dp => dp >= item.min && dp <= item.max).length, total),
    label: item.label,
  }));

  const tamanhoCicloMedio = Number((total / Math.max(1, ciclosCompletos)).toFixed(1));
  const janelas = {
    '01+04': calcJanelaStats(concursosOrdenados, [1, 4]),
    '01+05': calcJanelaStats(concursosOrdenados, [1, 5]),
  };

  const janelaAtual = ultimoResultado
    ? ([1, 4].every(d => ultimoResultado.dezenas.includes(d))
      ? { tipo: '01-04', ...janelas['01+04'] }
      : [1, 5].every(d => ultimoResultado.dezenas.includes(d))
        ? { tipo: '01-05', ...janelas['01+05'] }
        : null)
    : null;

  return {
    totalConcursos: total,
    ciclosCompletos,
    cicloAtual: numeroCicloAtual,
    cicloAnterior: ultimoCicloFechado?.ciclo ?? Math.max(0, numeroCicloAtual - 1),
    concursosNoCicloAtual,
    dezenasJaSairamNoCicloAtual,
    dezenasFaltantesCiclo,
    tamanhoCicloMedio,
    somaMedia: media(somaValores, 1),
    somaMin: Math.min(...somaValores),
    somaMax: Math.max(...somaValores),
    somaFaixas,
    somaFaixaMaisRecorrente,
    mediaPares: media(paresPorConcurso, 2),
    mediaImpares: media(imparesPorConcurso, 2),
    percentualMedioPares: Number(((media(paresPorConcurso, 4) / 15) * 100).toFixed(2)),
    percentualMedioImpares: Number(((media(imparesPorConcurso, 4) / 15) * 100).toFixed(2)),
    paresDistribuicao,
    padraoParesMaisRecorrente,
    frequenciaDezenas,
    topFrequentes: topFrequentes.slice(0, 10),
    atrasoAtual,
    reciclagemMedia,
    janelas,
    janelaAtual,
    quadrantesNomes: QUADRANTES_NOMES,
    quadrantesDistribuicao,
    desvioPadraoMedio,
    desvioPadraoIdeal: { min: 6.0, max: 8.5 },
    entropiaDistribuicao,
    ultimoResultado,
    penultimoResultado,
    ultimoConcursoProcessado,
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
      concursosNoCicloAtual: historico.concursosNoCicloAtual,
    },
    totalConcursos: historico.totalConcursos,
    ciclosCompletos: historico.ciclosCompletos,
    cicloAtual: historico.cicloAtual,
    cicloAnterior: historico.cicloAnterior,
    mediaPorCiclo: historico.tamanhoCicloMedio,
    tamanhoCicloMedio: historico.tamanhoCicloMedio,
    dezenasFaltantesCiclo: historico.dezenasFaltantesCiclo,
    dezenasJaSairamNoCicloAtual: historico.dezenasJaSairamNoCicloAtual,
    concursosNoCicloAtual: historico.concursosNoCicloAtual,
    ciclo: {
      atual: historico.cicloAtual,
      anterior: historico.cicloAnterior,
      dezenasFaltantes: historico.dezenasFaltantesCiclo,
      dezenasJaSairam: historico.dezenasJaSairamNoCicloAtual,
      concursosNoCicloAtual: historico.concursosNoCicloAtual,
      tamanhoMedio: historico.tamanhoCicloMedio,
    },
    soma: {
      media: historico.somaMedia,
      min: historico.somaMin,
      max: historico.somaMax,
      faixas: historico.somaFaixas,
      faixaMaisRecorrente: historico.somaFaixaMaisRecorrente,
    },
    pares: {
      distribuicao: historico.paresDistribuicao,
      media: historico.mediaPares,
      percentualMedio: historico.percentualMedioPares,
      padraoMaisRecorrente: historico.padraoParesMaisRecorrente,
    },
    impares: {
      media: historico.mediaImpares,
      percentualMedio: historico.percentualMedioImpares,
    },
    frequencias: historico.frequenciaDezenas,
    topFrequentes: historico.topFrequentes,
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

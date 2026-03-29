const {
  calcSoma, calcPares, calcQuadrantes, calcDesvioPadrao,
  calcAgrupamentos, calcReciclagem, calcAlinhamentoCiclo, labelDispersal,
} = require('../utils/lotofacilCalc');

const BONUS_QUANTIDADE = {
  15: 0,
  16: 8,
  17: 16,
  18: 24,
  19: 33,
  20: 46,
};

function classificarScore(score) {
  if (score <= 75) {
    return { label: 'CRÍTICO', emoji: '🟣', descricao: 'Jogo muito fraco para os padrões estatísticos.', cor: '#6A0DAD' };
  }
  if (score <= 90) {
    return { label: 'PÉSSIMO', emoji: '🔴', descricao: 'Jogo abaixo do mínimo recomendado.', cor: '#FF3B3B' };
  }
  if (score <= 110) {
    return { label: 'RUIM', emoji: '🟠', descricao: 'Jogo fora de boa parte dos padrões históricos.', cor: '#FF8C00' };
  }
  if (score <= 120) {
    return { label: 'BOM', emoji: '🔵', descricao: 'Jogo aceitável, com base estatística razoável.', cor: '#3B82F6' };
  }
  if (score <= 140) {
    return { label: 'MUITO BOM', emoji: '🟢', descricao: 'Jogo consistente e bem equilibrado.', cor: '#7CFF7C' };
  }
  if (score <= 180) {
    return { label: 'ÓTIMO', emoji: '💚', descricao: 'Jogo forte dentro dos filtros principais.', cor: '#39FF14' };
  }
  return { label: 'OURO', emoji: '🏆', descricao: 'Jogo premium com cobertura estatística máxima.', cor: '#FFD700' };
}

function buildJanelaMensagem(janelaAtual, temJ04, temJ05) {
  const jogoMsg = temJ04
    ? 'Seu jogo contém a janela 01-04.'
    : temJ05
      ? 'Seu jogo contém a janela 01-05.'
      : 'Seu jogo não contém 01-04 nem 01-05.';

  if (!janelaAtual) {
    return `${jogoMsg} No último concurso não houve abertura em 01-04 nem 01-05.`;
  }

  return `Concurso atual foi iniciado em dezenas ${janelaAtual.tipo}. Aproveite a janela ${janelaAtual.tipo} e aumente sua probabilidade em ${janelaAtual.ganhoProbabilidadePct.toFixed(3)}% sobre a chance combinatória base. ${jogoMsg}`;
}

function analisar(dezenas, contexto = {}) {
  const historico = contexto.historico ?? {};
  const ultimoResultado = contexto.ultimoResultado ?? null;
  const ultimasDezenas = ultimoResultado?.dezenas ?? [];
  const concursoRef = ultimoResultado?.concurso ?? null;
  const pendentes = historico.dezenasFaltantesCiclo ?? [];
  const janelaAtual = historico.janelaAtual ?? null;
  const janelas = historico.janelas ?? { '01+04': { ausenteHa: 0 }, '01+05': { ausenteHa: 0 } };
  const frequencias = historico.frequenciaDezenas ?? {};
  const atrasos = historico.atrasoAtual ?? {};
  const qtdSelecionadas = dezenas.length;

  const soma = calcSoma(dezenas);
  const pares = calcPares(dezenas);
  const impares = qtdSelecionadas - pares;
  const agrup = calcAgrupamentos(dezenas);
  const reciclagem = calcReciclagem(dezenas, ultimasDezenas);
  const quadrantes = calcQuadrantes(dezenas);
  const dp = calcDesvioPadrao(dezenas);
  const dpRound = Math.round(dp * 100) / 100;
  const temJ04 = dezenas.includes(1) && dezenas.includes(4);
  const temJ05 = dezenas.includes(1) && dezenas.includes(5);

  let score = 0;
  const filtros = [];

  const somaBaseMin = Math.round((180 / 15) * qtdSelecionadas);
  const somaBaseMax = Math.round((210 / 15) * qtdSelecionadas);
  const somaAceitavelMin = Math.round((170 / 15) * qtdSelecionadas);
  const somaAceitavelMax = Math.round((220 / 15) * qtdSelecionadas);
  const somaOk = soma >= somaBaseMin && soma <= somaBaseMax;
  const somaAc = soma >= somaAceitavelMin && soma <= somaAceitavelMax;
  filtros.push({
    id: 1,
    nome: 'Soma dos Números',
    explicacao: `Somamos os ${qtdSelecionadas} números escolhidos. A faixa ideal foi ajustada proporcionalmente ao tamanho do jogo.`,
    valor: `Soma total = ${soma}`,
    status: somaOk ? 'aprovado' : somaAc ? 'atencao' : 'reprovado',
    detalhe: somaOk ? '✔ Soma dentro da zona ideal proporcional.' : somaAc ? 'Faixa aceitável, mas dá para refinar.' : 'Soma fora do padrão proporcional recomendado.',
    faixa: `Ideal: ${somaBaseMin}–${somaBaseMax}`,
    referencia: { media: historico.somaMedia, min: historico.somaMin, max: historico.somaMax },
  });
  score += somaOk ? 18 : somaAc ? 9 : 0;

  const paresIdealMin = Math.floor(qtdSelecionadas * 0.45);
  const paresIdealMax = Math.ceil(qtdSelecionadas * 0.55);
  const paresAceitavelMin = Math.max(0, paresIdealMin - 1);
  const paresAceitavelMax = Math.min(qtdSelecionadas, paresIdealMax + 1);
  const paresOk = pares >= paresIdealMin && pares <= paresIdealMax;
  const paresAc = pares >= paresAceitavelMin && pares <= paresAceitavelMax;
  filtros.push({
    id: 2,
    nome: 'Equilíbrio de Pares e Ímpares',
    explicacao: 'Quanto mais equilibrado entre pares e ímpares, mais próximo do padrão histórico.',
    valor: `${pares} pares / ${impares} ímpares`,
    status: paresOk ? 'aprovado' : paresAc ? 'atencao' : 'reprovado',
    detalhe: paresOk ? '✔ Equilíbrio muito bom.' : paresAc ? 'Faixa aceitável.' : 'Desequilíbrio alto entre pares e ímpares.',
    faixa: `Ideal: ${paresIdealMin} a ${paresIdealMax} pares`,
    referencia: { distribuicao: historico.paresDistribuicao },
  });
  score += paresOk ? 16 : paresAc ? 8 : 0;

  const totalAgr = agrup.quadra + agrup.quina * 2 + agrup.sena * 3;
  const agrupOk = totalAgr === 0 && agrup.terno <= 2;
  const agrupAc = totalAgr <= 1;
  const agrupDesc = Object.entries(agrup).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}(s)`).join(', ') || 'Nenhum';
  filtros.push({
    id: 3,
    nome: 'Números em Sequência',
    explicacao: 'Sequências longas demais tendem a fugir do padrão histórico.',
    valor: agrupDesc,
    status: agrupOk ? 'aprovado' : agrupAc ? 'atencao' : 'reprovado',
    detalhe: agrupOk ? '✔ Sequências sob controle.' : agrupAc ? 'Alguma concentração, ainda aceitável.' : 'Há sequências demais para um jogo equilibrado.',
    faixa: agrupOk ? 'Dispersão ideal' : agrupAc ? 'Agrupamento moderado' : 'Sequências excessivas',
    referencia: agrup,
  });
  score += agrupOk ? 16 : agrupAc ? 8 : 0;

  const noCiclo = calcAlinhamentoCiclo(dezenas, pendentes);
  const cicloOk = noCiclo >= Math.max(2, Math.round(qtdSelecionadas * 0.13));
  const cicloAc = noCiclo >= 1;
  filtros.push({
    id: 4,
    nome: `Ciclo das Dezenas (Ciclo ${historico.cicloAtual ?? '—'})`,
    explicacao: 'Prioriza dezenas ainda pendentes no ciclo atual para aumentar alinhamento estatístico.',
    valor: `${noCiclo} dezena(s) pendentes do ciclo no seu jogo`,
    status: cicloOk ? 'aprovado' : cicloAc ? 'atencao' : 'reprovado',
    detalhe: pendentes.length === 25
      ? `O último concurso encerrou o ciclo ${historico.cicloAtual}. O próximo sorteio abrirá um novo ciclo com todas as 25 dezenas pendentes; ${noCiclo} delas estão no seu jogo.`
      : `Faltam sair: ${pendentes.join(', ')}${noCiclo > 0 ? ` | No seu jogo: ${dezenas.filter(d => pendentes.includes(d)).join(', ')}` : ' | Nenhuma pendente no seu jogo.'}`,
    faixa: cicloOk ? 'Bom alinhamento com o ciclo' : cicloAc ? 'Alinhamento parcial' : 'Sem alinhamento relevante',
    referencia: { cicloAtual: historico.cicloAtual, pendentes },
  });
  score += cicloOk ? 18 : cicloAc ? 9 : 0;

  const atrasadasSelecionadas = dezenas.filter(d => (atrasos[d] ?? 0) >= 2);
  const atrasadasOk = atrasadasSelecionadas.length >= 1 && atrasadasSelecionadas.length <= 4;
  const maisAtrasada = Object.entries(atrasos).sort(([, a], [, b]) => b - a)[0];
  filtros.push({
    id: 5,
    nome: 'Dezenas Atrasadas',
    explicacao: 'Misturar algumas dezenas atrasadas ajuda a cobrir reversões estatísticas.',
    valor: `${atrasadasSelecionadas.length} dezena(s) atrasada(s) no jogo`,
    status: atrasadasOk ? 'aprovado' : atrasadasSelecionadas.length === 0 ? 'atencao' : 'reprovado',
    detalhe: atrasadasOk ? `✔ Atrasadas usadas: ${atrasadasSelecionadas.join(', ')}.` : atrasadasSelecionadas.length === 0 ? `Nenhuma atrasada usada. A mais atrasada é a ${maisAtrasada?.[0]} (${maisAtrasada?.[1]} concurso(s)).` : 'Excesso de dezenas atrasadas no mesmo jogo.',
    faixa: atrasadasOk ? 'Aproveitamento ideal' : 'Revisar atrasadas',
    referencia: atrasos,
  });
  score += atrasadasOk ? 14 : atrasadasSelecionadas.length === 0 ? 7 : 2;

  const janelaAtivaNoJogo = temJ04 || temJ05;
  filtros.push({
    id: 6,
    nome: 'Padrão de Janela (01+04 ou 01+05)',
    explicacao: 'A janela observa a coexistência do 01 com 04 ou 05 e o comportamento recente do último concurso.',
    valor: temJ04 ? 'Janela 01-04 presente no jogo' : temJ05 ? 'Janela 01-05 presente no jogo' : 'Janela ausente no jogo',
    status: janelaAtivaNoJogo ? 'aprovado' : janelaAtual ? 'atencao' : 'atencao',
    detalhe: `${buildJanelaMensagem(janelaAtual, temJ04, temJ05)} 01+04 ausente há ${janelas['01+04']?.ausenteHa ?? 0} concurso(s) | 01+05 ausente há ${janelas['01+05']?.ausenteHa ?? 0} concurso(s).`,
    faixa: janelaAtivaNoJogo ? 'Padrão presente' : 'Padrão ausente',
    referencia: janelas,
  });
  score += janelaAtivaNoJogo ? 14 : janelaAtual ? 7 : 4;

  const recicOk = reciclagem >= 7 && reciclagem <= 9;
  const recicAc = reciclagem >= 5 && reciclagem <= 11;
  const recicLista = dezenas.filter(d => ultimasDezenas.includes(d));
  filtros.push({
    id: 7,
    nome: 'Números Repetidos do Último Sorteio',
    explicacao: 'Mede quantos números do último concurso você reaproveitou no novo jogo.',
    valor: `${reciclagem} número(s) repetido(s) do último concurso`,
    status: recicOk ? 'aprovado' : recicAc ? 'atencao' : 'reprovado',
    detalhe: ultimasDezenas.length === 0 ? 'Último concurso indisponível.' : `Repetidos: ${recicLista.join(', ') || 'nenhum'} | Concurso ref.: #${concursoRef} | Média histórica: ${historico.reciclagemMedia}`,
    faixa: recicOk ? 'Faixa ideal: 7 a 9' : recicAc ? 'Aceitável' : 'Fora da faixa ideal',
    referencia: { ultimasDezenas, concursoRef, media: historico.reciclagemMedia },
  });
  score += recicOk ? 16 : recicAc ? 8 : 1;

  const mediaFreqJogo = Number((dezenas.reduce((acc, d) => acc + (frequencias[d] ?? 0), 0) / Math.max(1, qtdSelecionadas)).toFixed(2));
  const freqOk = mediaFreqJogo >= 59.5 && mediaFreqJogo <= 61.8;
  const freqAc = mediaFreqJogo >= 58.5 && mediaFreqJogo <= 62.5;
  filtros.push({
    id: 8,
    nome: 'Frequência Histórica Média',
    explicacao: 'Avalia se o conjunto mistura dezenas quentes e frias de forma equilibrada.',
    valor: `Frequência média = ${mediaFreqJogo}%`,
    status: freqOk ? 'aprovado' : freqAc ? 'atencao' : 'reprovado',
    detalhe: freqOk ? '✔ Frequência média bem equilibrada.' : freqAc ? 'Faixa aceitável de frequência.' : 'Conjunto muito concentrado em dezenas quentes ou frias.',
    faixa: 'Ideal aproximado: 59,5% a 61,8%',
    referencia: frequencias,
  });
  score += freqOk ? 14 : freqAc ? 7 : 1;

  const quadZeros = quadrantes.filter(q => q === 0).length;
  const quadDeseq = quadrantes.filter(q => q < Math.max(1, Math.floor(qtdSelecionadas / 10)) || q > Math.ceil(qtdSelecionadas / 4)).length;
  const quadOk = quadZeros === 0 && quadDeseq === 0;
  const quadAc = quadZeros === 0 && quadDeseq <= 1;
  const quadLabels = historico.quadrantesNomes ?? [];
  filtros.push({
    id: 9,
    nome: 'Distribuição nas Regiões do Volante',
    explicacao: 'Evita concentrar o jogo em poucas regiões do volante.',
    valor: quadrantes.map((q, i) => `${quadLabels[i] ?? i + 1}: ${q}`).join(' | '),
    status: quadZeros > 0 ? 'reprovado' : quadOk ? 'aprovado' : quadAc ? 'atencao' : 'reprovado',
    detalhe: quadZeros > 0 ? 'Há região vazia no volante.' : quadOk ? '✔ Distribuição saudável nas 5 regiões.' : 'Leve concentração em algumas regiões.',
    faixa: quadZeros > 0 ? 'Região vazia' : quadOk ? 'Equilibrado' : 'Leve concentração',
    referencia: { quadrantes, nomes: quadLabels },
  });
  score += quadZeros > 0 ? 0 : quadOk ? 14 : quadAc ? 7 : 2;

  const dpIdeal = historico.desvioPadraoIdeal ?? { min: 6, max: 8.5 };
  const dpOk = dp >= dpIdeal.min && dp <= dpIdeal.max;
  const dpAc = dp >= 5 && dp <= 9.6;
  const dpLabel = labelDispersal(dp);
  filtros.push({
    id: 10,
    nome: 'Espalhamento dos Números (σ)',
    explicacao: 'Mede o espalhamento dos números escolhidos dentro do volante.',
    valor: `σ = ${dpRound}`,
    status: dpOk ? 'aprovado' : dpAc ? 'atencao' : 'reprovado',
    detalhe: `Classificação: ${dpLabel} | Média histórica: ${historico.desvioPadraoMedio}`,
    faixa: dpOk ? 'Zona ideal: 6,0 a 8,5' : dpAc ? 'Aceitável' : 'Fora do padrão',
    referencia: { dp: dpRound, media: historico.desvioPadraoMedio, ideal: dpIdeal },
  });
  score += dpOk ? 14 : dpAc ? 7 : 0;

  const bonusQuantidade = BONUS_QUANTIDADE[qtdSelecionadas] ?? 0;
  filtros.push({
    id: 11,
    nome: 'Cobertura por Quantidade de Dezenas',
    explicacao: 'Quanto mais dezenas válidas entre 15 e 20, maior a cobertura combinatória do jogo.',
    valor: `${qtdSelecionadas} dezenas selecionadas`,
    status: qtdSelecionadas >= 18 ? 'aprovado' : qtdSelecionadas >= 16 ? 'atencao' : 'aprovado',
    detalhe: qtdSelecionadas === 15 ? 'Base padrão sem bônus extra.' : `Cobertura ampliada com bônus de ${bonusQuantidade} ponto(s).`,
    faixa: '15 a 20 dezenas',
    referencia: BONUS_QUANTIDADE,
  });
  score += bonusQuantidade;

  score = Math.max(0, Math.min(200, Math.round(score)));

  const aprovados = filtros.filter(f => f.status === 'aprovado').length;
  const atencao = filtros.filter(f => f.status === 'atencao').length;
  const reprovados = filtros.filter(f => f.status === 'reprovado').length;
  const classificacao = classificarScore(score);

  return {
    dezenas,
    quantidade: qtdSelecionadas,
    soma,
    pares,
    impares,
    reciclagem,
    score,
    classificacao,
    resumo: { aprovados, atencao, reprovados, total: filtros.length },
    filtros,
    referencia: { concursoRef, ultimasDezenas },
  };
}

module.exports = { analisar, classificarScore };

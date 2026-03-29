// ─── utils/lotofacilCalc.js ───────────────────────────────────────────────────
// Funções matemáticas puras para análise de jogos da Lotofácil.
// Nenhuma função aqui acessa estado externo, banco de dados ou APIs.
// Todas recebem os dados necessários por parâmetro — fáceis de testar.
// ──────────────────────────────────────────────────────────────────────────────

/** Soma todos os elementos do array. */
function calcSoma(dezenas) {
  return dezenas.reduce((acc, n) => acc + n, 0);
}

/** Quantidade de números pares. */
function calcPares(dezenas) {
  return dezenas.filter(n => n % 2 === 0).length;
}

/**
 * Distribui as dezenas nas 5 regiões do volante (quadrantes):
 * [01-05, 06-10, 11-15, 16-20, 21-25]
 * @returns {number[]} — array de 5 contagens
 */
function calcQuadrantes(dezenas) {
  return [
    dezenas.filter(n => n >= 1  && n <= 5).length,
    dezenas.filter(n => n >= 6  && n <= 10).length,
    dezenas.filter(n => n >= 11 && n <= 15).length,
    dezenas.filter(n => n >= 16 && n <= 20).length,
    dezenas.filter(n => n >= 21 && n <= 25).length,
  ];
}

/**
 * Calcula o desvio padrão (σ) — métrica de espalhamento/dispersão.
 * Valores próximos de 7.21 (média histórica) são ideais.
 * @returns {number}
 */
function calcDesvioPadrao(dezenas) {
  const media = calcSoma(dezenas) / dezenas.length;
  const variancia = dezenas.reduce((acc, n) => acc + Math.pow(n - media, 2), 0) / dezenas.length;
  return Math.sqrt(variancia);
}

/**
 * Detecta grupos de números consecutivos (agrupamentos sequenciais).
 * Exemplo: [4,5,6] = 1 terno | [10,11] = 1 duque
 * @returns {{ duque, terno, quadra, quina, sena }} — contagem por tipo
 */
function calcAgrupamentos(dezenas) {
  const sorted = [...dezenas].sort((a, b) => a - b);
  const grupos = { duque: 0, terno: 0, quadra: 0, quina: 0, sena: 0 };
  let i = 0;

  while (i < sorted.length) {
    let tamanho = 1;
    while (
      i + tamanho < sorted.length &&
      sorted[i + tamanho] === sorted[i + tamanho - 1] + 1
    ) {
      tamanho++;
    }

    if      (tamanho === 2) grupos.duque++;
    else if (tamanho === 3) grupos.terno++;
    else if (tamanho === 4) grupos.quadra++;
    else if (tamanho === 5) grupos.quina++;
    else if (tamanho >= 6)  grupos.sena++;

    i += tamanho;
  }

  return grupos;
}

/**
 * Conta quantas dezenas do jogo aparecem na lista do último concurso (reciclagem).
 * @param {number[]} dezenas        — jogo a analisar
 * @param {number[]} ultimoConcurso — dezenas do último sorteio real
 * @returns {number}
 */
function calcReciclagem(dezenas, ultimoConcurso) {
  return dezenas.filter(d => ultimoConcurso.includes(d)).length;
}

/**
 * Conta quantas dezenas do jogo estão na lista de pendentes do ciclo atual.
 * @param {number[]} dezenas          — jogo a analisar
 * @param {number[]} dezenasPendentes — dezenas ainda não sorteadas no ciclo
 * @returns {number}
 */
function calcAlinhamentoCiclo(dezenas, dezenasPendentes) {
  return dezenas.filter(d => dezenasPendentes.includes(d)).length;
}

/**
 * Retorna descrição textual do nível de dispersão com base no σ.
 * @param {number} dp — desvio padrão calculado
 * @returns {string}
 */
function labelDispersal(dp) {
  if (dp < 5)   return 'Muito concentrado';
  if (dp < 6)   return 'Concentrado';
  if (dp < 7)   return 'Equilibrado';
  if (dp < 8)   return 'Ótimo';
  if (dp < 8.5) return 'Disperso aceitável';
  return 'Muito disperso';
}

module.exports = {
  calcSoma,
  calcPares,
  calcQuadrantes,
  calcDesvioPadrao,
  calcAgrupamentos,
  calcReciclagem,
  calcAlinhamentoCiclo,
  labelDispersal,
};

// ─── utils/formatters.js ─────────────────────────────────────────────────────
// Funções utilitárias de formatação usadas nos componentes.
// ──────────────────────────────────────────────────────────────────────────────

/** Formata número de dezena com zero à esquerda. Ex: 5 → "05" */
export const fmt2 = (n) => String(n).padStart(2, '0');

/** Formata número como moeda BRL. */
export const fmtBRL = (n) =>
  n != null
    ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '–';

/** Formata número com separador de milhar BR. */
export const fmtNum = (n) =>
  n != null ? n.toLocaleString('pt-BR') : '–';

/** Retorna cor CSS conforme status do filtro. */
export const corStatus = (status) => ({
  aprovado:  '#AAEE00',
  atencao:   '#FFD700',
  reprovado: '#F87171',
}[status] ?? '#fff');

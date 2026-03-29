// ─── components/Bola.jsx ─────────────────────────────────────────────────────
// Botão circular representando uma dezena da Lotofácil.
// Estados: selected, highlight (pendente no ciclo), dimmed (grade cheia).
// ──────────────────────────────────────────────────────────────────────────────

import { fmt2 } from '../utils/formatters';

export default function Bola({ num, selected, onClick, highlight, dimmed }) {
  const classes = ['bola',
    selected  ? 'bola-selected'  : '',
    highlight ? 'bola-highlight' : '',
    dimmed    ? 'bola-dimmed'    : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      onClick={() => !dimmed && onClick(num)}
      aria-label={`Dezena ${fmt2(num)}${selected ? ' — selecionada' : ''}`}
      aria-pressed={selected}
    >
      {fmt2(num)}
    </button>
  );
}

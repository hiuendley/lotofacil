// ─── components/Ajuda.jsx ────────────────────────────────────────────────────
// Botão "?" que abre modal explicativo — acessível para usuários leigos.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

export default function Ajuda({ texto }) {
  const [aberto, setAberto] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle' }}>
      <button
        className="ajuda-btn"
        onClick={() => setAberto(true)}
        title="O que é isso?"
        aria-label="Abrir explicação"
      >
        ?
      </button>

      {aberto && (
        <div className="ajuda-overlay" onClick={() => setAberto(false)}>
          <div className="ajuda-modal" onClick={e => e.stopPropagation()}>
            <div className="ajuda-modal-titulo">💡 Entenda este filtro</div>
            <p>{texto}</p>
            <button className="ajuda-modal-btn" onClick={() => setAberto(false)}>
              ENTENDI ✓
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

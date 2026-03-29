// ─── components/FiltroCard.jsx ───────────────────────────────────────────────
// Card expansível para exibir um filtro estatístico.
// Clicável para expandir/recolher detalhes.
// Botão "?" abre modal explicativo em linguagem simples.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Ajuda from './Ajuda';

const CFG = {
  aprovado:  { icon: '✓', label: 'APROVADO',  cor: '#AAEE00' },
  atencao:   { icon: '⚠', label: 'ATENÇÃO',   cor: '#FFD700' },
  reprovado: { icon: '✗', label: 'REPROVADO', cor: '#F87171' },
};

export default function FiltroCard({ filtro }) {
  const [aberto, setAberto] = useState(false);
  const cfg = CFG[filtro.status] ?? CFG.atencao;

  return (
    <div className={`filtro-card ${filtro.status}`}>
      {/* Cabeçalho clicável */}
      <div
        className="filtro-header"
        onClick={() => setAberto(o => !o)}
        role="button"
        aria-expanded={aberto}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setAberto(o => !o)}
      >
        {/* Ícone de status */}
        <div
          className="filtro-icone"
          style={{
            background: `${cfg.cor}20`,
            border: `2px solid ${cfg.cor}50`,
            color: cfg.cor,
          }}
        >
          {cfg.icon}
        </div>

        {/* Conteúdo principal */}
        <div className="filtro-body">
          <div className="filtro-nome-row">
            <span className="filtro-nome">
              F{filtro.id} — {filtro.nome}
            </span>
            <Ajuda texto={filtro.explicacao} />
            <span
              className="filtro-badge"
              style={{
                background: `${cfg.cor}18`,
                color: cfg.cor,
              }}
            >
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <div className="filtro-valor">{filtro.valor}</div>
          <div className="filtro-detalhe">{filtro.detalhe}</div>
        </div>

        <span className="filtro-toggle">{aberto ? '▲ fechar' : '▼ mais'}</span>
      </div>

      {/* Detalhe expandido */}
      {aberto && (
        <div className="filtro-expandido">
          <strong style={{ color: 'rgba(255,255,255,0.65)' }}>O que é este filtro?</strong>
          <br />
          {filtro.explicacao}
          <br /><br />
          <span style={{ color: cfg.cor, fontWeight: 600 }}>Resultado: {filtro.faixa}</span>
        </div>
      )}
    </div>
  );
}

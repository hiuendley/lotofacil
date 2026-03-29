// ─── components/BannerResultado.jsx ─────────────────────────────────────────
// Exibe o último resultado oficial da Lotofácil no topo da página.
// Três estados: carregando | erro | resultado ao vivo.
// ──────────────────────────────────────────────────────────────────────────────

import { fmt2 } from '../utils/formatters';

export default function BannerResultado({ status, ultimoResultado, onRetry }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="banner-loading">
        <span style={{ fontSize: 18 }}>⏳</span>
        Carregando último resultado da planilha…
      </div>
    );
  }

  if (status === 'erro') {
    return (
      <div className="banner-erro">
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span>Não foi possível conectar ao servidor. Usando dados em cache.</span>
        {onRetry && (
          <button onClick={onRetry}>↺ Tentar novamente</button>
        )}
      </div>
    );
  }

  if (!ultimoResultado) return null;

  const soma = ultimoResultado.dezenas.reduce((a, b) => a + b, 0);

  return (
    <div className="banner-ok">
      <div className="banner-ok-header">
        <div>
          <div className="banner-ok-titulo">
            🏆 ÚLTIMO RESULTADO — CONCURSO #{ultimoResultado.concurso}
          </div>
          <div className="banner-ok-meta">
            Sorteio: {ultimoResultado.data} · Fonte: {ultimoResultado.fonte} · leitura automática da planilha
          </div>
        </div>
        {ultimoResultado.acumulado && (
          <div className="banner-acumulado">💰 ACUMULADO</div>
        )}
      </div>

      <div className="banner-bolas">
        {ultimoResultado.dezenas.map(n => (
          <div key={n} className="banner-bola">{fmt2(n)}</div>
        ))}
        <div className="banner-soma">
          <div className="banner-soma-label">Soma</div>
          <div className="banner-soma-value">{soma}</div>
        </div>
      </div>

      <div className="banner-ok-nota">
        💡 As dezenas acima são usadas automaticamente como referência para o{' '}
        <strong>Filtro F7 (Reciclagem)</strong> da análise do seu jogo.
      </div>
    </div>
  );
}

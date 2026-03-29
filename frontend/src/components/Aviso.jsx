// ─── components/Aviso.jsx ────────────────────────────────────────────────────
// Aviso laranja exibido quando o usuário tenta analisar sem selecionar 15 a 20 dezenas.
// ──────────────────────────────────────────────────────────────────────────────

export default function Aviso({ show }) {
  if (!show) return null;
  return (
    <div className="card-aviso" role="alert">
      <span className="card-aviso-icon">☝️</span>
      <div>
        <div className="card-aviso-titulo">Atenção!</div>
        <div className="card-aviso-texto">
          Você ainda não fez a simulação dos números!<br />
          Vá até a aba <strong style={{ color: '#AAEE00' }}>🎯 Meu Jogo</strong>,
          escolha seus <strong style={{ color: '#AAEE00' }}>15 a 20 números</strong> e
          clique em <strong style={{ color: '#AAEE00' }}>⚡ ANALISAR JOGO</strong>.
        </div>
      </div>
    </div>
  );
}

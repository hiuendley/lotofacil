// ─── components/Dica.jsx ─────────────────────────────────────────────────────
// Caixa de dica dourada para orientar usuários leigos.
// ──────────────────────────────────────────────────────────────────────────────

export default function Dica({ emoji = '💡', titulo, children }) {
  return (
    <div className="card-dica">
      <span className="card-dica-icon">{emoji}</span>
      <div className="card-dica-texto">
        {titulo && <strong style={{ color: '#FFD700', display: 'block', marginBottom: 4 }}>{titulo}</strong>}
        {children}
      </div>
    </div>
  );
}

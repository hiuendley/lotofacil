const FALLBACK = '#AAEE00';

export default function ScoreMeter({ score, classificacao }) {
  const pct = Math.min(score, 200) / 2;
  const cor = classificacao?.cor ?? FALLBACK;
  const R = 64;
  const circunferencia = 2 * Math.PI * R;
  const offset = circunferencia * (1 - pct / 100);

  return (
    <div className="score-meter">
      <div style={{ position: 'relative', width: 154, height: 154, margin: '0 auto' }}>
        <svg width={154} height={154} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={77} cy={77} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
          <circle
            cx={77}
            cy={77}
            r={R}
            fill="none"
            stroke={cor}
            strokeWidth={14}
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 10px ${cor}99)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Azonix',sans-serif", fontSize: 42, color: cor, lineHeight: 1 }}>{score}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>de 200</span>
        </div>
      </div>
      <div className="score-emoji">{classificacao?.emoji}</div>
      <div className="score-label" style={{ color: cor }}>{classificacao?.label}</div>
      <div className="score-desc">{classificacao?.descricao}</div>
    </div>
  );
}

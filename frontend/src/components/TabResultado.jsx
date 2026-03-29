import ScoreMeter from './ScoreMeter';
import FiltroCard from './FiltroCard';
import { fmt2 } from '../utils/formatters';

export default function TabResultado({ resultado, dezenas, onEditar }) {
  if (!resultado) {
    return (
      <div className="tela-vazia">
        <div className="tela-vazia-icon">🎯</div>
        <div className="tela-vazia-titulo">FAÇA PRIMEIRO A SIMULAÇÃO</div>
        <div className="tela-vazia-texto">
          Vá até a aba <strong style={{ color: '#AAEE00' }}>🎯 Meu Jogo</strong>, escolha
          seus <strong style={{ color: '#AAEE00' }}>15 a 20 números</strong> e clique em <strong style={{ color: '#AAEE00' }}>⚡ ANALISAR JOGO</strong>.
        </div>
        <button className="btn-primario" style={{ marginTop: 28 }} onClick={onEditar}>👆 IR PARA MEU JOGO</button>
      </div>
    );
  }

  const { score, classificacao, resumo, filtros, referencia } = resultado;

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid-2">
        <div className="card" style={{ paddingBottom: 16 }}>
          <ScoreMeter score={score} classificacao={classificacao} />
          <div className="score-resumo">
            <span style={{ color: '#AAEE00' }}>✓ {resumo.aprovados} ok</span>
            <span style={{ color: '#FFD700' }}>⚠ {resumo.atencao} atenção</span>
            <span style={{ color: '#F87171' }}>✗ {resumo.reprovados} falha</span>
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: 14 }}><div className="sec-titulo">RESUMO DO JOGO</div></div>
          {[
            { k: 'Números', v: dezenas.map(fmt2).join(' – ') },
            { k: 'Quantidade', v: resultado.quantidade },
            { k: 'Soma total', v: resultado.soma ?? dezenas.reduce((a, b) => a + b, 0) },
            { k: 'Pares / Ímpares', v: `${resultado.pares} / ${resultado.impares}` },
            { k: 'Repetidos do anterior', v: `${resultado.reciclagem} números` },
            { k: 'Concurso referência', v: referencia?.concursoRef ? `#${referencia.concursoRef}` : '–' },
          ].map(item => (
            <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{item.k}</span>
              <span style={{ color: '#e2d5ff', fontSize: 12, fontWeight: 600, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{String(item.v)}</span>
            </div>
          ))}
          <button className="btn-secundario" style={{ marginTop: 14 }} onClick={onEditar}>← Editar meu jogo</button>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 6 }}>
          <div className="sec-titulo">ANÁLISE POR FILTRO</div>
          <div className="sec-subtitulo">Clique em qualquer filtro para expandir. Toque no <strong style={{ color: '#FFD700' }}>?</strong> para entender o que cada um significa.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {filtros.map(f => <FiltroCard key={f.id} filtro={f} />)}
        </div>
      </div>
    </div>
  );
}

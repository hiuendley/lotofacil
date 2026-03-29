import Bola from './Bola';
import Dica from './Dica';
import { fmt2 } from '../utils/formatters';

const TODAS = Array.from({ length: 25 }, (_, i) => i + 1);
const MIN_DEZENAS = 15;
const MAX_DEZENAS = 20;

export default function TabSimulador({
  dezenas,
  inputVal,
  analisando,
  erroAnalise,
  dezenasPendentes,
  onToggle,
  onInput,
  onAleatorio,
  onLimpar,
  onAnalisar,
}) {
  const faltam = Math.max(0, MIN_DEZENAS - dezenas.length);
  const completo = dezenas.length >= MIN_DEZENAS && dezenas.length <= MAX_DEZENAS;
  const soma = dezenas.reduce((a, b) => a + b, 0);
  const pares = dezenas.filter(n => n % 2 === 0).length;

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="passo-header">
          <div className="passo-num">1</div>
          <div>
            <div className="passo-titulo">DIGITE SEUS NÚMEROS</div>
            <div className="passo-sub">Digite de 15 a 20 números separados por espaço ou vírgula</div>
          </div>
        </div>
        <input
          className="input-dezenas"
          value={inputVal}
          onChange={e => onInput(e.target.value)}
          placeholder="Exemplo: 01 05 09 11 13 15 17 18 19 20 21 22 23 24 25 03"
        />
      </div>

      <div className="card">
        <div className="passo-header">
          <div className="passo-num">2</div>
          <div>
            <div className="passo-titulo">OU CLIQUE NAS BOLINHAS</div>
            <div className="passo-sub">Toque nos números que quer jogar. Escolha entre 15 e 20.</div>
          </div>
        </div>

        <div className="legenda" style={{ marginBottom: 10 }}>
          <span>
            <span className="legenda-dot" style={{ background: 'linear-gradient(135deg,#AAEE00,#7CB800)' }} />
            Selecionado
          </span>
          <span>
            <span className="legenda-dot" style={{ border: '2px solid #FFD700', background: 'rgba(255,215,0,0.1)' }} />
            Pendente no ciclo atual — favorito!
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {TODAS.map(n => (
            <Bola
              key={n}
              num={n}
              selected={dezenas.includes(n)}
              highlight={dezenasPendentes?.includes(n)}
              dimmed={dezenas.length >= MAX_DEZENAS && !dezenas.includes(n)}
              onClick={onToggle}
            />
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
            <span>Progresso</span>
            <span style={{ color: completo ? '#AAEE00' : 'rgba(255,255,255,0.4)', fontWeight: completo ? 700 : 400 }}>
              {completo ? '✔ Pronto para analisar!' : `${dezenas.length} de ${MIN_DEZENAS} mínimo`}
            </span>
          </div>
          <div className="progresso-bar-track">
            <div className="progresso-bar-fill" style={{ width: `${Math.min(dezenas.length / MIN_DEZENAS, 1) * 100}%` }} />
          </div>
        </div>
      </div>

      {dezenas.length > 0 && (
        <div className="card-verde">
          <div className="sec-titulo" style={{ marginBottom: 10 }}>
            SEU JOGO ({dezenas.length}/{MAX_DEZENAS})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {dezenas.map(n => <span key={n} className="dezena-selecionada">{fmt2(n)}</span>)}
            {Array.from({ length: Math.max(0, MIN_DEZENAS - dezenas.length) }, (_, i) => (
              <span key={`v${i}`} className="dezena-placeholder">--</span>
            ))}
          </div>
          {completo && (
            <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              <span>Soma: <strong style={{ color: '#AAEE00' }}>{soma}</strong></span>
              <span>Pares: <strong style={{ color: '#AAEE00' }}>{pares}</strong></span>
              <span>Ímpares: <strong style={{ color: '#AAEE00' }}>{dezenas.length - pares}</strong></span>
            </div>
          )}
        </div>
      )}

      {erroAnalise && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, color: '#F87171', fontSize: 13 }}>
          ⚠ {erroAnalise}
        </div>
      )}

      <div className="btn-row">
        <button className="btn-aleatorio" onClick={onAleatorio}>🎲 GERAR ALEATÓRIO</button>
        <button className="btn-limpar" onClick={onLimpar}>✕ LIMPAR</button>
        <button
          className={`btn-analisar ${completo && !analisando ? 'pronto' : 'aguardando'}`}
          onClick={onAnalisar}
          disabled={!completo || analisando}
        >
          {analisando
            ? '⏳ ANALISANDO...'
            : completo
              ? '⚡ ANALISAR JOGO'
              : dezenas.length === 0
                ? '👆 ESCOLHA OS NÚMEROS'
                : `FALTAM ${faltam} NÚMERO(S)`}
        </button>
      </div>

      <Dica emoji="💡" titulo="Dica para escolher melhor">
        As bolinhas com <strong style={{ color: '#FFD700' }}>borda dourada</strong> são os números que ainda não saíram no ciclo atual.
        Incluir pelo menos 2 deles aumenta o alinhamento estatístico do seu jogo.
        {dezenasPendentes?.length === 25 && <span> O ciclo acabou de começar — todos os números estão em igual situação!</span>}
      </Dica>
    </div>
  );
}

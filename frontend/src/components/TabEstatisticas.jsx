// ─── components/TabEstatisticas.jsx ──────────────────────────────────────────
// Abas "Frequência" e "Estatísticas" — dados históricos e análises visuais.
// ──────────────────────────────────────────────────────────────────────────────

import Dica from './Dica';
import { fmt2, fmtNum } from '../utils/formatters';

// ── Heatmap de frequência ─────────────────────────────────────────────────────
export function TabHeatmap({ frequencias, dezenas }) {
  const todas = Array.from({ length: 25 }, (_, i) => i + 1);
  const sorted = Object.entries(frequencias ?? {})
    .map(([n, f]) => ({ n: Number(n), f }))
    .sort((a, b) => b.f - a.f);

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Dica emoji="🔥" titulo="O que é o Mapa de Frequência?">
        Mostra quais números saíram mais vezes na Lotofácil desde o início.
        Quanto mais brilhante o roxo, mais aquela dezena foi sorteada.
        Seus números aparecem em <strong style={{ color: '#AAEE00' }}>verde</strong>.
      </Dica>

      <div className="card">
        <div style={{ marginBottom: 14 }}>
          <div className="sec-titulo">MAPA DE CALOR</div>
          <div className="sec-subtitulo">Cada quadrado mostra a frequência histórica daquela dezena</div>
        </div>
        <div className="heatmap-grid">
          {todas.map(n => {
            const freq = frequencias?.[n] ?? 60;
            const isNo = dezenas.includes(n);
            const intensity = Math.min(Math.max((freq - 55) / 15, 0), 1);
            return (
              <div
                key={n}
                className={`heatmap-cell ${isNo ? 'selecionada' : ''}`}
                style={isNo ? {} : { background: `rgba(107,15,172,${0.2 + intensity * 0.75})`, color: '#fff' }}
                title={`Dezena ${fmt2(n)}: ${freq}%`}
              >
                {fmt2(n)}
                <span className="heatmap-freq">{freq}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="sec-titulo" style={{ marginBottom: 14 }}>
          RANKING (mais → menos sorteado)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {sorted.map(({ n, f }, i) => (
            <div key={n} className="barra-row">
              <span style={{ width: 26, fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>#{i + 1}</span>
              <span style={{ width: 32, fontFamily: "'Azonix',sans-serif", fontSize: 15, color: dezenas.includes(n) ? '#AAEE00' : '#fff' }}>
                {fmt2(n)}
              </span>
              <div className="barra-track">
                <div
                  className={`barra-fill ${dezenas.includes(n) ? 'destaque' : ''}`}
                  style={{ width: `${((f - 55) / 10) * 100}%` }}
                />
              </div>
              <span className="barra-pct" style={{ color: dezenas.includes(n) ? '#AAEE00' : 'rgba(255,255,255,0.4)' }}>
                {f}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Estatísticas completas ────────────────────────────────────────────────────
export function TabEstatisticas({ dashboard, dezenas }) {
  if (!dashboard) {
    return (
      <div style={{ marginTop: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        ⏳ Carregando estatísticas…
      </div>
    );
  }

  const { meta, ciclo, soma, pares, reciclagem, quadrantes } = dashboard;
  const jogoValido = dezenas.length >= 15;
  const somaJogo   = jogoValido ? dezenas.reduce((a, b) => a + b, 0) : -1;
  const paresJogo  = jogoValido ? dezenas.filter(n => n % 2 === 0).length : -1;
  const quadJogo   = jogoValido
    ? [
        dezenas.filter(n => n >= 1  && n <= 5).length,
        dezenas.filter(n => n >= 6  && n <= 10).length,
        dezenas.filter(n => n >= 11 && n <= 15).length,
        dezenas.filter(n => n >= 16 && n <= 20).length,
        dezenas.filter(n => n >= 21 && n <= 25).length,
      ]
    : null;

  const maxSomaPct = Math.max(...(soma?.faixas?.map(f => f.pct) ?? [1]));

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Dica emoji="📈" titulo="O que são as estatísticas?">
        São informações baseadas em todos os{' '}
        <strong style={{ color: '#fff' }}>{fmtNum(meta?.totalConcursos)} concursos</strong> já realizados.
        Elas mostram quais padrões aparecem com mais frequência e ajudam a escolher jogos mais equilibrados.
      </Dica>

      {/* Soma + Pares */}
      <div className="grid-2">
        <div className="card">
          <div className="sec-titulo" style={{ marginBottom: 4 }}>FAIXA DE SOMA</div>
          <div className="sec-subtitulo" style={{ marginBottom: 12 }}>Verde = onde está o seu jogo</div>
          {soma?.faixas?.map(f => {
            const [lo, hi] = f.faixa.split('-').map(Number);
            const isJ = somaJogo >= lo && somaJogo <= hi;
            return (
              <div key={f.faixa} className="barra-row">
                <span className="barra-label" style={{ width: 64, color: isJ ? '#AAEE00' : 'rgba(255,255,255,0.35)' }}>
                  {f.faixa}
                </span>
                <div className="barra-track">
                  <div className={`barra-fill ${isJ ? 'destaque' : ''}`} style={{ width: `${(f.pct / maxSomaPct) * 100}%` }} />
                </div>
                <span className="barra-pct" style={{ color: isJ ? '#AAEE00' : 'rgba(255,255,255,0.35)' }}>{f.pct}%</span>
                {isJ && <span className="barra-marker" style={{ color: '#AAEE00' }}>◀</span>}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="sec-titulo" style={{ marginBottom: 4 }}>PARES E ÍMPARES</div>
          <div className="sec-subtitulo" style={{ marginBottom: 12 }}>Padrão mais comum na história</div>
          {pares?.distribuicao?.map(p => {
            const isJ = jogoValido && `${paresJogo}P/${dezenas.length - paresJogo}I` === p.padrao;
            return (
              <div key={p.padrao} className="barra-row">
                <span className="barra-label" style={{ width: 72, color: isJ ? '#AAEE00' : 'rgba(255,255,255,0.35)' }}>{p.padrao}</span>
                <div className="barra-track">
                  <div className={`barra-fill ${isJ ? 'destaque' : ''}`} style={{ width: `${p.pct / 30 * 100}%` }} />
                </div>
                <span className="barra-pct" style={{ color: isJ ? '#AAEE00' : 'rgba(255,255,255,0.35)' }}>{p.pct}%</span>
                {isJ && <span className="barra-marker" style={{ color: '#AAEE00' }}>◀</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ciclo detalhado */}
      <div className="card">
        <div className="sec-titulo">🔄 CICLOS DAS DEZENAS — ENTENDA COMO FUNCIONA</div>
        <div className="info-box" style={{ marginTop: 12 }}>
          Um <strong style={{ color: '#FFD700' }}>ciclo</strong> termina quando todas as 25 dezenas saem
          pelo menos uma vez nos sorteios. Depois disso, começa um novo ciclo do zero.
          <br /><br />
          📊 <strong style={{ color: '#AAEE00' }}>{fmtNum(meta?.totalConcursos)} concursos</strong> realizados desde o início da Lotofácil.
          <br />
          🔄 <strong style={{ color: '#AAEE00' }}>{ciclo?.anterior} ciclos completos</strong> já foram concluídos.
          <br />
          📏 Média de <strong style={{ color: '#AAEE00' }}>{ciclo?.tamanhoMedio} concursos por ciclo</strong>.
          <br />
          ⚡ Agora estamos no <strong style={{ color: '#AAEE00' }}>Ciclo {ciclo?.atual}</strong>, ainda em andamento.
        </div>

        <div className="stats-grid-3">
          {[
            { label: 'Concursos realizados',       val: fmtNum(meta?.totalConcursos),      cor: '#AAEE00' },
            { label: 'Ciclos completos',            val: ciclo?.anterior,                   cor: '#FFD700' },
            { label: 'Ciclo em andamento',          val: `#${ciclo?.atual}`,               cor: '#c084fc' },
            { label: 'Média de conc. por ciclo',    val: ciclo?.tamanhoMedio,               cor: '#60a5fa' },
            { label: 'Dezenas pendentes no ciclo',  val: ciclo?.dezenasFaltantes?.length,  cor: '#fb923c' },
            { label: 'Dezenas do ciclo no seu jogo',val: dezenas.filter(d => ciclo?.dezenasFaltantes?.includes(d)).length, cor: '#AAEE00' },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div className="stat-card-val" style={{ color: item.cor }}>{item.val}</div>
              <div className="stat-card-label">{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
          Dezenas <strong style={{ color: '#FFD700' }}>pendentes</strong> no Ciclo {ciclo?.atual} — candidatas a sair em breve:
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {ciclo?.dezenasFaltantes?.map(d => {
            const noJogo = dezenas.includes(d);
            return (
              <div key={d} className={`dezena-card ${noJogo ? 'ativa' : 'inativa'}`}>
                <div className="dezena-card-num">{fmt2(d)}</div>
                <div className="dezena-card-label">{noJogo ? 'no seu jogo ✔' : 'pendente'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Último concurso / reciclagem */}
      <div className="card">
        <div className="sec-titulo">
          {dashboard.ultimoResultado
            ? `♻️ ÚLTIMO SORTEIO — CONCURSO #${dashboard.ultimoResultado.concurso} (${dashboard.ultimoResultado.data})`
            : '♻️ REPETIÇÃO DO ÚLTIMO SORTEIO'}
        </div>
        <div className="sec-subtitulo" style={{ marginBottom: 12 }}>
          Em média {reciclagem?.media} números se repetem de um concurso para o próximo. Verde = presente no seu jogo.
        </div>
        {dashboard.ultimoResultado && (
          <span className="tag-ao-vivo">🟢 Planilha ativa · Concurso #{dashboard.ultimoResultado.concurso}</span>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10, marginBottom: 12 }}>
          {(reciclagem?.ultimas ?? []).map(d => {
            const r = dezenas.includes(d);
            return (
              <span key={d} style={{
                background: r ? 'linear-gradient(135deg,#AAEE00,#7CB800)' : 'rgba(255,255,255,0.06)',
                color: r ? '#1a0033' : 'rgba(255,255,255,0.45)',
                borderRadius: 8, padding: '6px 12px',
                fontFamily: "'Azonix',sans-serif", fontSize: 17,
                border: r ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>{fmt2(d)}</span>
            );
          })}
        </div>
        {jogoValido && (reciclagem?.ultimas?.length ?? 0) > 0 && (() => {
          const rep = dezenas.filter(d => reciclagem.ultimas.includes(d)).length;
          const ok  = rep >= 7 && rep <= 9;
          return (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: ok ? 'rgba(170,238,0,0.1)' : 'rgba(255,165,0,0.1)',
              border: `1px solid ${ok ? 'rgba(170,238,0,0.3)' : 'rgba(255,165,0,0.3)'}`,
              fontSize: 13, color: ok ? '#AAEE00' : '#FFD700',
            }}>
              Seu jogo repete <strong>{rep}</strong> números do último concurso.
              {ok ? ' ✔ Dentro da faixa ideal (7 a 9)!' : ' ⚠ O ideal é repetir entre 7 e 9 números.'}
            </div>
          );
        })()}
      </div>

      {/* Regiões do volante */}
      <div className="card">
        <div className="sec-titulo">🗺️ REGIÕES DO VOLANTE</div>
        <div className="sec-subtitulo" style={{ marginBottom: 14 }}>
          O ideal é ter 2 a 4 números em cada região, sem deixar nenhuma vazia
        </div>
        <div className="regioes-grid">
          {(quadrantes?.nomes ?? []).map((nome, i) => {
            const val = quadJogo ? quadJogo[i] : null;
            const cor = val === null ? 'rgba(255,255,255,0.15)'
                      : val === 0   ? '#F87171'
                      : val < 2 || val > 4 ? '#FFD700'
                      : '#AAEE00';
            return (
              <div key={nome} className="regiao-item" style={{ border: `1px solid ${cor}30` }}>
                <div className="regiao-valor" style={{ color: cor }}>{val ?? '–'}</div>
                <div className="regiao-barra" style={{ background: cor, opacity: val != null ? 0.6 : 0.1 }} />
                <div className="regiao-nome">{nome}</div>
                {val === 0    && <div className="regiao-status" style={{ color: '#F87171' }}>⚠ VAZIA</div>}
                {val >= 2 && val <= 4 && <div className="regiao-status" style={{ color: '#AAEE00' }}>✔ ok</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

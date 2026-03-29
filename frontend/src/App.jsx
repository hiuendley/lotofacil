// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Componente raiz. Orquestra abas, estado global e comunicação com hooks.
// Não contém lógica de negócio — apenas composição.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

import { useDashboard }  from './hooks/useDashboard';
import { useSimulador }  from './hooks/useSimulador';

import BannerResultado   from './components/BannerResultado';
import Aviso             from './components/Aviso';
import TabSimulador      from './components/TabSimulador';
import TabResultado      from './components/TabResultado';
import { TabHeatmap, TabEstatisticas } from './components/TabEstatisticas';
import { fmt2, fmtNum }  from './utils/formatters';

// ── Definição das abas ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'simulador',    label: '🎯 Meu Jogo'    },
  { id: 'resultado',    label: '📊 Resultado'   },
  { id: 'heatmap',      label: '🔥 Frequência'  },
  { id: 'estatisticas', label: '📈 Estatísticas' },
];

export default function App() {
  const { data: dashboard, status: dashStatus, erro: dashErro, recarregar } = useDashboard();
  const sim = useSimulador();

  const [tabAtiva,     setTabAtiva]     = useState('simulador');
  const [avisoVisivel, setAvisoVisivel] = useState(false);

  // Mostra aviso temporário se tentar ir para resultado sem análise
  function navegarPara(tabId) {
    if (tabId === 'resultado' && !sim.resultado) {
      setAvisoVisivel(true);
      setTimeout(() => setAvisoVisivel(false), 5000);
      return;
    }
    setTabAtiva(tabId);
    setAvisoVisivel(false);
  }

  // Após analisar, muda para aba de resultado automaticamente
  async function handleAnalisar() {
    await sim.analisar();
    if (!sim.erroAnalise) {
      // Pequeno delay para o estado atualizar antes da navegação
      setTimeout(() => setTabAtiva('resultado'), 100);
    }
  }

  const ultimoResultado = dashboard?.ultimoResultado ?? null;

  return (
    <div className="app-container">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-logo">
          <div className="header-icon" aria-hidden="true">🍀</div>
          <div>
            <div className="header-title">MENTALIDADE DE SORTE</div>
            <div className="header-subtitle">Analisador Estatístico da Lotofácil</div>
          </div>
        </div>
        <div className="header-concurso">
          <div className="header-concurso-label">PRÓXIMO CONCURSO</div>
          <div className="header-concurso-num">
            #{ultimoResultado ? ultimoResultado.concurso + 1 : '…'}
          </div>
        </div>
      </header>

      {/* ── Barra de status ─────────────────────────────────────────────── */}
      <div className="status-bar" role="status" aria-label="Informações gerais">
        {[
          { icon: '🎰', label: 'Concursos realizados', val: fmtNum(dashboard?.meta?.totalConcursos) },
          { icon: '🔄', label: 'Ciclos completos',      val: dashboard?.ciclo?.anterior ?? '…'      },
          { icon: '⚡', label: 'Ciclo atual',            val: dashboard?.ciclo?.atual ? `#${dashboard.ciclo.atual}` : '…' },
          { icon: '📏', label: 'Média por ciclo',        val: dashboard?.ciclo?.tamanhoMedio ? `${dashboard.ciclo.tamanhoMedio} conc.` : '…' },
          { icon: '🎯', label: 'Números no jogo',        val: `${sim.dezenas.length} / 20`, hl: sim.dezenas.length >= 15 && sim.dezenas.length <= 20 },
        ].map(item => (
          <div key={item.label} className="status-item">
            <span className="status-item-icon" aria-hidden="true">{item.icon}</span>
            <div>
              <div className="status-item-label">{item.label}</div>
              <div className={`status-item-value${item.hl ? ' highlight' : ''}`}>{item.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Banner resultado ao vivo ─────────────────────────────────────── */}
      <BannerResultado
        status={dashStatus}
        ultimoResultado={ultimoResultado}
        onRetry={recarregar}
      />

      {/* ── Navegação por abas ───────────────────────────────────────────── */}
      <nav className="tabs" role="tablist">
        {TABS.map(tab => {
          const bloqueada = tab.id === 'resultado' && !sim.resultado;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabAtiva === tab.id}
              className={`tab-btn ${tabAtiva === tab.id ? 'active' : ''}`}
              onClick={() => navegarPara(tab.id)}
              disabled={bloqueada}
              title={bloqueada ? 'Analise um jogo primeiro' : undefined}
            >
              {tab.label}{bloqueada ? ' 🔒' : ''}
            </button>
          );
        })}
      </nav>

      {/* ── Conteúdo das abas ────────────────────────────────────────────── */}
      <main className="content-area">

        {/* Aviso "faça primeiro a simulação" */}
        <Aviso show={avisoVisivel} />

        {/* Aba: Simulador */}
        {tabAtiva === 'simulador' && (
          <TabSimulador
            dezenas={sim.dezenas}
            inputVal={sim.inputVal}
            analisando={sim.analisando}
            erroAnalise={sim.erroAnalise}
            dezenasPendentes={dashboard?.ciclo?.dezenasFaltantes}
            onToggle={sim.toggleDezena}
            onInput={sim.handleInput}
            onAleatorio={sim.gerarAleatorio}
            onLimpar={sim.limpar}
            onAnalisar={handleAnalisar}
          />
        )}

        {/* Aba: Resultado */}
        {tabAtiva === 'resultado' && (
          <TabResultado
            resultado={sim.resultado}
            dezenas={sim.dezenas}
            onEditar={() => setTabAtiva('simulador')}
          />
        )}

        {/* Aba: Frequência (heatmap) */}
        {tabAtiva === 'heatmap' && (
          <TabHeatmap
            frequencias={dashboard?.frequencias}
            dezenas={sim.dezenas}
          />
        )}

        {/* Aba: Estatísticas */}
        {tabAtiva === 'estatisticas' && (
          <TabEstatisticas
            dashboard={dashboard}
            dezenas={sim.dezenas}
          />
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-marca">MENTALIDADE DE SORTE</div>
        <div className="footer-texto">
          Aposte com lógica, não apenas com sorte · Ferramenta educacional estatística<br />
          Dados baseados nos {fmtNum(dashboard?.meta?.totalConcursos)} concursos realizados · Ciclos: Mazusoft
        </div>
      </footer>
    </div>
  );
}

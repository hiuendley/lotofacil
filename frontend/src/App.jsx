import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const THEME_KEY = "mentalidade-theme";

const lightTheme = {
  name: "light",
  bg: "#f5f0ff",
  bgSoft: "#efe7ff",
  panel: "rgba(255,255,255,0.84)",
  panelStrong: "#ffffff",
  text: "#2f2355",
  textSoft: "#67598f",
  border: "rgba(117, 90, 180, 0.14)",
  shadow: "0 12px 40px rgba(104, 79, 160, 0.12)",
  glow: "0 0 0 rgba(0,0,0,0)",
  hero: "radial-gradient(circle at top left, rgba(76, 177, 255, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(255, 92, 186, 0.24), transparent 30%), linear-gradient(135deg, #ffffff 0%, #f3edff 34%, #f7f7ff 100%)",
  primary: "linear-gradient(135deg, #7c4dff 0%, #4f46e5 52%, #22d3ee 100%)",
  primarySolid: "#6d48ff",
  accent: "#32d583",
  warning: "#f59e0b",
  danger: "#ef4444",
  numberIdle: "rgba(129, 97, 208, 0.08)",
  numberIdleBorder: "rgba(129, 97, 208, 0.20)",
  numberIdleText: "#63558a",
  chipBg: "rgba(109, 72, 255, 0.08)",
  appFrame: "#ffffff",
  toggleBg: "rgba(109,72,255,0.08)",
};

const darkTheme = {
  name: "dark",
  bg: "#0d0718",
  bgSoft: "#160d25",
  panel: "rgba(15, 10, 28, 0.82)",
  panelStrong: "#150c27",
  text: "#f7f4ff",
  textSoft: "#b7abd7",
  border: "rgba(178, 135, 255, 0.14)",
  shadow: "0 24px 64px rgba(0, 0, 0, 0.42)",
  glow: "0 0 34px rgba(110, 73, 255, 0.14)",
  hero: "radial-gradient(circle at top left, rgba(59, 130, 246, 0.24), transparent 26%), radial-gradient(circle at top right, rgba(236, 72, 153, 0.16), transparent 24%), radial-gradient(circle at bottom right, rgba(34, 211, 238, 0.12), transparent 20%), linear-gradient(135deg, #0d0718 0%, #120824 30%, #170c2c 64%, #0b1223 100%)",
  primary: "linear-gradient(135deg, #8b5cf6 0%, #6d48ff 42%, #22d3ee 100%)",
  primarySolid: "#7c4dff",
  accent: "#39e97b",
  warning: "#fbbf24",
  danger: "#fb7185",
  numberIdle: "rgba(255, 255, 255, 0.06)",
  numberIdleBorder: "rgba(201, 179, 255, 0.14)",
  numberIdleText: "#ded5ff",
  chipBg: "rgba(109, 72, 255, 0.16)",
  appFrame: "#12091f",
  toggleBg: "rgba(255,255,255,0.06)",
};

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function normalizeUltimo(payload) {
  if (!payload) return null;
  const dezenas = (
    payload.listaDezenas ||
    payload.dezenas ||
    payload.dezenasSorteadas ||
    payload.dezenasSorteadasOrdemSorteio ||
    payload.numeros ||
    []
  )
    .map((n) => Number(n))
    .filter((n) => n >= 1 && n <= 25)
    .sort((a, b) => a - b);

  return {
    concurso: payload.numero || payload.concurso || payload.numeroConcurso || "—",
    data: payload.dataApuracao || payload.data || payload.dataResultado || "—",
    dezenas,
    raw: payload,
  };
}

function normalizeDashboard(payload) {
  if (!payload) return {};
  return {
    concursosRealizados:
      payload.totalConcursos ||
      payload.concursosRealizados ||
      payload.quantidadeConcursos ||
      payload.concursos ||
      "—",
    ciclosCompletos:
      payload.ciclosCompletos ||
      payload.totalCiclosCompletos ||
      payload.ciclos ||
      "—",
    cicloAtual:
      payload.cicloAtual ||
      payload.cicloEmAndamento ||
      payload.numeroCicloAtual ||
      "—",
    mediaPorCiclo:
      payload.mediaPorCiclo ||
      payload.tamanhoCicloMedio ||
      payload.mediaConcursosPorCiclo ||
      "—",
    faltantesCiclo:
      payload.dezenasFaltantesCiclo ||
      payload.numerosFaltantesCiclo ||
      payload.faltantesCiclo ||
      [],
    ultimoConcurso:
      payload.ultimoConcurso ||
      payload.ultimoResultado ||
      payload.dezenasUltimoConcurso ||
      [],
  };
}

function normalizeAnalise(payload) {
  if (!payload) return null;

  const filtros = Array.isArray(payload.filtros)
    ? payload.filtros
    : Array.isArray(payload.analise?.filtros)
    ? payload.analise.filtros
    : [];

  const classificacao =
    payload.classificacao ||
    payload.resultado?.classificacao ||
    payload.resumo?.classificacao || null;

  return {
    score:
      Number(payload.score ?? payload.pontuacao ?? payload.resultado?.score ?? payload.analise?.score ?? 0) || 0,
    filtros,
    classificacao,
    soma: payload.soma ?? payload.resumo?.soma ?? payload.metricas?.soma ?? "—",
    pares: payload.pares ?? payload.resumo?.pares ?? payload.metricas?.pares ?? "—",
    impares: payload.impares ?? payload.resumo?.impares ?? payload.metricas?.impares ?? "—",
    recicladas:
      payload.reciclagem ??
      payload.recicladas ??
      payload.resumo?.reciclagem ??
      payload.metricas?.reciclagem ??
      "—",
    quadrantes:
      payload.quadrantes ||
      payload.metricas?.quadrantes ||
      payload.resumo?.quadrantes ||
      [],
    dp:
      payload.dp ??
      payload.desvioPadrao ??
      payload.metricas?.dp ??
      payload.metricas?.desvioPadrao ??
      "—",
    raw: payload,
  };
}

function statusConfig(status, theme) {
  switch ((status || "").toLowerCase()) {
    case "aprovado":
    case "ok":
      return {
        label: "Aprovado",
        border: theme.accent,
        soft: theme.name === "dark" ? "rgba(57,233,123,0.10)" : "rgba(50,213,131,0.12)",
      };
    case "reprovado":
    case "erro":
      return {
        label: "Reprovado",
        border: theme.danger,
        soft: theme.name === "dark" ? "rgba(251,113,133,0.10)" : "rgba(239,68,68,0.08)",
      };
    default:
      return {
        label: "Atenção",
        border: theme.warning,
        soft: theme.name === "dark" ? "rgba(251,191,36,0.10)" : "rgba(245,158,11,0.10)",
      };
  }
}

function numberLabel(n) {
  return String(n).padStart(2, "0");
}

function Header({ theme, setThemeName, dashboard }) {
  return (
    <header className="hero" style={{ background: theme.hero }}>
      <div className="brand">
        <div className="brand-mark">
          <div className="brand-petal petal-a" />
          <div className="brand-petal petal-b" />
          <div className="brand-petal petal-c" />
          <div className="brand-petal petal-d" />
          <div className="brand-core" />
        </div>
        <div>
          <h1>MENTALIDADE DE SORTE</h1>
          <p>Analisador Estatístico da Lotofácil</p>
        </div>
      </div>

      <div className="hero-actions">
        <div className="contest-pill">
          <span>Próximo concurso</span>
          <strong>#{dashboard.concursosRealizados || "—"}</strong>
        </div>

        <div className="theme-switch">
          <span>Tema:</span>
          <button
            className={theme.name === "light" ? "is-active" : ""}
            onClick={() => setThemeName("light")}
            type="button"
          >
            ☀ Claro
          </button>
          <button
            className={theme.name === "dark" ? "is-active" : ""}
            onClick={() => setThemeName("dark")}
            type="button"
          >
            🌙 Escuro
          </button>
        </div>
      </div>
    </header>
  );
}

function StatCard({ title, value, icon, theme }) {
  return (
    <div className="stat-card card">
      <div className="stat-icon" style={{ background: theme.primary }}>{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Tabs({ activeTab, setActiveTab, lockResultado }) {
  const items = [
    { key: "meu-jogo", label: "Meu Jogo" },
    { key: "resultado", label: "Resultado", locked: lockResultado },
    { key: "frequencia", label: "Frequência" },
    { key: "estatisticas", label: "Estatísticas" },
  ];

  return (
    <nav className="tabs card">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          disabled={item.locked}
          className={activeTab === item.key ? "active" : ""}
          onClick={() => !item.locked && setActiveTab(item.key)}
        >
          {item.label} {item.locked ? "🔒" : ""}
        </button>
      ))}
    </nav>
  );
}

function NumberBall({ number, selected, toggle, theme, favorite }) {
  return (
    <button
      type="button"
      className={`number-ball ${selected ? "selected" : ""} ${favorite ? "favorite" : ""}`}
      onClick={() => toggle(number)}
      style={{
        background: selected ? theme.accent : theme.numberIdle,
        borderColor: favorite && !selected ? theme.warning : selected ? theme.accent : theme.numberIdleBorder,
        color: selected ? "#0b1312" : theme.numberIdleText,
        boxShadow: selected ? `0 0 24px ${theme.accent}55` : "none",
      }}
    >
      {numberLabel(number)}
    </button>
  );
}

function ScoreGauge({ score, theme }) {
  const pct = clamp(Number(score) || 0, 0, 200) / 2;
  return (
    <div className="score-gauge">
      <div
        className="score-ring"
        style={{
          background: `conic-gradient(from 180deg, ${theme.accent} ${pct}%, ${theme.primarySolid} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
        }}
      >
        <div className="score-center">
          <span>Score</span>
          <strong>{score}/200</strong>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [themeName, setThemeName] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const theme = themeName === "light" ? lightTheme : darkTheme;

  const [dashboard, setDashboard] = useState({});
  const [ultimo, setUltimo] = useState(null);
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analisando, setAnalisando] = useState(false);
  const [serverError, setServerError] = useState("");
  const [activeTab, setActiveTab] = useState("meu-jogo");
  const [inputValue, setInputValue] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeName);
  }, [themeName]);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme.name;
    document.body.style.background = theme.bg;
  }, [theme]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      setLoading(true);
      setServerError("");
      try {
        const [dashboardRes, ultimoRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/lotofacil/dashboard`),
          fetch(`${API_URL}/api/lotofacil/ultimo`),
        ]);

        if (!ignore) {
          if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
            setDashboard(normalizeDashboard(await dashboardRes.value.json()));
          }

          if (ultimoRes.status === "fulfilled" && ultimoRes.value.ok) {
            setUltimo(normalizeUltimo(await ultimoRes.value.json()));
          }

          if (
            dashboardRes.status === "rejected" ||
            (dashboardRes.status === "fulfilled" && !dashboardRes.value.ok)
          ) {
            setServerError("Não foi possível conectar ao servidor. Usando dados em cache.");
          }
        }
      } catch {
        if (!ignore) {
          setServerError("Não foi possível conectar ao servidor. Usando dados em cache.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  const numbersMissingInCycle = Array.isArray(dashboard.faltantesCiclo) ? dashboard.faltantesCiclo : [];
  const selectedCount = selectedNumbers.length;
  const selectedFavorites = selectedNumbers.filter((n) => numbersMissingInCycle.includes(n)).length;

  function syncNumbers(numbers) {
    const unique = [...new Set(numbers.map(Number))]
      .filter((n) => n >= 1 && n <= 25)
      .slice(0, 20)
      .sort((a, b) => a - b);
    setSelectedNumbers(unique);
  }

  function handleInputChange(value) {
    setInputValue(value);
    syncNumbers(value.split(/[\s,;]+/));
    setAnalise(null);
  }

  function toggleNumber(number) {
    setSelectedNumbers((prev) => {
      const exists = prev.includes(number);
      const next = exists ? prev.filter((n) => n !== number) : [...prev, number];
      const normalized = [...new Set(next)].filter((n) => n >= 1 && n <= 25).slice(0, 20).sort((a, b) => a - b);
      setInputValue(normalized.map(numberLabel).join(" "));
      setAnalise(null);
      return normalized;
    });
  }

  async function analyzeGame() {
    if (selectedNumbers.length < 15 || selectedNumbers.length > 20) {
      setServerError("Digite ou selecione entre 15 e 20 números para analisar.");
      return;
    }

    setAnalisando(true);
    setServerError("");
    try {
      const res = await fetch(`${API_URL}/api/lotofacil/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dezenas: selectedNumbers }),
      });

      if (!res.ok) {
        throw new Error("Falha ao analisar o jogo.");
      }

      const data = await res.json();
      setAnalise(normalizeAnalise(data));
      setActiveTab("resultado");
    } catch {
      setServerError("Falha ao analisar o jogo no backend. Verifique a API.");
    } finally {
      setAnalisando(false);
    }
  }

  function clearGame() {
    setSelectedNumbers([]);
    setInputValue("");
    setAnalise(null);
  }

  function randomGame() {
    const pool = Array.from({ length: 25 }, (_, i) => i + 1);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 15).sort((a, b) => a - b);
    setSelectedNumbers(shuffled);
    setInputValue(shuffled.map(numberLabel).join(" "));
    setAnalise(null);
  }

  const topStats = useMemo(
    () => [
      { title: "Concursos Realizados", value: dashboard.concursosRealizados || "—", icon: "📁" },
      { title: "Ciclos Completos", value: dashboard.ciclosCompletos || "—", icon: "🔄" },
      { title: "Ciclo Atual", value: dashboard.cicloAtual || "—", icon: "⚡" },
      { title: "Números no Jogo", value: `${selectedCount}/20`, icon: "🎯" },
    ],
    [dashboard, selectedCount]
  );

  return (
    <div
      className={`app-shell ${theme.name}`}
      style={{
        "--bg": theme.bg,
        "--bg-soft": theme.bgSoft,
        "--panel": theme.panel,
        "--panel-strong": theme.panelStrong,
        "--text": theme.text,
        "--text-soft": theme.textSoft,
        "--border": theme.border,
        "--shadow": theme.shadow,
        "--glow": theme.glow,
        "--primary": theme.primary,
        "--primary-solid": theme.primarySolid,
        "--accent": theme.accent,
        "--warning": theme.warning,
        "--danger": theme.danger,
        "--chip-bg": theme.chipBg,
        "--toggle-bg": theme.toggleBg,
        "--app-frame": theme.appFrame,
      }}
    >
      <div className="backdrop" />
      <div className="container">
        <Header theme={theme} setThemeName={setThemeName} dashboard={dashboard} />

        <section className="stats-grid">
          {topStats.map((item) => (
            <StatCard key={item.title} {...item} theme={theme} />
          ))}
        </section>

        <div className={`alert-bar card ${serverError ? "visible" : ""}`}>
          <span>⚠</span>
          <p>{serverError || "Conectado ao servidor."}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} lockResultado={!analise} />

        <main className="main-grid">
          <section className="left-column">
            <div className="card step-card">
              <div className="step-title">
                <span className="step-index">1</span>
                <div>
                  <h2>Digite seus números</h2>
                  <p>Digite de 15 a 20 números separados por espaço ou vírgula.</p>
                </div>
              </div>

              <input
                className="numbers-input"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Exemplo: 01 05 09 11 13 15 17 18 19 20 21 22 23 24 25"
              />
            </div>

            <div className="card step-card">
              <div className="step-title">
                <span className="step-index">2</span>
                <div>
                  <h2>Ou clique nas bolinhas</h2>
                  <p>Toque nos números que quer jogar. Escolha entre 15 e 20.</p>
                </div>
              </div>

              <div className="legend-row">
                <span><i className="legend-dot selected" /> Selecionado</span>
                <span><i className="legend-dot favorite" /> Pendente no ciclo atual — favorito!</span>
              </div>

              <div className="numbers-grid">
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <NumberBall
                    key={n}
                    number={n}
                    selected={selectedNumbers.includes(n)}
                    toggle={toggleNumber}
                    theme={theme}
                    favorite={numbersMissingInCycle.includes(n)}
                  />
                ))}
              </div>

              <div className="progress-block">
                <div className="progress-meta">
                  <span>Progresso</span>
                  <strong>{selectedCount >= 15 ? "✔ Pronto para analisar!" : `Faltam ${15 - selectedCount} números`}</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${clamp((selectedCount / 15) * 100, 0, 100)}%`, background: theme.primary }}
                  />
                </div>
              </div>
            </div>

            <div className="card game-summary">
              <div className="panel-header">
                <h3>Seu jogo ({selectedCount}/20)</h3>
              </div>

              <div className="chip-list">
                {selectedNumbers.length ? (
                  selectedNumbers.map((n) => (
                    <span key={n} className="number-chip">
                      {numberLabel(n)}
                    </span>
                  ))
                ) : (
                  <span className="empty-state">Nenhum número selecionado ainda.</span>
                )}
              </div>

              <div className="mini-metrics">
                <span>Soma: <strong>{analise?.soma ?? "—"}</strong></span>
                <span>Pares: <strong>{analise?.pares ?? "—"}</strong></span>
                <span>Ímpares: <strong>{analise?.impares ?? "—"}</strong></span>
              </div>
            </div>

            <div className="action-row">
              <button className="secondary-btn" type="button" onClick={randomGame}>
                🎲 Gerar aleatório
              </button>
              <button className="ghost-btn" type="button" onClick={clearGame}>
                ✕ Limpar
              </button>
              <button className="primary-btn" type="button" onClick={analyzeGame} disabled={analisando}>
                ⚡ {analisando ? "Analisando..." : "Analisar jogo"}
              </button>
            </div>

            <div className="card tip-card">
              <span className="tip-icon">💡</span>
              <div>
                <h4>Dica para escolher melhor</h4>
                <p>
                  As bolinhas coloridas mostram os números que ainda não saíram no ciclo atual.
                  Incluir pelo menos 2 deles aumenta o alinhamento estatístico do seu jogo.
                </p>
              </div>
            </div>
          </section>

          <aside className="right-column">
            <div className="card side-card">
              <div className="panel-header">
                <h3>Resumo do jogo</h3>
              </div>

              <div className="summary-list">
                <div className="summary-item">
                  <span>🍀 Quantidade selecionada</span>
                  <strong>{selectedCount} números</strong>
                </div>
                <div className="summary-item">
                  <span>🧩 Faltam para 15</span>
                  <strong>{Math.max(0, 15 - selectedCount)} números</strong>
                </div>
                <div className="summary-item">
                  <span>⭐ Favoritos no ciclo</span>
                  <strong>{selectedFavorites} números</strong>
                </div>
              </div>
            </div>

            <div className="card side-card">
              <div className="panel-header">
                <h3>Como funciona?</h3>
              </div>
              <ol className="steps-list">
                <li><b>Digite ou selecione</b><span>Escolha entre 15 e 20 números.</span></li>
                <li><b>Analise os dados</b><span>Veja score, filtros e padrões do backend.</span></li>
                <li><b>Acompanhe resultados</b><span>Compare com os concursos e ciclos.</span></li>
              </ol>
            </div>

            {ultimo && (
              <div className="card side-card">
                <div className="panel-header">
                  <h3>Último concurso</h3>
                </div>
                <div className="ultimo-meta">
                  <span>Concurso {ultimo.concurso}</span>
                  <strong>{ultimo.data}</strong>
                </div>
                <div className="chip-list compact">
                  {ultimo.dezenas.map((n) => (
                    <span key={n} className="number-chip">
                      {numberLabel(n)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analise && (
              <>
                <div className="card side-card">
                  <ScoreGauge score={analise.score} theme={theme} />
                  <div className="classification">
                    <strong>{analise.classificacao?.label || "Análise pronta"}</strong>
                    <p>{analise.classificacao?.desc || "Os filtros e o score foram retornados pelo backend."}</p>
                  </div>
                </div>

                <div className="card side-card">
                  <div className="panel-header">
                    <h3>Filtros de análise</h3>
                  </div>
                  <div className="filters-list">
                    {analise.filtros.length ? (
                      analise.filtros.map((filtro, idx) => {
                        const cfg = statusConfig(filtro.status, theme);
                        return (
                          <div
                            key={idx}
                            className="filter-item"
                            style={{ borderColor: cfg.border, background: cfg.soft }}
                          >
                            <div className="filter-head">
                              <strong>{filtro.nome || `Filtro ${idx + 1}`}</strong>
                              <span style={{ color: cfg.border }}>{cfg.label}</span>
                            </div>
                            <p>{filtro.valor || filtro.detalhe || filtro.explicacao || "Sem detalhe adicional."}</p>
                          </div>
                        );
                      })
                    ) : (
                      <span className="empty-state">A API retornou a análise sem lista de filtros detalhada.</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </aside>
        </main>

        <footer className="footer-bar">
          <span>Dados atualizados do último ciclo em cache.</span>
          <span>{loading ? "Sincronizando..." : "Template novo aplicado sem alterar a lógica do backend."}</span>
        </footer>
      </div>
    </div>
  );
}

export default App;

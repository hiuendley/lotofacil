import { useEffect, useMemo, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://lotofacil-goin.onrender.com";
const THEME_KEY = "mentalidade-theme";

// ── Temas minimalistas ─────────────────────────────────────────────────────────
const lightTheme = {
  name: "light",
  bg: "#FFFFFF",
  bgSoft: "#F7F7F7",
  panel: "#FFFFFF",
  panelStrong: "#FFFFFF",
  text: "#111111",
  textSoft: "#666666",
  border: "#E5E5E5",
  shadow: "0 2px 12px rgba(0,0,0,0.06)",
  glow: "none",
  hero: "#FFFFFF",
  primary: "#7C3AED",
  primarySolid: "#7C3AED",
  accent: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  numberIdle: "#F3F4F6",
  numberIdleBorder: "#E5E7EB",
  numberIdleText: "#374151",
  purple: "#7C3AED",
  purpleSoft: "#F3EEFF",
  purpleBorder: "#DDD6FE",
  green: "#16A34A",
  greenSoft: "#F0FDF4",
  greenBorder: "#BBF7D0",
  chipBg: "rgba(124,58,237,0.08)",
  toggleBg: "#F3F4F6",
  appFrame: "#FFFFFF",
};

const darkTheme = {
  name: "dark",
  bg: "#0A0A0A",
  bgSoft: "#141414",
  panel: "#1A1A1A",
  panelStrong: "#1A1A1A",
  text: "#F5F5F5",
  textSoft: "#909090",
  border: "#2A2A2A",
  shadow: "0 2px 16px rgba(0,0,0,0.5)",
  glow: "none",
  hero: "#0A0A0A",
  primary: "#A78BFA",
  primarySolid: "#A78BFA",
  accent: "#4ADE80",
  warning: "#FBBF24",
  danger: "#F87171",
  numberIdle: "rgba(255,255,255,0.06)",
  numberIdleBorder: "rgba(167,139,250,0.25)",
  numberIdleText: "#E0E0E0",
  purple: "#A78BFA",
  purpleSoft: "rgba(167,139,250,0.10)",
  purpleBorder: "rgba(167,139,250,0.25)",
  green: "#4ADE80",
  greenSoft: "rgba(74,222,128,0.08)",
  greenBorder: "rgba(74,222,128,0.2)",
  chipBg: "rgba(167,139,250,0.10)",
  toggleBg: "rgba(255,255,255,0.08)",
  appFrame: "#0A0A0A",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

function numberLabel(n) { return String(n).padStart(2, "0"); }

function normalizeUltimo(payload) {
  if (!payload) return null;
  const dezenas = (
    payload.listaDezenas ||
    payload.dezenas ||
    payload.dezenasSorteadas ||
    payload.dezenasSorteadasOrdemSorteio ||
    payload.numeros ||
    []
  ).map((n) => Number(n)).filter((n) => n >= 1 && n <= 25).sort((a, b) => a - b);
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
    concursosRealizados: payload.totalConcursos || payload.concursosRealizados || payload.quantidadeConcursos || payload.concursos || "—",
    ciclosCompletos: payload.ciclosCompletos || payload.totalCiclosCompletos || payload.ciclos || "—",
    cicloAtual: payload.cicloAtual || payload.cicloEmAndamento || payload.numeroCicloAtual || "—",
    mediaPorCiclo: payload.mediaPorCiclo || payload.tamanhoCicloMedio || payload.mediaConcursosPorCiclo || "—",
    faltantesCiclo: payload.dezenasFaltantesCiclo || payload.numerosFaltantesCiclo || payload.faltantesCiclo || [],
    ultimoConcurso: payload.ultimoConcurso || payload.ultimoResultado || payload.dezenasUltimoConcurso || [],
  };
}

function normalizeAnalise(payload) {
  if (!payload) return null;
  const filtros = Array.isArray(payload.filtros)
    ? payload.filtros
    : Array.isArray(payload.analise?.filtros)
      ? payload.analise.filtros
      : [];
  const classificacao = payload.classificacao || payload.resultado?.classificacao || payload.resumo?.classificacao || null;
  return {
    score: Number(payload.score ?? payload.pontuacao ?? payload.resultado?.score ?? 0) || 0,
    filtros,
    classificacao,
    soma: payload.soma ?? payload.resumo?.soma ?? "—",
    pares: payload.pares ?? payload.resumo?.pares ?? "—",
    impares: payload.impares ?? payload.resumo?.impares ?? "—",
    recicladas: payload.reciclagem ?? payload.recicladas ?? payload.resumo?.reciclagem ?? "—",
    raw: payload,
  };
}

// ── Cores dos filtros por status ───────────────────────────────────────────────
function statusConfig(status, theme) {
  const s = (status || "").toLowerCase();
  if (s === "aprovado" || s === "ok") {
    return {
      label: "✅ Aprovado",
      border: theme.green,
      soft: theme.greenSoft,
      textColor: theme.green,
    };
  }
  if (s === "reprovado" || s === "erro") {
    return {
      label: "❌ Reprovado",
      border: theme.danger,
      soft: theme.name === "dark" ? "rgba(248,113,130,0.08)" : "rgba(220,38,38,0.05)",
      textColor: theme.danger,
    };
  }
  return {
    label: "⚠️ Atenção",
    border: theme.warning,
    soft: theme.name === "dark" ? "rgba(251,191,36,0.08)" : "rgba(217,119,6,0.06)",
    textColor: theme.warning,
  };
}

// ── Cor do score conforme classificação ───────────────────────────────────────
function scoreColor(score) {
  if (score <= 75)  return "#7C3AED"; // Crítico   - violeta
  if (score <= 90)  return "#EF4444"; // Péssimo   - vermelho
  if (score <= 110) return "#F97316"; // Ruim      - laranja
  if (score <= 120) return "#3B82F6"; // Bom       - azul
  if (score <= 140) return "#4ADE80"; // Muito Bom - verde claro
  if (score <= 180) return "#22C55E"; // Ótimo     - verde neon
  return "#EAB308";                    // Excelente - ouro
}

// ── Salvar análise ─────────────────────────────────────────────────────────────
function salvarAnalise(analise, selectedNumbers) {
  if (!analise) return;

  const dataHoje = new Date().toLocaleDateString("pt-BR");
  const horaAgora = new Date().toLocaleTimeString("pt-BR");
  const numeros = selectedNumbers.map((n) => numberLabel(n)).join(" - ");

  const linhas = [
    "═══════════════════════════════════════════════════",
    "          ANÁLISE DA LOTOFÁCIL",
    "          Mentalidade de Sorte",
    "═══════════════════════════════════════════════════",
    "",
    `📅 Data: ${dataHoje} às ${horaAgora}`,
    `🔢 Números jogados: ${numeros}`,
    `🏆 Score final: ${analise.score}/200`,
    `🎯 Classificação: ${analise.classificacao?.label ?? "—"}`,
    `💬 ${analise.classificacao?.descricao ?? ""}`,
    "",
    "─── ANÁLISE DETALHADA POR FILTRO ──────────────────",
    "",
  ];

  if (Array.isArray(analise.filtros) && analise.filtros.length > 0) {
    analise.filtros.forEach((f) => {
      const icone =
        f.status === "aprovado" ? "✅" :
        f.status === "reprovado" ? "❌" : "⚠️";
      linhas.push(`${icone} ${f.nome ?? ""}`);
      if (f.valor)   linhas.push(`   Valor: ${f.valor}`);
      if (f.faixa)   linhas.push(`   Faixa: ${f.faixa}`);
      if (f.detalhe) linhas.push(`   Info:  ${f.detalhe}`);
      linhas.push("");
    });
  }

  linhas.push("═══════════════════════════════════════════════════");
  linhas.push("Gerado por: Mentalidade de Sorte");
  linhas.push("═══════════════════════════════════════════════════");

  const texto = linhas.join("\n");
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analise-lotofacil-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Componente: Header ─────────────────────────────────────────────────────────
function Header({ theme, setThemeName, dashboard }) {
  return (
    <header className="hero" style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
      <div className="brand">
        <div className="brand-logo" style={{ background: theme.purple }}>🍀</div>
        <div>
          <h1 style={{ color: theme.text }}>Mentalidade de Sorte</h1>
          <p style={{ color: theme.textSoft }}>Analisador Estatístico da Lotofácil</p>
        </div>
      </div>

      <div className="hero-actions">
        <div className="contest-pill">
          <span style={{ color: theme.textSoft, fontSize: "0.78rem" }}>Próximo concurso</span>
          <strong style={{ color: theme.purple, fontSize: "1rem", fontWeight: 700 }}>
            #{dashboard.concursosRealizados || "—"}
          </strong>
        </div>

        <div className="theme-switch" style={{ background: theme.bgSoft, border: `1px solid ${theme.border}` }}>
          <button
            className={theme.name === "light" ? "is-active" : ""}
            onClick={() => setThemeName("light")}
            type="button"
            style={{ color: theme.name === "light" ? "#fff" : theme.textSoft }}
          >
            ☀ Claro
          </button>
          <button
            className={theme.name === "dark" ? "is-active" : ""}
            onClick={() => setThemeName("dark")}
            type="button"
            style={{ color: theme.name === "dark" ? "#fff" : theme.textSoft }}
          >
            🌙 Escuro
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Componente: StatCard ───────────────────────────────────────────────────────
function StatCard({ title, value, icon, theme }) {
  return (
    <div className="card stat-card" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
      <div className="stat-icon" style={{ background: theme.purpleSoft }}>
        {icon}
      </div>
      <div>
        <span style={{ color: theme.textSoft }}>{title}</span>
        <strong style={{ color: theme.text }}>{value}</strong>
      </div>
    </div>
  );
}

// ── Componente: Tabs ───────────────────────────────────────────────────────────
function Tabs({ activeTab, setActiveTab, lockResultado, theme }) {
  const items = [
    { key: "meu-jogo",      label: "🎯 Meu Jogo" },
    { key: "resultado",     label: "📊 Resultado",  locked: lockResultado },
    { key: "frequencia",    label: "🔥 Frequência" },
    { key: "estatisticas",  label: "📈 Estatísticas" },
  ];

  return (
    <nav className="tabs card" style={{ background: theme.bgSoft, border: `1px solid ${theme.border}` }}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          disabled={item.locked}
          className={activeTab === item.key ? "active" : ""}
          onClick={() => !item.locked && setActiveTab(item.key)}
          style={{
            color: activeTab === item.key ? theme.purple : theme.textSoft,
            background: activeTab === item.key ? theme.panel : "transparent",
          }}
        >
          {item.label} {item.locked ? "🔒" : ""}
        </button>
      ))}
    </nav>
  );
}

// ── Componente: Bola de número 5x5 ────────────────────────────────────────────
function NumberBall({ number, selected, toggle, theme, favorite, dimmed }) {
  const bg = selected
    ? theme.purple
    : favorite
      ? theme.greenSoft
      : theme.numberIdle;

  const border = selected
    ? theme.purple
    : favorite
      ? theme.green
      : theme.numberIdleBorder;

  const color = selected
    ? "#fff"
    : favorite
      ? theme.green
      : theme.numberIdleText;

  return (
    <button
      type="button"
      className="number-ball"
      data-dim={dimmed ? "true" : "false"}
      onClick={() => !dimmed && toggle(number)}
      title={favorite ? `Número ${number} — pendente no ciclo atual ⭐` : `Número ${number}`}
      aria-label={`Número ${numberLabel(number)}${selected ? " — selecionado" : ""}${favorite ? " — favorito" : ""}`}
      style={{
        background: bg,
        border: `2px solid ${border}`,
        color,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
      }}
    >
      {numberLabel(number)}
    </button>
  );
}

// ── Componente: Score Gauge ────────────────────────────────────────────────────
function ScoreGauge({ score, classificacao, theme }) {
  const cor = classificacao?.cor ?? scoreColor(score);
  const pct = clamp(Number(score) || 0, 0, 200) / 2;

  return (
    <div className="score-gauge">
      <div
        className="score-ring"
        style={{
          background: `conic-gradient(from 180deg, ${cor} ${pct}%, ${theme.border} ${pct}%)`,
        }}
      >
        <div className="score-center" style={{ background: theme.panel }}>
          <span style={{ color: theme.textSoft }}>Score</span>
          <strong style={{ color: cor }}>{score}/200</strong>
        </div>
      </div>
    </div>
  );
}

// ── App principal ──────────────────────────────────────────────────────────────
function App() {
  const [themeName, setThemeName] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const theme = themeName === "light" ? lightTheme : darkTheme;

  const [dashboard, setDashboard]       = useState({});
  const [ultimo, setUltimo]             = useState(null);
  const [analise, setAnalise]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [analisando, setAnalisando]     = useState(false);
  const [serverError, setServerError]   = useState("");
  const [activeTab, setActiveTab]       = useState("meu-jogo");
  const [inputValue, setInputValue]     = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [savedNotice, setSavedNotice]   = useState(false);

  useEffect(() => { localStorage.setItem(THEME_KEY, themeName); }, [themeName]);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme.name;
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [theme]);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      setServerError("");
      try {
        const [dashRes, ultimoRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/lotofacil/dashboard`),
          fetch(`${API_URL}/api/lotofacil/ultimo`),
        ]);
        if (ignore) return;

        if (dashRes.status === "fulfilled" && dashRes.value.ok) {
          setDashboard(normalizeDashboard(await dashRes.value.json()));
        } else {
          setServerError("Não foi possível carregar as estatísticas do servidor.");
        }

        if (ultimoRes.status === "fulfilled" && ultimoRes.value.ok) {
          setUltimo(normalizeUltimo(await ultimoRes.value.json()));
        }
      } catch {
        if (!ignore) setServerError("Erro de conexão com o servidor.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => { ignore = true; };
  }, []);

  const numbersMissingInCycle = Array.isArray(dashboard.faltantesCiclo) ? dashboard.faltantesCiclo : [];
  const selectedCount = selectedNumbers.length;
  const selectedFavorites = selectedNumbers.filter((n) => numbersMissingInCycle.includes(n)).length;

  function syncNumbers(arr) {
    const unique = [...new Set(arr.map(Number))]
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
      const normalized = [...new Set(next)]
        .filter((n) => n >= 1 && n <= 25)
        .slice(0, 20)
        .sort((a, b) => a - b);
      setInputValue(normalized.map(numberLabel).join(" "));
      setAnalise(null);
      return normalized;
    });
  }

  async function analyzeGame() {
    if (selectedNumbers.length < 15 || selectedNumbers.length > 20) {
      setServerError("Escolha entre 15 e 20 números para analisar.");
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
      if (!res.ok) throw new Error("Falha ao analisar o jogo.");
      const data = await res.json();
      setAnalise(normalizeAnalise(data));
      setActiveTab("resultado");
    } catch {
      setServerError("Falha ao analisar o jogo. Verifique se o servidor está ativo.");
    } finally {
      setAnalisando(false);
    }
  }

  function clearGame() {
    setSelectedNumbers([]);
    setInputValue("");
    setAnalise(null);
    setSavedNotice(false);
  }

  function randomGame() {
    const pool = Array.from({ length: 25 }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5)
      .slice(0, 15)
      .sort((a, b) => a - b);
    setSelectedNumbers(pool);
    setInputValue(pool.map(numberLabel).join(" "));
    setAnalise(null);
  }

  function handleSalvar() {
    salvarAnalise(analise, selectedNumbers);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  }

  const topStats = useMemo(() => [
    { title: "Concursos Realizados", value: dashboard.concursosRealizados || "—", icon: "📁" },
    { title: "Ciclos Completos",      value: dashboard.ciclosCompletos || "—",      icon: "🔄" },
    { title: "Ciclo Atual",           value: dashboard.cicloAtual || "—",           icon: "⚡" },
    { title: "Seus Números",          value: `${selectedCount}/20`,                  icon: "🎯" },
  ], [dashboard, selectedCount]);

  const cor = analise?.classificacao?.cor ?? (analise ? scoreColor(analise.score) : theme.purple);

  return (
    <div
      className={`app-shell ${theme.name}`}
      style={{ minHeight: "100vh", background: theme.bg, color: theme.text }}
    >
      <div className="container">
        <Header theme={theme} setThemeName={setThemeName} dashboard={dashboard} />

        {/* Stats */}
        <section className="stats-grid" style={{ margin: "20px 0 16px" }}>
          {topStats.map((item) => (
            <StatCard key={item.title} {...item} theme={theme} />
          ))}
        </section>

        {/* Alert */}
        {serverError && (
          <div className="alert-bar visible" style={{ marginBottom: 12 }}>
            <span>⚠️</span>
            <p>{serverError}</p>
            <button type="button" onClick={() => setServerError("")}>Fechar</button>
          </div>
        )}

        {/* Tabs */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} lockResultado={!analise} theme={theme} />

        {/* ═══ ABA MEU JOGO ═══ */}
        {activeTab === "meu-jogo" && (
          <div className="main-grid">
            <section className="left-column">

              {/* PASSO 1 — digitar */}
              <div className="card step-card" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
                <div className="step-title">
                  <span className="step-index" style={{ background: theme.purple }}>1</span>
                  <div>
                    <h2 style={{ color: theme.text }}>Digite seus números</h2>
                    <p style={{ color: theme.textSoft }}>
                      Escreva de 15 a 20 números separados por espaço ou vírgula.
                    </p>
                  </div>
                </div>
                <input
                  className="numbers-input"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Exemplo: 01 05 09 11 13 15 17 18 19 20 21 22 23 24 25"
                  style={{
                    background: theme.bg,
                    color: theme.text,
                    border: `1.5px solid ${theme.border}`,
                  }}
                />
              </div>

              {/* PASSO 2 — bolinhas 5x5 */}
              <div className="card step-card" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
                <div className="step-title">
                  <span className="step-index" style={{ background: theme.purple }}>2</span>
                  <div>
                    <h2 style={{ color: theme.text }}>Ou clique nos números</h2>
                    <p style={{ color: theme.textSoft }}>
                      Toque nos números que quer jogar. Escolha no mínimo 15 e no máximo 20.
                    </p>
                  </div>
                </div>

                <div className="legend-row" style={{ marginBottom: 14 }}>
                  <span style={{ color: theme.textSoft, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: theme.purple, display: "inline-block", flexShrink: 0 }} />
                    Selecionado
                  </span>
                  <span style={{ color: theme.textSoft, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: theme.green, display: "inline-block", flexShrink: 0 }} />
                    Pendente no ciclo — favorito ⭐
                  </span>
                </div>

                {/* Grade 5 × 5 */}
                <div className="numbers-grid">
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                    <NumberBall
                      key={n}
                      number={n}
                      selected={selectedNumbers.includes(n)}
                      toggle={toggleNumber}
                      theme={theme}
                      favorite={numbersMissingInCycle.includes(n)}
                      dimmed={selectedNumbers.length >= 20 && !selectedNumbers.includes(n)}
                    />
                  ))}
                </div>

                {/* Notificação aposta mínima */}
                {selectedCount === 15 && (
                  <div className="min-bet-notice" style={{
                    background: theme.greenSoft,
                    border: `1.5px solid ${theme.green}`,
                    color: theme.name === "dark" ? theme.green : "#14532D",
                  }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div>
                      <strong style={{ display: "block", marginBottom: 2 }}>Aposta mínima completa!</strong>
                      Você já pode analisar ou, se quiser, adicione até{" "}
                      <strong>5 números a mais</strong> (máximo de 20) para aumentar suas chances.
                    </div>
                  </div>
                )}

                {/* Progresso */}
                <div className="progress-block" style={{ marginTop: 14 }}>
                  <div className="progress-meta">
                    <span style={{ color: theme.textSoft }}>
                      {selectedCount < 15
                        ? `Faltam ${15 - selectedCount} número${15 - selectedCount !== 1 ? "s" : ""} para o mínimo`
                        : selectedCount < 20
                          ? `${selectedCount} números selecionados — pode adicionar mais ${20 - selectedCount}`
                          : "Máximo de 20 números atingido"}
                    </span>
                    <strong style={{ color: selectedCount >= 15 ? theme.green : theme.textSoft }}>
                      {selectedCount}/20
                    </strong>
                  </div>
                  <div className="progress-track" style={{ background: theme.border }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${clamp((selectedCount / 20) * 100, 0, 100)}%`,
                        background: selectedCount >= 15 ? theme.green : theme.purple,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Resumo rápido */}
              {selectedCount > 0 && (
                <div className="card game-summary" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
                  <div className="panel-header">
                    <h3 style={{ color: theme.text }}>Seus números ({selectedCount}/20)</h3>
                  </div>
                  <div className="chip-list">
                    {selectedNumbers.map((n) => (
                      <span
                        key={n}
                        className="number-chip"
                        style={{
                          background: theme.purpleSoft,
                          color: theme.purple,
                          border: `1px solid ${theme.purpleBorder}`,
                        }}
                      >
                        {numberLabel(n)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="action-row">
                <button className="secondary-btn" type="button" onClick={randomGame}
                  style={{ background: theme.bgSoft, color: theme.text, border: `1.5px solid ${theme.border}` }}>
                  🎲 Gerar aleatório
                </button>
                <button className="ghost-btn" type="button" onClick={clearGame}
                  style={{ color: theme.textSoft, border: `1.5px solid ${theme.border}` }}>
                  ✕ Limpar
                </button>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={analyzeGame}
                  disabled={analisando || selectedCount < 15 || selectedCount > 20}
                  style={{ background: theme.purple }}
                >
                  ⚡ {analisando ? "Analisando..." : "Analisar Jogo"}
                </button>
              </div>

              {/* Dica */}
              <div className="card tip-card" style={{ background: theme.purpleSoft, border: `1px solid ${theme.purpleBorder}` }}>
                <span className="tip-icon">💡</span>
                <div>
                  <h4 style={{ color: theme.purple }}>Dica para escolher melhor</h4>
                  <p style={{ color: theme.name === "dark" ? theme.purple : "#4C1D95" }}>
                    Os números com borda <strong>verde</strong> ainda não saíram no ciclo atual.
                    Incluir pelo menos 2 deles aumenta o alinhamento estatístico do seu jogo!
                  </p>
                </div>
              </div>
            </section>

            {/* Coluna lateral */}
            <aside className="right-column">
              <div className="card side-card" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
                <div className="panel-header">
                  <h3 style={{ color: theme.text }}>Resumo do jogo</h3>
                </div>
                <div className="summary-list">
                  {[
                    { icon: "🔢", label: "Números escolhidos", val: `${selectedCount} de 20` },
                    { icon: "➕", label: "Faltam para o mínimo", val: `${Math.max(0, 15 - selectedCount)} números` },
                    { icon: "⭐", label: "Favoritos do ciclo", val: `${selectedFavorites} números` },
                  ].map((item) => (
                    <div key={item.label} className="summary-item" style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ color: theme.textSoft }}>{item.icon} {item.label}</span>
                      <strong style={{ color: theme.text }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card side-card" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
                <div className="panel-header">
                  <h3 style={{ color: theme.text }}>Como funciona?</h3>
                </div>
                <ol className="steps-list">
                  <li style={{ color: theme.textSoft }}>
                    <b style={{ color: theme.text }}>Escolha seus números</b>
                    <span>Selecione entre 15 e 20 números de 01 a 25.</span>
                  </li>
                  <li style={{ color: theme.textSoft }}>
                    <b style={{ color: theme.text }}>Clique em Analisar</b>
                    <span>O sistema verifica seu jogo com base nos sorteios anteriores.</span>
                  </li>
                  <li style={{ color: theme.textSoft }}>
                    <b style={{ color: theme.text }}>Veja o resultado</b>
                    <span>Receba a pontuação e entenda o que pode melhorar.</span>
                  </li>
                  <li style={{ color: theme.textSoft }}>
                    <b style={{ color: theme.text }}>Salve sua análise</b>
                    <span>Baixe um arquivo com todo o relatório do seu jogo.</span>
                  </li>
                </ol>
              </div>

              {ultimo && (
                <div className="card side-card" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
                  <div className="panel-header">
                    <h3 style={{ color: theme.text }}>Último sorteio</h3>
                  </div>
                  <div className="ultimo-meta">
                    <span style={{ color: theme.textSoft }}>Concurso {ultimo.concurso}</span>
                    <strong style={{ color: theme.text }}>{ultimo.data}</strong>
                  </div>
                  <div className="chip-list compact">
                    {ultimo.dezenas.map((n) => (
                      <span key={n} className="number-chip"
                        style={{ background: theme.purpleSoft, color: theme.purple, border: `1px solid ${theme.purpleBorder}` }}>
                        {numberLabel(n)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ═══ ABA RESULTADO ═══ */}
        {activeTab === "resultado" && (
          <div>
            {!analise ? (
              <div className="card" style={{
                background: theme.panel,
                border: `1px solid ${theme.border}`,
                textAlign: "center",
                padding: "48px 24px",
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                <h2 style={{ color: theme.text, marginBottom: 8 }}>Faça primeiro a análise</h2>
                <p style={{ color: theme.textSoft, marginBottom: 24, fontSize: "0.95rem" }}>
                  Vá até a aba <strong style={{ color: theme.purple }}>🎯 Meu Jogo</strong>, escolha seus
                  números e clique em <strong style={{ color: theme.purple }}>⚡ Analisar Jogo</strong>.
                </p>
                <button className="primary-btn" type="button" onClick={() => setActiveTab("meu-jogo")}
                  style={{ background: theme.purple, maxWidth: 240, margin: "0 auto", display: "block" }}>
                  Ir para Meu Jogo
                </button>
              </div>
            ) : (
              <div className="left-column">

                {/* Score principal */}
                <div className="card" style={{ background: theme.panel, border: `1px solid ${theme.border}`, padding: 24 }}>
                  <ScoreGauge score={analise.score} classificacao={analise.classificacao} theme={theme} />
                  <div className="classification">
                    <strong style={{ color: cor, fontSize: "1.3rem" }}>
                      {analise.classificacao?.emoji ?? ""} {analise.classificacao?.label ?? "Análise pronta"}
                    </strong>
                    <p style={{ color: theme.textSoft, marginTop: 6 }}>
                      {analise.classificacao?.descricao ?? "Os filtros e o score foram calculados com base nos sorteios históricos."}
                    </p>
                  </div>

                  {/* Resumo dos filtros */}
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                    marginTop: 16,
                    flexWrap: "wrap",
                    fontSize: "0.88rem",
                  }}>
                    <span style={{ color: theme.green }}>
                      ✅ {analise.filtros.filter(f => f.status === "aprovado").length} aprovados
                    </span>
                    <span style={{ color: theme.warning }}>
                      ⚠️ {analise.filtros.filter(f => f.status === "atencao").length} atenção
                    </span>
                    <span style={{ color: theme.danger }}>
                      ❌ {analise.filtros.filter(f => f.status === "reprovado").length} reprovados
                    </span>
                  </div>
                </div>

                {/* Botão Salvar */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    className="save-btn"
                    type="button"
                    onClick={handleSalvar}
                    style={{
                      background: theme.greenSoft,
                      color: theme.name === "dark" ? theme.green : "#14532D",
                      border: `1.5px solid ${theme.greenBorder}`,
                    }}
                  >
                    <span>💾</span>
                    Salvar Análise (.txt)
                  </button>
                  {savedNotice && (
                    <span className="saved-badge" style={{
                      background: theme.greenSoft,
                      color: theme.name === "dark" ? theme.green : "#14532D",
                      border: `1px solid ${theme.greenBorder}`,
                    }}>
                      ✅ Arquivo baixado!
                    </span>
                  )}
                  <button className="secondary-btn" type="button" onClick={() => setActiveTab("meu-jogo")}
                    style={{ background: theme.bgSoft, color: theme.text, border: `1.5px solid ${theme.border}` }}>
                    ← Editar jogo
                  </button>
                </div>

                {/* Filtros detalhados */}
                <div className="card" style={{ background: theme.panel, border: `1px solid ${theme.border}`, padding: 20 }}>
                  <div style={{ marginBottom: 14 }}>
                    <h3 style={{ color: theme.text, fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Análise detalhada por filtro
                    </h3>
                    <p style={{ color: theme.textSoft, fontSize: "0.82rem", marginTop: 4 }}>
                      Cada filtro verifica uma característica do seu jogo com base nos sorteios históricos.
                    </p>
                  </div>
                  <div className="filters-list">
                    {analise.filtros.length > 0 ? (
                      analise.filtros.map((filtro, idx) => {
                        const cfg = statusConfig(filtro.status, theme);
                        return (
                          <div
                            key={idx}
                            className="filter-item"
                            style={{
                              borderColor: cfg.border,
                              background: cfg.soft,
                              border: `1.5px solid ${cfg.border}`,
                            }}
                          >
                            <div className="filter-head">
                              <strong style={{ color: theme.text }}>{filtro.nome || `Filtro ${idx + 1}`}</strong>
                              <span style={{
                                color: cfg.textColor,
                                background: cfg.soft,
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}>
                                {cfg.label}
                              </span>
                            </div>
                            {filtro.valor && (
                              <p style={{ color: theme.textSoft, marginBottom: 2 }}>
                                <strong style={{ color: theme.text }}>Valor:</strong> {filtro.valor}
                              </p>
                            )}
                            {filtro.faixa && (
                              <p style={{ color: theme.textSoft, marginBottom: 2 }}>
                                <strong style={{ color: theme.text }}>Referência:</strong> {filtro.faixa}
                              </p>
                            )}
                            {filtro.detalhe && (
                              <p style={{ color: theme.textSoft }}>{filtro.detalhe}</p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="empty-state" style={{ color: theme.textSoft }}>
                        A API retornou sem lista de filtros detalhada.
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabela de scores para referência */}
                <div className="card" style={{ background: theme.panel, border: `1px solid ${theme.border}`, padding: 20 }}>
                  <h3 style={{ color: theme.text, fontSize: "0.9rem", fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Tabela de classificação (0 → 200)
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { range: "0–75",   label: "Crítico",    cor: "#7C3AED" },
                      { range: "75–90",  label: "Péssimo",    cor: "#EF4444" },
                      { range: "90–110", label: "Ruim",       cor: "#F97316" },
                      { range: "110–120",label: "Bom",        cor: "#3B82F6" },
                      { range: "120–140",label: "Muito Bom",  cor: "#4ADE80" },
                      { range: "140–180",label: "Ótimo",      cor: "#22C55E" },
                      { range: "180–200",label: "Excelente",  cor: "#EAB308" },
                    ].map((row) => (
                      <div key={row.range} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: analise.score >= parseInt(row.range) &&
                          analise.score <= parseInt(row.range.split("–")[1]) ?
                          `${row.cor}15` : "transparent",
                        border: analise.score >= parseInt(row.range) &&
                          analise.score <= parseInt(row.range.split("–")[1]) ?
                          `1.5px solid ${row.cor}` : `1px solid transparent`,
                      }}>
                        <span style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: row.cor,
                          flexShrink: 0,
                        }} />
                        <span style={{ color: theme.textSoft, fontSize: "0.84rem", width: 70 }}>{row.range}</span>
                        <span style={{ color: theme.text, fontWeight: 600, fontSize: "0.88rem" }}>{row.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ABA FREQUÊNCIA ═══ */}
        {activeTab === "frequencia" && (
          <div className="card" style={{ background: theme.panel, border: `1px solid ${theme.border}`, padding: 24 }}>
            <h2 style={{ color: theme.text, marginBottom: 8 }}>Frequência Histórica</h2>
            <p style={{ color: theme.textSoft, marginBottom: 20, fontSize: "0.88rem" }}>
              Esta tela mostra quais números saíram mais vezes desde o início da Lotofácil.
              Use as informações para ajudar na escolha dos seus números.
            </p>
            <p style={{ color: theme.textSoft, fontSize: "0.85rem" }}>
              {loading
                ? "⏳ Carregando estatísticas..."
                : "Dados disponíveis após carregar o dashboard completo."}
            </p>
          </div>
        )}

        {/* ═══ ABA ESTATÍSTICAS ═══ */}
        {activeTab === "estatisticas" && (
          <div className="card" style={{ background: theme.panel, border: `1px solid ${theme.border}`, padding: 24 }}>
            <h2 style={{ color: theme.text, marginBottom: 8 }}>Estatísticas Históricas</h2>
            <p style={{ color: theme.textSoft, marginBottom: 20, fontSize: "0.88rem" }}>
              Resumo estatístico dos últimos concursos da Lotofácil com base na planilha histórica.
            </p>
            {dashboard.ciclosCompletos ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Total de concursos", val: dashboard.concursosRealizados },
                  { label: "Ciclos completos",   val: dashboard.ciclosCompletos },
                  { label: "Ciclo atual",         val: dashboard.cicloAtual },
                  { label: "Média por ciclo",     val: dashboard.mediaPorCiclo },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: theme.bgSoft,
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                  }}>
                    <span style={{ color: theme.textSoft, fontSize: "0.88rem" }}>{item.label}</span>
                    <strong style={{ color: theme.text }}>{item.val ?? "—"}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: theme.textSoft, fontSize: "0.85rem" }}>
                {loading ? "⏳ Carregando..." : "Dados não disponíveis."}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="footer-bar" style={{ borderTop: `1px solid ${theme.border}` }}>
          <span style={{ color: theme.textSoft }}>
            {loading ? "⏳ Sincronizando dados..." : "✅ Dados carregados"}
          </span>
          <span style={{ color: theme.textSoft }}>Mentalidade de Sorte © 2025</span>
        </footer>
      </div>
    </div>
  );
}

export default App;

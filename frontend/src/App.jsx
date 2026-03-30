import { useEffect, useMemo, useState } from 'react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001';
const THEME_KEY = 'mentalidade-theme';

const lightTheme = {
  name: 'light',
  bg: '#FFFFFF',
  bgSoft: '#F7F7F7',
  panel: '#FFFFFF',
  text: '#111111',
  textSoft: '#666666',
  border: '#E5E5E5',
  shadow: '0 12px 28px rgba(0,0,0,0.06)',
  primary: '#A78BFA',
  primaryStrong: '#8B5CF6',
  success: '#4ADE80',
  successStrong: '#22C55E',
  warning: '#F59E0B',
  danger: '#F43F5E',
  idle: '#F3F4F6',
  idleBorder: '#DDD6FE',
  idleText: '#3F3F46',
};

const darkTheme = {
  name: 'dark',
  bg: '#0A0A0A',
  bgSoft: '#141414',
  panel: '#171717',
  text: '#F5F5F5',
  textSoft: '#A1A1AA',
  border: '#262626',
  shadow: '0 12px 32px rgba(0,0,0,0.32)',
  primary: '#A78BFA',
  primaryStrong: '#8B5CF6',
  success: '#4ADE80',
  successStrong: '#22C55E',
  warning: '#FBBF24',
  danger: '#F43F5E',
  idle: 'rgba(255,255,255,0.05)',
  idleBorder: 'rgba(167,139,250,0.30)',
  idleText: '#E4E4E7',
};

function numberLabel(n) {
  return String(Number(n)).padStart(2, '0');
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function parseRangeStart(range) {
  return Number(String(range).split('–')[0] || String(range).split('-')[0] || 0);
}

function scoreColor(score) {
  if (score <= 75) return '#7C3AED';
  if (score <= 90) return '#EF4444';
  if (score <= 110) return '#F97316';
  if (score <= 120) return '#3B82F6';
  if (score <= 140) return '#4ADE80';
  if (score <= 180) return '#22C55E';
  return '#EAB308';
}

function normalizeUltimo(payload) {
  if (!payload) return null;
  return {
    concurso: payload.concurso ?? payload.numero ?? '—',
    data: payload.data ?? payload.dataApuracao ?? '—',
    dezenas: Array.isArray(payload.dezenas)
      ? payload.dezenas.map(Number).sort((a, b) => a - b)
      : [],
  };
}

function normalizeDashboard(payload) {
  if (!payload) return {};
  return {
    totalConcursos: payload.totalConcursos ?? payload.meta?.totalConcursos ?? '—',
    ciclosCompletos: payload.ciclosCompletos ?? '—',
    cicloAtual: payload.cicloAtual ?? payload.meta?.cicloAtual ?? '—',
    mediaPorCiclo: payload.mediaPorCiclo ?? payload.tamanhoCicloMedio ?? payload.meta?.tamanhoCicloMedio ?? '—',
    concursosNoCicloAtual: payload.concursosNoCicloAtual ?? payload.meta?.concursosNoCicloAtual ?? 0,
    faltantesCiclo: payload.dezenasFaltantesCiclo ?? payload.ciclo?.dezenasFaltantes ?? [],
    vistasNoCiclo: payload.dezenasJaSairamNoCicloAtual ?? payload.ciclo?.dezenasJaSairam ?? [],
    soma: payload.soma ?? {},
    pares: payload.pares ?? {},
    impares: payload.impares ?? {},
    frequencias: payload.frequencias ?? {},
    topFrequentes: payload.topFrequentes ?? [],
    atrasos: payload.atrasos ?? {},
    reciclagem: payload.reciclagem ?? {},
    quadrantes: payload.quadrantes ?? {},
    entropia: payload.entropia ?? {},
    ultimoResultado: normalizeUltimo(payload.ultimoResultado),
    alertaCiclos: payload.alertaCiclos ?? null,
  };
}

function normalizeAnalise(payload) {
  if (!payload) return null;
  return {
    score: Number(payload.score ?? 0),
    classificacao: payload.classificacao ?? null,
    filtros: Array.isArray(payload.filtros) ? payload.filtros : [],
    resumo: payload.resumo ?? { aprovados: 0, atencao: 0, reprovados: 0, total: 0 },
    soma: payload.soma ?? payload.estatisticas?.soma ?? 0,
    pares: payload.pares ?? payload.estatisticas?.pares ?? 0,
    impares: payload.impares ?? payload.estatisticas?.impares ?? 0,
    percentualPares: payload.percentualPares ?? payload.estatisticas?.percentualPares ?? 0,
    percentualImpares: payload.percentualImpares ?? payload.estatisticas?.percentualImpares ?? 0,
    repetidosUltimoSorteio: payload.repetidosUltimoSorteio ?? payload.estatisticas?.repetidosUltimoSorteio ?? 0,
    dezenasRepetidasUltimoSorteio: payload.dezenasRepetidasUltimoSorteio ?? payload.estatisticas?.dezenasRepetidasUltimoSorteio ?? [],
    estatisticas: payload.estatisticas ?? {},
  };
}

function statusMeta(status, theme) {
  const key = String(status || '').toLowerCase();
  if (key === 'aprovado' || key === 'ok') {
    return { label: 'Aprovado', color: theme.successStrong, bg: `${theme.successStrong}14` };
  }
  if (key === 'reprovado' || key === 'erro') {
    return { label: 'Reprovado', color: theme.danger, bg: `${theme.danger}12` };
  }
  return { label: 'Atenção', color: theme.warning, bg: `${theme.warning}14` };
}

function Header({ theme, setThemeName, dashboard }) {
  return (
    <header className="hero card" style={{ background: theme.panel, borderColor: theme.border }}>
      <div className="brand-wrap">
        <div className="brand-clover" aria-hidden="true">🍀</div>
        <div>
          <h1>Mentalidade de Sorte</h1>
          <p>Analisador estatístico pesado da Lotofácil</p>
        </div>
      </div>

      <div className="hero-right">
        <div className="pill pill-highlight">
          <span>Ciclo atual</span>
          <strong>{dashboard.cicloAtual}</strong>
        </div>
        <div className="theme-switch">
          <button
            type="button"
            className={theme.name === 'dark' ? 'active' : ''}
            onClick={() => setThemeName('dark')}
          >
            🌙
          </button>
          <button
            type="button"
            className={theme.name === 'light' ? 'active' : ''}
            onClick={() => setThemeName('light')}
          >
            ☀️
          </button>
        </div>
      </div>
    </header>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Tabs({ activeTab, setActiveTab, canViewResult }) {
  const tabs = [
    ['meu-jogo', '🎯 Meu jogo'],
    ['resultado', '📊 Resultado'],
    ['frequencia', '🔥 Frequência'],
    ['estatisticas', '📈 Estatísticas'],
  ];

  return (
    <nav className="card tabs">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={activeTab === key ? 'active' : ''}
          disabled={key === 'resultado' && !canViewResult}
          onClick={() => setActiveTab(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function NumberBall({ number, selected, pending, onToggle }) {
  return (
    <button
      type="button"
      className={`number-ball ${selected ? 'selected' : ''} ${pending ? 'pending' : ''}`}
      onClick={() => onToggle(number)}
      aria-pressed={selected}
      title={pending ? `Dezena ${numberLabel(number)} pendente no ciclo` : `Dezena ${numberLabel(number)}`}
    >
      <span>{numberLabel(number)}</span>
      {pending && <small>⭐</small>}
    </button>
  );
}

function ScoreGauge({ score, classificacao, theme }) {
  const color = classificacao?.cor || scoreColor(score);
  const pct = clamp(score, 0, 200) / 2;

  return (
    <div className="score-box">
      <div className="score-ring" style={{ background: `conic-gradient(${color} ${pct}%, ${theme.border} ${pct}% 100%)` }}>
        <div className="score-center card" style={{ background: theme.panel }}>
          <span>Score</span>
          <strong style={{ color }}>{score}/200</strong>
        </div>
      </div>
      <div className="score-label" style={{ color }}>
        <span className="score-dot" style={{ background: color }} />
        {classificacao?.label || 'SEM CLASSIFICAÇÃO'}
      </div>
      <p className="score-description">{classificacao?.descricao || 'Faça uma análise para ver o diagnóstico.'}</p>
    </div>
  );
}

function SummaryBadge({ label, value, color }) {
  return (
    <div className="summary-badge" style={{ borderColor: `${color}40`, color }}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ResultFilter({ filter, theme }) {
  const meta = statusMeta(filter.status, theme);
  return (
    <div className="filter-card card" style={{ borderColor: meta.color, background: theme.panel }}>
      <div className="filter-head">
        <div>
          <h4>{filter.nome}</h4>
          <p>{filter.explicacao}</p>
        </div>
        <span className="filter-tag" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
      </div>
      <div className="filter-body">
        <strong>{filter.valor}</strong>
        {filter.faixa && <span>Faixa: {filter.faixa}</span>}
        {filter.detalhe && <p>{filter.detalhe}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = max ? clamp((value / max) * 100, 0, 100) : 0;
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function FrequencyCard({ item }) {
  return (
    <div className="frequency-card card">
      <div className="frequency-ball">{numberLabel(item.dezena)}</div>
      <div>
        <strong>{item.pct}%</strong>
        <span>{item.ocorrencias} ocorrências</span>
      </div>
    </div>
  );
}

function MiniNumberList({ title, values, empty = '—' }) {
  return (
    <div className="mini-list card">
      <h4>{title}</h4>
      {values?.length ? (
        <div className="mini-number-wrap">
          {values.map((value) => <span key={value} className="mini-number">{numberLabel(value)}</span>)}
        </div>
      ) : (
        <p>{empty}</p>
      )}
    </div>
  );
}

async function createStoryImage({ dezenas, analise, ultimo, theme }) {
  const color = analise.classificacao?.cor || scoreColor(analise.score);
  const totalRows = Math.ceil(dezenas.length / 4);
  const boxes = dezenas.map((dezena, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const x = 120 + col * 210;
    const y = 820 + row * 170;
    return `
      <rect x="${x}" y="${y}" width="160" height="110" rx="32" fill="rgba(167,139,250,0.18)" stroke="${color}" stroke-width="3"/>
      <text x="${x + 80}" y="${y + 68}" fill="#F5F5F5" font-size="50" font-family="Arial" font-weight="700" text-anchor="middle">${numberLabel(dezena)}</text>
    `;
  }).join('');

  const repeated = analise.dezenasRepetidasUltimoSorteio?.length
    ? analise.dezenasRepetidasUltimoSorteio.map(numberLabel).join(' · ')
    : 'Nenhuma';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#09090B"/>
        <stop offset="100%" stop-color="#18181B"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.2" cy="0.15" r="1">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#bg)"/>
    <rect width="1080" height="1920" fill="url(#glow)"/>
    <text x="120" y="180" fill="#4ADE80" font-size="82">🍀</text>
    <text x="220" y="178" fill="#F5F5F5" font-size="54" font-family="Arial" font-weight="700">Mentalidade de Sorte</text>
    <text x="120" y="280" fill="#A1A1AA" font-size="38" font-family="Arial">Análise estatística pronta para compartilhar</text>

    <rect x="120" y="360" width="840" height="280" rx="42" fill="rgba(255,255,255,0.04)" stroke="${color}" stroke-width="4"/>
    <text x="180" y="450" fill="#A1A1AA" font-size="40" font-family="Arial">Score</text>
    <text x="180" y="545" fill="${color}" font-size="104" font-family="Arial" font-weight="700">${analise.score}/200</text>
    <text x="180" y="610" fill="${color}" font-size="52" font-family="Arial" font-weight="700">${analise.classificacao?.label || ''}</text>
    <text x="180" y="670" fill="#E5E7EB" font-size="34" font-family="Arial">${analise.classificacao?.descricao || ''}</text>

    <text x="120" y="760" fill="#F5F5F5" font-size="46" font-family="Arial" font-weight="700">Dezenas analisadas</text>
    ${boxes}

    <rect x="120" y="${980 + totalRows * 170}" width="840" height="380" rx="38" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <text x="170" y="${1060 + totalRows * 170}" fill="#F5F5F5" font-size="40" font-family="Arial" font-weight="700">Resumo rápido</text>
    <text x="170" y="${1140 + totalRows * 170}" fill="#D4D4D8" font-size="34" font-family="Arial">Soma: ${analise.soma}</text>
    <text x="170" y="${1200 + totalRows * 170}" fill="#D4D4D8" font-size="34" font-family="Arial">Pares: ${analise.pares} (${analise.percentualPares}%)</text>
    <text x="170" y="${1260 + totalRows * 170}" fill="#D4D4D8" font-size="34" font-family="Arial">Ímpares: ${analise.impares} (${analise.percentualImpares}%)</text>
    <text x="170" y="${1320 + totalRows * 170}" fill="#D4D4D8" font-size="34" font-family="Arial">Repetidos do último: ${analise.repetidosUltimoSorteio}</text>
    <text x="170" y="${1380 + totalRows * 170}" fill="#4ADE80" font-size="30" font-family="Arial">Último concurso #${ultimo?.concurso || '—'} · ${repeated}</text>

    <text x="120" y="1780" fill="#A1A1AA" font-size="28" font-family="Arial">Gerado automaticamente pela aplicação.</text>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = 'async';
  image.src = url;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);

  const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
  return pngBlob;
}

function App() {
  const [themeName, setThemeName] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const theme = themeName === 'light' ? lightTheme : darkTheme;
  const [dashboard, setDashboard] = useState({});
  const [ultimo, setUltimo] = useState(null);
  const [analise, setAnalise] = useState(null);
  const [activeTab, setActiveTab] = useState('meu-jogo');
  const [inputValue, setInputValue] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analisando, setAnalisando] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeName);
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--bg-soft', theme.bgSoft);
    document.documentElement.style.setProperty('--panel', theme.panel);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--text-soft', theme.textSoft);
    document.documentElement.style.setProperty('--border', theme.border);
    document.documentElement.style.setProperty('--shadow', theme.shadow);
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--primary-strong', theme.primaryStrong);
    document.documentElement.style.setProperty('--success', theme.successStrong);
    document.documentElement.style.setProperty('--warning', theme.warning);
    document.documentElement.style.setProperty('--danger', theme.danger);
    document.documentElement.style.setProperty('--idle', theme.idle);
    document.documentElement.style.setProperty('--idle-border', theme.idleBorder);
    document.documentElement.style.setProperty('--idle-text', theme.idleText);
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.documentElement.style.colorScheme = theme.name;
  }, [theme, themeName]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const [dashRes, ultimoRes] = await Promise.all([
          fetch(`${API_URL}/api/lotofacil/dashboard`),
          fetch(`${API_URL}/api/lotofacil/ultimo`),
        ]);

        if (!dashRes.ok || !ultimoRes.ok) throw new Error('Falha ao carregar dados do backend.');

        const [dashJson, ultimoJson] = await Promise.all([dashRes.json(), ultimoRes.json()]);
        if (ignore) return;

        setDashboard(normalizeDashboard(dashJson));
        setUltimo(normalizeUltimo(ultimoJson));
        setError('');
      } catch {
        if (!ignore) setError('Não consegui falar com o backend. Confere a URL da API no Vercel/Render.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const faltantesCiclo = Array.isArray(dashboard.faltantesCiclo) ? dashboard.faltantesCiclo : [];
  const vistasNoCiclo = Array.isArray(dashboard.vistasNoCiclo) ? dashboard.vistasNoCiclo : [];
  const selectedCount = selectedNumbers.length;
  const selectedPendingCount = selectedNumbers.filter((n) => faltantesCiclo.includes(n)).length;
  const isValidGame = selectedCount >= 15 && selectedCount <= 20;

  const topStats = useMemo(() => ([
    { icon: '📁', label: 'Total de concursos', value: dashboard.totalConcursos || '—' },
    { icon: '🔄', label: 'Ciclos completos', value: dashboard.ciclosCompletos || '—' },
    { icon: '⚡', label: 'Ciclo atual', value: dashboard.cicloAtual || '—' },
    { icon: '🎯', label: 'Seu jogo', value: `${selectedCount}/20` },
  ]), [dashboard, selectedCount]);

  function syncNumbers(values) {
    const normalized = [...new Set(values.map(Number))]
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 25)
      .slice(0, 20)
      .sort((a, b) => a - b);

    setSelectedNumbers(normalized);
    setInputValue(normalized.map(numberLabel).join(' '));
    setAnalise(null);
  }

  function handleInputChange(value) {
    setInputValue(value);
    const parsed = value.split(/[\s,;.-]+/).filter(Boolean);
    syncNumbers(parsed);
  }

  function toggleNumber(number) {
    const next = selectedNumbers.includes(number)
      ? selectedNumbers.filter((item) => item !== number)
      : [...selectedNumbers, number];
    syncNumbers(next);
  }

  function randomGame() {
    const pool = Array.from({ length: 25 }, (_, index) => index + 1)
      .sort(() => Math.random() - 0.5)
      .slice(0, 15)
      .sort((a, b) => a - b);
    syncNumbers(pool);
  }

  function clearGame() {
    setInputValue('');
    setSelectedNumbers([]);
    setAnalise(null);
    setActiveTab('meu-jogo');
  }

  async function analyzeGame() {
    if (!isValidGame) {
      setError('Escolha entre 15 e 20 dezenas para analisar.');
      return;
    }

    setAnalisando(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/lotofacil/analisar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dezenas: selectedNumbers }),
      });

      if (!response.ok) throw new Error('Falha na análise');
      const json = await response.json();
      setAnalise(normalizeAnalise(json));
      setActiveTab('resultado');
    } catch {
      setError('Falha ao analisar. Se o Render dormir, acorda ele com um café e tenta de novo.');
    } finally {
      setAnalisando(false);
    }
  }

  function downloadAnalysisText() {
    if (!analise) return;
    const text = [
      'MENTALIDADE DE SORTE',
      `Números: ${selectedNumbers.map(numberLabel).join(' - ')}`,
      `Score: ${analise.score}/200`,
      `Classificação: ${analise.classificacao?.label || '—'}`,
      `Soma: ${analise.soma}`,
      `Pares: ${analise.pares} (${analise.percentualPares}%)`,
      `Ímpares: ${analise.impares} (${analise.percentualImpares}%)`,
      `Repetidos do último sorteio: ${analise.repetidosUltimoSorteio}`,
      '',
      ...analise.filtros.map((item) => `- ${item.nome}: ${item.valor} | ${item.detalhe || ''}`),
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-lotofacil-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice('Análise salva em TXT.');
  }

  async function shareToWhatsApp() {
    if (!analise) return;

    try {
      const pngBlob = await createStoryImage({ dezenas: selectedNumbers, analise, ultimo, theme });
      const file = new File([pngBlob], 'story-lotofacil.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Análise Lotofácil',
          text: 'Story gerado pelo Mentalidade de Sorte',
        });
        setNotice('Imagem pronta e compartilhada.');
        return;
      }

      const url = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'story-lotofacil.png';
      a.click();
      URL.revokeObjectURL(url);
      window.open(`https://wa.me/?text=${encodeURIComponent('Story da análise gerado. Baixe a imagem e envie no WhatsApp.')}`, '_blank');
      setNotice('Imagem story gerada.');
    } catch {
      setError('Não consegui gerar a imagem do story agora.');
    }
  }

  const scoreAccent = analise?.classificacao?.cor || theme.primary;
  const analysisSummaryCards = analise ? [
    { label: 'Soma', value: analise.soma, color: scoreAccent },
    { label: 'Pares', value: `${analise.pares} · ${analise.percentualPares}%`, color: theme.warning },
    { label: 'Ímpares', value: `${analise.impares} · ${analise.percentualImpares}%`, color: theme.primaryStrong },
    { label: 'Último sorteio', value: `${analise.repetidosUltimoSorteio} iguais`, color: theme.successStrong },
  ] : [];

  return (
    <div className="app-shell">
      <div className="container">
        <Header theme={theme} setThemeName={setThemeName} dashboard={dashboard} />

        <section className="stats-grid">
          {topStats.map((item) => <StatCard key={item.label} {...item} />)}
        </section>

        {error && <div className="notice error">⚠️ {error}</div>}
        {notice && <div className="notice success">✅ {notice}</div>}

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} canViewResult={Boolean(analise)} />

        {activeTab === 'meu-jogo' && (
          <section className="main-grid">
            <div className="stack">
              <div className="card panel">
                <div className="section-head">
                  <div>
                    <h2>Escolha suas dezenas</h2>
                    <p>Toque nos números. Mínimo 15 e máximo 20. Os pendentes do ciclo aparecem com estrela.</p>
                  </div>
                  <span className="pill">{selectedCount}/20</span>
                </div>

                <textarea
                  className="number-input"
                  rows={2}
                  value={inputValue}
                  onChange={(event) => handleInputChange(event.target.value)}
                  placeholder="Ex.: 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15"
                />

                <div className="number-grid">
                  {Array.from({ length: 25 }, (_, index) => index + 1).map((number) => (
                    <NumberBall
                      key={number}
                      number={number}
                      selected={selectedNumbers.includes(number)}
                      pending={faltantesCiclo.includes(number)}
                      onToggle={toggleNumber}
                    />
                  ))}
                </div>

                <div className="cycle-strip card">
                  <div>
                    <strong>Aposta mínima completa?</strong>
                    <p>
                      {isValidGame
                        ? `Sim. Você também está usando ${selectedPendingCount} dezena(s) pendente(s) do ciclo ${dashboard.cicloAtual}.`
                        : 'Ainda não. Complete pelo menos 15 dezenas.'}
                    </p>
                  </div>
                  <strong>{selectedCount}/20</strong>
                </div>

                <ProgressBar value={selectedCount} max={20} color={theme.successStrong} />

                <div className="action-row">
                  <button type="button" className="btn primary" onClick={analyzeGame} disabled={analisando || !isValidGame}>
                    {analisando ? 'Analisando...' : 'Analisar jogo'}
                  </button>
                  <button type="button" className="btn" onClick={randomGame}>Surpresa</button>
                  <button type="button" className="btn" onClick={clearGame}>Limpar</button>
                </div>
              </div>
            </div>

            <div className="stack">
              <div className="card panel side-highlight">
                <h3>Ciclo {dashboard.cicloAtual}</h3>
                <p>Planilha = fonte oficial. Salvou a planilha, recalculou tudo.</p>
                <div className="side-stats-grid">
                  <SummaryBadge label="No ciclo" value={dashboard.concursosNoCicloAtual ?? 0} color={theme.primaryStrong} />
                  <SummaryBadge label="Já saíram" value={vistasNoCiclo.length} color={theme.successStrong} />
                  <SummaryBadge label="Faltam" value={faltantesCiclo.length} color={theme.warning} />
                </div>
              </div>

              <MiniNumberList title="Dezenas pendentes do ciclo" values={faltantesCiclo} empty="Nenhuma pendente. Ciclo recém-aberto." />
              <MiniNumberList title="Dezenas já saídas no ciclo" values={vistasNoCiclo} empty="Ciclo zerado." />

              {ultimo && (
                <div className="card panel">
                  <h3>Último concurso #{ultimo.concurso}</h3>
                  <p>{ultimo.data}</p>
                  <div className="mini-number-wrap">
                    {ultimo.dezenas.map((dezena) => (
                      <span key={dezena} className={`mini-number ${selectedNumbers.includes(dezena) ? 'hit' : ''}`}>
                        {numberLabel(dezena)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'resultado' && analise && (
          <section className="result-grid">
            <div className="stack">
              <div className="card panel result-main">
                <ScoreGauge score={analise.score} classificacao={analise.classificacao} theme={theme} />
                <div className="summary-grid">
                  {analysisSummaryCards.map((item) => <SummaryBadge key={item.label} {...item} />)}
                </div>
                <div className="action-row">
                  <button type="button" className="btn primary" onClick={shareToWhatsApp}>Compartilhar no WhatsApp</button>
                  <button type="button" className="btn" onClick={downloadAnalysisText}>Salvar TXT</button>
                </div>
              </div>

              <div className="card panel">
                <div className="section-head compact">
                  <div>
                    <h3>Filtros aplicados</h3>
                    <p>O círculo e a classificação seguem a cor da pontuação. A tabela virou coadjuvante, como deveria.</p>
                  </div>
                </div>
                <div className="filter-list">
                  {analise.filtros.map((filter) => <ResultFilter key={filter.id} filter={filter} theme={theme} />)}
                </div>
              </div>
            </div>

            <div className="stack">
              <div className="card panel">
                <h3>Resumo da análise</h3>
                <div className="kv-list">
                  <div><span>Aprovados</span><strong>{analise.resumo.aprovados}</strong></div>
                  <div><span>Atenção</span><strong>{analise.resumo.atencao}</strong></div>
                  <div><span>Reprovados</span><strong>{analise.resumo.reprovados}</strong></div>
                  <div><span>Faixa de soma recorrente</span><strong>{analise.estatisticas.mediaFaixaMaisRecorrente?.faixa || '—'}</strong></div>
                  <div><span>Padrão de pares mais comum</span><strong>{analise.estatisticas.padraoParesMaisRecorrente?.padrao || '—'}</strong></div>
                  <div><span>Repetidos do último</span><strong>{analise.repetidosUltimoSorteio}</strong></div>
                </div>
              </div>

              <MiniNumberList title="Repetidos do último sorteio" values={analise.dezenasRepetidasUltimoSorteio} empty="Nenhuma dezena repetida." />
              <MiniNumberList title="Pendentes do ciclo no seu jogo" values={analise.estatisticas.dezenasPendentesNoJogo} empty="Nenhuma pendente usada." />
            </div>
          </section>
        )}

        {activeTab === 'frequencia' && (
          <section className="stack">
            <div className="card panel">
              <div className="section-head compact">
                <div>
                  <h2>🔥 Frequência histórica</h2>
                  <p>Top dezenas da planilha histórica. Nada de chute vendendo certeza; aqui é histórico bruto.</p>
                </div>
              </div>
              <div className="frequency-grid">
                {(dashboard.topFrequentes || []).map((item) => <FrequencyCard key={item.dezena} item={item} />)}
              </div>
            </div>

            <div className="card panel">
              <h3>Frequência completa das 25 dezenas</h3>
              <div className="full-frequency-grid">
                {Array.from({ length: 25 }, (_, index) => index + 1).map((dezena) => {
                  const pct = dashboard.frequencias?.[dezena] ?? 0;
                  return (
                    <div key={dezena} className="full-frequency-item">
                      <span className="mini-number">{numberLabel(dezena)}</span>
                      <div>
                        <strong>{pct}%</strong>
                        <ProgressBar value={pct} max={100} color={theme.primaryStrong} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'estatisticas' && (
          <section className="stack">
            <div className="stats-grid stats-grid-4">
              <StatCard icon="📚" label="Total de concursos" value={dashboard.totalConcursos || '—'} />
              <StatCard icon="🔁" label="Ciclos completos" value={dashboard.ciclosCompletos || '—'} />
              <StatCard icon="🧠" label="Ciclo atual" value={dashboard.cicloAtual || '—'} />
              <StatCard icon="📐" label="Média por ciclo" value={dashboard.mediaPorCiclo || '—'} />
            </div>

            <div className="dual-grid">
              <div className="card panel">
                <h3>Estatísticas históricas</h3>
                <div className="kv-list">
                  <div><span>Soma média</span><strong>{dashboard.soma?.media ?? '—'}</strong></div>
                  <div><span>Soma mínima</span><strong>{dashboard.soma?.min ?? '—'}</strong></div>
                  <div><span>Soma máxima</span><strong>{dashboard.soma?.max ?? '—'}</strong></div>
                  <div><span>Faixa de soma que mais cai</span><strong>{dashboard.soma?.faixaMaisRecorrente?.faixa || '—'}</strong></div>
                  <div><span>% média de pares</span><strong>{dashboard.pares?.percentualMedio ?? '—'}%</strong></div>
                  <div><span>% média de ímpares</span><strong>{dashboard.impares?.percentualMedio ?? '—'}%</strong></div>
                  <div><span>Padrão pares/ímpares recorrente</span><strong>{dashboard.pares?.padraoMaisRecorrente?.padrao || '—'}</strong></div>
                  <div><span>Desvio padrão médio</span><strong>{dashboard.entropia?.media ?? '—'}</strong></div>
                </div>
              </div>

              <div className="card panel">
                <h3>Ciclo das dezenas</h3>
                <div className="kv-list">
                  <div><span>Concursos no ciclo atual</span><strong>{dashboard.concursosNoCicloAtual ?? 0}</strong></div>
                  <div><span>Já saíram no ciclo</span><strong>{vistasNoCiclo.length}</strong></div>
                  <div><span>Restam no ciclo</span><strong>{faltantesCiclo.length}</strong></div>
                </div>
                <ProgressBar value={vistasNoCiclo.length} max={25} color={theme.successStrong} />
                <div className="subgrid-two">
                  <MiniNumberList title="Já saíram" values={vistasNoCiclo} empty="Ciclo novo." />
                  <MiniNumberList title="Faltam sair" values={faltantesCiclo} empty="Ciclo fechado." />
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="footer-bar">
          <span>{loading ? '⏳ Carregando dados...' : '✅ Sincronizado com a planilha'}</span>
          <span>Render + Vercel sem drama, por favor.</span>
        </footer>
      </div>
    </div>
  );
}

export default App;

// ─── services/caixaService.js ─────────────────────────────────────────────────
// Responsável por buscar o último resultado real da Lotofácil nas APIs externas.
// Implementa cache em memória (10 min) para evitar chamadas excessivas.
// O backend atua como proxy — elimina problema de CORS no frontend.
// ──────────────────────────────────────────────────────────────────────────────

// node-fetch v3 é ESM puro. Para CJS usamos import dinâmico.
let _fetch;
async function getFetch() {
  if (!_fetch) {
    const mod = await import('node-fetch');
    _fetch = mod.default;
  }
  return _fetch;
}

// ── Fontes externas (ordem de prioridade) ─────────────────────────────────────
const FONTES = [
  {
    url: 'https://api.guidi.dev.br/loteria/lotofacil/ultimo',
    nome: 'guidi',
    normalizar: (d) => ({
      concurso:       Number(d.numero ?? d.concurso ?? 0),
      data:           d.dataApuracao ?? d.data ?? '',
      dezenas:        extrairDezenas(d.listaDezenas ?? d.dezenas ?? []),
      acumulado:      Boolean(d.acumulado),
      premioEstimado: d.valorEstimadoProximoConcurso ?? d.valorAcumuladoProximoConcurso ?? null,
    }),
  },
  {
    url: 'https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest',
    nome: 'loteriascaixa-api',
    normalizar: (d) => ({
      concurso:       Number(d.concurso ?? d.numero ?? 0),
      data:           d.data ?? d.dataApuracao ?? '',
      dezenas:        extrairDezenas(d.dezenas ?? d.listaDezenas ?? []),
      acumulado:      Boolean(d.acumulado),
      premioEstimado: d.valorEstimadoProximoConcurso ?? null,
    }),
  },
];

// ── Cache simples em memória ──────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
let cache = { resultado: null, timestamp: 0 };

// ── Helpers ───────────────────────────────────────────────────────────────────
function extrairDezenas(raw) {
  return raw
    .map(Number)
    .filter(n => Number.isInteger(n) && n >= 1 && n <= 25)
    .sort((a, b) => a - b);
}

function cacheValido() {
  return cache.resultado && Date.now() - cache.timestamp < CACHE_TTL_MS;
}

// ── Função principal ──────────────────────────────────────────────────────────
/**
 * Busca o último resultado da Lotofácil.
 * Retorna objeto normalizado ou null se todas as fontes falharem.
 * @returns {Promise<object|null>}
 */
async function fetchUltimoResultado() {
  // Retorna do cache se ainda válido
  if (cacheValido()) {
    console.log('[CaixaService] Retornando do cache');
    return cache.resultado;
  }

  const fetch = await getFetch();

  for (const fonte of FONTES) {
    try {
      console.log(`[CaixaService] Tentando fonte: ${fonte.nome}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(fonte.url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`[CaixaService] ${fonte.nome} respondeu ${res.status}`);
        continue;
      }

      const data = await res.json();
      const normalizado = fonte.normalizar(data);

      // Valida que vieram exatamente 15 dezenas válidas
      if (normalizado.dezenas.length !== 15) {
        console.warn(`[CaixaService] ${fonte.nome} retornou ${normalizado.dezenas.length} dezenas. Ignorando.`);
        continue;
      }

      // Salva no cache e retorna
      cache = {
        resultado: { ...normalizado, fonte: fonte.nome },
        timestamp: Date.now(),
      };

      console.log(`[CaixaService] ✅ Resultado obtido via ${fonte.nome} — Concurso #${normalizado.concurso}`);
      return cache.resultado;

    } catch (err) {
      console.warn(`[CaixaService] Falha em ${fonte.nome}:`, err.message);
    }
  }

  console.error('[CaixaService] ❌ Todas as fontes falharam.');
  return null;
}

module.exports = { fetchUltimoResultado };

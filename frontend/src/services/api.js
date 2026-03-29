// ─── services/api.js ─────────────────────────────────────────────────────────
// Única camada de comunicação entre o frontend e o backend.
// Em dev: Vite proxy redireciona /api → localhost:3001
// Em prod: VITE_API_BASE_URL define o endereço do backend no Hostinger
// ──────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return res.json();
}

/**
 * GET /api/lotofacil/ultimo
 * Retorna o último resultado oficial da Lotofácil.
 */
export async function getUltimoResultado() {
  return apiFetch('/api/lotofacil/ultimo');
}

/**
 * GET /api/lotofacil/dashboard
 * Retorna estatísticas históricas + último resultado.
 */
export async function getDashboard() {
  return apiFetch('/api/lotofacil/dashboard');
}

/**
 * POST /api/lotofacil/analisar
 * Envia de 15 a 20 dezenas e recebe score + filtros detalhados.
 * @param {number[]} dezenas
 */
export async function analisarJogo(dezenas) {
  return apiFetch('/api/lotofacil/analisar', {
    method: 'POST',
    body: JSON.stringify({ dezenas }),
  });
}

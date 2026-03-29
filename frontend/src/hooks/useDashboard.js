// ─── hooks/useDashboard.js ────────────────────────────────────────────────────
// Carrega os dados do dashboard (estatísticas + último resultado) ao montar.
// Expõe estado de loading, erro e botão de retry.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../services/api';

export function useDashboard() {
  const [data,    setData]    = useState(null);
  const [status,  setStatus]  = useState('idle'); // idle | loading | ok | erro
  const [erro,    setErro]    = useState(null);

  const carregar = useCallback(async () => {
    setStatus('loading');
    setErro(null);
    try {
      const resultado = await getDashboard();
      setData(resultado);
      setStatus('ok');
    } catch (e) {
      setErro(e.message);
      setStatus('erro');
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return { data, status, erro, recarregar: carregar };
}

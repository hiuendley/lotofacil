import { useState, useCallback } from 'react';
import { analisarJogo } from '../services/api';

const MIN_DEZENAS = 15;
const MAX_DEZENAS = 20;

export function useSimulador() {
  const [dezenas, setDezenas] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [resultado, setResultado] = useState(null);
  const [analisando, setAnalisando] = useState(false);
  const [erroAnalise, setErroAnalise] = useState(null);

  const toggleDezena = useCallback((num) => {
    setDezenas(prev => {
      if (prev.includes(num)) return prev.filter(d => d !== num);
      if (prev.length >= MAX_DEZENAS) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
    setResultado(null);
  }, []);

  const handleInput = useCallback((val) => {
    setInputVal(val);
    const nums = val
      .split(/[\s,;]+/)
      .map(Number)
      .filter(n => Number.isInteger(n) && n >= 1 && n <= 25);
    const unique = [...new Set(nums)].slice(0, MAX_DEZENAS).sort((a, b) => a - b);
    setDezenas(unique);
    setResultado(null);
  }, []);

  const gerarAleatorio = useCallback(() => {
    const nums = [];
    while (nums.length < MIN_DEZENAS) {
      const n = Math.floor(Math.random() * 25) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    setDezenas(nums.sort((a, b) => a - b));
    setResultado(null);
    setInputVal('');
    setErroAnalise(null);
  }, []);

  const limpar = useCallback(() => {
    setDezenas([]);
    setResultado(null);
    setInputVal('');
    setErroAnalise(null);
  }, []);

  const analisar = useCallback(async () => {
    if (dezenas.length < MIN_DEZENAS || dezenas.length > MAX_DEZENAS) return;
    setAnalisando(true);
    setErroAnalise(null);
    try {
      const res = await analisarJogo(dezenas);
      setResultado(res);
    } catch (e) {
      setErroAnalise(e.message);
    } finally {
      setAnalisando(false);
    }
  }, [dezenas]);

  return {
    dezenas,
    inputVal,
    resultado,
    analisando,
    erroAnalise,
    toggleDezena,
    handleInput,
    gerarAleatorio,
    limpar,
    analisar,
  };
}

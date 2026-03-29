const { getResultados, getUltimoResultado } = require('../services/resultadosService');
const statsService = require('../services/statsService');
const scoreService = require('../services/scoreService');

async function getUltimo(req, res, next) {
  try {
    const ultimo = getUltimoResultado();
    if (!ultimo) {
      return res.status(404).json({ error: 'Nenhum resultado encontrado na planilha.' });
    }
    res.json(ultimo);
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const resultados = getResultados();
    const dashboard = statsService.buildDashboard(resultados);
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
}

async function analisarJogo(req, res, next) {
  try {
    const { dezenas } = req.body;

    if (!Array.isArray(dezenas)) {
      return res.status(400).json({ error: 'O campo "dezenas" deve ser um array.' });
    }

    const dezenasParsed = dezenas.map(Number);
    if (dezenasParsed.length < 15 || dezenasParsed.length > 20) {
      return res.status(400).json({ error: 'Envie entre 15 e 20 dezenas.' });
    }

    if (dezenasParsed.some(n => n < 1 || n > 25 || !Number.isInteger(n))) {
      return res.status(400).json({ error: 'Todas as dezenas devem ser inteiros entre 1 e 25.' });
    }

    const uniqueDezenas = [...new Set(dezenasParsed)].sort((a, b) => a - b);
    if (uniqueDezenas.length !== dezenasParsed.length) {
      return res.status(400).json({ error: 'As dezenas devem ser todas diferentes.' });
    }

    const resultados = getResultados();
    const historico = statsService.getHistorico(resultados);
    const analise = scoreService.analisar(uniqueDezenas, {
      ultimoResultado: historico.ultimoResultado,
      historico,
    });

    res.json(analise);
  } catch (err) {
    next(err);
  }
}

module.exports = { getUltimo, getDashboard, analisarJogo };

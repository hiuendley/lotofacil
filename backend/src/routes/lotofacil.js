// ─── routes/lotofacil.js ──────────────────────────────────────────────────────
// Define todas as rotas do módulo Lotofácil e conecta aos controllers.
// ──────────────────────────────────────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/lotofacilController');

// GET  /api/lotofacil/ultimo     → Último resultado carregado da planilha
router.get('/ultimo', controller.getUltimo);

// GET  /api/lotofacil/dashboard  → Estatísticas históricas para a tela principal
router.get('/dashboard', controller.getDashboard);

// POST /api/lotofacil/analisar   → Recebe de 15 a 20 dezenas e devolve score + filtros
// Body: { "dezenas": [1, 5, 9, ...] }
router.post('/analisar', controller.analisarJogo);

module.exports = router;

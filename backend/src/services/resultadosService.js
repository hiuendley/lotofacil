const path = require('path');
const XLSX = require('xlsx');

const DATA_FILE = path.join(__dirname, '../data/lotofacil.xlsx');

function parseLinha(row) {
  const dezenas = [];
  for (let i = 1; i <= 15; i++) {
    const value = Number(row[`bola ${i}`]);
    if (Number.isInteger(value)) dezenas.push(value);
  }

  if (!Number.isInteger(Number(row.Concurso)) || dezenas.length !== 15) {
    return null;
  }

  return {
    concurso: Number(row.Concurso),
    data: String(row.Data ?? ''),
    dezenas: dezenas.sort((a, b) => a - b),
    fonte: 'Planilha manual',
  };
}

function getResultados() {
  const workbook = XLSX.readFile(DATA_FILE, { cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  return rows
    .map(parseLinha)
    .filter(Boolean)
    .sort((a, b) => a.concurso - b.concurso);
}

function getUltimoResultado() {
  const resultados = getResultados();
  return resultados[resultados.length - 1] ?? null;
}

module.exports = {
  getResultados,
  getUltimoResultado,
};
